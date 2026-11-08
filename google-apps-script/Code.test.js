const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, 'Code.gs'), 'utf8');
const expectedHeaders = [
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

function makeHarness({ emailFails = false } = {}) {
  const rows = [];
  const emails = [];
  const errors = [];
  const sheet = {
    getLastRow: () => rows.length,
    getRange(row) {
      return {
        setValues(values) {
          rows[row - 1] = values[0];
        },
        getDisplayValues() {
          return [rows[row - 1] || []];
        },
      };
    },
  };
  const context = {
    console: { error: (...values) => errors.push(values.join(' ')) },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (key) =>
          ({
            SPREADSHEET_ID: 'test-spreadsheet-id',
            NOTIFICATION_EMAIL: 'admissions@example.test',
          })[key] || null,
      }),
    },
    SpreadsheetApp: {
      openById: (id) => {
        assert.equal(id, 'test-spreadsheet-id');
        return {
          getSheetByName: (name) => (name === 'Enquiries' ? sheet : null),
          insertSheet: (name) => {
            assert.equal(name, 'Enquiries');
            return sheet;
          },
        };
      },
      flush: () => {},
    },
    LockService: {
      getScriptLock: () => ({ waitLock: () => {}, releaseLock: () => {} }),
    },
    Utilities: {
      formatDate: (_date, timezone, pattern) => {
        assert.equal(timezone, 'Asia/Kolkata');
        return pattern === 'yyyyMMdd' ? '20261108' : '2026-11-08 20:30:00';
      },
      getUuid: () => '12345678-90ab-cdef-1234-567890abcdef',
    },
    MailApp: {
      sendEmail: (...args) => {
        emails.push(args);
        if (emailFails) throw new Error('simulated mail failure');
      },
    },
    HtmlService: {
      XFrameOptionsMode: { ALLOWALL: 'ALLOWALL' },
      createHtmlOutput: (html) => ({
        html,
        setXFrameOptionsMode(mode) {
          assert.equal(mode, 'ALLOWALL');
          return this;
        },
      }),
    },
  };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: 'Code.gs' });
  return { context, rows, emails, errors };
}

function makeRequest(overrides = {}) {
  return {
    firstName: 'Test Lead',
    lastName: 'Example',
    qualification: 'B.Tech',
    course: 'HVAC',
    contactNumber: '+91 9876543210',
    sourcePage: 'HVAC Course',
    website: '',
    ...overrides,
  };
}

function post(context, payload) {
  const serialized = JSON.stringify(payload);
  return context.doPost({
    parameter: { payload: serialized, nonce: 'a'.repeat(32) },
    contentLength: serialized.length,
  });
}

function readBridgeResponse(output) {
  const match = output.html.match(/postMessage\((.*), "\*"\)/);
  assert.ok(match, 'response HTML should post a bridge message');
  return JSON.parse(JSON.parse(match[1]));
}

test('valid submission appends the prescribed row and emails the same enquiry details', () => {
  const harness = makeHarness();
  const output = post(harness.context, makeRequest({ firstName: '=Test Lead' }));
  assert.match(output.html, /window\.top\.postMessage/);
  const message = readBridgeResponse(output);

  assert.equal(message.response.saved, true);
  assert.equal(message.response.notificationSent, true);
  assert.equal(harness.rows.length, 2);
  assert.deepEqual(Array.from(harness.rows[0]), expectedHeaders);
  assert.deepEqual(Array.from(harness.rows[1]), [
    'DES-20261108-12345678-90AB-CDEF-1234-567890ABCDEF',
    '2026-11-08 20:30:00',
    "'=Test Lead",
    'Example',
    'B.Tech',
    'HVAC',
    "'+91 9876543210",
    'HVAC Course',
    'New',
  ]);
  assert.equal(harness.emails.length, 1);
  assert.equal(harness.emails[0][0], 'admissions@example.test');
  assert.equal(harness.emails[0][1], 'New Course Enquiry – DES-TECH ACADEMY');
  assert.match(harness.emails[0][2], /Course interested in: HVAC/);
  assert.match(harness.emails[0][2], /Source page: HVAC Course/);
  assert.match(harness.emails[0][3].htmlBody, />=Test Lead<\/td>/);
});

test('email failure does not undo the saved enquiry', () => {
  const harness = makeHarness({ emailFails: true });
  const message = readBridgeResponse(post(harness.context, makeRequest()));

  assert.equal(message.response.saved, true);
  assert.equal(message.response.notificationSent, false);
  assert.equal(harness.rows.length, 2);
  assert.equal(harness.errors.length, 1);
});

test('email HTML escapes supplied text and unrecognized sources are stored as Other', () => {
  const harness = makeHarness();
  const hostileName = '<img src=x onerror=alert(1)>';
  const message = readBridgeResponse(
    post(harness.context, makeRequest({ firstName: hostileName, sourcePage: 'Untrusted source' })),
  );

  assert.equal(message.response.saved, true);
  assert.equal(Array.from(harness.rows[1])[7], 'Other');
  assert.match(harness.emails[0][3].htmlBody, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(harness.emails[0][3].htmlBody, /<img src=x/);
});

test('invalid fields and a filled honeypot never write a row or send email', () => {
  const harness = makeHarness();
  const invalidNumber = readBridgeResponse(
    post(harness.context, makeRequest({ contactNumber: '12345' })),
  );
  assert.equal(invalidNumber.response.saved, false);
  assert.equal(invalidNumber.response.fieldErrors.contactNumber, 'Enter a valid 10-digit Indian mobile number, optionally with +91.');
  assert.equal(harness.rows.length, 0);

  const botSubmission = readBridgeResponse(post(harness.context, makeRequest({ website: 'spam' })));
  assert.equal(botSubmission.response.code, 'REJECTED');
  assert.equal(harness.rows.length, 0);
  assert.equal(harness.emails.length, 0);

  const unexpectedField = readBridgeResponse(
    post(harness.context, makeRequest({ isAdmin: true })),
  );
  assert.equal(unexpectedField.response.code, 'INVALID_REQUEST');
  assert.equal(harness.rows.length, 0);
});
