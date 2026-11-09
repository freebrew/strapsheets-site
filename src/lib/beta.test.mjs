import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const betaPath = path.join(root, "public/beta.js");
const source = fs.readFileSync(betaPath, "utf8");

function makeLink(intentName, href) {
  const attrs = { href, target: "_blank", rel: "noopener noreferrer", "data-intent": intentName };
  return {
    getAttribute: (name) => (name in attrs ? attrs[name] : null),
    setAttribute: (name, value) => {
      attrs[name] = value;
    },
    removeAttribute: (name) => {
      delete attrs[name];
    },
    attrs,
  };
}

function run(userAgent) {
  const optIn = makeLink("play-optin", "https://play.google.com/apps/testing/com.strapsheets.app");
  const listing = makeLink("play-listing", "https://play.google.com/store/apps/details?id=com.strapsheets.app");
  const notice = { hidden: true };
  const chrome = {
    hidden: true,
    attrs: {},
    setAttribute(name, value) {
      this.attrs[name] = value;
    },
  };
  const elements = { "inapp-notice": notice, "open-chrome": chrome };
  const context = {
    encodeURIComponent,
    document: {
      getElementById: (id) => elements[id] || null,
      querySelectorAll: (selector) => {
        assert.equal(selector, "a[data-intent]");
        return [optIn, listing];
      },
    },
    window: { navigator: { userAgent } },
  };
  vm.runInNewContext(source, context, { filename: betaPath });
  return { optIn, listing, notice, chrome };
}

const chromeAndroid = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/126.0 Mobile Safari/537.36";
const facebookAndroid = `${chromeAndroid} [FB_IAB/FB4A;FBAV/470.0.0.0;]`;
const desktop = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36";

test("beta.js avoids innerHTML, network calls, and storage", () => {
  assert.doesNotMatch(source, /\binnerHTML\b/);
  assert.doesNotMatch(source, /\b(?:fetch|XMLHttpRequest|sendBeacon|WebSocket|EventSource)\b|\bimport\s*\(/);
  assert.doesNotMatch(source, /\b(?:localStorage|sessionStorage|indexedDB|cookie)\b/);
});

test("beta.js rewrites Play links to Play Store intents on Android Chrome", () => {
  const { optIn, listing, notice, chrome } = run(chromeAndroid);
  assert.match(listing.attrs.href, /^intent:\/\/details\?id=com\.strapsheets\.app#Intent;scheme=market;package=com\.android\.vending;/);
  assert.ok(
    listing.attrs.href.includes(
      "S.browser_fallback_url=" + encodeURIComponent("https://play.google.com/store/apps/details?id=com.strapsheets.app"),
    ),
  );
  assert.match(optIn.attrs.href, /^intent:\/\/play\.google\.com\/apps\/testing\/com\.strapsheets\.app#Intent;scheme=https;package=com\.android\.vending;/);
  assert.equal(listing.attrs.target, undefined);
  assert.equal(notice.hidden, true);
  assert.equal(chrome.hidden, true);
});

test("beta.js reveals Open in Chrome notice inside Android in-app browsers", () => {
  const { listing, notice, chrome } = run(facebookAndroid);
  assert.equal(notice.hidden, false);
  assert.equal(chrome.hidden, false);
  assert.match(chrome.attrs.href, /^intent:\/\/strapsheets\.agent-swarm\.net\/beta\/#Intent;scheme=https;package=com\.android\.chrome;/);
  assert.match(listing.attrs.href, /^intent:\/\//);
});

test("beta.js preserves standard web links on desktop", () => {
  const { optIn, listing, notice } = run(desktop);
  assert.equal(optIn.attrs.href, "https://play.google.com/apps/testing/com.strapsheets.app");
  assert.equal(listing.attrs.target, "_blank");
  assert.equal(notice.hidden, true);
});
