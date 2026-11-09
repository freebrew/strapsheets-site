(() => {
  "use strict";

  const PACKAGE = "com.strapsheets.app";
  const LISTING_URL = `https://play.google.com/store/apps/details?id=${PACKAGE}`;
  const OPT_IN_URL = `https://play.google.com/apps/testing/${PACKAGE}`;
  const PAGE_URL = "https://strapsheets.agent-swarm.net/beta/";

  const userAgent = String(window.navigator.userAgent || "");
  const isAndroid = /Android/i.test(userAgent);
  const isIos = /iPhone|iPad|iPod/i.test(userAgent);
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

  if (inAppBrowser && !isIos) {
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

  const tabs = document.querySelectorAll("[data-beta-tab]");
  const panels = document.querySelectorAll("[data-beta-panel]");

  function selectPlatform(platform) {
    for (const tab of tabs) {
      const active = tab.getAttribute("data-beta-tab") === platform;
      tab.setAttribute("aria-selected", active ? "true" : "false");
    }
    for (const panel of panels) {
      panel.hidden = panel.getAttribute("data-beta-panel") !== platform;
    }
  }

  for (const tab of tabs) {
    if (typeof tab.addEventListener === "function") {
      tab.addEventListener("click", () => {
        selectPlatform(tab.getAttribute("data-beta-tab"));
      });
    }
  }

  if (tabs.length > 0 && panels.length > 0) {
    selectPlatform(isIos ? "ios" : "android");
  }
})();
