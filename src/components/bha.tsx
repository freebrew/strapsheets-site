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
 * the minimum and maximum common metrics across the string:
 *   - Additive Total Length (m)
 *   - Maximum OD (in) & Minimum OD (in)
 *   - Minimum Bore ID (in) & Maximum Bore ID (in)
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

function fmtIn(value: number) {
  return value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

const RECORD_BADGE: Record<string, { text: string; kind: "max" | "min" | "neck" }> = {
  stab: { text: "MAX OD 8.5″", kind: "max" },
  pony: { text: "MIN OD 4.75″", kind: "neck" },
  mwd: { text: "MAX ID 3.00″", kind: "neck" },
  exciter: { text: "MIN ID 2.00″", kind: "min" },
};

export function BhaPreview() {
  const theme = useSiteTheme();
  return (
    <Faux id="bha">
      <Stage
        width={450}
        height={790}
        theme={theme}
        greys="cool"
        play="once"
        initial={OPEN}
        poster={POSTER}
        compact={{ below: 480, width: 358, height: 690 }}
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
                    <strong>{fmtIn(active.maxOdIn)}″ / {fmtIn(active.minOdIn)}″</strong>
                  </div>
                  <div className="bha-metric-box">
                    <span>MIN / MAX ID</span>
                    <strong>{active.minIdIn.toFixed(2)}″ / {active.maxIdIn.toFixed(2)}″</strong>
                  </div>
                </div>
              </div>

              <div className="bha-vstack" data-crop>
                {STEPS.map((piece, idx) => {
                  const art = silhouettes[piece.art];
                  const isShown = idx < count;
                  const isCurrent = idx === count - 1;
                  const badge = RECORD_BADGE[piece.key];
                  const odRatio = Math.round((piece.odIn / 8.5) * 100);
                  return (
                    <div
                      className="bha-vrow"
                      key={piece.key}
                      data-shown={isShown || undefined}
                      data-current={isCurrent || undefined}
                      data-max-od={(isShown && piece.key === "stab") || undefined}
                    >
                      <span className="bha-idx">{String(idx + 1).padStart(2, "0")}</span>
                      <div className="bha-well-col">
                        <div className="bha-silhouette-wrap" style={{ width: `${Math.max(58, odRatio)}%` }}>
                          <svg viewBox={art.viewBox} aria-hidden="true" preserveAspectRatio="none">
                            <g dangerouslySetInnerHTML={{ __html: art.markup }} />
                          </svg>
                        </div>
                      </div>
                      <div className="bha-info-col">
                        <div className="bha-name-line">
                          <strong>{piece.name}</strong>
                          {badge && !compact && (
                            <i className={`bha-tag bha-tag--${badge.kind}`} data-lit={isShown || undefined}>
                              {badge.text}
                            </i>
                          )}
                        </div>
                        <div className="bha-spec-line">
                          <span>+{piece.lengthM.toFixed(2)}m</span>
                          <span>OD {fmtIn(piece.odIn)}″</span>
                          {!compact && <span>ID {piece.idIn.toFixed(2)}″</span>}
                        </div>
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
