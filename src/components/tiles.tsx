import { Stage } from "../stageshow/kit/stage";
import type { Act } from "../stageshow/kit/act";
import { Phone } from "../stageshow/kit/phone";
import { Window } from "../stageshow/kit/window";
import { Badge } from "../stageshow/kit/controls/Badge";
import { Row } from "../stageshow/kit/parts/Row";
import { Icon } from "../stageshow/kit/parts/Icon";
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

export function ConfirmTile() {
  return (
    <div id="tile-confirm">
    <Stage width={520} height={220} theme="dark" greys="cool" compact={{ below: 560, width: 320, height: 200 }}>
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
    <Stage width={240} height={150} theme="dark" greys="cool" compact={{ below: 300, width: 220, height: 130 }}>
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
      theme="dark"
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
    <div id={id}>
    <Stage width={260} height={180} theme="dark" greys="cool" compact={{ below: 300, width: 220, height: 160 }}>
      {() => (
        <div className="stack-scene">
          <div className="pile" aria-hidden>
            <div className="sheet" />
            <div className="sheet" />
            <div className="sheet"><strong>Jars</strong><span>Job 1044</span></div>
          </div>
        </div>
      )}
    </Stage>
    </div>
  );
}

export function StatementTile() {
  return (
    <div id="tile-statement">
    <Stage width={280} height={210} theme="dark" greys="cool" compact={{ below: 320, width: 240, height: 200 }}>
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
      <Stage width={420} height={280} theme="dark" greys="cool" compact={{ below: 480, width: 320, height: 200 }}>
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
      <Stage width={860} height={420} theme="dark" greys="cool" compact={{ below: 800, width: 358, height: 280 }}>
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
      <Stage width={520} height={200} theme="dark" greys="cool" compact={{ below: 560, width: 320, height: 180 }}>
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
