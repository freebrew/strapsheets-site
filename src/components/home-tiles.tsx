import { Stage } from "../stageshow/kit/stage";
import type { Act } from "../stageshow/kit/act";
import { silhouettes } from "../generated/silhouettes.mjs";
import { Faux, useSiteTheme } from "../lib/theme";
import "./scene.css";

type CustomStep = { phase: 1 | 2 | 3 };
const customMorphScript = async (a: Act<CustomStep>) => {
  await a.wait(450);
  await a.set({ phase: 2 });
  await a.wait(650);
  await a.set({ phase: 3 });
  await a.wait(2000);
};

export function CustomMorphTile() {
  const theme = useSiteTheme();
  return (
    <Faux id="tile-custom-morph">
      <Stage
        width={680}
        height={260}
        theme={theme}
        greys="cool"
        play="once"
        initial={{ phase: 1 }}
        poster={{ phase: 3 }}
        compact={{ below: 560, width: 358, height: 280 }}
        script={customMorphScript}
      >
        {(s) => (
          <div className="custom-morph-scene" data-phase={s.phase}>
            <div className="cm-top-row">
              <div className="cm-end-col">
                <span className="cm-end-label">LOWER / BTM · LEFT END</span>
                <strong className="cm-end-val">PIN · DS 38 [NC38]</strong>
              </div>
              <div className="cm-end-col cm-end-col--right">
                <span className="cm-end-label">UPPER / TOP · RIGHT END</span>
                <strong className="cm-end-val">BOX · 4 1/2 IF [NC 50]</strong>
              </div>
            </div>
            <div className="cm-tube-canvas">
              <svg viewBox="0 0 640 112" aria-hidden="true">
                <text x="52" y="18" fill="var(--dg-ink)" fontSize="12" fontWeight="700" textAnchor="middle">PIN · DS 38</text>
                <text x="586" y="18" fill="var(--dg-ink)" fontSize="12" fontWeight="700" textAnchor="middle">BOX · 4 1/2 IF</text>
                <polygon
                  points="22,48 58,36 180,36 200,26 268,26 288,36 616,36 616,84 288,84 268,94 200,94 180,84 58,84 22,72"
                  fill="var(--dg-fill)"
                  stroke="var(--dg-ink)"
                  strokeWidth="2.4"
                />
                <line x1="31" y1="46" x2="31" y2="74" stroke="var(--dg-ink)" strokeWidth="1.3" />
                <line x1="40" y1="43" x2="40" y2="77" stroke="var(--dg-ink)" strokeWidth="1.3" />
                <line x1="49" y1="40" x2="49" y2="80" stroke="var(--dg-ink)" strokeWidth="1.3" />
                <line x1="592" y1="48" x2="610" y2="48" stroke="var(--dg-ink)" strokeWidth="1.3" strokeDasharray="3 3" />
                <line x1="592" y1="60" x2="610" y2="60" stroke="var(--dg-ink)" strokeWidth="1.3" strokeDasharray="3 3" />
                <line x1="592" y1="72" x2="610" y2="72" stroke="var(--dg-ink)" strokeWidth="1.3" strokeDasharray="3 3" />
                <polygon
                  points="360,36 376,22 454,22 470,36 470,84 454,98 376,98 360,84"
                  fill="var(--dg-bevel-core)"
                  stroke="var(--dg-ink)"
                  strokeWidth="1.8"
                />
                <line x1="378" y1="96" x2="412" y2="24" stroke="#858b97" strokeWidth="1.4" />
                <line x1="402" y1="96" x2="436" y2="24" stroke="#858b97" strokeWidth="1.4" />
                <line x1="426" y1="96" x2="458" y2="24" stroke="#858b97" strokeWidth="1.4" />
                <circle cx="234" cy="14" r="10" fill="var(--dg-select)" />
                <text x="234" y="18" fill="#15171b" fontSize="12" fontWeight="700" textAnchor="middle">A</text>
                <circle cx="415" cy="14" r="10" fill="var(--dg-surface)" stroke="var(--dg-select)" strokeWidth="2" />
                <text x="415" y="18" fill="var(--dg-ink)" fontSize="12" fontWeight="700" textAnchor="middle">B</text>
              </svg>
            </div>
            <div className="cm-chips-row">
              <span className="cm-chip" data-lit>A Upset OD · 6.75″</span>
              <span className="cm-chip" data-lit={s.phase >= 2 || undefined}>B Spiral OD · 8.25″ (step 18)</span>
              <span className="cm-chip" data-lit={s.phase >= 3 || undefined}>C Length · 3.10 m</span>
            </div>
          </div>
        )}
      </Stage>
    </Faux>
  );
}

type ThemeBeat = { paperMode: boolean };
const themeMorphScript = async (a: Act<ThemeBeat>) => {
  await a.wait(650);
  await a.set({ paperMode: true });
  await a.wait(2000);
};

export function ThemeMorphTile() {
  const theme = useSiteTheme();
  const subs = silhouettes.Subs;
  return (
    <Faux id="tile-theme-morph">
      <Stage
        width={420}
        height={290}
        theme={theme}
        greys="cool"
        play="once"
        initial={{ paperMode: false }}
        poster={{ paperMode: true }}
        compact={{ below: 450, width: 358, height: 270 }}
        script={themeMorphScript}
      >
        {(s) => (
          <div className="theme-morph-scene" data-paper={s.paperMode || undefined}>
            <div className="tm-header">
              <span className="bha-kicker">INLINE SVG ⇄ LIGHT PDF</span>
              <span className="tm-mode-label">SUB-2201 · Subs</span>
            </div>
            <div className="tm-svg-stage">
              <svg viewBox={subs.viewBox} aria-hidden="true">
                <g dangerouslySetInnerHTML={{ __html: subs.markup }} />
              </svg>
              <div className="tm-meta">Screen (--dg-surface) · Highlighted: B (6.50″)</div>
            </div>
            <div className="tm-yellow-strip" data-lit={s.paperMode || undefined}>
              <div className="tm-yellow-row">
                <strong>PRINT &amp; PDF CARD</strong>
                <span>A LEN 0.82 m · B OD 6.50″ · D ID 2.25″</span>
              </div>
            </div>
          </div>
        )}
      </Stage>
    </Faux>
  );
}

export function WallTile({ id = "tile-wall" }: { id?: string }) {
  return (
    <Faux id={id}>
      <Stage width={680} height={210} theme={useSiteTheme()} greys="cool" compact={{ below: 560, width: 358, height: 210 }}>
        {(_s, _r, layout) => (
          <div className="wall-morph-scene" data-layout={layout}>
            <div className="wall-head-row">
              <span className="bha-kicker">TICKED SESSIONS ⇄ WALL-SORTED CARDS · JOB 1044</span>
              <span className="tm-mode-label">3 sheets ready</span>
            </div>
            <div className="wall-cards-col">
              <div className="sheet-card">
                <strong>MOTOR · MTR-4418</strong>
                <span>BOX 4 1/2 IF · PIN DS 38</span>
                <div className="sheet-card-bar">9.42 m · 6.75″ OD</div>
              </div>
              <div className="sheet-card">
                <strong>SUBS · SUB-2201</strong>
                <span>BOX 4 1/2 IF · PIN DS 38</span>
                <div className="sheet-card-bar">0.82 m · 6.50″ OD</div>
              </div>
              {layout === "wide" && (
                <div className="sheet-card">
                  <strong>CUSTOM · CUST-204</strong>
                  <span>PIN DS 38 · BOX 4 1/2 IF</span>
                  <div className="sheet-card-bar">11.40 m · 8.25″ OD</div>
                </div>
              )}
            </div>
          </div>
        )}
      </Stage>
    </Faux>
  );
}
