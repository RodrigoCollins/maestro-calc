// Google Tag Manager behind Consent Mode v2, loaded after the page (analytics-gtm).
// The container id comes from the tag's data-gtm attribute; the file runs on the production host
// only, so previews and the browser tests send nothing to Google.
(function () {
  var tag = document.currentScript;
  var id = tag && tag.getAttribute('data-gtm');
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
  // The address without its query: a calculator keeps the typed values in the query, and they must
  // not reach analytics. The GA4 tag of the container sends this as page_location.
  dataLayer.push({ page_location_clean: location.origin + location.pathname });
  dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });

  function load() {
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(id);
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
