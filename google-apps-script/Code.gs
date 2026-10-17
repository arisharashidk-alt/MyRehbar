/**
 * MyRehbar form receiver (Google Apps Script)
 * ===========================================
 *
 * Paste this whole file into your private MyRehbar Google Sheet:
 *   Extensions -> Apps Script -> replace everything in Code.gs -> Save.
 * Full setup steps: README.md -> "7. Forms".
 *
 * How it keeps answers private and safe:
 * - WRITE-ONLY. There is no doGet() and nothing is ever returned except "ok" or an error code,
 *   so nobody can read the sheet through this script. Never add code that returns sheet data.
 * - Only the forms and questions listed in FORMS below are saved. Anything else is ignored.
 * - Every answer is trimmed, length-limited, and protected against spreadsheet formula injection
 *   (text starting with = + - @ is stored as plain text, never run as a formula).
 * - Spam protection: a hidden "honeypot" field, a minimum time to fill in the form,
 *   and a cap on how many answers are accepted per minute.
 * - The sheet itself stays private: keep its sharing set to "Restricted".
 *
 * IMPORTANT: after you change this file, publish a new version:
 *   Deploy -> Manage deployments -> pencil icon -> Version: "New version" -> Deploy.
 * (The web app URL stays the same.)
 */

// Each form: the sheet tab it goes to, and its questions as [key, column header, required?].
// Keys must match src/forms/schema.ts in the website.
const FORMS = {
  student: {
    sheet: 'Students',
    atLeastOne: ['phone', 'email'],
    fields: [
      ['fullName', 'Full name', true],
      ['age', 'Age', true],
      ['city', 'City or area', true],
      ['school', 'School or college', true],
      ['studyLevel', 'Studying now', true],
      ['phone', 'Phone / WhatsApp', false],
      ['email', 'Email', false],
      ['contactOwner', 'Whose contact', true],
      ['fieldInterest', 'Wants to study', true],
      ['scholarship', 'Scholarship of interest', false],
      ['womanRehbar', 'Wants a woman Rehbar', false],
      ['internet', 'Internet access', false],
      ['needs', 'Needs help with', false],
      ['guardianAware', '18+ or parent/teacher knows', true],
      ['consent', 'Consent', true],
    ],
  },
  request: {
    sheet: 'Rehbar requests',
    atLeastOne: ['phone', 'email'],
    fields: [
      ['rehbar', 'Rehbar requested', true],
      ['fullName', 'Student name', true],
      ['age', 'Age', true],
      ['city', 'City or area', true],
      ['phone', 'Phone / WhatsApp', false],
      ['email', 'Email', false],
      ['contactOwner', 'Whose contact', true],
      ['needs', 'Needs help with', true],
      ['guardianAware', '18+ or parent/teacher knows', true],
      ['consent', 'Consent', true],
    ],
  },
  rehbar: {
    sheet: 'Rehbar applications',
    fields: [
      ['fullName', 'Full name', true],
      ['email', 'Email', true],
      ['phone', 'Phone', false],
      ['university', 'University / organisation', true],
      ['program', 'Degree / program', true],
      ['field', 'Field', true],
      ['country', 'Country', true],
      ['languages', 'Languages', true],
      ['hours', 'Time available', true],
      ['gender', 'Gender', false],
      ['background', 'Background', true],
      ['linkedin', 'LinkedIn', false],
      ['conduct', 'Agrees to code of conduct', true],
      ['consent', 'Consent', true],
    ],
  },
  contact: {
    sheet: 'Contact',
    fields: [
      ['fullName', 'Name', true],
      ['organisation', 'Organisation', false],
      ['email', 'Email', true],
      ['phone', 'Phone', false],
      ['topic', 'Topic', true],
      ['message', 'Message', true],
      ['consent', 'Consent', true],
    ],
  },
};

const MAX_LENGTH = 2000; // characters per answer
const MIN_FILL_MS = 3000; // people take longer than 3 seconds; bots often don't
const MAX_PER_MINUTE = 30; // total answers accepted per minute, across all forms

/** Receives one form answer from the website. */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const form = FORMS[body.form];
    if (!form) return reply_(false, 'unknown_form');

    // Honeypot filled in = a bot. Pretend it worked so it doesn't retry.
    if (body.website) return reply_(true);
    if (!(Number(body.elapsedMs) >= MIN_FILL_MS)) return reply_(false, 'too_fast');

    const data = body.data && typeof body.data === 'object' ? body.data : {};
    const values = form.fields.map(function (f) {
      return clean_(data[f[0]]);
    });

    const missing = form.fields.some(function (f, i) {
      return f[2] && !values[i];
    });
    const noContact =
      form.atLeastOne &&
      !form.atLeastOne.some(function (key) {
        return clean_(data[key]);
      });
    if (missing || noContact) return reply_(false, 'missing');

    lock.waitLock(10000);
    if (isRateLimited_()) return reply_(false, 'busy');

    getSheet_(form).appendRow([new Date(), clean_(body.lang)].concat(values));
    return reply_(true);
  } catch (err) {
    // Log only the error type, never the answers.
    console.error('MyRehbar form error: ' + (err && err.name));
    return reply_(false, 'server');
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

/**
 * Run this once from the Apps Script editor (select "setup" -> Run).
 * It asks for permission and creates one tab per form with bold, frozen headers.
 */
function setup() {
  Object.keys(FORMS).forEach(function (id) {
    getSheet_(FORMS[id]);
  });
}

function getSheet_(form) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(form.sheet);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(form.sheet);
    const headers = ['Submitted at', 'Language'].concat(
      form.fields.map(function (f) {
        return f[1];
      }),
    );
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  return sheet;
}

/** Make an answer safe to store: text only, trimmed, limited, and never a formula. */
function clean_(value) {
  if (value === undefined || value === null || typeof value === 'object') return '';
  let text = String(value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, MAX_LENGTH);
  if (/^[=+\-@]/.test(text)) text = "'" + text;
  return text;
}

function isRateLimited_() {
  const cache = CacheService.getScriptCache();
  const key = 'rate_' + Math.floor(Date.now() / 60000);
  const count = Number(cache.get(key) || 0);
  if (count >= MAX_PER_MINUTE) return true;
  cache.put(key, String(count + 1), 120);
  return false;
}

function reply_(ok, error) {
  const payload = ok ? { ok: true } : { ok: false, error: error };
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
