import { useEffect, useState } from "react";
import { Stage } from "../stageshow/kit/stage";
import type { Act } from "../stageshow/kit/act";
import { BHA_BUILD, bhaProgress } from "../lib/bha.mjs";
import { markBhaComplete } from "../lib/scene-order.mjs";
import { silhouettes } from "../generated/silhouettes.mjs";
import { Faux, useSiteTheme } from "../lib/theme";
import { BhaWebglColumn } from "./bha-webgl";
import "./scene.css";

/**
 * Single-Column Vertical BHA Depiction — Inventory Workflow Preview.
 * Tools are oriented vertically, scaled to their posted length, and torqued together
 * shoulder-to-shoulder from Bit (01) through Jars (11), with WebGL 3D axial rotation
 * (clockwise looking up) and OD/ID chart make-up torques animating between kN·m and ft·lbs.
 */

type Build = { shown: number };
const STEPS = bhaProgress();
const GL_PIECES = STEPS.map((piece) => ({
  key: piece.key,
  odMm: piece.odMm,
  idMm: piece.idMm,
  lengthM: piece.lengthM,
  rowHeightPx: Math.round(40 + piece.lengthM * 3.8),
}));
const OPEN: Build = { shown: 1 };
const POSTER: Build = { shown: STEPS.length };

const script = async (a: Act<Build>) => {
  await a.wait(240);
  a.mark("open");
  for (let shown = 2; shown <= STEPS.length; shown++) {
    a.mark(`add-${shown}`);
    await a.set({ shown });
    await a.wait(240);
  }
  a.mark("payoff");
  markBhaComplete();
  await a.wait(1200);
};

const RECORD_BADGE: Record<string, { text: string; kind: "max" | "min" | "neck" }> = {
  bit: { text: "MAX OD", kind: "max" },
  pony: { text: "MIN OD", kind: "neck" },
  mwd: { text: "MAX ID", kind: "neck" },
  exciter: { text: "MIN ID", kind: "min" },
};

function fmtTorque(kNm: number | null, ftLbs: number | null, unit: "kNm" | "ftLbs"): string {
  if (kNm == null || ftLbs == null) return "—";
  if (unit === "ftLbs") return `${ftLbs.toLocaleString("en-US")} ft·lbs`;
  return `${kNm.toFixed(1)} kN·m`;
}

export function BhaPreview() {
  const theme = useSiteTheme();
  const [torqueUnit, setTorqueUnit] = useState<"kNm" | "ftLbs">("kNm");
  const [webglReady, setWebglReady] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTorqueUnit((prev) => (prev === "kNm" ? "ftLbs" : "kNm"));
    }, 2600);
    return () => window.clearInterval(timer);
  }, []);

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
                  <span className="bha-kicker">SINGLE-COLUMN BHA · 3D AXIAL CW ↑</span>
                  <span className="bha-unit-pill" data-unit={torqueUnit}>
                    <i data-active={torqueUnit === "kNm" || undefined}>kN·m</i>
                    <span>⇄</span>
                    <i data-active={torqueUnit === "ftLbs" || undefined}>ft·lbs</i>
                  </span>
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

              <div className="bha-vstack" data-webgl={webglReady || undefined} data-crop>
                <BhaWebglColumn
                  pieces={GL_PIECES}
                  shown={count}
                  theme={theme}
                  onReady={setWebglReady}
                />
                {STEPS.map((piece, idx) => {
                  const art = silhouettes[piece.art];
                  const isShown = idx < count;
                  const isCurrent = idx === count - 1;
                  const badge = RECORD_BADGE[piece.key];
                  const isBit = piece.key === "bit";
                  const isCrossover = !piece.sameThread && piece.topThread !== "—";
                  const odRatio = isBit ? 96 : Math.round(92 + ((piece.odMm - 169) / 3) * 6);
                  const rowHeightPx = GL_PIECES[idx]?.rowHeightPx ?? 48;
                  return (
                    <div
                      className="bha-vrow"
                      key={piece.key}
                      style={{ height: `${rowHeightPx}px` }}
                      data-shown={isShown || undefined}
                      data-current={isCurrent || undefined}
                      data-max-od={(isShown && isBit) || undefined}
                      data-xover={isCrossover || undefined}
                    >
                      <span className="bha-idx">{String(idx + 1).padStart(2, "0")}</span>
                      <div className="bha-well-col">
                        <div
                          className="bha-silhouette-wrap"
                          data-bit={isBit || undefined}
                          style={{ width: `${odRatio}%`, height: `${rowHeightPx}px` }}
                        >
                          <svg
                            viewBox={art.vertViewBox ?? art.bhaViewBox ?? art.viewBox}
                            aria-hidden="true"
                            preserveAspectRatio="none"
                            style={{ height: `${rowHeightPx}px` }}
                          >
                            <g dangerouslySetInnerHTML={{ __html: art.vertMarkup ?? art.markup }} />
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
                      <div className="bha-thread-col" aria-label="Threads and make-up torque">
                        {isBit ? (
                          <>
                            <span className="bha-thread-name">PIN {piece.btmThread}</span>
                            <span className="bha-torque-val" data-unit={torqueUnit}>
                              {fmtTorque(piece.btmTorqueKnm, piece.btmTorqueFtLbs, torqueUnit)}
                            </span>
                          </>
                        ) : piece.sameThread ? (
                          <>
                            <span className="bha-thread-name">{piece.topThread}</span>
                            <span className="bha-torque-val" data-unit={torqueUnit}>
                              {fmtTorque(piece.topTorqueKnm, piece.topTorqueFtLbs, torqueUnit)}
                            </span>
                          </>
                        ) : (
                          <>
                            <span>
                              TOP {piece.topThread} ·{" "}
                              <em className="bha-torque-inline" data-unit={torqueUnit}>
                                {fmtTorque(piece.topTorqueKnm, piece.topTorqueFtLbs, torqueUnit)}
                              </em>
                            </span>
                            <span>
                              BTM {piece.btmThread} ·{" "}
                              <em className="bha-torque-inline" data-unit={torqueUnit}>
                                {fmtTorque(piece.btmTorqueKnm, piece.btmTorqueFtLbs, torqueUnit)}
                              </em>
                            </span>
                          </>
                        )}
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
