(() => {
  'use strict';
  const cfg = window.BYD_PROFILE_CONFIG || {};
  const form = document.getElementById('leadForm'), status = document.getElementById('formStatus'), submitBtn = document.getElementById('submitBtn');
  const modelSelect = form.querySelector('[name="model"]'), messageField = form.querySelector('[name="message"]');
  const qs = new URLSearchParams(location.search);
  const keys = ['utm_source','utm_medium','utm_campaign','utm_content','fbclid','gclid'];
  const storageKey = 'byd_profile_attribution_v1';
  const attribution = {};
  try {
    const cached = JSON.parse(sessionStorage.getItem(storageKey) || '{}');
    for (const key of keys) if (typeof cached[key] === 'string') attribution[key] = cached[key];
  } catch (_) {}
  // First nonempty value per parameter within this session; no full URL or PII is stored.
  for (const key of keys) if (qs.get(key) && !Object.hasOwn(attribution,key)) attribution[key] = qs.get(key);
  try { sessionStorage.setItem(storageKey,JSON.stringify(attribution)); } catch (_) {}
  const source = qs.get('src') || attribution.utm_source || 'direct';
  const landingModel = qs.get('model') || '';
  const models = {DOLPHIN:'DOLPHIN',ATTO3:'ATTO 3 Plus',SEAL:'SEAL',SEALION7:'SEALION 7',SEALION6:'SEALION 6 DM-i'};
  if (Object.hasOwn(models,landingModel)) modelSelect.value = models[landingModel];
  function fillHidden(eventId = '') {
    form.elements.source.value = source; form.elements.pageUrl.value = location.href;
    for (const key of keys) form.elements[key].value = attribution[key] || '';
    form.elements.landing_model.value = landingModel; form.elements.event_id.value = eventId;
  }
  fillHidden();
  function eventFields(eventId = '') {
    return {model:modelSelect.value,request_type:form.querySelector('[name="requestType"]:checked')?.value || '',utm_source:attribution.utm_source || '',event_id:eventId};
  }
  function track(event,fields) { try { window.BYD_PROFILE_TRACK?.(event,fields); } catch (_) {} }
  const phoneDigits = (cfg.phone || '').replace(/\D/g,'');
  document.getElementById('callBtn').href = phoneDigits ? `tel:${phoneDigits}` : '#';
  document.getElementById('smsBtn').href = phoneDigits ? `sms:${phoneDigits}` : '#';
  document.getElementById('kakaoBtn').href = cfg.kakaoUrl || '#';
  // Includes the existing direct Kakao button as well as the bottom contact block.
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href]'); if (!link) return;
    const href = link.getAttribute('href') || '';
    if (href.startsWith('tel:')) track('profile_tel_click',eventFields());
    else if (href.startsWith('sms:')) track('profile_sms_click',eventFields());
    else { try { const u = new URL(link.href); if (u.protocol === 'https:' && u.hostname === 'pf.kakao.com') track('profile_kakao_click',eventFields()); } catch (_) {} }
  });
  document.querySelectorAll('.model-consult').forEach(btn => btn.addEventListener('click',() => {
    modelSelect.value = btn.closest('.car-card').dataset.model;
    track('profile_model_consult_click',eventFields());
    document.getElementById('consult').scrollIntoView({behavior:'smooth'}); setTimeout(() => modelSelect.focus(),450);
  }));
  document.querySelectorAll('.quick-question').forEach(btn => btn.addEventListener('click',() => {
    messageField.value = btn.dataset.message || ''; document.getElementById('consult').scrollIntoView({behavior:'smooth'}); setTimeout(() => messageField.focus(),450);
  }));
  const modal = document.getElementById('privacyModal');
  document.getElementById('privacyBtn').addEventListener('click',() => {modal.classList.add('open');modal.setAttribute('aria-hidden','false');});
  document.getElementById('privacyClose').addEventListener('click',() => {modal.classList.remove('open');modal.setAttribute('aria-hidden','true');});
  modal.addEventListener('click',e => {if (e.target === modal) document.getElementById('privacyClose').click();});
  const normalizePhone = value => value.replace(/\D/g,'');
  let inFlight = false;
  form.addEventListener('submit',async e => {
    e.preventDefault(); if (inFlight) return;
    status.className = 'status';
    const data = Object.fromEntries(new FormData(form).entries());
    const phone = normalizePhone(data.phone || '');
    if (!(data.name || '').trim() || !phone || !data.model) {status.textContent='이름, 연락처, 관심차종을 확인해 주세요.';status.classList.add('bad');return;}
    if (phone.length < 10 || phone.length > 11) {status.textContent='연락처 형식을 확인해 주세요.';status.classList.add('bad');return;}
    if (!form.querySelector('[name="privacy"]').checked) {status.textContent='개인정보 수집·이용 동의가 필요합니다.';status.classList.add('bad');return;}
    if (!cfg.formEndpoint) {status.textContent='상담 수신 주소가 설정되지 않았습니다.';status.classList.add('bad');return;}
    inFlight = true; submitBtn.disabled = true; submitBtn.textContent = '신청 중...';
    try {
      const eventId = crypto.randomUUID(); fillHidden(eventId);
      const payload = Object.fromEntries(new FormData(form).entries());
      payload.phone = phone; payload.userAgent = navigator.userAgent; payload.referrer = document.referrer || ''; payload.submittedAtClient = new Date().toISOString();
      const trackedFields = eventFields(eventId);
      const response = await fetch(cfg.formEndpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});
      if (!response.ok) throw new Error('HTTP submission failed');
      const result = await response.json();
      if (result.ok !== true) throw new Error('Submission rejected');
      // Capture values before reset; exactly one Lead only in this success branch.
      track('profile_lead_submitted',trackedFields);
      form.reset(); fillHidden(); // Do not reapply landing model after a successful submission.
      status.textContent='신청이 완료되었습니다. 확인 후 연락드리겠습니다.';status.classList.add('ok');
    } catch (_) {
      // Do not print submitted data or remote error bodies.
      status.textContent='전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';status.classList.add('bad');
    } finally {inFlight=false;submitBtn.disabled=false;submitBtn.textContent='상담 신청하기';}
  });
})();
