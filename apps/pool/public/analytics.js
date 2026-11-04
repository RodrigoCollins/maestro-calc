// Google Analytics 4 (gtag.js) behind Consent Mode v2, loaded after the page.
// The measurement id comes from the tag's data-ga attribute; the file runs on the production host
// only, so previews and the browser tests send nothing to Google. Same consent and privacy rules
// as Maestro Calc's loader (apps/web/public/analytics.js).
(function () {
  var tag = document.currentScript;
  var id = tag && tag.getAttribute('data-ga');
  if (!id || location.hostname !== tag.getAttribute('data-host')) return;

  var dataLayer = (window.dataLayer = window.dataLayer || []);
  // gtag queues the arguments object itself, as Google's snippet does.
  function gtag() {
    dataLayer.push(arguments);
  }
  // No advertising yet: ad storage stays denied everywhere. Analytics is denied by default in the
  // EEA, the United Kingdom and Switzerland (no consent banner yet), and for a Global Privacy
  // Control signal.
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: navigator.globalPrivacyControl === true ? 'denied' : 'granted',
  });
  gtag('consent', 'default', {
    analytics_storage: 'denied',
    region: [
      'AT',
      'BE',
      'BG',
      'HR',
      'CY',
      'CZ',
      'DK',
      'EE',
      'FI',
      'FR',
      'DE',
      'GR',
      'HU',
      'IE',
      'IT',
      'LV',
      'LT',
      'LU',
      'MT',
      'NL',
      'PL',
      'PT',
      'RO',
      'SK',
      'SI',
      'ES',
      'SE',
      'IS',
      'LI',
      'NO',
      'GB',
      'CH',
    ],
  });
  // The addresses without their query: a calculator keeps the typed hours and pay in the query,
  // and they must not reach analytics. Only the campaign tags (utm_*) of the page's own address
  // are kept, so a post's link can be attributed. A same-site referrer is the full address of the
  // page before, values included, so it keeps nothing after the path.
  var campaign = location.search
    .slice(1)
    .split('&')
    .filter(function (pair) {
      return /^utm_[a-z]+=/.test(pair);
    })
    .join('&');
  gtag('js', new Date());
  gtag('config', id, {
    page_location: location.origin + location.pathname + (campaign ? '?' + campaign : ''),
    page_referrer: document.referrer.split(/[?#]/)[0],
  });

  function load() {
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(script);
  }
  // After the load event and an idle moment, so the tag never competes with the page itself.
  function later() {
    if ('requestIdleCallback' in window) requestIdleCallback(load, { timeout: 3000 });
    else setTimeout(load, 1);
  }
  if (document.readyState === 'complete') later();
  else addEventListener('load', later, { once: true });
})();
