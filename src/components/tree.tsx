import { Stage } from "../stageshow/kit/stage";
import type { Act } from "../stageshow/kit/act";
import { Icon } from "../stageshow/kit/parts/Icon";
import { Badge } from "../stageshow/kit/controls/Badge";
import { whenBhaComplete } from "../lib/scene-order.mjs";
import { Faux, useSiteTheme } from "../lib/theme";
import "./scene.css";

/**
 * Inventory workflow preview. Not a shipped file browser.
 * Rows stay mounted and morph from saved entries into family folders.
 */

type Tree = { step: number; count: number };

const OPEN: Tree = { step: 1, count: 2 };
const POSTER: Tree = { step: 4, count: 5 };

const script = async (a: Act<Tree>) => {
  await whenBhaComplete();
  a.mark("open");
  await a.wait(260);
  await a.set({ step: 2, count: 3 });
  a.mark("motor-file");
  await a.wait(380);
  await a.set({ step: 3, count: 4 });
  a.mark("sub-file");
  await a.wait(380);
  await a.set({ step: 4, count: 5 });
  a.mark("payoff");
  await a.wait(2000);
};

export function DirectoryPreview() {
  const theme = useSiteTheme();
  return (
    <Faux id="directory">
      <Stage
        width={420}
        height={250}
        theme={theme}
        greys="cool"
        play="once"
        initial={OPEN}
        poster={POSTER}
        compact={{ below: 450, width: 358, height: 240 }}
        script={script}
      >
        {(s, _rect, layout) => (
          <div className="tree-scene" data-crop>
            <div className="tree-kicker-row">
              <span className="bha-kicker">INVENTORY WORKFLOW PREVIEW</span>
              <Badge tone="neutral">{s.count} PDFs</Badge>
            </div>
            <div className="tree">
              <div className="tree-job">
                <Icon name="archive" />
                <strong>Job 1044 /</strong>
                <span className="tree-meta">Sorted by family</span>
              </div>
              <div className="tree-folder" data-on={s.step >= 1 || undefined}>
                <div className="tree-row-head"><Icon name="archive" /><span>Motor/</span></div>
                <div className="tree-file" data-lit={s.step === 2 || undefined}>
                  <Icon name="file" /><span>MTR-4418.pdf</span><em>9.42 m · 171 mm</em>
                </div>
              </div>
              <div className="tree-folder" data-on={s.step >= 2 || undefined}>
                <div className="tree-row-head"><Icon name="archive" /><span>Subs/</span></div>
                <div className="tree-file" data-lit={s.step === 3 || undefined}>
                  <Icon name="file" /><span>SUB-2201.pdf</span><em>0.82 m · 170 mm</em>
                </div>
              </div>
              {layout === "wide" && (
                <div className="tree-folder" data-on={s.step >= 3 || undefined}>
                  <div className="tree-row-head"><Icon name="archive" /><span>Custom/</span></div>
                  <div className="tree-file" data-lit={s.step === 4 || undefined}>
                    <Icon name="file" /><span>CUST-204.pdf</span><em>11.40 m · 210 mm</em>
                  </div>
                </div>
              )}
              <div className="tree-folder" data-on>
                <div className="tree-row-head"><Icon name="archive" /><span>Jars &amp; Shock/</span></div>
                <div className="tree-file"><Icon name="file" /><span>JAR-1180.pdf · SHK-14.pdf</span><em>12.03 m</em></div>
              </div>
            </div>
          </div>
        )}
      </Stage>
    </Faux>
  );
}
