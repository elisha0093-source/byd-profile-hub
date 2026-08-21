(() => {
  const cfg = window.BYD_PROFILE_CONFIG || {};
  const form = document.getElementById('leadForm');
  const status = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');
  const modelSelect = form.querySelector('[name="model"]');

  const qs = new URLSearchParams(location.search);
  document.getElementById('sourceField').value = qs.get('src') || qs.get('utm_source') || 'direct';
  document.getElementById('pageUrlField').value = location.href;

  const phoneDigits = (cfg.phone || '').replace(/\D/g,'');
  document.getElementById('phoneText').textContent = cfg.phone || '연락처 설정 필요';
  document.getElementById('callBtn').href = phoneDigits ? `tel:${phoneDigits}` : '#';
  document.getElementById('smsBtn').href = phoneDigits ? `sms:${phoneDigits}` : '#';
  document.getElementById('kakaoBtn').href = cfg.kakaoUrl || '#';

  document.querySelectorAll('.model-consult').forEach(btn => {
    btn.addEventListener('click', () => {
      const model = btn.closest('.car-card').dataset.model;
      modelSelect.value = model;
      document.getElementById('consult').scrollIntoView({behavior:'smooth'});
      setTimeout(() => modelSelect.focus(), 450);
    });
  });

  const modal = document.getElementById('privacyModal');
  document.getElementById('privacyBtn').addEventListener('click', () => {
    modal.classList.add('open'); modal.setAttribute('aria-hidden','false');
  });
  document.getElementById('privacyClose').addEventListener('click', () => {
    modal.classList.remove('open'); modal.setAttribute('aria-hidden','true');
  });
  modal.addEventListener('click', e => { if(e.target === modal) document.getElementById('privacyClose').click(); });

  function normalizePhone(value){
    return value.replace(/\D/g,'');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.className = 'status';

    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    const phone = normalizePhone(data.phone || '');

    if (!data.name.trim() || !phone || !data.model) {
      status.textContent = '이름, 연락처, 관심차종을 확인해 주세요.';
      status.classList.add('bad');
      return;
    }
    if (phone.length < 10 || phone.length > 11) {
      status.textContent = '연락처 형식을 확인해 주세요.';
      status.classList.add('bad');
      return;
    }
    if (!form.querySelector('[name="privacy"]').checked) {
      status.textContent = '개인정보 수집·이용 동의가 필요합니다.';
      status.classList.add('bad');
      return;
    }
    if (!cfg.formEndpoint || cfg.formEndpoint.includes('PASTE_')) {
      status.textContent = '아직 수신 서버가 연결되지 않았습니다. config.js의 formEndpoint를 설정해 주세요.';
      status.classList.add('bad');
      return;
    }

    data.phone = phone;
    data.userAgent = navigator.userAgent;
    data.referrer = document.referrer || '';
    data.submittedAtClient = new Date().toISOString();

    submitBtn.disabled = true;
    submitBtn.textContent = '신청 중...';

    try {
      // Google Apps Script Web App에 JSON 대신 text/plain으로 보내 CORS preflight를 피합니다.
      const res = await fetch(cfg.formEndpoint, {
        method: 'POST',
        headers: {'Content-Type': 'text/plain;charset=utf-8'},
        body: JSON.stringify(data)
      });
      const result = await res.json();

      if (!result.ok) throw new Error(result.message || 'submit failed');

      form.reset();
      document.getElementById('sourceField').value = qs.get('src') || qs.get('utm_source') || 'direct';
      document.getElementById('pageUrlField').value = location.href;
      status.textContent = '신청이 완료되었습니다. 확인 후 연락드리겠습니다.';
      status.classList.add('ok');
    } catch (err) {
      console.error(err);
      status.textContent = '전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
      status.classList.add('bad');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = '시승 · 상담 신청하기';
    }
  });
})();