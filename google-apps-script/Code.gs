const HEADERS = [
  'Enquiry ID',
  'Submitted Date & Time',
  'First Name',
  'Last Name',
  'Qualification',
  'Course',
  'Contact Number',
  'Source Page',
  'Enquiry Status',
];

const QUALIFICATIONS = ['Plus Two', 'Diploma', 'B.Tech', 'B.E', 'B.Sc', 'B.Com', 'Other'];
const COURSES = ['HVAC', 'MEP', 'Warehouse Management', 'AWS', 'HSE'];
const SOURCE_PAGES = [
  'Homepage',
  'HVAC Course',
  'MEP Course',
  'Warehouse Management Course',
  'AWS Course',
  'HSE Course',
  'Courses Page',
  'About Page',
  'Contact Page',
  'Placements Page',
  'Student Stories Page',
  'Other',
];
const TIME_ZONE = 'Asia/Kolkata';
const MAX_REQUEST_LENGTH = 8192;
const BRIDGE_CHANNEL = 'destech-enquiry-response';

function doGet() {
  return HtmlService.createHtmlOutput(
    '<!doctype html><html><body><p>This endpoint accepts enquiry submissions only.</p></body></html>',
  );
}

function doPost(event) {
  const nonce = event && event.parameter ? String(event.parameter.nonce || '') : '';
  const validNonce = /^[a-f0-9]{32}$/.test(nonce) ? nonce : '';

  try {
    const requestLength = Number(event && event.contentLength);
    if (requestLength > MAX_REQUEST_LENGTH) {
      return responsePage_(validNonce, failure_('REQUEST_TOO_LARGE'));
    }
    if (
      !event ||
      !event.parameter ||
      typeof event.parameter.payload !== 'string' ||
      event.parameter.payload.length > MAX_REQUEST_LENGTH
    ) {
      return responsePage_(validNonce, failure_('INVALID_REQUEST'));
    }

    const payload = JSON.parse(event.parameter.payload);
    const validation = validatePayload_(payload);
    if (!validation.data) {
      return responsePage_(validNonce, {
        ok: false,
        saved: false,
        notificationSent: false,
        code: validation.code,
        fieldErrors: validation.fieldErrors,
      });
    }
    if (!validNonce) {
      return responsePage_('', failure_('INVALID_REQUEST'));
    }

    const config = readConfig_();
    const saved = saveEnquiry_(config.spreadsheetId, validation.data);
    let notificationSent = true;
    try {
      sendNotification_(config.notificationEmail, saved, validation.data);
    } catch (error) {
      notificationSent = false;
      console.error('Admissions notification failed for enquiry ' + saved.id + ': ' + error.message);
    }

    return responsePage_(validNonce, {
      ok: true,
      saved: true,
      notificationSent: notificationSent,
      enquiryId: saved.id,
    });
  } catch (error) {
    console.error('Enquiry processing failed: ' + error.message);
    return responsePage_(validNonce, failure_('SAVE_FAILED'));
  }
}

function readConfig_() {
  const properties = PropertiesService.getScriptProperties();
  const spreadsheetId = properties.getProperty('SPREADSHEET_ID');
  const notificationEmail = properties.getProperty('NOTIFICATION_EMAIL');
  if (!spreadsheetId || !notificationEmail) {
    throw new Error('Script configuration is incomplete.');
  }
  return { spreadsheetId: spreadsheetId, notificationEmail: notificationEmail };
}

function validatePayload_(payload) {
  const expectedKeys = [
    'firstName',
    'lastName',
    'qualification',
    'course',
    'contactNumber',
    'sourcePage',
    'website',
  ];
  const fieldErrors = {};

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { data: null, code: 'INVALID_REQUEST', fieldErrors: fieldErrors };
  }
  const keys = Object.keys(payload).sort();
  if (keys.length !== expectedKeys.length || keys.some(function (key, index) { return key !== expectedKeys.slice().sort()[index]; })) {
    return { data: null, code: 'INVALID_REQUEST', fieldErrors: fieldErrors };
  }
  if (typeof payload.website !== 'string' || payload.website.trim() !== '') {
    return { data: null, code: 'REJECTED', fieldErrors: fieldErrors };
  }

  const firstName = cleanText_(payload.firstName, 80);
  const lastName = cleanText_(payload.lastName, 80);
  const contactNumber = typeof payload.contactNumber === 'string' ? payload.contactNumber.trim() : '';

  if (!firstName) fieldErrors.firstName = 'Enter a valid first name.';
  if (!lastName) fieldErrors.lastName = 'Enter a valid last name.';
  if (QUALIFICATIONS.indexOf(payload.qualification) === -1) {
    fieldErrors.qualification = 'Select a valid qualification.';
  }
  if (COURSES.indexOf(payload.course) === -1) fieldErrors.course = 'Select a valid course.';
  if (!/^(?:\+91[\s-]?)?[6-9]\d{9}$/.test(contactNumber)) {
    fieldErrors.contactNumber = 'Enter a valid 10-digit Indian mobile number, optionally with +91.';
  }

  if (Object.keys(fieldErrors).length) {
    return { data: null, code: 'VALIDATION_FAILED', fieldErrors: fieldErrors };
  }

  const sourcePage = SOURCE_PAGES.indexOf(payload.sourcePage) !== -1 ? payload.sourcePage : 'Other';
  return {
    data: {
      firstName: firstName,
      lastName: lastName,
      qualification: payload.qualification,
      course: payload.course,
      contactNumber: contactNumber,
      sourcePage: sourcePage,
    },
  };
}

function cleanText_(value, maximumLength) {
  if (typeof value !== 'string') return '';
  const clean = value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
  return clean && clean.length <= maximumLength ? clean : '';
}

function saveEnquiry_(spreadsheetId, enquiry) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    let sheet = spreadsheet.getSheetByName('Enquiries');
    if (!sheet) sheet = spreadsheet.insertSheet('Enquiries');

    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    } else {
      const currentHeaders = sheet.getRange(1, 1, 1, HEADERS.length).getDisplayValues()[0];
      if (HEADERS.some(function (header, index) { return currentHeaders[index] !== header; })) {
        throw new Error('The Enquiries sheet has unexpected headers.');
      }
    }

    const submittedAt = new Date();
    const timestamp = Utilities.formatDate(submittedAt, TIME_ZONE, 'yyyy-MM-dd HH:mm:ss');
    const enquiryId = 'DES-' + Utilities.formatDate(submittedAt, TIME_ZONE, 'yyyyMMdd') + '-' + Utilities.getUuid().toUpperCase();
    const values = [
      enquiryId,
      timestamp,
      enquiry.firstName,
      enquiry.lastName,
      enquiry.qualification,
      enquiry.course,
      enquiry.contactNumber,
      enquiry.sourcePage,
      'New',
    ].map(safeCell_);

    sheet.getRange(sheet.getLastRow() + 1, 1, 1, HEADERS.length).setValues([values]);
    SpreadsheetApp.flush();
    return { id: enquiryId, timestamp: timestamp };
  } finally {
    lock.releaseLock();
  }
}

function safeCell_(value) {
  const text = String(value).replace(/[\u0000-\u001f\u007f]/g, ' ').trim();
  return /^[\s]*[=+@-]/.test(text) ? "'" + text : text;
}

function sendNotification_(recipient, saved, enquiry) {
  const fields = [
    ['Enquiry ID', saved.id],
    ['Submitted date and time', saved.timestamp],
    ['First name', enquiry.firstName],
    ['Last name', enquiry.lastName],
    ['Qualification', enquiry.qualification],
    ['Course interested in', enquiry.course],
    ['Contact number', enquiry.contactNumber],
    ['Source page', enquiry.sourcePage],
  ];
  const plainBody = 'New admissions lead\n\n' + fields.map(function (field) {
    return field[0] + ': ' + field[1];
  }).join('\n');
  const htmlRows = fields.map(function (field) {
    return '<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #e7e2da">' +
      escapeHtml_(field[0]) + '</th><td style="padding:8px;border-bottom:1px solid #e7e2da">' +
      escapeHtml_(field[1]) + '</td></tr>';
  }).join('');
  const htmlBody = '<div style="font-family:Arial,sans-serif;color:#0b1b32;max-width:640px">' +
    '<h2 style="font-weight:500">New admissions lead</h2><table style="border-collapse:collapse;width:100%">' +
    htmlRows + '</table></div>';

  MailApp.sendEmail(recipient, 'New Course Enquiry \u2013 DES-TECH ACADEMY', plainBody, {
    htmlBody: htmlBody,
  });
}

function escapeHtml_(value) {
  return String(value).replace(/[&<>"']/g, function (character) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[character];
  });
}

function failure_(code) {
  return { ok: false, saved: false, notificationSent: false, code: code };
}

function responsePage_(nonce, response) {
  const message = JSON.stringify({
    channel: BRIDGE_CHANNEL,
    nonce: nonce,
    response: response,
  });
  const messageLiteral = JSON.stringify(message)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
  const html = '<!doctype html><html><head><meta charset="utf-8"></head><body>' +
    '<script>window.top.postMessage(' + messageLiteral + ', "*");</script>' +
    '</body></html>';
  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
