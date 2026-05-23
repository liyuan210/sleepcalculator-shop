(function() {
  var STORAGE_KEY = 'sleepcalc_consent';
  var defaultConsent = { analytics: false, timestamp: null };
  var consent;

  try {
    consent = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultConsent;
  } catch (e) {
    consent = defaultConsent;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function() { window.dataLayer.push(arguments); };

  function loadAnalytics() {
    if (window.analyticsLoaded || !document.head) return;
    window.analyticsLoaded = true;

    var gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-8D482FWL5M';
    document.head.appendChild(gaScript);

    gaScript.onload = function() {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function() { window.dataLayer.push(arguments); };
      gtag('js', new Date());
      gtag('config', 'G-8D482FWL5M', { anonymize_ip: true });
    };
  }

  function saveConsent(newConsent) {
    newConsent.timestamp = Date.now();
    consent = newConsent;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch (e) {}
    hideBanner();
    if (consent.analytics) {
      loadAnalytics();
    }
  }

  function createBanner() {
    var banner = document.createElement('div');
    banner.id = 'consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie and Analytics Consent');
    banner.style.position = 'fixed';
    banner.style.bottom = '0';
    banner.style.left = '0';
    banner.style.right = '0';
    banner.style.zIndex = '99999';
    banner.style.background = 'rgba(255,255,255,0.98)';
    banner.style.boxShadow = '0 -6px 20px rgba(0,0,0,0.15)';
    banner.style.padding = '16px';
    banner.style.fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif';

    var container = document.createElement('div');
    container.style.maxWidth = '1100px';
    container.style.margin = '0 auto';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.gap = '12px';
    container.style.flexWrap = 'wrap';

    var text = document.createElement('div');
    text.style.flex = '1';
    text.style.color = '#4a5568';
    text.style.fontSize = '0.95rem';
    text.innerHTML =
      'We use cookies and Google Analytics to improve the site. ' +
      'Analytics are only enabled after you consent. ' +
      '<a href="/privacy.html" style="color:#667eea;text-decoration:none;">Privacy Policy</a>';

    var actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '10px';
    actions.style.flexWrap = 'wrap';

    function mkBtn(label, bg, color) {
      var btn = document.createElement('button');
      btn.textContent = label;
      btn.style.padding = '10px 14px';
      btn.style.border = 'none';
      btn.style.borderRadius = '8px';
      btn.style.cursor = 'pointer';
      btn.style.background = bg;
      btn.style.color = color;
      btn.style.fontWeight = '600';
      btn.style.minHeight = '40px';
      return btn;
    }

    var acceptBtn = mkBtn('Accept analytics', 'linear-gradient(135deg,#667eea,#764ba2)', '#fff');
    var rejectBtn = mkBtn('Reject analytics', '#edf2f7', '#2d3748');
    var manageBtn = mkBtn('Manage choices', '#edf2f7', '#2d3748');

    acceptBtn.addEventListener('click', function() {
      saveConsent({ analytics: true });
    });

    rejectBtn.addEventListener('click', function() {
      saveConsent({ analytics: false });
    });

    manageBtn.addEventListener('click', function() {
      var allowAnalytics = confirm('Allow Google Analytics? OK = Yes, Cancel = No');
      saveConsent({ analytics: allowAnalytics });
    });

    actions.appendChild(acceptBtn);
    actions.appendChild(rejectBtn);
    actions.appendChild(manageBtn);

    container.appendChild(text);
    container.appendChild(actions);
    banner.appendChild(container);
    document.body.appendChild(banner);
  }

  function hideBanner() {
    var el = document.getElementById('consent-banner');
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  }

  function init() {
    if (consent.analytics) {
      loadAnalytics();
    }
    if (!consent.timestamp) {
      createBanner();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();