import { Stage } from "../stageshow/kit/stage";
import type { Act } from "../stageshow/kit/act";
import { Phone } from "../stageshow/kit/phone";
import { Keyboard } from "../stageshow/kit/ios";
import { Field } from "../stageshow/kit/controls/Field";
import { Button } from "../stageshow/kit/controls/Button";
import { Icon } from "../stageshow/kit/parts/Icon";
import { Row } from "../stageshow/kit/parts/Row";
import { silhouettes } from "../generated/silhouettes.mjs";
import { Faux, useSiteTheme } from "../lib/theme";
import "./scene.css";

/**
 * Measured entry is the shipped product and the only looping scene.
 * Wide 760×520: phone, motor drawing, pad, confirm rows, yellow card.
 * Compact 358×460, used at 390 and 407: retained are the lit letter, the
 * value being typed, the confirm rows and the yellow card. Removed are the
 * number pad and the second material choice. Crop is the phone below the
 * card. Minimum text is 12px.
 */

type Step = "serial" | "material" | "measure" | "confirm";

type Scene = {
  step: Step;
  serial: string;
  material: string;
  length: string;
  od: string;
  focus: "" | "serial" | "length" | "od";
  mail: boolean;
  lit: "" | "A" | "B";
  rows: number;
  metric: boolean;
};

const START: Scene = {
  step: "serial", serial: "", material: "", length: "", od: "", focus: "serial", mail: false, lit: "", rows: 0, metric: false,
};
const POSTER: Scene = {
  step: "confirm", serial: "MTR-4418", material: "Steel", length: "9.42", od: "6.75", focus: "", mail: false, lit: "", rows: 4, metric: true,
};

const script = async (a: Act<Scene>) => {
  await a.wait(500);
  a.mark("serial");
  await a.click("serial");
  await a.type("serial", "MTR-4418", { interval: 55 });
  await a.wait(280);
  a.mark("material");
  await a.set({ step: "material", focus: "" });
  await a.wait(420);
  await a.click("steel");
  await a.set({ material: "Steel" });
  await a.wait(200);
  a.mark("length");
  await a.set({ step: "measure", focus: "length", lit: "A" });
  await a.wait(240);
  await a.click("length");
  await a.type("length", "9.42", { interval: 70 });
  await a.wait(180);
  a.mark("od");
  await a.click("od");
  await a.set({ focus: "od", lit: "B" });
  await a.type("od", "6.75", { interval: 70 });
  await a.wait(240);
  a.mark("confirm");
  await a.click("confirm");
  await a.set({ step: "confirm", focus: "", lit: "", rows: 1 });
  await a.wait(260);
  await a.set({ rows: 2 });
  await a.wait(260);
  await a.set({ rows: 3 });
  await a.wait(260);
  await a.set({ rows: 4, metric: true });
  a.mark("metric");
  await a.wait(2000);
  await a.click("send");
  await a.set({ mail: true });
  await a.wait(900);
  await a.click("dismiss");
  await a.set({ mail: false });
  a.mark("reset");
  await a.wait(240);
  await a.snap({ ...START });
  await a.wait(400);
};

function Motor({ lit }: { lit: Scene["lit"] }) {
  const drawing = silhouettes.Motor;
  return (
    <div className="motor-wrap">
      <svg viewBox={drawing.viewBox} role="img" aria-label="Motor">
        <g dangerouslySetInnerHTML={{ __html: drawing.markup }} />
      </svg>
      <i className="flag" data-lit={lit === "A" || undefined} style={{ left: "6%" }}>A</i>
      <i className="flag" data-lit={lit === "B" || undefined} style={{ left: "42%" }}>B</i>
    </div>
  );
}

function Paper({ on }: { on: boolean }) {
  return (
    <aside className="paper" data-on={on || undefined}>
      <strong>MOTOR</strong>
      <div className="sub">MTR-4418 · Steel</div>
      <div className="metric">
        <div><span>A LEN</span><span>9.42</span></div>
        <div><span>B OD</span><span>6.75</span></div>
      </div>
    </aside>
  );
}

const CONFIRM = [
  ["Serial", "MTR-4418"],
  ["Material", "Steel"],
  ["A LEN", "9.42"],
  ["B OD", "6.75"],
];

function Screen({ s, compact }: { s: Scene; compact: boolean }) {
  const digits = s.focus === "od" ? s.od : s.length;
  return (
    <div className="app-screen">
      <header>
        <strong>StrapSheets</strong>
        <span>Job 1044</span>
      </header>
      <div className="panes">
        <div className="pane" data-on={s.step === "serial" || undefined}>
          <Field label="Serial" value={s.serial} focused={s.focus === "serial"} placeholder="Serial" box={{ "data-target": "serial" }} />
        </div>
        <div className="pane" data-on={s.step === "material" || undefined}>
          <strong>Material</strong>
          <div className="choice-row">
            <Button data-target="steel" variant={s.material === "Steel" ? "primary" : "secondary"}>Steel</Button>
            {compact ? null : <Button variant="secondary">Non Magnetic</Button>}
          </div>
        </div>
        <div className="pane" data-on={s.step === "measure" || undefined}>
          <Motor lit={s.lit} />
          <Field label="A LEN" value={s.length} focused={s.focus === "length"} box={{ "data-target": "length" }} />
          <Field label="B OD" value={s.od} focused={s.focus === "od"} box={{ "data-target": "od" }} />
          {compact ? null : (
            <div className="pad" aria-hidden="true">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"].map((key) => (
                <i key={key} data-down={digits.endsWith(key) || undefined}>{key}</i>
              ))}
            </div>
          )}
        </div>
        <div className="pane confirm" data-on={s.step === "confirm" || undefined}>
          <strong>Motor</strong>
          <ul className="confirm-rows">
            {CONFIRM.slice(0, s.rows).map(([label, value]) => (
              <li key={label}><span>{label}</span><span>{value}</span></li>
            ))}
          </ul>
          <div className="choice-row">
            <Button variant="secondary">Back</Button>
            <Button data-target="confirm" variant="secondary">Confirm</Button>
            <Button data-target="send" variant="primary">Send</Button>
          </div>
        </div>
      </div>
      <div className="mail" data-on={s.mail || undefined} data-target="dismiss">
        <div className="mail-head"><Icon name="mail" /><strong>Mail</strong></div>
        <p>To the office</p>
        <span className="file-chip"><Icon name="file" /> Motor.pdf</span>
      </div>
      <div className="queue">
        {["Sub · SUB-2201", "NM Pony · NMP-110", "Jars · JAR-1180", "Shock Sub · SHK-14", "Bit · BIT-8", "MWD · CR-204"].map((line) => (
          <Row key={line} title={line.split(" · ")[0]} subtitle={line.split(" · ")[1]} pad={8} />
        ))}
      </div>
      {s.step === "serial" ? <Keyboard typed={s.serial} shift dark suggestions={["MTR", "4418", "Serial"]} /> : null}
    </div>
  );
}

export function HeroEntry() {
  const theme = useSiteTheme();
  return (
    <Faux id="hero">
      <Stage
        width={760}
        height={520}
        theme={theme}
        greys="cool"
        play="loop"
        initial={START}
        poster={POSTER}
        compact={{ below: 700, width: 358, height: 460 }}
        cursor={{ at: "serial", style: "touch", kind: "pointer" }}
        script={script}
      >
        {(s, _rect, layout) => (
          <div className="scene">
            <div className="hero-phone" data-crop>
              <Phone width={layout === "compact" ? 250 : 300} dark={theme === "dark"} time="06:40" wallpaper="var(--dg-surface)">
                <Screen s={s} compact={layout === "compact"} />
              </Phone>
            </div>
            <Paper on={s.metric} />
          </div>
        )}
      </Stage>
    </Faux>
  );
}
