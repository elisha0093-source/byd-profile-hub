(() => {
  'use strict';
  const cfg = window.BYD_TRACKING_CONFIG || {};
  window.dataLayer = window.dataLayer || [];
  function report(error) { console.warn('Tracking unavailable.'); }
  if (cfg.enabled === true) {
    if (/^G-[A-Z0-9]+$/.test(cfg.ga4Id || '')) {
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js',new Date()); window.gtag('config',cfg.ga4Id);
      const script = document.createElement('script'); script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(cfg.ga4Id); document.head.append(script);
    }
    if (/^\d+$/.test(cfg.metaPixelId || '')) {
      const fbq = window.fbq = function () { fbq.callMethod ? fbq.callMethod.apply(fbq,arguments) : fbq.queue.push(arguments); };
      fbq.push = fbq; fbq.loaded = true; fbq.version = '2.0'; fbq.queue = [];
      const script = document.createElement('script'); script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js'; document.head.append(script);
      fbq('init',cfg.metaPixelId); fbq('track','PageView');
    }
  }
  const sentLeadIds = new Set();
  const allowed = new Set(['profile_lead_submitted','profile_kakao_click','profile_tel_click','profile_sms_click','profile_model_consult_click']);
  const modelValues = new Set(['','DOLPHIN','DOLPHIN Active','ATTO 3 Plus','SEAL','SEAL Plus','SEAL Dynamic AWD','SEALION 6 DM-i','SEALION 7','SEALION 7 Plus','아직 미정']);
  const requestValues = new Set(['','시승신청','견적요청','구매상담']);
  window.BYD_PROFILE_TRACK = (event,fields = {}) => {
    try {
      if (!allowed.has(event)) return;
      const lead = event === 'profile_lead_submitted';
      const id = String(fields.event_id || '');
      if (lead && (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id) || sentLeadIds.has(id))) return;
      // Explicit allowlist: never spread form payloads or log personal fields.
      const payload = {event,
        model:modelValues.has(fields.model) ? fields.model : '',
        request_type:requestValues.has(fields.request_type) ? fields.request_type : '',
        utm_source:String(fields.utm_source || '').slice(0,200),
        event_id:lead ? id : ''};
      if (lead) sentLeadIds.add(id);
      window.dataLayer.push(payload);
      if (cfg.enabled !== true) return;
      // gtag has its own command queue; this generates one GA4 event, without GTM triggers.
      if (typeof window.gtag === 'function' && /^G-[A-Z0-9]+$/.test(cfg.ga4Id || '')) {
        const {event:_,...params} = payload;
        window.gtag('event',lead ? 'generate_lead' : event,params);
      }
      if (typeof window.fbq === 'function' && /^\d+$/.test(cfg.metaPixelId || '')) {
        const params = {model:payload.model,request_type:payload.request_type,utm_source:payload.utm_source};
        if (lead) window.fbq('track','Lead',params,{eventID:id});
        else if (['profile_kakao_click','profile_tel_click','profile_sms_click'].includes(event)) window.fbq('track','Contact',params);
      }
    } catch (error) { report(error); }
  };
})();
