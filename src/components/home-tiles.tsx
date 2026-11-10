import { Stage } from "../stageshow/kit/stage";
import type { Act } from "../stageshow/kit/act";
import { silhouettes } from "../generated/silhouettes.mjs";
import { Faux, useSiteTheme } from "../lib/theme";
import "./scene.css";

type EntryMode = "boxpin" | "measure-a" | "measure-b" | "custom" | "confirm";

type PanelScene = {
  mode: EntryMode;
  ring: "A" | "B" | "D";
  lenVal: string;
  odVal: string;
  rows: number;
  card: boolean;
  phase: 1 | 2 | 3;
};

const PANEL_START: PanelScene = {
  mode: "boxpin",
  ring: "A",
  lenVal: "9.42",
  odVal: "171",
  rows: 2,
  card: false,
  phase: 1,
};

const PANEL_POSTER: PanelScene = {
  mode: "confirm",
  ring: "B",
  lenVal: "9.42",
  odVal: "171",
  rows: 4,
  card: true,
  phase: 3,
};

const panelScript = async (a: Act<PanelScene>) => {
  await a.wait(420);
  a.mark("boxpin");
  await a.click("panel-pick-pin");
  await a.wait(360);
  a.mark("measure-a");
  await a.set({ mode: "measure-a", ring: "A", rows: 2, phase: 2 });
  await a.wait(520);
  a.mark("measure-b");
  await a.click("panel-field-od");
  await a.set({ mode: "measure-b", ring: "B", rows: 3, phase: 2 });
  await a.wait(520);
  a.mark("custom");
  await a.set({ mode: "custom", ring: "D", rows: 4, phase: 3 });
  await a.wait(640);
  a.mark("confirm");
  await a.click("panel-btn-review");
  await a.set({ mode: "confirm", ring: "B", rows: 4, card: true, phase: 3 });
  await a.wait(2000);
  a.mark("reset");
  await a.set({ card: false });
  await a.move("panel-pick-pin");
  await a.snap({ ...PANEL_START });
  await a.wait(320);
};

const PANEL_RING_POS: Record<PanelScene["ring"], { x: number; y: number; label: string }> = {
  A: { x: 14, y: 52, label: "A - Total Length" },
  B: { x: 46, y: 42, label: "B - Upper OD" },
  D: { x: 82, y: 48, label: "C - Custom Spiral OD" },
};

const PANEL_CONFIRM_ROWS = [
  ["Serial · Material", "MTR-4418 · Steel"],
  ["BOX · Upper", "4 1/2 IF [NC 50]"],
  ["PIN · Lower", "DS 38 [NC38]"],
  ["A LEN · B OD", "9.42 m · 171 mm"],
];

export function CustomMorphTile() {
  const theme = useSiteTheme();
  const motor = silhouettes.Motor;
  return (
    <Faux id="tile-custom-morph">
      <Stage
        width={680}
        height={396}
        theme={theme}
        greys="cool"
        play="loop"
        initial={PANEL_START}
        poster={PANEL_POSTER}
        compact={{ below: 560, width: 358, height: 410 }}
        cursor={{ at: "panel-pick-pin", style: "touch", kind: "pointer" }}
        script={panelScript}
      >
        {(s, _r, layout) => {
          const spot = PANEL_RING_POS[s.ring];
          const isCustom = s.mode === "custom";
          return (
            <div className="custom-morph-scene" data-phase={s.phase} data-layout={layout}>
              <div className="cm-split">
                <div className="cm-entry-screen">
                  <div className="real-app-header">
                    <strong>StrapSheets · Tools Data Entry</strong>
                    <span className="job-link">Job 1044</span>
                  </div>

                  <div className="hero-dg-frame" data-custom={isCustom || undefined}>
                    <div className="hero-dg-head">
                      <span>{isCustom ? "Custom · 5 of 5 · Builder" : "Motor · Measured Entry"}</span>
                      <em>Highlighted: {s.ring}</em>
                    </div>
                    <div className="hero-dg-canvas">
                      <div className="hero-dg-layer" data-active={!isCustom || undefined}>
                        <svg viewBox={motor.viewBox} role="img" aria-label="Motor diagram">
                          <g dangerouslySetInnerHTML={{ __html: motor.markup }} />
                        </svg>
                      </div>
                      <div className="hero-dg-layer hero-dg-layer--custom" data-active={isCustom || undefined}>
                        <svg viewBox="0 0 680 150" role="img" aria-label="Custom builder diagram">
                          <text x="58" y="24" fill="var(--dg-ink)" fontSize="13" fontWeight="700" textAnchor="middle">PIN · DS 38</text>
                          <text x="612" y="24" fill="var(--dg-ink)" fontSize="13" fontWeight="700" textAnchor="middle">BOX · 4 1/2 IF</text>
                          <polygon
                            points="28,62 64,50 210,50 230,38 300,38 320,50 644,50 644,104 320,104 300,116 230,116 210,104 64,104 28,92"
                            fill="var(--dg-fill)"
                            stroke="var(--dg-ink)"
                            strokeWidth="2.5"
                          />
                          <line x1="38" y1="60" x2="38" y2="94" stroke="var(--dg-ink)" strokeWidth="1.4" />
                          <line x1="48" y1="56" x2="48" y2="98" stroke="var(--dg-ink)" strokeWidth="1.4" />
                          <line x1="58" y1="52" x2="58" y2="102" stroke="var(--dg-ink)" strokeWidth="1.4" />
                          <line x1="620" y1="66" x2="638" y2="66" stroke="var(--dg-ink)" strokeWidth="1.4" strokeDasharray="3 3" />
                          <line x1="620" y1="77" x2="638" y2="77" stroke="var(--dg-ink)" strokeWidth="1.4" strokeDasharray="3 3" />
                          <line x1="620" y1="88" x2="638" y2="88" stroke="var(--dg-ink)" strokeWidth="1.4" strokeDasharray="3 3" />
                          <polygon
                            points="385,50 402,34 478,34 495,50 495,104 478,120 402,120 385,104"
                            fill="var(--dg-bevel-core)"
                            stroke="var(--dg-ink)"
                            strokeWidth="2"
                          />
                          <line x1="402" y1="118" x2="438" y2="36" stroke="#858b97" strokeWidth="1.5" />
                          <line x1="426" y1="118" x2="462" y2="36" stroke="#858b97" strokeWidth="1.5" />
                          <line x1="450" y1="118" x2="484" y2="36" stroke="#858b97" strokeWidth="1.5" />
                        </svg>
                      </div>
                      <div className="hero-spot-ring" style={{ left: `${spot.x}%`, top: `${spot.y}%` }}>
                        <span>{s.ring}</span>
                      </div>
                    </div>
                  </div>

                  <div className="boxpin-two-sections">
                    <div className="boxpin-box">
                      <span className="boxpin-tag">BOX · Upper</span>
                      <strong>4 1/2 IF [NC 50]</strong>
                    </div>
                    <div className="boxpin-box boxpin-box--pin" data-target="panel-pick-pin">
                      <span className="boxpin-tag">PIN · Lower</span>
                      <strong>DS 38 [NC38]</strong>
                    </div>
                  </div>

                  <div className="measure-dual-row">
                    <div className="measure-pill" data-active={s.ring === "A" || undefined}>
                      <span>A · Length</span>
                      <strong>{s.lenVal} m</strong>
                    </div>
                    <div className="measure-pill" data-target="panel-field-od" data-active={s.ring === "B" || undefined}>
                      <span>B · Upper OD</span>
                      <strong>{s.odVal} mm</strong>
                    </div>
                    <div className="measure-pill" data-active={s.ring === "D" || undefined}>
                      <span>Spiral OD</span>
                      <strong>210 mm</strong>
                    </div>
                  </div>

                  <div className="real-nav-row">
                    <span className="real-btn-back">Back</span>
                    <span className="real-btn-next" data-target="panel-btn-review">
                      {s.mode === "confirm" ? "Save & Email PDF" : "Review"}
                    </span>
                  </div>
                </div>

                {layout === "wide" && (
                  <div className="cm-custom-col">
                    <div className="cm-diagram-group">
                      <div className="cm-top-row">
                        <div className="cm-end-col">
                          <span className="cm-end-label">LOWER / BTM · LEFT</span>
                          <strong className="cm-end-val">PIN · DS 38 [NC38]</strong>
                        </div>
                        <div className="cm-end-col cm-end-col--right">
                          <span className="cm-end-label">UPPER / TOP · RIGHT</span>
                          <strong className="cm-end-val">BOX · 4 1/2 IF</strong>
                        </div>
                      </div>

                      <div className="cm-tube-canvas">
                        <svg viewBox="0 0 640 112" aria-hidden="true">
                          <text x="56" y="18" fill="var(--dg-ink)" fontSize="13" fontWeight="700" textAnchor="middle">PIN · DS 38</text>
                          <text x="582" y="18" fill="var(--dg-ink)" fontSize="13" fontWeight="700" textAnchor="middle">BOX · 4 1/2 IF</text>
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
                          <circle cx="234" cy="14" r="11" fill="var(--dg-select)" />
                          <text x="234" y="18" fill="#15171b" fontSize="12" fontWeight="700" textAnchor="middle">A</text>
                          <circle cx="415" cy="14" r="11" fill="var(--dg-surface)" stroke="var(--dg-select)" strokeWidth="2" />
                          <text x="415" y="18" fill="var(--dg-ink)" fontSize="12" fontWeight="700" textAnchor="middle">B</text>
                        </svg>
                      </div>

                      <div className="cm-chips-row">
                        <span className="cm-chip" data-lit>A Upset OD · 171 mm</span>
                        <span className="cm-chip" data-lit={s.phase >= 2 || undefined}>B Spiral OD · 210 mm</span>
                        <span className="cm-chip" data-lit={s.phase >= 3 || undefined}>C Length · 3.10 m</span>
                      </div>
                    </div>

                    <ul className="confirm-rows">
                      {PANEL_CONFIRM_ROWS.map(([label, value], idx) => (
                        <li key={label} data-lit={idx < s.rows || undefined}>
                          <span>{label}</span>
                          <strong>{value}</strong>
                        </li>
                      ))}
                    </ul>

                    <div className="cm-yellow-payoff" data-lit={s.card || undefined}>
                      <strong>MOTOR · MTR-4418 · PRINTED CARD</strong>
                      <span>A LEN 9.42 m · B OD 171 mm · D ID 71 mm</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        }}
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
        height={250}
        theme={theme}
        greys="cool"
        play="once"
        initial={{ paperMode: false }}
        poster={{ paperMode: true }}
        compact={{ below: 450, width: 358, height: 240 }}
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
              <div className="tm-meta">Screen (--dg-surface) · Highlighted: B (170 mm)</div>
            </div>
            <div className="tm-yellow-strip" data-lit={s.paperMode || undefined}>
              <div className="tm-yellow-row">
                <strong>PRINT &amp; PDF CARD</strong>
                <span>A LEN 0.82 m · B OD 170 mm · D ID 57 mm</span>
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
      <Stage width={680} height={160} theme={useSiteTheme()} greys="cool" compact={{ below: 560, width: 358, height: 170 }}>
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
                <div className="sheet-card-bar">9.42 m · 171 mm OD</div>
              </div>
              <div className="sheet-card">
                <strong>SUBS · SUB-2201</strong>
                <span>BOX 4 1/2 XH · PIN 4 1/2 IF</span>
                <div className="sheet-card-bar">0.82 m · 170 mm OD</div>
              </div>
              {layout === "wide" && (
                <div className="sheet-card">
                  <strong>CUSTOM · CUST-204</strong>
                  <span>PIN DS 38 · BOX 4 1/2 IF</span>
                  <div className="sheet-card-bar">11.40 m · 210 mm OD</div>
                </div>
              )}
            </div>
          </div>
        )}
      </Stage>
    </Faux>
  );
}
