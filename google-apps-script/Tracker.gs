/**
 * MyRehbar application tracker: accounts and saved trackers (Google Apps Script)
 * ==============================================================================
 *
 * This is a SEPARATE Apps Script project from Code.gs (the form receiver), with its own web app URL.
 * Code.gs stays write-only. This script can read data back, but only a person's OWN tracker,
 * and only with a valid login. Full setup steps: README.md -> "7a. Application tracker".
 *
 * It writes to three tabs in the same private MyRehbar Google Sheet:
 *   Tracker accounts  - user id, email, salt, password hash, dates. Never the password.
 *   Tracker sessions  - a hash of each login token and when it expires. Never the token itself.
 *   Tracker data      - each person's tracker, one row per person, saved as JSON across a few cells.
 *
 * How it keeps accounts safe:
 * - The password never leaves the browser. The website turns it into a key with PBKDF2-SHA256
 *   (600,000 rounds, see src/tracker/crypto.ts). This script stores only
 *   HMAC-SHA256(secret pepper, random salt + key). The pepper lives in Script Properties, not in
 *   the sheet, so a copy of the sheet alone is not enough to test passwords.
 * - Login tokens are 244 random bits. Only their SHA-256 hash is stored. They expire
 *   (30 days with "keep me logged in", otherwise 12 hours). Resetting the password logs out everywhere.
 * - New accounts and password resets need a 6-digit code sent by email (15 minutes, 5 tries).
 * - Login: 5 wrong passwords lock that email for 15 minutes. Errors never say whether an email has an account.
 * - Rate limits on every request, on login attempts, on emails sent, and on saves.
 * - Nothing written to the sheet can run as a formula, and logs never contain emails, passwords or data.
 *
 * IMPORTANT: after you change this file, publish a new version:
 *   Deploy -> Manage deployments -> pencil icon -> Version: "New version" -> Deploy.
 * Never change or delete the TRACKER_PEPPER script property: every password would stop working.
 */

const TABS = {
  accounts: { name: 'Tracker accounts', headers: ['User id', 'Email', 'Salt', 'Password hash', 'Created', 'Last login'] },
  sessions: { name: 'Tracker sessions', headers: ['Token hash', 'User id', 'Created', 'Expires'] },
  data: { name: 'Tracker data', headers: ['User id', 'Version', 'Saved', 'Size (characters)'] },
};

const MAX_BODY = 2000000; // characters per request
const MAX_DATA = 1500000; // characters per tracker (about 1.5 MB)
const CHUNK = 45000; // a Google Sheets cell holds at most 50,000 characters
const MAX_CHUNKS = Math.ceil(MAX_DATA / CHUNK);
const SESSION_LONG_MS = 30 * 24 * 3600 * 1000;
const SESSION_SHORT_MS = 12 * 3600 * 1000;
const MAX_SESSIONS_PER_USER = 10;
const CODE_MS = 15 * 60 * 1000;
const CODE_MAX_TRIES = 5;
const LOGIN_MAX_FAILS = 5;
const LOGIN_LOCK_SECONDS = 15 * 60;
const MAX_REQUESTS_PER_MINUTE = 120;
const MAX_AUTH_PER_MINUTE = 30;
const MAX_SAVES_PER_MINUTE = 20; // per person
const MAX_EMAILS_PER_DAY = 80; // a free Gmail account can send about 100
const MAX_EMAILS_PER_ADDRESS_PER_DAY = 5;
const EMAIL_COOLDOWN_SECONDS = 60;
const MIN_SIGNUP_MS = 3000;

const ACTIONS = {
  signup: signup_,
  verify: verify_,
  login: login_,
  forgot: forgot_,
  reset: reset_,
  logout: logout_,
  logoutAll: logoutAll_,
  load: load_,
  save: save_,
  deleteAccount: deleteAccount_,
};

/** Receives one request from the website. Every reply is JSON: { ok: true, ... } or { ok: false, error }. */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const raw = (e && e.postData && e.postData.contents) || '';
    if (raw.length > MAX_BODY) return reply_({ ok: false, error: 'too_large' });
    const body = JSON.parse(raw || '{}');
    const action = body && typeof body.action === 'string' && Object.prototype.hasOwnProperty.call(ACTIONS, body.action) ? body.action : '';
    if (!action) return reply_({ ok: false, error: 'invalid' });

    if (!lock.tryLock(20000)) return reply_({ ok: false, error: 'busy' });
    if (overLimit_('req', 120, MAX_REQUESTS_PER_MINUTE)) return reply_({ ok: false, error: 'busy' });
    return reply_(ACTIONS[action](body));
  } catch (err) {
    // Log only the error type, never what was sent.
    console.error('MyRehbar tracker error: ' + (err && err.name));
    return reply_({ ok: false, error: 'server' });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

/* ---------------- Accounts ---------------- */

/** Step 1 of sign-up: email a code. The reply is the same whether or not the email already has an account. */
function signup_(b) {
  if (b.website) return { ok: true }; // honeypot: bots fill in the hidden field
  if (!(Number(b.elapsedMs) >= MIN_SIGNUP_MS)) return { ok: false, error: 'too_fast' };
  const email = email_(b.email);
  const key = key_(b.key);
  if (!email || !key) return { ok: false, error: 'invalid' };
  if (authLimited_()) return { ok: false, error: 'busy' };
  if (!mayEmail_(email)) return { ok: false, error: 'wait' };

  if (findAccount_(email)) {
    sendMail_(email, 'Your MyRehbar account',
      'Someone (hopefully you) tried to create a MyRehbar tracker account with this email, but you already have one.\n\n' +
      'Log in at https://myrehbar.org/login. If you forgot your password, choose "Forgot password" there.\n\n' +
      'If this was not you, you can ignore this email. Nothing has changed.');
    return { ok: true };
  }

  const code = code_();
  const salt = randomHex_().slice(0, 32);
  putCode_('signup', email, { code: codeHash_('signup', email, code), salt: salt, hash: passwordHash_(salt, key) });
  sendMail_(email, 'Your MyRehbar code: ' + code,
    'Your code to finish creating your MyRehbar application tracker is:\n\n    ' + code + '\n\n' +
    'It works for 15 minutes. If you did not ask for this, ignore this email: no account is created without the code.');
  return { ok: true };
}

/** Step 2 of sign-up: check the code, create the account and log in. */
function verify_(b) {
  const email = email_(b.email);
  if (!email || !/^\d{6}$/.test(String(b.code || ''))) return { ok: false, error: 'invalid' };
  if (authLimited_()) return { ok: false, error: 'busy' };
  const pending = checkCode_('signup', email, String(b.code));
  if (!pending) return { ok: false, error: 'code' };
  if (findAccount_(email)) return { ok: false, error: 'code' };

  const userId = 'u' + randomHex_().slice(0, 31);
  const now = new Date().toISOString();
  sheet_(TABS.accounts).appendRow([userId, email, pending.salt, pending.hash, now, now]);
  return session_(userId, email, b.remember === true);
}

function login_(b) {
  const email = email_(b.email);
  const key = key_(b.key);
  if (!email || !key) return { ok: false, error: 'invalid' };
  if (authLimited_()) return { ok: false, error: 'busy' };

  const cache = CacheService.getScriptCache();
  const failKey = 'fail_' + emailId_(email);
  const fails = Number(cache.get(failKey) || 0);
  if (fails >= LOGIN_MAX_FAILS) return { ok: false, error: 'locked' };

  const account = findAccount_(email);
  // Hash even when there is no account, so both cases take about the same time.
  const hash = passwordHash_(account ? account.salt : '00000000000000000000000000000000', key);
  if (!account || !safeEqual_(hash, account.hash)) {
    cache.put(failKey, String(fails + 1), LOGIN_LOCK_SECONDS);
    return { ok: false, error: fails + 1 >= LOGIN_MAX_FAILS ? 'locked' : 'wrong' };
  }
  cache.remove(failKey);
  account.sheet.getRange(account.row, 6).setValue(new Date().toISOString());
  return session_(account.userId, email, b.remember === true);
}

/** Forgot password: email a reset code. Same reply whether or not the account exists. */
function forgot_(b) {
  const email = email_(b.email);
  if (!email) return { ok: false, error: 'invalid' };
  if (authLimited_()) return { ok: false, error: 'busy' };
  if (!mayEmail_(email)) return { ok: false, error: 'wait' };
  if (!findAccount_(email)) return { ok: true };

  const code = code_();
  putCode_('reset', email, { code: codeHash_('reset', email, code) });
  sendMail_(email, 'Reset your MyRehbar password: ' + code,
    'Your code to set a new password for your MyRehbar application tracker is:\n\n    ' + code + '\n\n' +
    'It works for 15 minutes. If you did not ask for this, ignore this email: your password stays the same.');
  return { ok: true };
}

/** Set a new password with the emailed code. Logs out every other device. */
function reset_(b) {
  const email = email_(b.email);
  const key = key_(b.key);
  if (!email || !key || !/^\d{6}$/.test(String(b.code || ''))) return { ok: false, error: 'invalid' };
  if (authLimited_()) return { ok: false, error: 'busy' };
  if (!checkCode_('reset', email, String(b.code))) return { ok: false, error: 'code' };
  const account = findAccount_(email);
  if (!account) return { ok: false, error: 'code' };

  const salt = randomHex_().slice(0, 32);
  account.sheet.getRange(account.row, 3, 1, 2).setValues([[salt, passwordHash_(salt, key)]]);
  CacheService.getScriptCache().remove('fail_' + emailId_(email));
  removeSessions_(account.userId);
  return session_(account.userId, email, b.remember === true);
}

function logout_(b) {
  const token = token_(b.token);
  if (!token) return { ok: true };
  const sheet = sheet_(TABS.sessions);
  const hash = sha256Hex_(token);
  const row = findRow_(sheet, 1, hash);
  if (row) sheet.deleteRow(row);
  CacheService.getScriptCache().remove('s_' + hash);
  return { ok: true };
}

function logoutAll_(b) {
  const user = currentUser_(b.token);
  if (!user) return { ok: false, error: 'auth' };
  removeSessions_(user);
  return { ok: true };
}

/** Delete the account, every session and the saved tracker. Needs the password again. */
function deleteAccount_(b) {
  const user = currentUser_(b.token);
  if (!user) return { ok: false, error: 'auth' };
  const key = key_(b.key);
  if (!key) return { ok: false, error: 'invalid' };
  const accounts = sheet_(TABS.accounts);
  const row = findRow_(accounts, 1, user);
  if (!row) return { ok: false, error: 'auth' };
  const values = accounts.getRange(row, 1, 1, 4).getValues()[0];
  if (!safeEqual_(passwordHash_(String(values[2]), key), String(values[3]))) return { ok: false, error: 'wrong' };

  const data = sheet_(TABS.data);
  const dataRow = findRow_(data, 1, user);
  if (dataRow) data.deleteRow(dataRow);
  removeSessions_(user);
  accounts.deleteRow(row);
  return { ok: true };
}

/* ---------------- Tracker data ---------------- */

function load_(b) {
  const user = currentUser_(b.token);
  if (!user) return { ok: false, error: 'auth' };
  const stored = readData_(user);
  const accounts = sheet_(TABS.accounts);
  const row = findRow_(accounts, 1, user);
  return { ok: true, email: row ? String(accounts.getRange(row, 2).getValue()) : '', version: stored.version, data: stored.data };
}

/**
 * Save the whole tracker. `version` must be the version the browser last loaded or saved;
 * if another tab or device saved in between, nothing is overwritten and the newer copy is sent back.
 */
function save_(b) {
  const user = currentUser_(b.token);
  if (!user) return { ok: false, error: 'auth' };
  if (overLimit_('save_' + user, 60, MAX_SAVES_PER_MINUTE)) return { ok: false, error: 'busy' };
  const data = b.data;
  if (typeof data !== 'string') return { ok: false, error: 'invalid' };
  if (data.length > MAX_DATA) return { ok: false, error: 'too_large' };
  let parsed;
  try {
    parsed = JSON.parse(data);
  } catch (err) {
    return { ok: false, error: 'invalid' };
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return { ok: false, error: 'invalid' };

  const stored = readData_(user);
  if (Number(b.version) !== stored.version) return { ok: false, error: 'conflict', version: stored.version, data: stored.data };

  const version = stored.version + 1;
  const cells = [];
  // "~" in front of every piece: a cell starting with = + - @ could otherwise become a formula.
  for (let i = 0; i < data.length; i += CHUNK) cells.push('~' + data.slice(i, i + CHUNK));
  while (cells.length < MAX_CHUNKS) cells.push('');
  const values = [[user, version, new Date().toISOString(), data.length].concat(cells)];
  const sheet = sheet_(TABS.data);
  const row = stored.row || sheet.getLastRow() + 1;
  sheet.getRange(row, 1, 1, values[0].length).setValues(values);
  return { ok: true, version: version };
}

function readData_(user) {
  const sheet = sheet_(TABS.data);
  const row = findRow_(sheet, 1, user);
  if (!row) return { row: 0, version: 0, data: null };
  const values = sheet.getRange(row, 1, 1, 4 + MAX_CHUNKS).getValues()[0];
  const data = values.slice(4).map(function (cell) { return String(cell).slice(1); }).join('');
  return { row: row, version: Number(values[1]) || 0, data: data || null };
}

/* ---------------- Sessions ---------------- */

function session_(userId, email, remember) {
  const sheet = sheet_(TABS.sessions);
  // Keep at most MAX_SESSIONS_PER_USER logins per person: remove the oldest.
  const rows = sessionRows_(sheet, userId);
  const cache = CacheService.getScriptCache();
  rows.slice(0, Math.max(0, rows.length - MAX_SESSIONS_PER_USER + 1)).reverse().forEach(function (r) {
    cache.remove('s_' + r.hash);
    sheet.deleteRow(r.row);
  });

  const token = randomHex_();
  const now = Date.now();
  const expires = new Date(now + (remember ? SESSION_LONG_MS : SESSION_SHORT_MS));
  sheet.appendRow([sha256Hex_(token), userId, new Date(now).toISOString(), expires.toISOString()]);
  return { ok: true, token: token, email: email, expiresAt: expires.toISOString() };
}

/** The user id for a login token, or '' if the token is unknown or expired. */
function currentUser_(value) {
  const token = token_(value);
  if (!token) return '';
  const hash = sha256Hex_(token);
  const cache = CacheService.getScriptCache();
  const cached = cache.get('s_' + hash);
  if (cached) {
    const parts = cached.split('|');
    if (Number(parts[1]) > Date.now()) return parts[0];
    cache.remove('s_' + hash);
    return '';
  }
  const sheet = sheet_(TABS.sessions);
  const row = findRow_(sheet, 1, hash);
  if (!row) return '';
  const values = sheet.getRange(row, 1, 1, 4).getValues()[0];
  const expires = new Date(values[3]).getTime();
  if (!(expires > Date.now())) {
    sheet.deleteRow(row);
    return '';
  }
  cache.put('s_' + hash, values[1] + '|' + expires, 600);
  return String(values[1]);
}

function sessionRows_(sheet, userId) {
  const last = sheet.getLastRow();
  if (last < 2) return [];
  return sheet.getRange(2, 1, last - 1, 2).getValues()
    .map(function (v, i) { return { row: i + 2, hash: String(v[0]), user: String(v[1]) }; })
    .filter(function (r) { return r.user === userId; });
}

function removeSessions_(userId) {
  const sheet = sheet_(TABS.sessions);
  const cache = CacheService.getScriptCache();
  sessionRows_(sheet, userId).reverse().forEach(function (r) {
    cache.remove('s_' + r.hash);
    sheet.deleteRow(r.row);
  });
}

/* ---------------- Email codes ---------------- */

function putCode_(purpose, email, entry) {
  entry.tries = 0;
  entry.expires = Date.now() + CODE_MS;
  CacheService.getScriptCache().put(purpose + '_' + emailId_(email), JSON.stringify(entry), Math.ceil(CODE_MS / 1000));
}

/** Returns the stored entry if the code is right. Every wrong try counts; after 5 the code stops working. */
function checkCode_(purpose, email, code) {
  const cache = CacheService.getScriptCache();
  const cacheKey = purpose + '_' + emailId_(email);
  const raw = cache.get(cacheKey);
  if (!raw) return null;
  const entry = JSON.parse(raw);
  const left = entry.expires - Date.now();
  if (left <= 0 || entry.tries >= CODE_MAX_TRIES) {
    cache.remove(cacheKey);
    return null;
  }
  if (!safeEqual_(codeHash_(purpose, email, code), entry.code)) {
    entry.tries += 1;
    cache.put(cacheKey, JSON.stringify(entry), Math.max(1, Math.ceil(left / 1000)));
    return null;
  }
  cache.remove(cacheKey);
  return entry;
}

function code_() {
  return ('000000' + (parseInt(randomHex_().slice(0, 12), 16) % 1000000)).slice(-6);
}

function codeHash_(purpose, email, code) {
  return hmacHex_('code:' + purpose + ':' + email + ':' + code);
}

/** Limits per address (one email a minute, five a day) and overall (MAX_EMAILS_PER_DAY). */
function mayEmail_(email) {
  const cache = CacheService.getScriptCache();
  const id = emailId_(email);
  if (cache.get('cool_' + id)) return false;
  const day = new Date().toISOString().slice(0, 10);
  const perAddress = Number(cache.get('mday_' + day + id) || 0);
  const total = Number(cache.get('mall_' + day) || 0);
  if (perAddress >= MAX_EMAILS_PER_ADDRESS_PER_DAY || total >= MAX_EMAILS_PER_DAY) return false;
  if (MailApp.getRemainingDailyQuota() < 5) return false;
  cache.put('cool_' + id, '1', EMAIL_COOLDOWN_SECONDS);
  cache.put('mday_' + day + id, String(perAddress + 1), 21600);
  cache.put('mall_' + day, String(total + 1), 21600);
  return true;
}

function sendMail_(to, subject, body) {
  MailApp.sendEmail({ to: to, subject: subject, name: 'MyRehbar', body: body + '\n\nMyRehbar · myrehbar.org' });
}

/* ---------------- Checks and hashing ---------------- */

function email_(value) {
  if (typeof value !== 'string') return '';
  const email = value.trim().toLowerCase();
  // Starts with a letter or digit, so it can never be read as a formula.
  return email.length <= 254 && /^[a-z0-9][a-z0-9._%+'-]*@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/.test(email) ? email : '';
}

/** The browser's PBKDF2 key: 32 bytes as base64. */
function key_(value) {
  return typeof value === 'string' && /^[A-Za-z0-9+/]{43}=$/.test(value) ? value : '';
}

function token_(value) {
  return typeof value === 'string' && /^[a-f0-9]{64}$/.test(value) ? value : '';
}

function findAccount_(email) {
  const sheet = sheet_(TABS.accounts);
  const row = findRow_(sheet, 2, email);
  if (!row) return null;
  const v = sheet.getRange(row, 1, 1, 4).getValues()[0];
  return { sheet: sheet, row: row, userId: String(v[0]), salt: String(v[2]), hash: String(v[3]) };
}

function passwordHash_(salt, key) {
  return hmacHex_('password:' + salt + ':' + key);
}

function pepper_() {
  const pepper = PropertiesService.getScriptProperties().getProperty('TRACKER_PEPPER');
  if (!pepper || pepper.length < 64) throw new Error('Run setupTracker first');
  return pepper;
}

function hmacHex_(message) {
  return hex_(Utilities.computeHmacSha256Signature(message, pepper_(), Utilities.Charset.UTF_8));
}

function sha256Hex_(text) {
  return hex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8));
}

function hex_(bytes) {
  return bytes.map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
}

/** 64 hex characters from two random UUIDs (244 random bits, from Java's SecureRandom). */
function randomHex_() {
  return (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '');
}

/** Same time whether the first or last character differs. */
function safeEqual_(a, b) {
  a = String(a);
  b = String(b);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function emailId_(email) {
  return sha256Hex_('email:' + email).slice(0, 40);
}

function authLimited_() {
  return overLimit_('auth', 120, MAX_AUTH_PER_MINUTE);
}

/** Count one more for this key in the current minute. True once the limit is passed. */
function overLimit_(name, ttl, max) {
  const cache = CacheService.getScriptCache();
  const key = 'rl_' + name + '_' + Math.floor(Date.now() / 60000);
  const count = Number(cache.get(key) || 0);
  if (count >= max) return true;
  cache.put(key, String(count + 1), ttl);
  return false;
}

/* ---------------- Sheet ---------------- */

function book_() {
  const id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  if (!id) throw new Error('Add the SHEET_ID script property first');
  return SpreadsheetApp.openById(id);
}

function sheet_(tab) {
  const book = book_();
  let sheet = book.getSheetByName(tab.name);
  if (sheet) return sheet;
  sheet = book.insertSheet(tab.name);
  const width = tab === TABS.data ? tab.headers.length + MAX_CHUNKS : tab.headers.length;
  if (sheet.getMaxColumns() < width) sheet.insertColumnsAfter(sheet.getMaxColumns(), width - sheet.getMaxColumns());
  const headers = tab.headers.slice();
  while (headers.length < width) headers.push('Data part ' + (headers.length - tab.headers.length + 1));
  sheet.getRange(1, 1, 1, width).setValues([headers]).setFontWeight('bold');
  sheet.setFrozenRows(1);
  // Store everything as plain text (dates as ISO text), never as a formula.
  sheet.getRange(1, 1, sheet.getMaxRows(), width).setNumberFormat('@');
  sheet.protect().setDescription('Written by the tracker script: editing by hand can lock people out').setWarningOnly(true);
  return sheet;
}

/** Row number (2+) whose cell in `column` is exactly `value`, or 0. */
function findRow_(sheet, column, value) {
  const last = sheet.getLastRow();
  if (last < 2 || !value) return 0;
  const cell = sheet.getRange(2, column, last - 1, 1).createTextFinder(value).matchEntireCell(true).matchCase(true).findNext();
  return cell ? cell.getRow() : 0;
}

function reply_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------------- Run these from the editor ---------------- */

/**
 * Run once (select "setupTracker" -> Run) after adding the SHEET_ID script property.
 * It creates the secret pepper, the three tabs, asks for permission to send email,
 * and adds a daily clean-up of expired logins.
 */
function setupTracker() {
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('TRACKER_PEPPER')) props.setProperty('TRACKER_PEPPER', randomHex_() + randomHex_());
  Object.keys(TABS).forEach(function (k) { sheet_(TABS[k]); });
  MailApp.getRemainingDailyQuota();
  const hasTrigger = ScriptApp.getProjectTriggers().some(function (t) { return t.getHandlerFunction() === 'cleanupTracker'; });
  if (!hasTrigger) ScriptApp.newTrigger('cleanupTracker').timeBased().everyDays(1).atHour(3).create();
}

/** Removes expired logins. Runs every night (set up by setupTracker). */
function cleanupTracker() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) return;
  try {
    const sheet = sheet_(TABS.sessions);
    const last = sheet.getLastRow();
    if (last < 2) return;
    const now = Date.now();
    const expires = sheet.getRange(2, 4, last - 1, 1).getValues();
    for (let i = expires.length - 1; i >= 0; i--) {
      if (!(new Date(expires[i][0]).getTime() > now)) sheet.deleteRow(i + 2);
    }
  } finally {
    lock.releaseLock();
  }
}
