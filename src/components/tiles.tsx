import { Stage } from "../stageshow/kit/stage";
import type { Act } from "../stageshow/kit/act";
import { Phone } from "../stageshow/kit/phone";
import { Window } from "../stageshow/kit/window";
import { Badge } from "../stageshow/kit/controls/Badge";
import { Row } from "../stageshow/kit/parts/Row";
import { Icon } from "../stageshow/kit/parts/Icon";
import { silhouettes } from "../generated/silhouettes.mjs";
import { Faux, useSiteTheme } from "../lib/theme";
import "./scene.css";

type Tick = { on: boolean };
const tickScript = async (a: Act<Tick>) => {
  await a.wait(700);
  await a.click("row");
  await a.set({ on: true });
  await a.wait(1600);
  await a.set({ on: false });
  await a.wait(400);
};

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
        height={240}
        theme={theme}
        greys="cool"
        play="once"
        initial={{ phase: 1 }}
        poster={{ phase: 3 }}
        compact={{ below: 560, width: 358, height: 240 }}
        script={customMorphScript}
      >
        {(s) => (
          <div className="custom-morph-scene" data-phase={s.phase}>
            <div className="cm-top-row">
              <div className="cm-end-box" data-active>
                <span>LOWER / BTM · LEFT END</span>
                <strong>PIN · DS 38 [NC38]</strong>
              </div>
              <div className="cm-arrow">→ morphs ends &amp; OD marks →</div>
              <div className="cm-end-box" data-active>
                <span>UPPER / TOP · RIGHT END</span>
                <strong>BOX · 4 1/2 IF [NC 50]</strong>
              </div>
            </div>
            <div className="cm-tube-frame">
              <svg viewBox="0 0 640 112" aria-hidden="true">
                <text x="52" y="18" fill="var(--dg-ink)" fontSize="11" fontWeight="700" textAnchor="middle">PIN · DS 38</text>
                <text x="586" y="18" fill="var(--dg-ink)" fontSize="11" fontWeight="700" textAnchor="middle">BOX · 4 1/2 IF</text>
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
                <text x="234" y="18" fill="#15171b" fontSize="11" fontWeight="700" textAnchor="middle">A</text>
                <circle cx="415" cy="14" r="10" fill="var(--dg-surface)" stroke="var(--dg-select)" strokeWidth="2" />
                <text x="415" y="18" fill="var(--dg-ink)" fontSize="11" fontWeight="700" textAnchor="middle">B</text>
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
        compact={{ below: 450, width: 358, height: 260 }}
        script={themeMorphScript}
      >
        {(s) => (
          <div className="theme-morph-scene" data-paper={s.paperMode || undefined}>
            <div className="tm-header">
              <span className="bha-kicker">INLINE SVG ⇄ LIGHT PRINT &amp; PDF</span>
              <span className="tm-badge">{s.paperMode ? "Dark Screen + Light PDF" : "Dark Screen SVG"}</span>
            </div>
            <div className="tm-split">
              <div className="tm-pane tm-pane--dark">
                <span className="tm-tag">Screen (--dg-surface)</span>
                <svg viewBox={subs.viewBox} aria-hidden="true">
                  <g dangerouslySetInnerHTML={{ __html: subs.markup }} />
                </svg>
                <div className="tm-meta">SUB-2201 · Highlighted: B (6.50″)</div>
              </div>
              <div className="tm-pane tm-pane--light" data-lit={s.paperMode || undefined}>
                <span className="tm-tag">Print &amp; PDF (#ffffff paper)</span>
                <div className="tm-yellow-card">
                  <strong>SUBS · SUB-2201</strong>
                  <div><span>A LEN 0.82 m</span><span>B OD 6.50″</span><span>D ID 2.25″</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Stage>
    </Faux>
  );
}

export function ConfirmTile() {
  return (
    <div id="tile-confirm">
      <Stage width={520} height={220} theme={useSiteTheme()} greys="cool" compact={{ below: 560, width: 320, height: 200 }}>
        {(_s, _r, layout) => (
          <div className="scene letter-card">
            <svg width={layout === "compact" ? 120 : 210} height="84" viewBox="0 0 210 84" aria-hidden>
              <rect x="18" y="28" width="150" height="22" rx="8" fill="var(--ss-fill)" />
              <circle cx="28" cy="39" r="7" fill="none" stroke="var(--ss-accent)" strokeWidth="2" />
              <text x="24" y="43" fill="var(--ss-accent-text)" fontSize="11" fontFamily="var(--ss-font)">A</text>
              <path d="M40 62 h70" stroke="var(--ss-text-faint)" strokeWidth="1" />
            </svg>
            <div className="metric">
              <div><span>A LEN</span><span>9.42</span></div>
              <div><span>B OD</span><span>6.75</span></div>
            </div>
          </div>
        )}
      </Stage>
    </div>
  );
}

export function StatTile() {
  return (
    <div id="tile-stat">
      <Stage width={240} height={150} theme={useSiteTheme()} greys="cool" compact={{ below: 300, width: 220, height: 130 }}>
        {() => (
          <div className="stat-scene">
            <strong>14<span>tools</span></strong>
          </div>
        )}
      </Stage>
    </div>
  );
}

export function SessionTile() {
  return (
    <div id="tile-session">
      <Stage
        width={300}
        height={150}
        theme={useSiteTheme()}
        greys="cool"
        play="loop"
        initial={{ on: false }}
        poster={{ on: true }}
        compact={{ below: 340, width: 260, height: 140 }}
        cursor={{ at: "row", style: "touch", kind: "pointer" }}
        script={tickScript}
      >
        {(s) => (
          <div className="ticks">
            <div className="tick-row" data-target="row">
              <span className={`box${s.on ? " ss-tick" : ""}`} data-on={s.on || undefined}>{s.on ? <Icon name="check" /> : null}</span>
              <span>Motor · MTR-4418</span>
            </div>
            <div className="tick-row">
              <span className="box" />
              <span>Sub · SUB-2201</span>
            </div>
          </div>
        )}
      </Stage>
    </div>
  );
}

export function WallTile({ id = "tile-wall" }: { id?: string }) {
  return (
    <Faux id={id}>
      <Stage width={680} height={180} theme={useSiteTheme()} greys="cool" compact={{ below: 560, width: 358, height: 190 }}>
        {() => (
          <div className="wall-morph-scene">
            <div className="wall-sessions-col">
              <span className="bha-kicker">SESSIONS · JOB 1044</span>
              <div className="wall-session-item"><i>✓</i><strong>MTR-4418</strong><span>Motor · 9.42 m</span></div>
              <div className="wall-session-item"><i>✓</i><strong>SUB-2201</strong><span>Subs · 0.82 m</span></div>
              <div className="wall-session-item"><i>✓</i><strong>CUST-204</strong><span>Custom · 11.40 m</span></div>
            </div>
            <div className="wall-cards-col">
              <div className="sheet-card">
                <strong>MOTOR</strong>
                <span>MTR-4418 · 6.75″ OD</span>
                <em>9.42 m</em>
              </div>
              <div className="sheet-card">
                <strong>SUBS</strong>
                <span>SUB-2201 · 6.50″ OD</span>
                <em>0.82 m</em>
              </div>
              <div className="sheet-card">
                <strong>CUSTOM</strong>
                <span>CUST-204 · 8.25″ OD</span>
                <em>11.40 m</em>
              </div>
            </div>
          </div>
        )}
      </Stage>
    </Faux>
  );
}

export function StatementTile() {
  return (
    <div id="tile-statement">
      <Stage width={280} height={210} theme={useSiteTheme()} greys="cool" compact={{ below: 320, width: 240, height: 200 }}>
        {() => (
          <div className="statement">
            <strong>Capitals, number pad, no spelling fixes.</strong>
          </div>
        )}
      </Stage>
    </div>
  );
}

const STOCK = ["MTR-4418", "MTR-4419", "SUB-2201", "JAR-1180"];

export function InventoryTile() {
  return (
    <div id="inventory">
      <Stage width={420} height={280} theme={useSiteTheme()} greys="cool" compact={{ below: 480, width: 320, height: 200 }}>
        {(_s, _r, layout) => (
          <div className="inventory-scene">
            <div className="job">Job 1044 · on location</div>
            {(layout === "compact" ? STOCK.slice(0, 3) : STOCK).map((serial) => (
              <Row key={serial} title={serial} subtitle={serial.startsWith("MTR") ? "Motor" : serial.startsWith("SUB") ? "Sub" : "Jars"} pad={8} />
            ))}
            <Badge className="coming" tone="accent">Coming</Badge>
          </div>
        )}
      </Stage>
    </div>
  );
}

export function HowPair() {
  return (
    <div id="how-pair">
      <Stage width={860} height={420} theme={useSiteTheme()} greys="cool" compact={{ below: 800, width: 358, height: 280 }}>
        {(_s, _r, layout) => (
          <div className="scene pair-scene">
            <div className="sheet-window">
              <Window title="Job 1044">
                <div style={{ padding: 12, display: "grid", gap: 4 }}>
                  <Row title="Motor" subtitle="MTR-4418" meta="9.42 m" pad={8} />
                  <Row title="Sub" subtitle="SUB-2201" meta="1.20 m" pad={8} />
                  {layout === "compact" ? null : <Row title="Jars" subtitle="JAR-1180" meta="4.05 m" pad={8} />}
                </div>
              </Window>
            </div>
            <Phone width={layout === "compact" ? 320 : 250} dark time="06:40" wallpaper="var(--ss-canvas)" className="pair-phone">
              <div className="app-screen">
                <header><strong>Confirm</strong></header>
                <Row title="Motor" subtitle="MTR-4418" meta="Ready" pad={8} />
              </div>
            </Phone>
          </div>
        )}
      </Stage>
    </div>
  );
}

export function CustomTile() {
  return (
    <div id="custom-pro">
      <Stage width={520} height={200} theme={useSiteTheme()} greys="cool" compact={{ below: 560, width: 320, height: 180 }}>
        {() => (
          <div className="custom-scene">
            <svg width="220" height="70" viewBox="0 0 220 70" aria-hidden>
              <rect x="16" y="24" width="188" height="22" rx="11" fill="var(--ss-fill)" stroke="var(--ss-line)" />
              <circle cx="48" cy="35" r="5" fill="var(--ss-accent)" />
              <circle cx="110" cy="35" r="5" fill="var(--ss-text-faint)" />
              <circle cx="168" cy="35" r="5" fill="var(--ss-text-faint)" />
              <text x="44" y="58" fill="var(--ss-accent-text)" fontSize="11" fontFamily="var(--ss-font)">A</text>
            </svg>
            <div>
              <Badge tone="accent">Pro</Badge>
              <p className="custom-line">Mark the tube yourself.</p>
            </div>
          </div>
        )}
      </Stage>
    </div>
  );
}
