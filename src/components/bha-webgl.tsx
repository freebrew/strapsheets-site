import { useEffect, useRef, useState } from "react";

export interface BhaGlPiece {
  key: string;
  odMm: number;
  idMm: number;
  lengthM: number;
  rowHeightPx: number;
}

const VERT_SRC = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = vec2(a_pos.x * 0.5 + 0.5, 0.5 - a_pos.y * 0.5);
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

// Fragment shader: raycasts a 3D vertical cylindrical BHA string with per-tool axial & azimuthal
// geometry R(v, phi) rotating counter-clockwise looking up (front-face features travel left-to-right).
const FRAG_SRC = `
precision highp float;
varying vec2 v_uv;

uniform float u_time;
uniform float u_shown;
uniform float u_totalH;
uniform float u_lightMode;
uniform float u_yEnds[11];
uniform float u_odNorm[11];

const float PI = 3.14159265359;

// Returnsvec3(outerRadius, surfaceRelief, bandTint) for tool idx at axial v in [0,1] and body angle phi.
vec3 toolGeometry(int idx, float v, float phi, float baseR) {
  float r = baseR;
  float relief = 0.0;
  float band = 0.0;

  // Machined make-up shoulder chamfers at top (v=0) and bottom (v=1) of each torqued connection
  float jointDist = min(v, 1.0 - v);
  if (jointDist < 0.028) {
    float j = 1.0 - jointDist / 0.028;
    r -= 0.028 * j;
    relief -= 0.35 * j;
    band = 0.65 * j;
  }

  if (idx == 0) {
    // 01 Bit (216 mm PDC Bit): 5 helical PDC blades & cutters on top crown (v < 0.74), 171 mm shank below
    if (v < 0.74) {
      float cv = v / 0.74;
      float crownEnv = smoothstep(0.0, 0.16, cv) * (1.0 - 0.08 * smoothstep(0.78, 1.0, cv));
      float bladeWave = cos(5.0 * phi + 2.4 * cv);
      float blade = smoothstep(-0.15, 0.35, bladeWave);
      r = mix(0.56, 0.89 * crownEnv + 0.10, blade);
      relief += 0.42 * bladeWave;
      // Hardfaced gauge pad band on outer blades
      if (cv > 0.28 && cv < 0.82 && blade > 0.6) {
        band = max(band, 0.45);
      }
      // Circular PDC diamond cutter pockets along blade leading edges
      float cutterRow = sin(cv * 26.0);
      float cutterEdge = exp(-pow((bladeWave - 0.45) * 4.2, 2.0));
      if (cutterRow > 0.25 && cv > 0.08 && cv < 0.76) {
        float cstud = smoothstep(0.25, 0.85, cutterRow) * cutterEdge;
        r += 0.032 * cstud;
        relief += 0.65 * cstud;
        band = max(band, 0.85 * cstud);
      }
    } else {
      // Bit shank (171 mm) with 2 rotating bit-breaker wrench flats
      r = 0.56;
      if (v > 0.80 && v < 0.93) {
        float flatCut = smoothstep(0.45, 0.85, cos(2.0 * phi));
        r -= 0.055 * flatCut;
        relief -= 0.35 * flatCut;
        band = max(band, 0.5 * flatCut);
      }
    }
  } else if (idx == 1) {
    // 02 Motor: lower & upper spiral wear pads + bent-housing ring + stator flutes
    if ((v > 0.18 && v < 0.29) || (v > 0.46 && v < 0.57)) {
      float padWave = cos(4.0 * phi + 7.0 * v);
      float pad = smoothstep(0.0, 0.5, padWave);
      r += 0.065 * pad;
      relief += 0.35 * padWave;
      band = max(band, 0.35 * pad);
    } else if (v > 0.35 && v < 0.39) {
      // Bent-housing scribe ring
      r += 0.025;
      band = max(band, 0.7);
    } else if (v > 0.60 && v < 0.94) {
      // Power section multi-lobe helical sheen
      relief += 0.12 * cos(5.0 * phi - 9.0 * v);
    }
  } else if (idx == 2) {
    // 03 Stabilized Sub: 3 wide helical spiral stabilizer blades wrapping around the body
    if (v > 0.18 && v < 0.78) {
      float sv = (v - 0.18) / 0.60;
      float env = smoothstep(0.0, 0.18, sv) * smoothstep(1.0, 0.82, sv);
      float bWave = cos(3.0 * phi + 3.6 * sv);
      float blade = smoothstep(-0.05, 0.45, bWave);
      r += 0.19 * env * blade;
      relief += 0.48 * env * bWave;
      band = max(band, 0.40 * env * blade);
    }
  } else if (idx == 3) {
    // 04 NM Pony: slick non-mag collar with rotating handling recess & turn marks
    relief += 0.08 * cos(2.0 * phi + 8.0 * v);
    if (v > 0.45 && v < 0.55) {
      band = max(band, 0.28);
    }
  } else if (idx == 4) {
    // 05 MWD Carrier: helical centralizer fins + PEEK gap sub insulator band
    if (v > 0.20 && v < 0.38) {
      float finWave = cos(4.0 * phi + 4.5 * v);
      float fin = smoothstep(0.1, 0.6, finWave);
      r += 0.045 * fin;
      relief += 0.28 * finWave;
    }
    if (v > 0.82 && v < 0.93) {
      band = max(band, 0.75);
      relief -= 0.18 * sin((v - 0.82) / 0.11 * PI);
    }
  } else if (idx == 5 || idx == 6) {
    // 06 & 07 NM Flex Monel: 4 waisted flex necks with rotating helical stress-relief grooves
    for (int k = 1; k <= 4; k++) {
      float c = float(k) * 0.195;
      float d = abs(v - c);
      if (d < 0.065) {
        float dip = 0.5 * (1.0 + cos(d / 0.065 * PI));
        r -= 0.105 * dip;
        relief += 0.22 * dip * cos(3.0 * phi + 14.0 * v);
        band = max(band, 0.30 * dip);
      }
    }
  } else if (idx == 7) {
    // 08 Subs - X-Over (4 1/2 XH to 4 1/2 IF): machined crossover groove & rotating tong marks
    if (abs(v - 0.50) < 0.06) {
      float g = 1.0 - abs(v - 0.50) / 0.06;
      r -= 0.045 * g;
      band = max(band, 0.65 * g);
    }
    relief += 0.15 * cos(6.0 * phi) * exp(-pow((v - 0.50) * 5.0, 2.0));
  } else if (idx == 8) {
    // 09 Exciter / Agitator: central valve neck + rotating fluid-pulse flutes
    if (abs(v - 0.48) < 0.075) {
      float neck = 0.5 * (1.0 + cos((v - 0.48) / 0.075 * PI));
      r -= 0.125 * neck;
      relief += 0.28 * neck * cos(4.0 * phi);
      band = max(band, 0.50 * neck);
    } else {
      relief += 0.14 * cos(4.0 * phi + 6.0 * v);
    }
  } else if (idx == 9) {
    // 10 Shock Sub: recessed upper splined Kelly mandrel (6 rotating axial splines)
    if (v > 0.16 && v < 0.40) {
      float sv = (v - 0.16) / 0.24;
      float env = smoothstep(0.0, 0.15, sv) * smoothstep(1.0, 0.85, sv);
      float sp = cos(6.0 * phi);
      r -= (0.095 - 0.022 * sp) * env;
      relief += 0.38 * sp * env;
      band = max(band, 0.45 * env);
    }
  } else if (idx == 10) {
    // 11 Jars: recessed jar drive mandrel (6 rotating splines) + mechanical latch ring
    if (v > 0.68 && v < 0.88) {
      float jv = (v - 0.68) / 0.20;
      float env = smoothstep(0.0, 0.15, jv) * smoothstep(1.0, 0.85, jv);
      float sp = cos(6.0 * phi);
      r -= (0.105 - 0.024 * sp) * env;
      relief += 0.40 * sp * env;
      band = max(band, 0.48 * env);
    } else if (abs(v - 0.44) < 0.03) {
      band = max(band, 0.60);
    }
  }

  return vec3(r, relief, band);
}

void main() {
  float py = v_uv.y * u_totalH;
  float cx = (v_uv.x - 0.5) * 2.0;

  int toolIdx = 10;
  float y0 = 0.0;
  float y1 = u_yEnds[0];
  float baseR = u_odNorm[10];
  bool found = false;
  for (int i = 0; i < 11; i++) {
    float endY = u_yEnds[i];
    if (!found && py <= endY) {
      toolIdx = i;
      y1 = endY;
      baseR = u_odNorm[i];
      found = true;
    }
    if (!found) {
      y0 = endY;
    }
  }

  // Fly-in progress for this tool
  float appear = clamp(u_shown - float(toolIdx), 0.0, 1.0);
  if (appear <= 0.001) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    return;
  }
  float ease = smoothstep(0.0, 1.0, appear);
  float v = clamp((py - y0 - (1.0 - ease) * 18.0) / max(1.0, y1 - y0), 0.0, 1.0);

  // Counter-clockwise looking up the BHA axis (reversed):
  // Front-face features move from left (-X) to right (+X) as u_time increases.
  float omega = 1.65;
  float rotAngle = -(u_time * omega + (1.0 - ease) * 1.8);

  // First-pass angle estimate on the cylinder
  float uEst = clamp(cx / max(0.35, baseR), -0.999, 0.999);
  float thetaEst = asin(uEst);
  float phi = thetaEst + rotAngle;

  vec3 geom = toolGeometry(toolIdx, v, phi, baseR);
  float r = geom.x;
  float relief = geom.y;
  float band = geom.z;

  float dist = abs(cx);
  float aa = 0.032;
  float alpha = (1.0 - smoothstep(r - aa, r + aa, dist)) * ease;
  if (alpha <= 0.002) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    return;
  }

  // Exact cylinder normal on radius r
  float nx = clamp(cx / max(0.05, r), -0.995, 0.995);
  float nz = sqrt(max(0.01, 1.0 - nx * nx));
  // Perturb normal by azimuthal & axial tool relief so rotating blades/splines catch the light
  vec3 norm = normalize(vec3(nx - relief * 0.38, 0.0, nz));

  // Key light from upper-left (-0.52, -0.15, 0.84) matching the 7-band StrapSheets steel bevel
  vec3 lightDir = normalize(vec3(-0.52, -0.12, 0.84));
  float diff = clamp(dot(norm, lightDir), 0.0, 1.0);
  vec3 halfVec = normalize(lightDir + vec3(0.0, 0.0, 1.0));
  float spec = pow(clamp(dot(norm, halfVec), 0.0, 1.0), 28.0);
  float rim = pow(1.0 - nz, 2.2);

  // Rotating anisotropic brushed-steel micro-grooves around circumference
  float grain = 0.035 * sin(18.0 * (asin(nx) + rotAngle) + 6.0 * v);

  vec3 darkRim = u_lightMode > 0.5 ? vec3(0.56, 0.64, 0.73) : vec3(0.16, 0.22, 0.28);
  vec3 midSteel = u_lightMode > 0.5 ? vec3(0.82, 0.87, 0.92) : vec3(0.29, 0.37, 0.45);
  vec3 glossTop = u_lightMode > 0.5 ? vec3(0.97, 0.99, 1.00) : vec3(0.56, 0.65, 0.74);
  vec3 bandCol = u_lightMode > 0.5 ? vec3(0.29, 0.35, 0.40) : vec3(0.60, 0.66, 0.72);

  vec3 col = mix(darkRim, midSteel, smoothstep(0.0, 0.55, diff));
  col = mix(col, glossTop, smoothstep(0.50, 0.95, diff));
  col += spec * (u_lightMode > 0.5 ? 0.28 : 0.24);
  col -= rim * 0.14;
  col += grain;
  col = mix(col, bandCol, band * 0.55);

  // Darken the 1.5 px make-up shoulder seam line at the bottom of each tool
  if (v > 0.975) {
    col *= 0.42;
  }

  gl_FragColor = vec4(col * alpha, alpha);
}
`;

export function BhaWebglColumn({
  pieces,
  shown,
  theme,
  onReady,
}: {
  pieces: BhaGlPiece[];
  shown: number;
  theme: "dark" | "light";
  onReady?: (ready: boolean) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shownRef = useRef(shown);
  const themeRef = useRef(theme);
  shownRef.current = shown;
  themeRef.current = theme;
  const [glSupported, setGlSupported] = useState(false);

  const totalH = pieces.reduce((acc, p) => acc + p.rowHeightPx, 0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = (canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: true }) ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) {
      onReady?.(false);
      return;
    }

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type);
      if (!sh) return null;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };

    const vs = compile(gl.VERTEX_SHADER, VERT_SRC);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG_SRC);
    if (!vs || !fs) {
      onReady?.(false);
      return;
    }

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      onReady?.(false);
      return;
    }

    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const posLoc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uShown = gl.getUniformLocation(prog, "u_shown");
    const uTotalH = gl.getUniformLocation(prog, "u_totalH");
    const uLightMode = gl.getUniformLocation(prog, "u_lightMode");
    const uYEnds = gl.getUniformLocation(prog, "u_yEnds[0]");
    const uOdNorm = gl.getUniformLocation(prog, "u_odNorm[0]");

    const yEnds = new Float32Array(11);
    const odNorm = new Float32Array(11);
    let cumY = 0;
    for (let i = 0; i < 11; i++) {
      const p = pieces[i];
      cumY += p ? p.rowHeightPx : 50;
      yEnds[i] = cumY;
      odNorm[i] = i === 0 ? 0.88 : 0.535 + ((p?.odMm ?? 170) - 169) * 0.015;
    }

    setGlSupported(true);
    onReady?.(true);

    let raf = 0;
    let smoothShown = shownRef.current;
    const t0 = performance.now();

    const render = (now: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(totalH * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      const targetShown = shownRef.current;
      if (targetShown < smoothShown) {
        smoothShown = targetShown;
      } else {
        smoothShown += (targetShown - smoothShown) * 0.18;
      }

      gl.uniform1f(uTime, (now - t0) * 0.001);
      gl.uniform1f(uShown, smoothShown);
      gl.uniform1f(uTotalH, totalH);
      gl.uniform1f(uLightMode, themeRef.current === "light" ? 1.0 : 0.0);
      gl.uniform1fv(uYEnds, yEnds);
      gl.uniform1fv(uOdNorm, odNorm);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [pieces, totalH]);

  return (
    <canvas
      ref={canvasRef}
      className="bha-webgl-canvas"
      data-ready={glSupported || undefined}
      style={{ height: `${totalH}px` }}
      aria-hidden="true"
    />
  );
}

