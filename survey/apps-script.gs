/**
 * DOST kiosk Client Satisfaction Survey -> Google Sheet
 * Paste into the Sheet: Extensions > Apps Script, replace everything, Save.
 * Deploy > New deployment > Web app, Execute as: Me, Who has access: Anyone.
 */
const SHEET_NAME = 'Responses';
const TOKEN = 'dost-co-kiosk';

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.token !== TOKEN) return out({ ok: false, error: 'bad token' });
    const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
    const s = d.sqd || [];
    const row = [new Date(), d.submittedAt, d.build, d.clientType, d.sex, d.age, d.region, d.service,
      d.cc1, d.cc2, d.cc3];
    for (let i = 0; i < 9; i++) row.push(s[i]);
    row.push(d.suggestions, d.email);
    sh.appendRow(row.map((v, i) => i === 0 ? v : clean(v)));
    return out({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

// Plain text only, so nothing typed on the kiosk can run as a formula.
function clean(v) {
  v = String(v == null ? '' : v).slice(0, 2000);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function doGet() {
  return out({ ok: true, service: 'DOST kiosk survey' });
}

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
