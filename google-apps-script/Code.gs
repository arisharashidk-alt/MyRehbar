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

/* ======================================================================
 * Scholarship & university directory (copied INTO this sheet on demand)
 * ======================================================================
 *
 * Adds a "MyRehbar" menu to the sheet. Click:
 *   MyRehbar -> Update scholarships & universities
 * to copy the latest data from the website into four tabs (they are replaced each time).
 *
 * - Runs ONLY when you click it. Nothing runs automatically.
 * - Reads the same public data the website shows (myrehbar.org/data/*.json).
 * - Never touches the form tabs (Students, Rehbar requests, Rehbar applications, Contact).
 * - Does not change doPost: the form receiver stays write-only.
 * - To change scholarships, edit src/data/*.json in the website project and push.
 *   Editing these tabs does not change the website (and is overwritten on the next update).
 */

const DATA_BASE_URL = 'https://myrehbar.org/data/';

const DIRECTORY_TABS = {
  pakistan: 'Directory: Scholarships in Pakistan',
  abroad: 'Directory: Scholarships abroad',
  universities: 'Directory: Universities',
  aid: 'Directory: University aid',
};

const LEVEL_LABELS = { school: 'School (Grade 9–12)', undergraduate: 'Undergraduate', masters: "Master's", phd: 'PhD', exchange: 'Exchange' };

/** Runs when the sheet opens: adds the MyRehbar menu. */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('MyRehbar')
    .addItem('Update scholarships & universities', 'updateDirectory')
    .addToUi();
}

/** Copy scholarships and universities from the website into the Directory tabs. */
function updateDirectory() {
  const scholarships = fetchData_('scholarships.json').scholarships || [];
  const universities = fetchData_('universities.json').universities || [];
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  const scholarshipColumns = [
    ['Name', function (s) { return s.name; }],
    ['Provider', function (s) { return s.provider; }],
    ['Study in', function (s) { return s.country; }],
    ['Only for students from', function (s) { return (s.regions || []).join(', ') || 'Anywhere in Pakistan'; }],
    ['Levels', function (s) { return (s.levels || []).map(function (l) { return LEVEL_LABELS[l] || l; }).join(', '); }],
    ['Funding', function (s) { return s.fundingType === 'full' ? 'Fully funded' : 'Partial'; }],
    ['Who can apply', function (s) { return s.eligibility; }],
    ['What it pays for', function (s) { return lines_(s.covers); }],
    ['Application window', function (s) { return s.applicationWindow; }],
    ['Deadline', function (s) { return s.deadline; }],
    ['How to apply', function (s) { return steps_(s.howToApply); }],
    ['Official website', function (s) { return s.officialUrl; }],
    ['Sources', function (s) { return lines_(s.sources); }],
    ['Last verified', function (s) { return s.lastVerified || 'Not verified yet'; }],
    ['MyRehbar page', function (s) { return 'https://myrehbar.org/scholarships/' + s.slug; }],
  ];
  const universityColumns = [
    ['Short name', function (u) { return u.shortName; }],
    ['Name', function (u) { return u.name; }],
    ['City', function (u) { return u.city; }],
    ['Province', function (u) { return u.province; }],
    ['Public / private', function (u) { return u.sector; }],
    ['Categories', function (u) { return (u.categories || []).join(', '); }],
    ['Fee year', function (u) { return u.costs && u.costs.academicYear; }],
    ['Tuition per year (PKR)', function (u) { return u.costs && u.costs.tuitionPerYear; }],
    ['Hostel per year (PKR)', function (u) { return u.costs && u.costs.hostelPerYear; }],
    ['Total with hostel (PKR)', function (u) { return u.costs && u.costs.tuitionPerYear && u.costs.hostelPerYear ? u.costs.tuitionPerYear + u.costs.hostelPerYear : ''; }],
    ['Fee notes', function (u) { return u.costs && u.costs.otherNotes; }],
    ['Hostel available', function (u) { return yesNo_(u.hostel && u.hostel.available); }],
    ['Hostel notes', function (u) { return u.hostel && u.hostel.notes; }],
    ['Aid programs', function (u) { return (u.aid || []).length; }],
    ['Any aid covers hostel', function (u) { return (u.aid || []).some(function (a) { return a.coversHostel === true; }) ? 'Yes' : ''; }],
    ['How to get in', function (u) { return steps_(u.admissionSteps); }],
    ['Website', function (u) { return u.website; }],
    ['Admissions page', function (u) { return u.admissionsUrl; }],
    ['Financial aid page', function (u) { return u.financialAidUrl; }],
    ['Fee page', function (u) { return u.feesUrl; }],
    ['Last verified', function (u) { return u.lastVerified || 'Not verified yet'; }],
    ['MyRehbar page', function (u) { return 'https://myrehbar.org/universities/' + u.slug; }],
  ];
  const aidRows = [];
  universities.forEach(function (u) {
    (u.aid || []).forEach(function (a) { aidRows.push({ aid: a, uni: u }); });
  });
  const aidColumns = [
    ['University', function (r) { return r.uni.shortName || r.uni.name; }],
    ['City', function (r) { return r.uni.city; }],
    ['Aid program', function (r) { return r.aid.name; }],
    ['Type', function (r) { return r.aid.type; }],
    ['What it covers', function (r) { return lines_(r.aid.covers); }],
    ['Covers hostel', function (r) { return yesNo_(r.aid.coversHostel); }],
    ['How much', function (r) { return r.aid.amount; }],
    ['Who can apply', function (r) { return r.aid.whoCanApply; }],
    ['How to apply', function (r) { return steps_(r.aid.howToApply); }],
    ['Official page', function (r) { return r.aid.sourceUrl; }],
  ];

  const inPakistan = scholarships.filter(function (s) { return s.country === 'Pakistan'; });
  const abroad = scholarships.filter(function (s) { return s.country !== 'Pakistan'; });
  writeDirectoryTab_(spreadsheet, DIRECTORY_TABS.pakistan, scholarshipColumns, inPakistan);
  writeDirectoryTab_(spreadsheet, DIRECTORY_TABS.abroad, scholarshipColumns, abroad);
  writeDirectoryTab_(spreadsheet, DIRECTORY_TABS.universities, universityColumns, universities);
  writeDirectoryTab_(spreadsheet, DIRECTORY_TABS.aid, aidColumns, aidRows);

  spreadsheet.toast(
    inPakistan.length + ' in Pakistan, ' + abroad.length + ' abroad, ' + universities.length + ' universities, ' + aidRows.length + ' aid programs.',
    'MyRehbar directory updated',
    8,
  );
}

function fetchData_(file) {
  const response = UrlFetchApp.fetch(DATA_BASE_URL + file, { muteHttpExceptions: true, followRedirects: true });
  if (response.getResponseCode() !== 200) {
    throw new Error('Could not load ' + DATA_BASE_URL + file + ' (error ' + response.getResponseCode() + '). Is the website live?');
  }
  return JSON.parse(response.getContentText());
}

/** Replace a Directory tab's contents. Never used for the form tabs. */
function writeDirectoryTab_(spreadsheet, name, columns, items) {
  const formTabs = Object.keys(FORMS).map(function (id) { return FORMS[id].sheet; });
  if (formTabs.indexOf(name) !== -1) throw new Error('Refusing to overwrite a form tab: ' + name);

  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);
  sheet.clearContents();

  const rows = [columns.map(function (c) { return c[0]; })].concat(
    items.map(function (item) {
      return columns.map(function (c) { return cellValue_(c[1](item)); });
    }),
  );
  sheet.getRange(1, 1, rows.length, columns.length).setValues(rows);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, columns.length).setFontWeight('bold');
  sheet.getRange(1, 1).setNote(
    'Copied from myrehbar.org on ' + new Date().toDateString() + '.\n' +
    'Do not edit here: this tab is replaced by MyRehbar -> Update scholarships & universities.\n' +
    'To change the data, edit src/data/*.json in the website project.'
  );
  // Warn (but don't block) anyone who tries to edit by hand.
  const protections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
  if (protections.length === 0) sheet.protect().setDescription('Copied from the website: edits are overwritten').setWarningOnly(true);
}

/** Numbers stay numbers; text is cleaned with clean_ so it can never run as a formula. */
function cellValue_(value) {
  if (typeof value === 'number' && isFinite(value)) return value;
  if (value === undefined || value === null || value === false) return '';
  return clean_(String(value));
}

function lines_(list) {
  return Array.isArray(list) ? list.filter(Boolean).join('\n') : '';
}

function steps_(list) {
  return Array.isArray(list) ? list.map(function (s, i) { return (i + 1) + '. ' + s; }).join('\n') : '';
}

function yesNo_(value) {
  return value === true ? 'Yes' : value === false ? 'No' : '';
}
