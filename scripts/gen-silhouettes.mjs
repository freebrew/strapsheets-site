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

// Drill bit, drawn upright the way a bit sits on the rig floor and in the hole: threaded pin and
// bit-breaker neck at the top, the cutting end at the bottom. It blends the two families in the
// reference pictures: a roller-cone bit (three cones on legs, the middle one in front) whose cones
// carry PDC-style cutter inserts. The Bit row draws it as a 34 px square, so nothing is stretched.
const INK = 'var(--dg-ink, #243038)';
const CUTTER = 'var(--dg-bevel-rim-top, #ffffff)';
const CONE = 'var(--dg-bevel-shade-bot, #a5b6c9)';
const BIT = {
  viewBox: "0 0 40 44",
  markup:
    `<path d="M16 1 H24 V8 H16 Z" fill="var(--dg-fill, #e5ecf3)" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>` +
    `<path d="M16 3 H24 M16 5 H24" stroke="${INK}" stroke-width="1.1" fill="none"/>` +
    `<path d="M12 8 H28 V13 H12 Z" fill="var(--dg-fill, #e5ecf3)" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>` +
    `<path d="M7 13 H33 V24 Q33 27 30 27 H10 Q7 27 7 24 Z" fill="var(--dg-band, #4a5964)" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>` +
    `<path d="M3 27 L15 29 L14 42 L6 38 Z" fill="${CONE}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>` +
    `<path d="M37 27 L25 29 L26 42 L34 38 Z" fill="${CONE}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>` +
    `<path d="M14 28 H26 L24 43 H16 Z" fill="var(--dg-fill, #e5ecf3)" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>` +
    `<g fill="${CUTTER}" stroke="${INK}" stroke-width="0.9">` +
    '<circle cx="6.5" cy="31" r="1.5"/><circle cx="9.5" cy="34" r="1.5"/><circle cx="11.5" cy="38" r="1.5"/>' +
    '<circle cx="33.5" cy="31" r="1.5"/><circle cx="30.5" cy="34" r="1.5"/><circle cx="28.5" cy="38" r="1.5"/>' +
    '<circle cx="18" cy="32" r="1.6"/><circle cx="22" cy="32" r="1.6"/><circle cx="20" cy="36" r="1.6"/><circle cx="20" cy="40.5" r="1.4"/>' +
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
