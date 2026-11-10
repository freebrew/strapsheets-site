import { Stage } from "../stageshow/kit/stage";
import type { Act } from "../stageshow/kit/act";
import { BHA_BUILD, bhaProgress } from "../lib/bha.mjs";
import { markBhaComplete } from "../lib/scene-order.mjs";
import { silhouettes } from "../generated/silhouettes.mjs";
import { Faux, useSiteTheme } from "../lib/theme";
import "./scene.css";

/**
 * Single-Column Long BHA Depiction — Inventory Workflow Preview.
 * Tools stack in a single vertical column from Bit (01) through Jars (11).
 * Every addition updates the additive Total Length and dynamically detects
 * the minimum and maximum common metrics across the string in metric units:
 *   - Additive Total Length (m)
 *   - Maximum OD (mm) & Minimum OD (mm)
 *   - Minimum Bore ID (mm) & Maximum Bore ID (mm)
 */

type Build = { shown: number };
const STEPS = bhaProgress();
const OPEN: Build = { shown: 1 };
const POSTER: Build = { shown: STEPS.length };

const script = async (a: Act<Build>) => {
  await a.wait(320);
  a.mark("open");
  const groups = [
    [2, 3],
    [4, 5],
    [6, 7],
    [8, 9],
    [10, 11],
  ];
  for (const group of groups) {
    a.mark(`add-${group[0]}`);
    for (const shown of group) {
      await a.set({ shown });
      await a.wait(320);
    }
    await a.wait(220);
  }
  a.mark("payoff");
  await a.wait(2000);
  markBhaComplete();
};

const RECORD_BADGE: Record<string, { text: string; kind: "max" | "min" | "neck" }> = {
  bit: { text: "MAX OD 216 mm", kind: "max" },
  pony: { text: "MIN OD 169 mm", kind: "neck" },
  mwd: { text: "MAX ID 76 mm", kind: "neck" },
  exciter: { text: "MIN ID 51 mm", kind: "min" },
};

export function BhaPreview() {
  const theme = useSiteTheme();
  return (
    <Faux id="bha">
      <Stage
        width={436}
        height={790}
        theme={theme}
        greys="cool"
        play="once"
        initial={OPEN}
        poster={POSTER}
        compact={{ below: 420, width: 358, height: 790 }}
        script={script}
      >
        {(s, _rect, layout) => {
          const count = Math.max(1, s.shown);
          const active = STEPS[count - 1] ?? STEPS[0];
          const compact = layout === "compact";
          return (
            <div className="bha-column-scene" data-layout={layout} data-crop>
              <div className="bha-head">
                <div className="bha-title-row">
                  <span className="bha-kicker">SINGLE-COLUMN BHA · INVENTORY PREVIEW</span>
                  <span className="bha-step-label">{count} of {STEPS.length}</span>
                </div>
                <div className="bha-metrics-grid">
                  <div className="bha-metric-box bha-metric-box--sum">
                    <span>∑ TOTAL LEN</span>
                    <strong>{active.totalLengthM.toFixed(2)} m</strong>
                  </div>
                  <div className="bha-metric-box">
                    <span>MAX / MIN OD</span>
                    <strong>{active.maxOdMm} / {active.minOdMm} mm</strong>
                  </div>
                  <div className="bha-metric-box">
                    <span>MIN / MAX ID</span>
                    <strong>{active.minIdMm} / {active.maxIdMm} mm</strong>
                  </div>
                </div>
              </div>

              <div className="bha-vstack" data-crop>
                {STEPS.map((piece, idx) => {
                  const art = silhouettes[piece.art];
                  const isShown = idx < count;
                  const isCurrent = idx === count - 1;
                  const badge = RECORD_BADGE[piece.key];
                  const isBit = piece.key === "bit";
                  const odRatio = isBit ? 100 : Math.round(70 + ((piece.odMm - 169) / 3) * 10);
                  const rowHeightPx = isBit ? 26 : Math.round(14 + ((piece.odMm - 169) / 3) * 4);
                  return (
                    <div
                      className="bha-vrow"
                      key={piece.key}
                      data-shown={isShown || undefined}
                      data-current={isCurrent || undefined}
                      data-max-od={(isShown && isBit) || undefined}
                    >
                      <span className="bha-idx">{String(idx + 1).padStart(2, "0")}</span>
                      <div className="bha-well-col">
                        <div
                          className="bha-silhouette-wrap"
                          data-bit={isBit || undefined}
                          style={{ width: `${odRatio}%`, height: `${rowHeightPx}px` }}
                        >
                          <svg
                            viewBox={art.bhaViewBox ?? art.viewBox}
                            aria-hidden="true"
                            preserveAspectRatio="none"
                            style={{ height: `${rowHeightPx}px` }}
                          >
                            <g dangerouslySetInnerHTML={{ __html: art.markup }} />
                          </svg>
                        </div>
                      </div>
                      <div className="bha-info-col">
                        <div className="bha-name-line">
                          <strong>{piece.name}</strong>
                          {piece.jarSpecs && <span className="bha-jar-specs">{piece.jarSpecs}</span>}
                          {badge && !compact && (
                            <i className={`bha-tag bha-tag--${badge.kind}`} data-lit={isShown || undefined}>
                              {badge.text}
                            </i>
                          )}
                        </div>
                        <div className="bha-spec-line">
                          <span>+{piece.lengthM.toFixed(2)}m</span>
                          <span>OD {piece.odMm} mm</span>
                          {!compact && <span>ID {piece.idMm} mm</span>}
                        </div>
                      </div>
                      <div className="bha-thread-col" aria-label="Threads">
                        <span>TOP {piece.topThread}</span>
                        <span>BTM {piece.btmThread}</span>
                      </div>
                      <div className="bha-sum-col">
                        <strong>{piece.totalLengthM.toFixed(2)} m</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }}
      </Stage>
    </Faux>
  );
}

export const BHA_NAMES = BHA_BUILD.map((piece) => piece.name);
