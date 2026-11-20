# DES-TECH Academy Website

Responsive Angular website for DES-TECH ACADEMY, Centre for Advanced Professional Studies. The site presents the academy's training programs, practical learning approach, placement support, student stories, and enquiry options.

## Pages

| Path | Page |
| --- | --- |
| `/` | Home |
| `/about` | About the academy |
| `/courses` | Training courses |
| `/placements` | Placement support and partner companies |
| `/student-stories` | Student experiences |
| `/contact` | Contact information |
| `/enquiry` | Course enquiry |

## Requirements

- Node.js and npm
- Dependencies installed from `package-lock.json`

## Run locally

From the repository root:

```bash
npm ci
npm start
```

Open [http://localhost:4200](http://localhost:4200). The Angular development server reloads the app when source files change.

## Build and checks

```bash
npm run build
npm test -- --watch=false
npm run test:apps-script
```

The production build is written to `dist/`. Angular component tests run with Vitest. The Apps Script tests use Node's built-in test runner. There is no end-to-end test framework configured.

## Project structure

- `src/app/` — Angular routes, page components, and the shared site footer
- `src/styles.css` — global styles and design tokens
- `public/` — logos, page imagery, and other static assets served as-is
- `google-apps-script/` — Apps Script integration files and their tests

Page-specific content and repeated display data are maintained in the corresponding TypeScript component files. Keep assets local in `public/` and use descriptive alternative text for meaningful images.
