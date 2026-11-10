// Builds src/generated/silhouettes.mjs from StrapSheets vector SVGs.
// The site build imports only the committed module. Pass STRAPSHEETS_DIR when regenerating.

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.join(here, "..");
const sourceRoot = process.env.STRAPSHEETS_DIR || "Z:\\StrapSheets";
const vectorDir = path.join(sourceRoot, "illustrations", "vectors");
const outFile = path.join(siteRoot, "src", "generated", "silhouettes.mjs");

const TOOLS = ["Motor", "StabSub", "NMPony", "MWDCarrier", "NMFlex", "Subs", "Exciter", "ShockSub", "Jars"];

const ROLE = {
  "#243038": "var(--dg-ink, #243038)",
  "#e5ecf3": "var(--dg-fill, #e5ecf3)",
  "#ffffff": "var(--dg-bevel-rim-top, #ffffff)",
  "#f7fafe": "var(--dg-bevel-gloss-top, #f7fafe)",
  "#eef4fb": "var(--dg-bevel-gloss-mid, #eef4fb)",
  "#d5e0ec": "var(--dg-bevel-core, #d5e0ec)",
  "#bccad9": "var(--dg-bevel-shade-mid, #bccad9)",
  "#a5b6c9": "var(--dg-bevel-shade-bot, #a5b6c9)",
  "#90a4ba": "var(--dg-bevel-rim-bot, #90a4ba)",
  "#4a5964": "var(--dg-band, #4a5964)",
};

const RIM_TOP = "var(--dg-bevel-rim-top, #ffffff)";
const GLOSS_TOP = "var(--dg-bevel-gloss-top, #f7fafe)";
const GLOSS_MID = "var(--dg-bevel-gloss-mid, #eef4fb)";
const CORE = "var(--dg-bevel-core, #d5e0ec)";
const SHADE_MID = "var(--dg-bevel-shade-mid, #bccad9)";
const SHADE_BOT = "var(--dg-bevel-shade-bot, #a5b6c9)";
const RIM_BOT = "var(--dg-bevel-rim-bot, #90a4ba)";
const FILL = "var(--dg-fill, #e5ecf3)";
const BAND = "var(--dg-band, #4a5964)";
const INK = "var(--dg-ink, #243038)";

// Full-gauge 8.5" Reed / PDC drill bit side profile matching the downhole BHA schematics:
// tapered API pin on the left (x=10..110), bit-breaker shank (x=110..220), and wide 8.5" gauge
// pad + 4-blade PDC cutting crown extending to x=988 on the right. Every path uses the exact
// 7-band metallic bevel palette of the StrapSheets vector drawings (zero dark stroke outlines).
const BIT = {
  viewBox: "0 0 1000 200",
  bhaViewBox: "0 0 1000 200",
  markup:
    // Outer metallic silhouette (API pin x=10..112, shank x=112..224, full 8.5" gauge body x=224..988, y=6..194)
    `<path d="M10 68 L112 52 V34 H224 L256 6 H876 C936 6 980 38 988 76 L958 88 V112 L988 124 C980 162 936 194 876 194 H256 L224 166 H112 V148 L10 132 Z" fill="${FILL}"/>` +
    // Tapered API pin 7-band bevel (x=12..112)
    `<path d="M12 70 L112 54 V64 L12 77 Z" fill="${RIM_TOP}"/>` +
    `<path d="M12 77 L112 64 V78 L12 86 Z" fill="${GLOSS_TOP}"/>` +
    `<path d="M12 86 L112 78 V94 L12 96 Z" fill="${GLOSS_MID}"/>` +
    `<path d="M12 96 L112 94 V108 L12 106 Z" fill="${CORE}"/>` +
    `<path d="M12 106 L112 108 V122 L12 115 Z" fill="${SHADE_MID}"/>` +
    `<path d="M12 115 L112 122 V136 L12 123 Z" fill="${SHADE_BOT}"/>` +
    `<path d="M12 123 L112 136 V146 L12 130 Z" fill="${RIM_BOT}"/>` +
    // Shank 7-band bevel (x=114..224, y=36..164) + bit-breaker slot
    `<path d="M114 36 H224 V50 H114 Z" fill="${RIM_TOP}"/>` +
    `<path d="M114 50 H224 V68 H114 Z" fill="${GLOSS_TOP}"/>` +
    `<path d="M114 68 H224 V88 H114 Z" fill="${GLOSS_MID}"/>` +
    `<path d="M114 88 H224 V112 H114 Z" fill="${CORE}"/>` +
    `<path d="M114 112 H224 V132 H114 Z" fill="${SHADE_MID}"/>` +
    `<path d="M114 132 H224 V150 H114 Z" fill="${SHADE_BOT}"/>` +
    `<path d="M114 150 H224 V164 H114 Z" fill="${RIM_BOT}"/>` +
    `<rect x="142" y="74" width="54" height="52" rx="4" fill="${RIM_BOT}"/>` +
    // Full-gauge 8.5" body & PDC crown 7-band bevel (x=224..986, y=8..192)
    `<path d="M256 8 H876 C902 8 924 16 942 28 H234 Z" fill="${RIM_TOP}"/>` +
    `<path d="M234 28 H942 C960 40 974 54 982 68 H224 V36 Z" fill="${GLOSS_TOP}"/>` +
    `<path d="M224 68 H982 L958 88 V92 H224 Z" fill="${GLOSS_MID}"/>` +
    `<path d="M224 92 H958 V108 H224 Z" fill="${CORE}"/>` +
    `<path d="M224 108 H958 V112 L982 132 H224 Z" fill="${SHADE_MID}"/>` +
    `<path d="M224 132 H982 C974 146 960 160 942 172 H234 L224 164 Z" fill="${SHADE_BOT}"/>` +
    `<path d="M234 172 H942 C924 184 902 192 876 192 H256 Z" fill="${RIM_BOT}"/>` +
    // Spiral junk-slot flutes & raised PDC blade ribs across the gauge & crown
    `<path d="M268 38 H868 C904 38 932 48 946 62 H248 Z" fill="${RIM_BOT}"/>` +
    `<path d="M248 88 H912 C936 88 950 93 958 100 C950 107 936 112 912 112 H248 Z" fill="${RIM_BOT}"/>` +
    `<path d="M248 138 H946 C932 152 904 162 868 162 H268 Z" fill="${RIM_BOT}"/>` +
    // Hardfaced gauge pads on top & bottom 8.5" outer diameter (x=256..780)
    `<rect x="256" y="8" width="524" height="16" rx="3" fill="${BAND}"/>` +
    `<rect x="256" y="176" width="524" height="16" rx="3" fill="${BAND}"/>` +
    // Protruding PDC cutter discs along the 4 blades (bright rim-top face with dark carbide backing)
    `<g fill="${RIM_BOT}">` +
    `<circle cx="836" cy="22" r="12"/><circle cx="894" cy="26" r="12"/><circle cx="944" cy="36" r="12"/>` +
    `<circle cx="848" cy="74" r="11.5"/><circle cx="904" cy="76" r="11.5"/><circle cx="956" cy="79" r="11.5"/>` +
    `<circle cx="848" cy="126" r="11.5"/><circle cx="904" cy="124" r="11.5"/><circle cx="956" cy="121" r="11.5"/>` +
    `<circle cx="836" cy="178" r="12"/><circle cx="894" cy="174" r="12"/><circle cx="944" cy="164" r="12"/>` +
    `</g>` +
    `<g fill="${RIM_TOP}">` +
    `<circle cx="840" cy="22" r="8.5"/><circle cx="898" cy="26" r="8.5"/><circle cx="948" cy="36" r="8.5"/>` +
    `<circle cx="852" cy="74" r="8"/><circle cx="908" cy="76" r="8"/><circle cx="960" cy="79" r="8"/>` +
    `<circle cx="852" cy="126" r="8"/><circle cx="908" cy="124" r="8"/><circle cx="960" cy="121" r="8"/>` +
    `<circle cx="840" cy="178" r="8.5"/><circle cx="898" cy="174" r="8.5"/><circle cx="948" cy="164" r="8.5"/>` +
    `</g>`,
};

function paint(color) {
  if (!color || color === "none") return color || "none";
  if (color.startsWith("var(--dg-")) return color;
  return ROLE[color.toLowerCase()] || "var(--dg-ink, #243038)";
}

function rewrite(attrs) {
  return attrs
    .replace(/fill="([^"]*)"/, (_, color) => `fill="${paint(color)}"`)
    .replace(/stroke="([^"]*)"/, (_, color) => `stroke="${paint(color)}"`);
}

function extract(svg) {
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1];
  if (!viewBox) throw new Error("SVG has no viewBox");
  const [, , vw, vh] = viewBox.split(/\s+/).map(Number);
  const parts = [];
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  const re = /<(path|line)\b([^>]*?)\/>/g;
  let match;
  while ((match = re.exec(svg))) {
    const [, tag, attrs] = match;
    const d = /d="([^"]+)"/.exec(attrs)?.[1] || "";
    if (tag === "path" && d.startsWith("M 0 0")) continue;
    const fill = (/fill="([^"]+)"/.exec(attrs)?.[1] || "").toLowerCase();
    if (fill === "#243038" || fill.includes("--dg-ink")) continue;
    const coords = tag === "line"
      ? ["x1", "y1", "x2", "y2"].map((name) => Number(new RegExp(`${name}="([^"]+)"`).exec(attrs)?.[1]))
      : (d.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
    const xs = coords.filter((_, index) => index % 2 === 0);
    const ys = coords.filter((_, index) => index % 2 === 1);
    const average = ys.reduce((sum, y) => sum + y, 0) / (ys.length || 1);
    if (average < vh * 0.22 || average > vh * 0.78) continue;
    if (tag === "line") {
      if (Math.hypot(xs[1] - xs[0], ys[1] - ys[0]) > vw * 0.22 && Math.abs(ys[1] - ys[0]) > Math.abs(xs[1] - xs[0])) continue;
    }
    if (fill === "#e5ecf3" || fill.includes("--dg-fill")) {
      for (const x of xs) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
      for (const y of ys) {
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
    parts.push(`<${tag}${rewrite(attrs)}/>`);
  }
  if (!parts.length) throw new Error(`No body geometry in viewBox ${viewBox}`);
  const spanX = Math.max(1, maxX - minX);
  const spanY = Math.max(1, maxY - minY);
  const padX = spanX * 0.015;
  const padY = spanY * 0.55;
  const bhaViewBox = [
    Math.round((minX - padX) * 10) / 10,
    Math.round((minY - padY) * 10) / 10,
    Math.round((spanX + padX * 2) * 10) / 10,
    Math.round((spanY + padY * 2) * 10) / 10,
  ].join(" ");
  return { viewBox, bhaViewBox, markup: parts.join("") };
}

const hash = crypto.createHash("sha256");
hash.update("silhouettes-v1\n");
hash.update(JSON.stringify(BIT));
const art = { Bit: BIT };
for (const id of TOOLS) {
  const file = path.join(vectorDir, `${id}.svg`);
  const svg = fs.readFileSync(file);
  hash.update(id);
  hash.update(svg);
  art[id] = extract(svg.toString("utf8"));
}
const sourceSha256 = hash.digest("hex");
const body =
  `// Generated by scripts/gen-silhouettes.mjs. Do not edit.\n` +
  `// source-sha256: ${sourceSha256}\n` +
  `export const SILHOUETTE_SOURCE_SHA256 = ${JSON.stringify(sourceSha256)};\n` +
  `export const silhouettes = ${JSON.stringify(art)};\n`;
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, body);
console.log(`wrote ${outFile} (${sourceSha256.slice(0, 12)}, ${Buffer.byteLength(body)} bytes)`);
