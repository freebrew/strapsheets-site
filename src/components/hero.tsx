import { Stage } from "../stageshow/kit/stage";
import type { Act } from "../stageshow/kit/act";
import { Phone } from "../stageshow/kit/phone";
import { silhouettes } from "../generated/silhouettes.mjs";
import { Faux, useSiteTheme } from "../lib/theme";
import "./scene.css";

/**
 * Dual-process morphing hero modeled on the real dark-theme StrapSheets app:
 *   1. BOX / PIN Config & Thread Type (one section for BOX, one section for PIN)
 *   2. Process 1 — Standard Measured Entry (Motor / Subs): spotlight ring glides
 *      across callout letters A -> B -> D as measurements fill the confirm rows
 *   3. Process 2 — Custom Builder: ends morph from BOX/PIN config (left PIN · DS 38,
 *      right BOX · 4 1/2 IF) with A Upset OD, B Spiral OD (half-density hatch), C Length
 *   4. Payoff — Confirm & Printed Yellow Strap Sheet Card
 */

type Mode = "boxpin" | "measure-a" | "measure-b" | "custom" | "confirm";

type Scene = {
  mode: Mode;
  ring: "A" | "B" | "D";
  lenVal: string;
  odVal: string;
  rows: number;
  card: boolean;
};

const START: Scene = {
  mode: "boxpin",
  ring: "A",
  lenVal: "9.42",
  odVal: "171",
  rows: 2,
  card: false,
};

const POSTER: Scene = {
  mode: "confirm",
  ring: "B",
  lenVal: "9.42",
  odVal: "171",
  rows: 4,
  card: true,
};

const script = async (a: Act<Scene>) => {
  await a.wait(420);
  a.mark("boxpin");
  await a.click("pick-pin");
  await a.wait(360);
  a.mark("measure-a");
  await a.set({ mode: "measure-a", ring: "A", rows: 2 });
  await a.wait(520);
  a.mark("measure-b");
  await a.click("field-od");
  await a.set({ mode: "measure-b", ring: "B", rows: 3 });
  await a.wait(520);
  a.mark("custom");
  await a.set({ mode: "custom", ring: "D", rows: 4 });
  await a.wait(640);
  a.mark("confirm");
  await a.click("btn-review");
  await a.set({ mode: "confirm", ring: "B", rows: 4, card: true });
  await a.wait(2000);
  a.mark("reset");
  await a.set({ card: false });
  await a.move("pick-pin");
  await a.snap({ ...START });
  await a.wait(320);
};

const RING_POS: Record<Scene["ring"], { x: number; y: number; label: string }> = {
  A: { x: 14, y: 52, label: "A - Total Length" },
  B: { x: 46, y: 42, label: "B - Upper OD" },
  D: { x: 82, y: 48, label: "C - Custom Spiral OD" },
};

const CONFIRM_ROWS = [
  ["Serial · Material", "MTR-4418 · Steel"],
  ["BOX · Upper", "4 1/2 IF [NC 50]"],
  ["PIN · Lower", "DS 38 [NC38]"],
  ["A LEN · B OD", "9.42 m · 171 mm"],
];

function MorphDiagram({ s }: { s: Scene }) {
  const motor = silhouettes.Motor;
  const spot = RING_POS[s.ring];
  const isCustom = s.mode === "custom";
  return (
    <div className="hero-dg-frame" data-custom={isCustom || undefined}>
      <div className="hero-dg-head">
        <span>{isCustom ? "Custom · 5 of 5 · Builder" : "Motor · Measured Entry"}</span>
        <em>Highlighted: {s.ring} on the drawing</em>
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
        <div
          className="hero-spot-ring"
          style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
        >
          <span>{s.ring}</span>
        </div>
      </div>
    </div>
  );
}

function Paper({ on }: { on: boolean }) {
  return (
    <aside className="paper" data-on={on || undefined}>
      <div className="paper-head">
        <strong>MOTOR · MTR-4418</strong>
        <span>BOX 4 1/2 IF · PIN DS 38</span>
      </div>
      <div className="metric">
        <div><span>A LEN</span><span>9.42 m</span></div>
        <div><span>B OD</span><span>171 mm</span></div>
        <div><span>D ID</span><span>71 mm</span></div>
      </div>
    </aside>
  );
}

function Screen({ s }: { s: Scene }) {
  return (
    <div className="app-screen">
      <header className="real-app-header">
        <strong>StrapSheets</strong>
        <span className="job-link">Job 1044</span>
      </header>

      <MorphDiagram s={s} />

      <div className="morph-stage-card" data-mode={s.mode}>
        <div className="morph-section">
          <div className="morph-section-head">
            <strong>BOX PIN Config &amp; Thread Type</strong>
            <span>Step 3–4</span>
          </div>
          <div className="boxpin-two-sections">
            <div className="boxpin-box">
              <span className="boxpin-tag">BOX · Upper</span>
              <strong>4 1/2 IF [NC 50]</strong>
            </div>
            <div className="boxpin-box boxpin-box--pin" data-target="pick-pin">
              <span className="boxpin-tag">PIN · Lower</span>
              <strong>DS 38 [NC38]</strong>
            </div>
          </div>
        </div>

        <div className="morph-section">
          <div className="morph-section-head">
            <strong>{s.mode === "custom" ? "Custom Shape & Station OD" : RING_POS[s.ring].label}</strong>
            <span>{s.mode === "custom" ? "No Pin add-on" : "Number pad"}</span>
          </div>
          <div className="measure-dual-row">
            <div className="measure-pill" data-active={s.ring === "A" || undefined}>
              <span>A · Length</span>
              <strong>{s.lenVal} m</strong>
            </div>
            <div className="measure-pill" data-target="field-od" data-active={s.ring === "B" || undefined}>
              <span>B · Upper OD</span>
              <strong>{s.odVal} mm</strong>
            </div>
            <div className="measure-pill" data-active={s.ring === "D" || undefined}>
              <span>Spiral OD</span>
              <strong>210 mm</strong>
            </div>
          </div>
        </div>

        <div className="morph-section">
          <div className="morph-section-head">
            <strong>Confirm &amp; Card Summary</strong>
            <span>Ready to email</span>
          </div>
          <ul className="confirm-rows">
            {CONFIRM_ROWS.map(([label, value], idx) => (
              <li key={label} data-lit={idx < s.rows || undefined}>
                <span>{label}</span>
                <strong>{value}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="real-nav-row">
        <span className="real-btn-back">Back</span>
        <span className="real-btn-next" data-target="btn-review">
          {s.mode === "confirm" ? "Save & Email PDF" : "Review"}
        </span>
      </div>

      <nav className="real-tab-bar">
        <span className="active">New Entry</span>
        <span>Sessions (3)</span>
        <span>Settings</span>
      </nav>
    </div>
  );
}

export function HeroEntry() {
  const theme = useSiteTheme();
  return (
    <Faux id="hero">
      <Stage
        width={760}
        height={540}
        theme={theme}
        greys="cool"
        play="loop"
        initial={START}
        poster={POSTER}
        compact={{ below: 700, width: 358, height: 480 }}
        cursor={{ at: "pick-pin", style: "touch", kind: "pointer" }}
        script={script}
      >
        {(s, _rect, layout) => (
          <div className="scene">
            <div className="hero-phone" data-crop>
              <Phone width={layout === "compact" ? 260 : 310} dark={theme === "dark"} time="06:40" wallpaper="var(--dg-surface)">
                <Screen s={s} />
              </Phone>
            </div>
            <Paper on={s.card} />
          </div>
        )}
      </Stage>
    </Faux>
  );
}
