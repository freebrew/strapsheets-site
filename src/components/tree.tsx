import { Stage } from "../stageshow/kit/stage";
import type { Act } from "../stageshow/kit/act";
import { Icon } from "../stageshow/kit/parts/Icon";
import { Badge } from "../stageshow/kit/controls/Badge";
import { whenBhaComplete } from "../lib/scene-order.mjs";
import { Faux, useSiteTheme } from "../lib/theme";
import "./scene.css";

/**
 * Inventory workflow preview. Not a shipped file browser.
 * Wide 460×300 keeps both folders. Compact 358×250, used at 390 and 407,
 * keeps Job 1044, the Motor file and the count. The Sub folder is removed.
 * No crop. Minimum text is 12px.
 */

type Tree = { motor: boolean; motorFile: boolean; sub: boolean; subFile: boolean; count: number };

const OPEN: Tree = { motor: false, motorFile: false, sub: false, subFile: false, count: 0 };
const POSTER: Tree = { motor: true, motorFile: true, sub: true, subFile: true, count: 2 };

const script = async (a: Act<Tree>) => {
  await whenBhaComplete();
  a.mark("open");
  await a.wait(280);
  await a.set({ motor: true });
  a.mark("motor");
  await a.wait(460);
  await a.set({ motorFile: true, count: 1 });
  a.mark("motor-file");
  await a.wait(460);
  await a.set({ sub: true });
  a.mark("sub");
  await a.wait(420);
  await a.set({ subFile: true, count: 2 });
  a.mark("payoff");
  await a.wait(2000);
};

export function DirectoryPreview() {
  const theme = useSiteTheme();
  return (
    <Faux id="directory">
      <Stage
        width={460}
        height={300}
        theme={theme}
        greys="cool"
        play="once"
        initial={OPEN}
        poster={POSTER}
        compact={{ below: 480, width: 358, height: 250 }}
        script={script}
      >
        {(s, _rect, layout) => (
          <div className="tree-scene" data-crop>
            <div className="tree">
              <div className="tree-job"><Icon name="archive" /><strong>Job 1044</strong><Badge tone="neutral">{s.count}</Badge></div>
              {s.motor ? (
                <div className="tree-folder">
                  <div><Icon name="archive" /><span>Motor</span></div>
                  {s.motorFile ? <div className="tree-file"><Icon name="file" /><span>MTR-4418.pdf</span></div> : null}
                </div>
              ) : null}
              {layout === "wide" && s.sub ? (
                <div className="tree-folder">
                  <div><Icon name="archive" /><span>Sub</span></div>
                  {s.subFile ? <div className="tree-file"><Icon name="file" /><span>SUB-2201.pdf</span></div> : null}
                </div>
              ) : null}
              <div className="tree-folder"><div><Icon name="archive" /><span>Jars</span></div></div>
              <div className="tree-folder"><div><Icon name="archive" /><span>Shock Sub</span></div></div>
              <div className="tree-folder"><div><Icon name="archive" /><span>NM Pony</span></div></div>
              <div className="tree-file"><Icon name="file" /><span>JAR-1180.pdf</span></div>
              <div className="tree-file"><Icon name="file" /><span>SHK-14.pdf</span></div>
              <div className="tree-folder"><div><Icon name="archive" /><span>Bit</span></div></div>
              <div className="tree-file"><Icon name="file" /><span>BIT-8.pdf</span></div>
            </div>
          </div>
        )}
      </Stage>
    </Faux>
  );
}
