/**
 * Simple Consent Banner for Cookies & Google AdSense
 * - Shows a banner until the user provides consent
 * - Blocks ads rendering (adsbygoogle.push) before consent
 * - Remembers consent in localStorage
 */
(function() {
  var STORAGE_KEY = 'sleepcalc_consent';
  var defaultConsent = { ads: false, personalized: false, timestamp: null };
  var consent;

  try {
    consent = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultConsent;
  } catch (e) {
    consent = defaultConsent;
  }

  // Before consent, prevent ads from rendering
  if (!consent.ads) {
    window.adsbygoogle = { push: function() { /* blocked until consent */ } };
  } else {
    window.adsbygoogle = window.adsbygoogle || [];
  }

  function saveConsent(newConsent) {
    newConsent.timestamp = Date.now();
    consent = newConsent;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    // Enable ads rendering after consent
    window.adsbygoogle = window.adsbygoogle || [];
    // Optionally re-trigger ad slots if present on page
    // document.querySelectorAll('.adsbygoogle').forEach(function(el){ (adsbygoogle = window.adsbygoogle || []).push({}); });
    hideBanner();
  }

  function createBanner() {
    var banner = document.createElement('div');
    banner.id = 'consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie and Ads Consent');
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
      'We use cookies and Google AdSense to provide and improve our services. ' +
      'Ads may use cookies or identifiers. You can manage your preferences. ' +
      '<a href="/privacy.html" style="color:#667eea;text-decoration:none;">Privacy Policy</a> · ' +
      '<a href="https://www.google.com/settings/ads" target="_blank" rel="noopener" style="color:#667eea;text-decoration:none;">Ad Settings</a>';

    var actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '10px';

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

    var acceptAll = mkBtn('Accept all', 'linear-gradient(135deg,#667eea,#764ba2)', '#fff');
    var rejectAds = mkBtn('Reject ads', '#edf2f7', '#2d3748');
    var manageBtn = mkBtn('Manage choices', '#edf2f7', '#2d3748');

    acceptAll.addEventListener('click', function() {
      saveConsent({ ads: true, personalized: true, timestamp: Date.now() });
    });

    rejectAds.addEventListener('click', function() {
      saveConsent({ ads: false, personalized: false, timestamp: Date.now() });
      // Keep ads blocked (no change to window.adsbygoogle mock)
    });

    manageBtn.addEventListener('click', function() {
      // Simple toggle personalized option
      var wantAds = confirm('Enable ads? (OK = Yes, Cancel = No)');
      var personalized = false;
      if (wantAds) {
        personalized = confirm('Allow personalized ads? (OK = Yes, Cancel = No)');
      }
      saveConsent({ ads: !!wantAds, personalized: !!personalized, timestamp: Date.now() });
    });

    actions.appendChild(acceptAll);
    actions.appendChild(rejectAds);
    actions.appendChild(manageBtn);

    container.appendChild(text);
    container.appendChild(actions);
    banner.appendChild(container);
    document.body.appendChild(banner);
  }

  function hideBanner() {
    var el = document.getElementById('consent-banner');
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  function init() {
    if (!consent.ads) {
      // Show banner only if not consented
      createBanner();
    } else {
      // already consented, ensure ads array exists
      window.adsbygoogle = window.adsbygoogle || [];
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();