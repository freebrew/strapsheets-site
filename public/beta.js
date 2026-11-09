(() => {
  "use strict";

  const PACKAGE = "com.strapsheets.app";
  const LISTING_URL = `https://play.google.com/store/apps/details?id=${PACKAGE}`;
  const OPT_IN_URL = `https://play.google.com/apps/testing/${PACKAGE}`;
  const PAGE_URL = "https://strapsheets.agent-swarm.net/beta/";

  const userAgent = String(window.navigator.userAgent || "");
  const isAndroid = /Android/i.test(userAgent);
  const inAppBrowser = /FBAN|FBAV|FB_IAB|FBIOS|Instagram|Messenger|TikTok|musical_ly|Snapchat|Pinterest|Line\/|Twitter/i.test(userAgent);

  function intentUrl(target, scheme, packageName, fallbackUrl) {
    return `intent://${target}#Intent;scheme=${scheme};package=${packageName};` +
      `S.browser_fallback_url=${encodeURIComponent(fallbackUrl)};end`;
  }

  const intents = {
    "play-listing": intentUrl(`details?id=${PACKAGE}`, "market", "com.android.vending", LISTING_URL),
    "play-optin": intentUrl(`play.google.com/apps/testing/${PACKAGE}`, "https", "com.android.vending", OPT_IN_URL),
  };

  if (isAndroid) {
    for (const link of document.querySelectorAll("a[data-intent]")) {
      const intent = intents[link.getAttribute("data-intent")];
      if (intent) {
        link.setAttribute("href", intent);
        link.removeAttribute("target");
        link.removeAttribute("rel");
      }
    }
  }

  if (inAppBrowser) {
    const notice = document.getElementById("inapp-notice");
    const chrome = document.getElementById("open-chrome");
    if (notice) {
      notice.hidden = false;
    }
    if (chrome && isAndroid) {
      chrome.setAttribute(
        "href",
        intentUrl("strapsheets.agent-swarm.net/beta/", "https", "com.android.chrome", PAGE_URL),
      );
      chrome.hidden = false;
    }
  }
})();
