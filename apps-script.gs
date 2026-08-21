/**
 * BYD Profile Hub → Google Sheets + Telegram
 *
 * 1) 새 Google Sheet 생성
 * 2) 확장 프로그램 → Apps Script
 * 3) 이 파일 전체 붙여넣기
 * 4) 아래 SHEET_ID, SHEET_NAME 설정
 * 5) Telegram 사용 시 BOT_TOKEN, CHAT_ID 설정
 * 6) 배포 → 새 배포 → 웹 앱
 *    실행 사용자: 나
 *    액세스 권한: 모든 사용자
 * 7) 생성된 /exec URL을 사이트 config.js formEndpoint에 입력
 */

const SHEET_ID = 'PASTE_GOOGLE_SHEET_ID';
const SHEET_NAME = '웹상담';

// Telegram을 쓰지 않으면 빈 문자열로 두세요.
const BOT_TOKEN = '';
const CHAT_ID = '';

function doGet() {
  return json_({ok:true, service:'BYD Profile Lead Receiver'});
}

function doPost(e) {
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);

    const payload = JSON.parse(e.postData.contents || '{}');

    const name = clean_(payload.name);
    const phone = clean_(payload.phone);
    const model = clean_(payload.model);
    const requestType = clean_(payload.requestType);
    const message = clean_(payload.message);
    const source = clean_(payload.source);
    const pageUrl = clean_(payload.pageUrl);
    const referrer = clean_(payload.referrer);

    if (!name || !phone || !model) {
      return json_({ok:false, message:'required fields missing'});
    }

    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

    ensureHeader_(sheet);

    const now = new Date();
    const leadId = Utilities.getUuid();

    sheet.appendRow([
      now,
      leadId,
      name,
      phone,
      model,
      requestType,
      message,
      source,
      '신규',
      pageUrl,
      referrer,
      ''
    ]);

    if (BOT_TOKEN && CHAT_ID) {
      const text = [
        '🚘 BYD 신규 상담',
        '',
        `이름: ${name}`,
        `연락처: ${phone}`,
        `관심차종: ${model}`,
        `요청: ${requestType || '-'}`,
        `문의: ${message || '-'}`,
        `유입: ${source || 'direct'}`
      ].join('\n');

      sendTelegram_(text);
    }

    return json_({ok:true, leadId});
  } catch (err) {
    console.error(err);
    return json_({ok:false, message:String(err)});
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() > 0) return;

  sheet.appendRow([
    '접수일시',
    'Lead ID',
    '이름',
    '연락처',
    '관심차종',
    '상담유형',
    '문의내용',
    '유입경로',
    '상태',
    '페이지URL',
    'Referrer',
    '메모'
  ]);

  sheet.setFrozenRows(1);
}

function sendTelegram_(text) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      chat_id: CHAT_ID,
      text: text
    }),
    muteHttpExceptions: true
  });
}

function clean_(v) {
  return String(v == null ? '' : v).trim().slice(0, 1000);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
