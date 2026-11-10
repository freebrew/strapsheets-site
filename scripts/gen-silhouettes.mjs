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

const SHOULDER_SPECS = {
  Motor: { shoulderX: 60.88, boxX: 958.14, cylTopY: 122.65, cylBotY: 174.4 },
  StabSub: { shoulderX: 255.52, boxX: 911.6, cylTopY: 197.63, cylBotY: 308.12 },
  NMPony: { shoulderX: 154.05, boxX: 961.27, cylTopY: 100.99, cylBotY: 171.41 },
  MWDCarrier: { shoulderX: 78.0, boxX: 978.0, cylTopY: 115.5, cylBotY: 175.5 },
  NMFlex: { shoulderX: 128.83, boxX: 969.33, cylTopY: 101.06, cylBotY: 156.27 },
  Subs: { shoulderX: 424.11, boxX: 875.0, cylTopY: 282.77, cylBotY: 398.84 },
  Exciter: { shoulderX: 149.82, boxX: 965.43, cylTopY: 126.22, cylBotY: 187.39 },
  ShockSub: { shoulderX: 161.37, boxX: 948.66, cylTopY: 118.43, cylBotY: 206.45 },
  Jars: { shoulderX: 160.23, boxX: 958.89, cylTopY: 128.75, cylBotY: 189.15 },
};

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

// Vertical 216 mm (8.5") PDC / Reed drill bit connected at its bottom make-up shoulder (Y=1000,
// X=36..164) directly to the 171 mm Motor below it, while its full-gauge 216 mm PDC crown and
// gauge pads flare out to X=6..194 so the bit is unmistakably the widest OD in the vertical BHA.
const VERT_BIT_MARKUP =
  `<path d="M36 1000 V760 L6 690 V200 C6 104 36 38 74 22 L88 72 H112 L126 22 C164 38 194 104 194 200 V690 L164 760 V1000 Z" fill="${FILL}"/>` +
  // 7-band vertical cylindrical bevel across the 171 mm shank (X=36..164, Y=760..1000)
  `<path d="M36 760 H50 V1000 H36 Z" fill="${RIM_TOP}"/>` +
  `<path d="M50 760 H68 V1000 H50 Z" fill="${GLOSS_TOP}"/>` +
  `<path d="M68 760 H88 V1000 H68 Z" fill="${GLOSS_MID}"/>` +
  `<path d="M88 760 H112 V1000 H88 Z" fill="${CORE}"/>` +
  `<path d="M112 760 H132 V1000 H112 Z" fill="${SHADE_MID}"/>` +
  `<path d="M132 760 H150 V1000 H132 Z" fill="${SHADE_BOT}"/>` +
  `<path d="M150 760 H164 V1000 H150 Z" fill="${RIM_BOT}"/>` +
  // Bit-breaker wrench slot on shank
  `<rect x="74" y="810" width="52" height="110" rx="6" fill="${SHADE_BOT}" stroke="${BAND}" stroke-width="4"/>` +
  // 7-band vertical cylindrical bevel across the wide 216 mm gauge body & crown (X=6..194, Y=22..760)
  `<path d="M6 200 C6 150 16 110 28 78 V738 L6 690 Z" fill="${RIM_TOP}"/>` +
  `<path d="M28 78 C40 48 56 30 72 22 L68 760 H36 L28 738 Z" fill="${GLOSS_TOP}"/>` +
  `<path d="M72 22 L88 72 H92 V760 H68 Z" fill="${GLOSS_MID}"/>` +
  `<path d="M92 72 H108 V760 H92 Z" fill="${CORE}"/>` +
  `<path d="M108 72 H112 L128 22 L132 760 H108 Z" fill="${SHADE_MID}"/>` +
  `<path d="M128 22 C144 30 160 48 172 78 V738 L164 760 H132 Z" fill="${SHADE_BOT}"/>` +
  `<path d="M172 78 C184 110 194 150 194 200 V690 L172 738 Z" fill="${RIM_BOT}"/>` +
  // Deep vertical junk-slot flutes separating the 4 visible PDC blades
  `<path d="M36 705 V185 C36 125 46 80 60 56 V730 Z" fill="${RIM_BOT}"/>` +
  `<path d="M88 730 V120 C88 88 93 72 100 62 C107 72 112 88 112 120 V730 Z" fill="${RIM_BOT}"/>` +
  `<path d="M140 730 V56 C154 80 164 125 164 185 V705 Z" fill="${RIM_BOT}"/>` +
  // Hardfaced 216 mm gauge pads on left and right outer diameter (X=6..24 and X=176..194)
  `<rect x="6" y="220" width="18" height="460" rx="4" fill="${BAND}"/>` +
  `<rect x="176" y="220" width="18" height="460" rx="4" fill="${BAND}"/>` +
  // Protruding PDC cutter discs along the top crown & blades
  `<g fill="${RIM_BOT}">` +
  `<circle cx="20" cy="188" r="13.5"/><circle cx="25" cy="124" r="13.5"/><circle cx="35" cy="68" r="13.5"/>` +
  `<circle cx="74" cy="174" r="13"/><circle cx="76" cy="112" r="13"/><circle cx="79" cy="52" r="13"/>` +
  `<circle cx="126" cy="174" r="13"/><circle cx="124" cy="112" r="13"/><circle cx="121" cy="52" r="13"/>` +
  `<circle cx="180" cy="188" r="13.5"/><circle cx="175" cy="124" r="13.5"/><circle cx="165" cy="68" r="13.5"/>` +
  `</g>` +
  `<g fill="${RIM_TOP}">` +
  `<circle cx="20" cy="183" r="9.5"/><circle cx="25" cy="119" r="9.5"/><circle cx="35" cy="63" r="9.5"/>` +
  `<circle cx="74" cy="169" r="9"/><circle cx="76" cy="107" r="9"/><circle cx="79" cy="47" r="9"/>` +
  `<circle cx="126" cy="169" r="9"/><circle cx="124" cy="107" r="9"/><circle cx="121" cy="47" r="9"/>` +
  `<circle cx="180" cy="183" r="9.5"/><circle cx="175" cy="119" r="9.5"/><circle cx="165" cy="63" r="9.5"/>` +
  `</g>` +
  // Crisp metallic make-up shoulder seam where the bit torques into the Motor
  `<line x1="36" y1="996" x2="164" y2="996" stroke="${BAND}" stroke-width="8"/>`;

const BIT = {
  viewBox: "0 0 1000 200",
  bhaViewBox: "0 0 1000 200",
  vertViewBox: "0 0 200 1000",
  vertMarkup: VERT_BIT_MARKUP,
  markup:
    `<path d="M10 68 L112 52 V34 H224 L256 6 H876 C936 6 980 38 988 76 L958 88 V112 L988 124 C980 162 936 194 876 194 H256 L224 166 H112 V148 L10 132 Z" fill="${FILL}"/>` +
    `<path d="M12 70 L112 54 V64 L12 77 Z" fill="${RIM_TOP}"/>` +
    `<path d="M12 77 L112 64 V78 L12 86 Z" fill="${GLOSS_TOP}"/>` +
    `<path d="M12 86 L112 78 V94 L12 96 Z" fill="${GLOSS_MID}"/>` +
    `<path d="M12 96 L112 94 V108 L12 106 Z" fill="${CORE}"/>` +
    `<path d="M12 106 L112 108 V122 L12 115 Z" fill="${SHADE_MID}"/>` +
    `<path d="M12 115 L112 122 V136 L12 123 Z" fill="${SHADE_BOT}"/>` +
    `<path d="M12 123 L112 136 V146 L12 130 Z" fill="${RIM_BOT}"/>` +
    `<path d="M114 36 H224 V50 H114 Z" fill="${RIM_TOP}"/>` +
    `<path d="M114 50 H224 V68 H114 Z" fill="${GLOSS_TOP}"/>` +
    `<path d="M114 68 H224 V88 H114 Z" fill="${GLOSS_MID}"/>` +
    `<path d="M114 88 H224 V112 H114 Z" fill="${CORE}"/>` +
    `<path d="M114 112 H224 V132 H114 Z" fill="${SHADE_MID}"/>` +
    `<path d="M114 132 H224 V150 H114 Z" fill="${SHADE_BOT}"/>` +
    `<path d="M114 150 H224 V164 H114 Z" fill="${RIM_BOT}"/>` +
    `<rect x="142" y="74" width="54" height="52" rx="4" fill="${RIM_BOT}"/>` +
    `<path d="M256 8 H876 C902 8 924 16 942 28 H234 Z" fill="${RIM_TOP}"/>` +
    `<path d="M234 28 H942 C960 40 974 54 982 68 H224 V36 Z" fill="${GLOSS_TOP}"/>` +
    `<path d="M224 68 H982 L958 88 V92 H224 Z" fill="${GLOSS_MID}"/>` +
    `<path d="M224 92 H958 V108 H224 Z" fill="${CORE}"/>` +
    `<path d="M224 108 H958 V112 L982 132 H224 Z" fill="${SHADE_MID}"/>` +
    `<path d="M224 132 H982 C974 146 960 160 942 172 H234 L224 164 Z" fill="${SHADE_BOT}"/>` +
    `<path d="M234 172 H942 C924 184 902 192 876 192 H256 Z" fill="${RIM_BOT}"/>` +
    `<path d="M268 38 H868 C904 38 932 48 946 62 H248 Z" fill="${RIM_BOT}"/>` +
    `<path d="M248 88 H912 C936 88 950 93 958 100 C950 107 936 112 912 112 H248 Z" fill="${RIM_BOT}"/>` +
    `<path d="M248 138 H946 C932 152 904 162 868 162 H268 Z" fill="${RIM_BOT}"/>` +
    `<rect x="256" y="8" width="524" height="16" rx="3" fill="${BAND}"/>` +
    `<rect x="256" y="176" width="524" height="16" rx="3" fill="${BAND}"/>` +
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

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function round1(v) {
  return Math.round(v * 10) / 10;
}

function buildVerticalMarkup(id, rawItems) {
  const spec = SHOULDER_SPECS[id];
  // Shrink the longitudinal window slightly inside shoulderX..boxX so the 7 bevel bands run flush
  // from Y=0 to Y=1000 with zero end gap.
  const startX = spec.shoulderX + 2;
  const endX = spec.boxX - 2;
  const cy = (spec.cylTopY + spec.cylBotY) / 2;
  const r = (spec.cylBotY - spec.cylTopY) / 2;
  const spanX = endX - startX;
  const NOM_R = 64; // Nominal cylinder spans X = 36..164 (width 128 in 200-wide viewBox)

  const mapX = (y) => round1(100 - ((y - cy) / r) * NOM_R);
  const mapY = (x) => {
    const raw = ((x - startX) / spanX) * 1000;
    if (raw <= 8) return 0;
    if (raw >= 992) return 1000;
    return round1(raw);
  };

  const out = [];
  for (const item of rawItems) {
    if (item.tag === "line") {
      if (Math.min(item.x1, item.x2) <= spec.shoulderX + 2 || Math.max(item.x1, item.x2) >= spec.boxX - 2) continue;
      if (Math.min(item.y1, item.y2) < spec.cylTopY - 1 || Math.max(item.y1, item.y2) > spec.cylBotY + 1) continue;
      const x1 = mapX(item.y1);
      const y1 = mapY(item.x1);
      const x2 = mapX(item.y2);
      const y2 = mapY(item.x2);
      out.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${RIM_BOT}" stroke-width="2"/>`);
      continue;
    }
    if (!item.fill || item.fill === "none") continue;
    if (Math.max(...item.xs) <= spec.shoulderX + 2) continue;
    const isOuterFill = item.fill === "#e5ecf3" || item.fill.includes("--dg-fill");
    const pairs = [];
    for (let i = 0; i < item.xs.length; i++) {
      const px = item.xs[i];
      const py = item.ys[i];
      if (isOuterFill && px < spec.shoulderX - 1) continue;
      pairs.push([mapX(py), mapY(px)]);
    }
    if (pairs.length < 3) continue;
    const dVert =
      `M ${pairs[0][0]} ${pairs[0][1]} ` +
      pairs
        .slice(1)
        .map(([vx, vy]) => `L ${vx} ${vy}`)
        .join(" ") +
      " Z";
    out.push(`<path d="${dVert}" fill="${paint(item.fill)}"/>`);
  }
  // Crisp machined make-up shoulder seam at Y=996 where adjacent tools torque together
  out.push(`<line x1="36" y1="996" x2="164" y2="996" stroke="${BAND}" stroke-width="8"/>`);
  return out.join("");
}

function extract(id, svg) {
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1];
  if (!viewBox) throw new Error("SVG has no viewBox");
  const [, , vw, vh] = viewBox.split(/\s+/).map(Number);
  const parts = [];
  const rawItems = [];
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
      rawItems.push({ tag: "line", attrs, x1: xs[0], y1: ys[0], x2: xs[1], y2: ys[1] });
    } else {
      rawItems.push({ tag: "path", attrs, fill, xs, ys });
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
  const vertMarkup = buildVerticalMarkup(id, rawItems);
  return { viewBox, bhaViewBox, vertViewBox: "0 0 200 1000", vertMarkup, markup: parts.join("") };
}

const hash = crypto.createHash("sha256");
hash.update("silhouettes-v2\n");
hash.update(JSON.stringify(BIT));
const art = { Bit: BIT };
for (const id of TOOLS) {
  const file = path.join(vectorDir, `${id}.svg`);
  const svg = fs.readFileSync(file);
  hash.update(id);
  hash.update(svg);
  art[id] = extract(id, svg.toString("utf8"));
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
