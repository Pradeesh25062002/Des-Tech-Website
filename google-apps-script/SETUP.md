# DES-TECH ACADEMY Enquiry Web App Setup

The enquiry form stores submissions in the private `Enquiries` sheet and then attempts an admissions email. The Angular page does not read the spreadsheet. The Apps Script deployment URL must be configured before form submissions can work.

## 1. Open the spreadsheet

Open the supplied spreadsheet while signed in to the account that will own the Apps Script deployment:

<https://docs.google.com/spreadsheets/d/1G9wPe0Lc0JYWl8jJP32Brp3uRO-Mc0oAYResnhhIzdk/edit>

Keep the spreadsheet private. The script opens it using its owner's access; do not change its sharing setting to public.

## 2. Create the Apps Script project

1. In the spreadsheet, choose **Extensions → Apps Script**.
2. Replace the starter contents of `Code.gs` with `google-apps-script/Code.gs` from this repository.
3. In **Project Settings**, enable **Show `appsscript.json` manifest file in editor**.
4. Replace the manifest contents with `google-apps-script/appsscript.json` from this repository.
5. Save the project with a clear name, such as `DES-TECH Enquiry Intake`.

The script accepts enquiry POSTs only. Its GET response does not read or return spreadsheet data.

## 3. Set Script Properties

In the Apps Script editor, open **Project Settings → Script Properties → Add script property** and add:

| Property | Value |
| --- | --- |
| `SPREADSHEET_ID` | `1G9wPe0Lc0JYWl8jJP32Brp3uRO-Mc0oAYResnhhIzdk` |
| `NOTIFICATION_EMAIL` | `destechacademyedu@gmail.com` |

The script reads these values from Script Properties. They are not configured in Angular.

## 4. Confirm the project time zone

The manifest sets the project time zone to `Asia/Kolkata`. Confirm that **Project Settings** shows **(GMT+05:30) India Standard Time — Kolkata**. The code also formats saved timestamps explicitly with `Asia/Kolkata`.

## 5. Deploy as a Web App

1. Choose **Deploy → New deployment**.
2. Select **Web app** as the deployment type.
3. Set **Execute as** to **Me** (the spreadsheet owner/deployer).
4. Set access to **Anyone** so prospective students can submit without signing in. The manifest requests anonymous access; if the Google Workspace administrator does not permit anonymous web apps, deployment must be approved or hosted under an account that permits it.
5. Choose **Deploy**, review the requested Sheets and send-only mail permissions, and authorize them as the script owner.
6. Copy the deployed URL ending in `/exec`. Do not use the editor-only `/dev` URL.

The response uses `HtmlService` with `XFrameOptionsMode.ALLOWALL` so a hidden cross-origin form can receive a nonce-checked `postMessage`. Anyone can frame an `ALLOWALL` page, so keep the response page limited to this fixed bridge and never add spreadsheet data to it.

## 6. Configure Angular

Edit `src/environments/environment.ts` and set `googleAppsScriptUrl` to the deployed `/exec` URL, for example:

```ts
export const environment = {
  production: false,
  googleAppsScriptUrl: 'https://script.google.com/macros/s/PASTE_DEPLOYMENT_ID/exec',
};
```

Replace the example with the actual URL. The committed empty default intentionally fails closed and displays a setup message instead of claiming a submission succeeded. Rebuild and deploy the Angular site after setting the URL.

## 7. Browser submission transport

The Angular service submits a normal URL-encoded HTML form to a hidden iframe, then accepts a response only from an Apps Script origin with the fixed response channel and fresh 128-bit nonce. The bridge posts to the top page so the message can cross Apps Script's HTML-service sandbox frame. This avoids `no-cors` and does not treat an opaque response as success.

Apps Script `ContentService` responses redirect to a one-time `script.googleusercontent.com` URL, which complicates browser response verification. This project returns a small HTML bridge page instead. The official Apps Script documentation describes the Content Service redirect and the `HtmlOutput` frame-options control: [Content Service](https://developers.google.com/apps-script/guides/content) and [HtmlOutput](https://developers.google.com/apps-script/reference/html/html-output).

## 8. Test the complete flow

Run the local Apps Script logic tests from the repository root with `npm run test:apps-script`. They use mocked Sheets, MailApp, and Script Properties; they do not contact Google or create real rows/emails.

1. Confirm the spreadsheet has no public sharing and the deployment uses **Execute as Me**.
2. Open the site and select **Apply Now**, or use a course-specific enquiry button. Check that the course dropdown is preselected for HVAC, MEP, Warehouse Management, AWS, or HSE and remains editable.
3. Submit a valid test enquiry. Confirm the page only displays success after receiving `saved: true` from the bridge.
4. Confirm a new row appears in `Enquiries` with the exact header order, a unique `DES-...` ID, an Asia/Kolkata timestamp, source page, and status `New`.
5. Confirm the admissions mailbox receives the new-lead message. If email fails after the row is saved, the form still confirms receipt and notes that the internal notification could not be sent.
6. Try missing fields and invalid mobile numbers. Confirm inline errors appear and no row is added.
7. Try submitting with the hidden `website` field populated using browser developer tools. The script should reject it without writing a row.
8. Temporarily use an invalid endpoint or disable network access. Confirm the form shows an error, preserves the entered values, and does not show success.
9. Test on a narrow mobile viewport and confirm the fields remain usable without horizontal scrolling.

Do not announce that live Sheets or email delivery works until these steps have been completed against the deployed Web App.

## 9. Update the deployment after code changes

1. Save the updated Apps Script source, including the `window.top.postMessage` response bridge.
2. Choose **Deploy → Manage deployments** and edit the active Web App deployment.
3. Select **New version**, then deploy it.
4. If Google provides a new Web App URL, update `googleAppsScriptUrl`, rebuild the Angular site, and redeploy it.
