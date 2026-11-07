import { Stage } from "../stageshow/kit/stage";
import type { Act } from "../stageshow/kit/act";
import { BHA_BUILD, bhaProgress } from "../lib/bha.mjs";
import { markBhaComplete } from "../lib/scene-order.mjs";
import { silhouettes } from "../generated/silhouettes.mjs";
import { Faux, useSiteTheme } from "../lib/theme";
import "./scene.css";

/**
 * Inventory workflow preview. The string builds from the bit.
 * Wide 520×300 shows the whole string, running off the left once it is long.
 * Compact 358×250, used at 390 and 407, keeps the latest three tools and both
 * counters. Earlier tools are removed. data-crop marks that left-edge run-off.
 * Minimum text is 13px.
 */

type Build = { shown: number };
const STEPS = bhaProgress();
const OPEN: Build = { shown: 0 };
const POSTER: Build = { shown: STEPS.length };

const script = async (a: Act<Build>) => {
  await a.wait(360);
  a.mark("open");
  const groups = [[1, 2], [3, 4, 5], [6, 7], [8, 9], [10, 11]];
  for (const group of groups) {
    a.mark(`add-${group[0]}`);
    for (const shown of group) {
      await a.set({ shown });
      await a.wait(340);
    }
    await a.wait(280);
  }
  a.mark("payoff");
  await a.wait(2000);
  markBhaComplete();
};

function od(value: number) {
  return value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

export function BhaPreview() {
  const theme = useSiteTheme();
  return (
    <Faux id="bha">
      <Stage
        width={520}
        height={300}
        theme={theme}
        greys="cool"
        play="once"
        initial={OPEN}
        poster={POSTER}
        compact={{ below: 540, width: 358, height: 250 }}
        script={script}
      >
        {(s, _rect, layout) => {
          const shown = STEPS.slice(0, s.shown);
          const visible = layout === "compact" ? shown.slice(-3) : shown;
          const latest = shown.at(-1);
          return (
            <div className="bha-scene">
              <div className="bha-kicker">Inventory Workflow Preview</div>
              <div className="bha-row" data-crop>
                {visible.map((piece) => {
                  const art = silhouettes[piece.art];
                  return (
                    <div className="bha-piece" key={piece.key}>
                      <svg viewBox={art.viewBox} aria-hidden="true">
                        <g dangerouslySetInnerHTML={{ __html: art.markup }} />
                      </svg>
                      <span>{piece.name}</span>
                    </div>
                  );
                })}
              </div>
              <div className="bha-totals">
                <div><span>Total Length</span><strong>{latest ? latest.totalLengthM.toFixed(2) : "0.00"} m</strong></div>
                <div><span>Largest OD</span><strong>{latest ? od(latest.largestOdIn) : "0"} in</strong></div>
              </div>
            </div>
          );
        }}
      </Stage>
    </Faux>
  );
}

export const BHA_NAMES = BHA_BUILD.map((piece) => piece.name);
