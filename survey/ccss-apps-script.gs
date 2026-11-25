/**
 * DOST-CO CCSS (DOSTCO-001 Rev. 7) from the lobby kiosk.
 * Each answer is saved to the "Responses" tab and emailed to RECIPIENT.
 *
 * Setup, once: create an Apps Script project (script.google.com > New project,
 * or Extensions > Apps Script in the Sheet), replace everything with this file, Save.
 * Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone.
 * Authorize, then copy the Web app URL (ends in /exec) into the kiosk.
 */
const RECIPIENT = 'woosila@dost.gov.ph';
const SHEET_ID = '1SgsBcrMM6ZwCfg1nL3_O3cNJdNnCnYHckTqXIPoDuho'; // DOST-CO CCSS – Kiosk Responses
const SHEET_NAME = 'Responses';
const TOKEN = 'dost-co-kiosk';
const SQD = [
  'I am satisfied with the service that I availed.',
  'I spent a reasonable amount of time for my transaction.',
  "The office followed the transaction's requirements and steps based on the information provided.",
  'I easily found information about my transaction from the office or its website.',
  'I paid an acceptable amount of fees for my transaction.',
  'I feel the office was fair to everyone during my transaction.',
  'I was treated courteously by the staff and the staff was helpful.',
  'I got what I needed from the government office.'
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.token !== TOKEN) return out({ ok: false, error: 'bad token' });
    // A kiosk may resend an answer after a network hiccup: keep only the first copy.
    const cache = CacheService.getScriptCache();
    if (d.id && cache.get('id_' + d.id)) return out({ ok: true, duplicate: true });

    const s = d.sqd || [];
    const row = [new Date(), d.submittedAt, d.build, d.name, d.sex, d.contact, d.age, d.email,
      d.clientType, d.affiliation, d.office, d.personnel, d.visit, d.purpose, d.cc1, d.cc2, d.cc3];
    for (let i = 0; i < 8; i++) row.push(s[i]);
    row.push(d.comments, d.complaints, whyText(d));
    SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME)
      .appendRow(row.map((v, i) => i === 0 ? v : clean(v)));

    sendMail(d);
    if (d.id) cache.put('id_' + d.id, '1', 21600);
    return out({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function sendMail(d) {
  const s = d.sqd || [];
  const info = [
    ['Name of citizen/client', d.name], ['Sex at birth', d.sex], ['Contact no.', d.contact],
    ['Age bracket', d.age], ['Email', d.email], ['Citizen or client type', d.clientType],
    ['Agency/school/company affiliation', d.affiliation], ['Office or unit visited', d.office],
    ['DOST-CO personnel attending', d.personnel], ['Date and time of visit', d.visit],
    ['Purpose of visit', d.purpose],
    ['CC1 Awareness of CC', d.cc1], ['CC2 Visibility of CC', d.cc2], ['CC3 Helpfulness of CC', d.cc3]
  ];
  const why = d.why || [];
  SQD.forEach((q, i) => {
    info.push([(i + 1) + '. ' + q, s[i]]);
    if (why[i]) info.push(['\u2003Why dissatisfied', why[i], true]);
  });
  info.push(['Comments or suggestions', d.comments], ['Complaint/s', d.complaints]);

  const rows = info.map(([k, v, hot]) =>
    '<tr><td style="padding:6px 10px;border:1px solid #ccd;background:' + (hot ? '#fde8d8' : '#f3f6fa') + ';font-weight:bold;vertical-align:top">' +
    esc(k) + '</td><td style="padding:6px 10px;border:1px solid #ccd;vertical-align:top' + (hot ? ';background:#fff4ec' : '') + '">' +
    (esc(v) || '<span style="color:#889">(blank)</span>') + '</td></tr>').join('');
  const html = '<p>A Citizen/Client Satisfaction Survey (DOSTCO-001 Rev. 7) was submitted at the lobby kiosk on ' +
    esc(d.submittedAt) + '.</p><table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:13px">' +
    rows + '</table>';

  const who = d.affiliation || d.name || 'Walk-in client';
  const unhappy = s.some(v => v === 'Dissatisfied' || v === 'Very dissatisfied');
  const subject = (d.complaints ? '[With complaint] ' : '') + (unhappy ? '[Dissatisfied] ' : '') + 'CCSS (kiosk): ' + who + ', ' + (d.visit || d.submittedAt);
  const msg = { to: RECIPIENT, subject: subject, htmlBody: html, name: 'DOST-CO Lobby Kiosk' };
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email || '')) msg.replyTo = d.email;
  MailApp.sendEmail(msg);
}

// "SQD2 (Dissatisfied): reason; SQD5 (Very dissatisfied): reason"
function whyText(d) {
  const s = d.sqd || [], why = d.why || [];
  return why.map((w, i) => w ? 'SQD' + (i + 1) + ' (' + s[i] + '): ' + w : '').filter(Boolean).join('; ');
}

// Plain text only, so nothing typed on the kiosk can run as a formula.
function clean(v) {
  v = String(v == null ? '' : v).slice(0, 3000);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}
function esc(v) {
  return String(v == null ? '' : v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
// Run once from the editor to grant permissions (adds nothing to the Sheet).
function authorize() {
  SpreadsheetApp.openById(SHEET_ID).getName();
  MailApp.getRemainingDailyQuota();
}
function doGet() { return out({ ok: true, service: 'DOST-CO CCSS kiosk' }); }
function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
