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

// PDC drill bit, side view, cutting face to the right. From the left: the threaded API pin,
// the shank with its bit-breaker slot, the gauge section with gauge pads and junk slots,
// then the shoulder, nose and cone of the crown carrying the diamond cutters.
// The viewBox matches the 3.3:1 box the BHA column gives the Bit row, so nothing is stretched.
const INK = 'var(--dg-ink, #243038)';
const BIT = {
  viewBox: "0 0 132 40",
  markup:
    `<path d="M2 13 H22 V8 H40 V3 H92 C108 3 120 10 128 18 L130 20 L128 22 C120 30 108 37 92 37 H40 V32 H22 V27 H2 Z" fill="var(--dg-fill, #e5ecf3)" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>` +
    `<path d="M6 13 V27 M10 13 V27 M14 13 V27 M18 13 V27" stroke="${INK}" stroke-width="1.4" fill="none"/>` +
    `<path d="M29 8 V32 M34 8 V32" stroke="${INK}" stroke-width="1.4" fill="none"/>` +
    `<path d="M40 3 H86 V7 H40 Z M40 33 H86 V37 H40 Z" fill="var(--dg-band, #4a5964)" stroke="${INK}" stroke-width="1.4"/>` +
    `<path d="M52 7 L60 33 M66 7 L74 33 M80 7 L88 33" stroke="${INK}" stroke-width="1.6" fill="none"/>` +
    `<path d="M92 3 C108 3 120 10 128 18 L130 20 L128 22 C120 30 108 37 92 37 Z" fill="var(--dg-bevel-shade-bot, #a5b6c9)" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>` +
    `<g fill="var(--dg-bevel-rim-top, #ffffff)" stroke="${INK}" stroke-width="1.3">` +
    '<circle cx="97" cy="7" r="2.6"/><circle cx="105" cy="9" r="2.6"/><circle cx="113" cy="12.5" r="2.6"/><circle cx="120" cy="16.5" r="2.4"/>' +
    '<circle cx="97" cy="33" r="2.6"/><circle cx="105" cy="31" r="2.6"/><circle cx="113" cy="27.5" r="2.6"/><circle cx="120" cy="23.5" r="2.4"/>' +
    '<circle cx="106" cy="20" r="2.6"/><circle cx="115" cy="20" r="2.4"/>' +
    "</g>",
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
  const re = /<(path|line)\b([^>]*?)\/>/g;
  let match;
  while ((match = re.exec(svg))) {
    const [, tag, attrs] = match;
    const d = /d="([^"]+)"/.exec(attrs)?.[1] || "";
    if (tag === "path" && d.startsWith("M 0 0")) continue;
    const fill = (/fill="([^"]+)"/.exec(attrs)?.[1] || "").toLowerCase();
    if (fill === "#243038" || fill.includes("--dg-ink")) continue;
    const ys = tag === "line"
      ? ["y1", "y2"].map((name) => Number(new RegExp(`${name}="([^"]+)"`).exec(attrs)?.[1]))
      : (d.match(/-?\d+(?:\.\d+)?/g) || []).map(Number).filter((_, index) => index % 2 === 1);
    const average = ys.reduce((sum, y) => sum + y, 0) / (ys.length || 1);
    if (average < vh * 0.22 || average > vh * 0.78) continue;
    if (tag === "line") {
      const x1 = Number(/x1="([^"]+)"/.exec(attrs)?.[1]);
      const x2 = Number(/x2="([^"]+)"/.exec(attrs)?.[1]);
      if (Math.hypot(x2 - x1, ys[1] - ys[0]) > vw * 0.22 && Math.abs(ys[1] - ys[0]) > Math.abs(x2 - x1)) continue;
    }
    parts.push(`<${tag}${rewrite(attrs)}/>`);
  }
  if (!parts.length) throw new Error(`No body geometry in viewBox ${viewBox}`);
  return { viewBox, markup: parts.join("") };
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
