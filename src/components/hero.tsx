import { Stage } from "../stageshow/kit/stage";
import type { Act } from "../stageshow/kit/act";
import { Phone } from "../stageshow/kit/phone";
import { Keyboard } from "../stageshow/kit/ios";
import { Field } from "../stageshow/kit/controls/Field";
import { Button } from "../stageshow/kit/controls/Button";
import { Icon } from "../stageshow/kit/parts/Icon";
import "./scene.css";

type Step = "serial" | "material" | "measure" | "confirm";

type Scene = {
  step: Step;
  serial: string;
  material: string;
  length: string;
  od: string;
  focus: "" | "serial" | "length" | "od";
  mail: boolean;
};

const START: Scene = { step: "serial", serial: "", material: "", length: "", od: "", focus: "serial", mail: false };
const POSTER: Scene = { step: "confirm", serial: "MTR-4418", material: "Steel", length: "9.42", od: "6.75", focus: "", mail: true };

const script = async (a: Act<Scene>) => {
  await a.wait(600);
  await a.click("serial");
  await a.type("serial", "MTR-4418", { interval: 55 });
  await a.wait(350);
  await a.set({ step: "material", focus: "" });
  await a.wait(500);
  await a.click("steel");
  await a.set({ material: "Steel" });
  await a.wait(200);
  await a.set({ step: "measure", focus: "length" });
  await a.wait(300);
  await a.click("length");
  await a.type("length", "9.42", { interval: 70 });
  await a.wait(200);
  await a.click("od");
  await a.set({ focus: "od" });
  await a.type("od", "6.75", { interval: 70 });
  await a.wait(280);
  await a.click("confirm");
  await a.set({ step: "confirm", focus: "" });
  await a.wait(900);
  await a.click("send");
  await a.set({ mail: true });
  await a.wait(1400);
  await a.click("dismiss");
  await a.set({ mail: false });
  await a.wait(280);
  await a.move("serial");
  await a.snap({ ...START });
  await a.wait(400);
};

function Paper({ on, compact }: { on: boolean; compact: boolean }) {
  return (
    <aside className="paper" data-on={on || undefined} aria-hidden={!on}>
      <strong>MOTOR</strong>
      <div className="sub">MTR-4418 · Steel</div>
      {compact ? null : (
        <div className="metric">
          <div><span>A LEN</span><span>9.42</span></div>
          <div><span>B OD</span><span>6.75</span></div>
        </div>
      )}
    </aside>
  );
}

function Screen({ s }: { s: Scene }) {
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
            <Button variant="secondary">Non Magnetic</Button>
          </div>
        </div>
        <div className="pane" data-on={s.step === "measure" || undefined}>
          <Field label="Length" value={s.length} focused={s.focus === "length"} box={{ "data-target": "length" }} />
          <Field label="OD" value={s.od} focused={s.focus === "od"} box={{ "data-target": "od" }} />
          <div className="pad" aria-hidden>
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"].map((key) => (
              <i key={key} data-down={digits.endsWith(key) || undefined}>{key}</i>
            ))}
          </div>
        </div>
        <div className="pane confirm" data-on={s.step === "confirm" || undefined}>
          <strong>Motor</strong>
          <span>MTR-4418 · 9.42 · 6.75</span>
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
      <Keyboard typed={s.serial} shift dark suggestions={["MTR", "4418", "Serial"]} />
    </div>
  );
}

export function HeroEntry() {
  return (
    <div id="hero">
      <Stage
        width={720}
        height={420}
        theme="dark"
        greys="cool"
        play="loop"
        initial={START}
        poster={POSTER}
        compact={{ below: 760, width: 358, height: 460 }}
        cursor={{ at: "serial", style: "touch", kind: "pointer" }}
        script={script}
      >
        {(s, _rect, layout) => (
          <div className="scene">
            <div className="hero-phone">
              <Phone width={layout === "compact" ? 320 : 460} dark time="06:40" wallpaper="var(--ss-canvas)">
                <Screen s={s} />
              </Phone>
            </div>
            <Paper on={s.step === "confirm" || s.mail} compact={layout === "compact"} />
          </div>
        )}
      </Stage>
    </div>
  );
}
