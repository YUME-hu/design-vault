/**
 * The preview canvas: a self-contained HTML document rendered in an
 * `<iframe srcdoc>`.
 *
 * Why a document and not React nodes: keyframes, `:hover`, `color-mix()` and
 * pointer parallax are all things inline styles cannot express. The parent only
 * writes CSS custom properties into it and asks for one recipe at a time, so the
 * canvas never reloads and never flickers.
 *
 * @module design-vault-plugin/client/preview-doc
 */

import { GUIDANCE } from "../shared/guidance.ts";
import type { PreviewPalette } from "./preview.ts";
import {
  BORDER_CSS,
  DENSITY_CSS,
  MOTION_CSS,
  RADIUS_PX,
  SHADOW_CSS,
  TYPOGRAPHY_CSS,
  withAlpha,
  type LayoutToken,
  type ShapeControls,
} from "./style-tokens.ts";

/**
 * The twenty recipes, in display order.
 *
 * The canonical list lives in `guidance.ts` so the canvas, the export and the
 * prompt panel cannot drift apart; the canvas keys its CSS classes by position.
 */
export const MOTION_RECIPES = GUIDANCE.motion.map((recipe) => ({
  key: recipe.id,
  label: recipe.name,
}));

/** Every value the canvas needs, as CSS custom properties. */
export function previewVars(
  palette: PreviewPalette,
  controls: ShapeControls,
): Record<string, string> {
  const density = DENSITY_CSS[controls.density];
  const type = TYPOGRAPHY_CSS[controls.typography];
  const motion = MOTION_CSS[controls.motion];
  const border = BORDER_CSS[controls.border];
  return {
    "--dv-bg": palette.background,
    "--dv-surface": palette.card,
    "--dv-body": palette.content,
    "--dv-ink": palette.title,
    "--dv-primary": palette.accent,
    "--dv-radius": `${RADIUS_PX[controls.radius]}px`,
    "--dv-pad": `${density.padding}px`,
    "--dv-gap": `${density.gap}px`,
    "--dv-inset": `${density.inset}px`,
    "--dv-shadow": SHADOW_CSS[controls.shadow],
    "--dv-shadow-lift": "0 20px 44px rgba(0,0,0,.28), 0 8px 16px rgba(0,0,0,.14)",
    "--dv-border-width": `${border.width}px`,
    "--dv-border-color":
      border.width === 0 ? "transparent" : withAlpha(palette.content, border.alpha),
    "--dv-font": type.body,
    "--dv-font-head": type.heading,
    "--dv-weight": String(type.weight),
    "--dv-weight-head": String(type.headingWeight),
    "--dv-track": type.tracking,
    "--dv-leading": String(type.leading),
    "--dv-dur": motion.duration,
    "--dv-ease": motion.easing,
    "--dv-lift": motion.lift,
  };
}

/** What the parent posts into the frame. */
export type PreviewMessage = {
  dv: true;
  vars: Record<string, string>;
  layout: LayoutToken;
  vibe: string;
  /** 1-based recipe index; 0 means "nothing queued". */
  recipe: number;
  /** Bumped on every click so the same recipe can replay. */
  nonce: number;
};

/**
 * Build the message for the current state.
 *
 * @param palette - colours resolved for the selected style.
 * @param controls - the seven shape/type tokens.
 * @param vibeName - style name, shown in the canvas header.
 * @param recipe - 1-based recipe index, 0 for none.
 * @param nonce - monotonically increasing click counter.
 */
export function previewMessage(
  palette: PreviewPalette,
  controls: ShapeControls,
  vibeName: string,
  recipe: number,
  nonce: number,
): PreviewMessage {
  return {
    dv: true,
    vars: previewVars(palette, controls),
    layout: controls.layout,
    vibe: vibeName,
    recipe,
    nonce,
  };
}

const RECIPE_SELECTORS = MOTION_RECIPES.map((_, index) => `.fx-${index + 1}`).join(",");
const RECIPE_NAMES = JSON.stringify(MOTION_RECIPES.map((recipe) => recipe.label));

/**
 * Per-recipe timing, generated from `guidance.motion` (the motion-web duration
 * scale and easing dictionary) so the canvas obeys the same tokens it publishes.
 */
const RECIPE_RULES = GUIDANCE.motion
  .map((recipe, index) => {
    const n = index + 1;
    const iterations = recipe.iterations ?? 1;
    return (
      `.fx-${n}{animation-name:k${n};animation-duration:${recipe.duration};` +
      `animation-timing-function:${recipe.easing};animation-iteration-count:${iterations}}`
    );
  })
  .join("\n");

/** The document itself. Built once; every later change arrives by message. */
export function buildPreviewDoc(
  palette: PreviewPalette,
  controls: ShapeControls,
  vibeName: string,
): string {
  const vars = Object.entries(previewVars(palette, controls))
    .map(([key, value]) => `${key}:${value};`)
    .join("");

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<style>
:root{${vars}}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{
  background:var(--dv-bg);color:var(--dv-ink);font-family:var(--dv-font);font-weight:var(--dv-weight);
  letter-spacing:var(--dv-track);line-height:var(--dv-leading);padding:var(--dv-pad);
  -webkit-font-smoothing:antialiased;overflow:hidden;
  transition:background var(--dv-dur) var(--dv-ease),color var(--dv-dur) var(--dv-ease);
}
.stage{display:grid;gap:var(--dv-gap);height:100%;grid-template-areas:"top top" "hero deck" "split deck";grid-template-columns:1.25fr 1fr;grid-template-rows:auto auto 1fr}
body[data-layout="Bento"] .stage{grid-template-areas:"top top" "hero hero" "split deck"}
body[data-layout="ThreeColumn"] .stage{grid-template-areas:"top top top" "hero split deck";grid-template-columns:1fr 1.15fr 1fr}
body[data-layout="Stack"] .stage{grid-template-areas:"top" "hero" "split" "deck";grid-template-columns:1fr}

.top{grid-area:top;display:flex;align-items:center;justify-content:space-between;gap:12px}
.brand{display:flex;align-items:center;gap:9px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--dv-body)}
.dot{width:9px;height:9px;border-radius:50%;background:var(--dv-primary);box-shadow:0 0 0 4px color-mix(in srgb,var(--dv-primary) 18%,transparent)}
.pill{font-size:10px;letter-spacing:.12em;text-transform:uppercase;padding:4px 10px;border-radius:999px;border:var(--dv-border-width) solid var(--dv-border-color);color:var(--dv-body)}

.hero{grid-area:hero;display:grid;gap:calc(var(--dv-gap) * .5);align-content:start;animation:k1 620ms var(--dv-ease) both}
.hl{margin:0;font-family:var(--dv-font-head);font-weight:var(--dv-weight-head);font-size:clamp(22px,3.6vw,34px);line-height:1.06;letter-spacing:-.025em}
.hl em{font-style:normal;color:var(--dv-primary)}
.bars{display:grid;gap:7px;margin-top:2px}
.bar{height:7px;border-radius:999px;background:color-mix(in srgb,var(--dv-ink) 15%,transparent)}
.bar.w1{width:94%}.bar.w2{width:76%}.bar.w3{width:58%}

.split{grid-area:split;display:grid;grid-template-columns:1.1fr 1fr;gap:var(--dv-gap);min-height:0}
.media{position:relative;overflow:hidden;border-radius:var(--dv-radius);border:var(--dv-border-width) solid var(--dv-border-color);
  background:linear-gradient(140deg,color-mix(in srgb,var(--dv-primary) 26%,var(--dv-surface)),var(--dv-surface));box-shadow:var(--dv-shadow);
  transition:box-shadow var(--dv-dur) var(--dv-ease),transform var(--dv-dur) var(--dv-ease)}
.media:hover{box-shadow:var(--dv-shadow-lift);transform:var(--dv-lift)}
.spark{position:absolute;right:-18%;bottom:-42%;width:78%;aspect-ratio:1;border-radius:50%;
  background:radial-gradient(circle at 32% 30%,color-mix(in srgb,var(--dv-primary) 70%,transparent),transparent 70%);
  filter:blur(4px);transform:translate3d(calc(var(--px) * 12px),calc(var(--py) * 12px),0);transition:transform 120ms linear}
.media .tag{position:absolute;left:12px;bottom:12px;font-size:10px;letter-spacing:.14em;text-transform:uppercase;
  color:color-mix(in srgb,var(--dv-ink) 70%,transparent);background:color-mix(in srgb,var(--dv-surface) 80%,transparent);
  padding:4px 8px;border-radius:999px;border:var(--dv-border-width) solid var(--dv-border-color)}

.copy{display:grid;gap:10px;align-content:start;min-width:0}
.copy strong{font-family:var(--dv-font-head);font-weight:var(--dv-weight-head);font-size:13px;letter-spacing:-.01em}
.copy p{margin:0;font-size:12px;color:var(--dv-body)}
.btn{align-self:start;appearance:none;border:0;cursor:pointer;font:inherit;font-size:12px;font-weight:700;color:#fff;
  background:var(--dv-primary);padding:9px 16px;border-radius:calc(var(--dv-radius) * .7);
  box-shadow:0 6px 16px color-mix(in srgb,var(--dv-primary) 42%,transparent);
  transition:transform var(--dv-dur) var(--dv-ease),filter var(--dv-dur) var(--dv-ease),box-shadow var(--dv-dur) var(--dv-ease)}
.btn:hover{transform:var(--dv-lift);filter:brightness(1.06) saturate(1.05);box-shadow:0 14px 30px color-mix(in srgb,var(--dv-primary) 50%,transparent)}
.btn:active{transform:translateY(0) scale(.985)}

.deck{grid-area:deck;display:grid;align-content:end;min-height:0}
.card{position:relative;overflow:hidden;border-radius:var(--dv-radius);background:var(--dv-surface);border:var(--dv-border-width) solid var(--dv-border-color);
  box-shadow:var(--dv-shadow);padding:calc(var(--dv-inset) * .9);
  transition:transform var(--dv-dur) var(--dv-ease),box-shadow var(--dv-dur) var(--dv-ease);
  animation:k1 720ms var(--dv-ease) both}
.card:hover{transform:var(--dv-lift);box-shadow:var(--dv-shadow-lift)}
.thumb{height:74px;border-radius:calc(var(--dv-radius) * .75);margin-bottom:10px;
  background:linear-gradient(125deg,color-mix(in srgb,var(--dv-primary) 55%,var(--dv-surface)),color-mix(in srgb,var(--dv-primary) 12%,var(--dv-surface)))}
.card b{display:block;font-family:var(--dv-font-head);font-weight:var(--dv-weight-head);font-size:13px;margin-bottom:4px}
.card p{margin:0;font-size:11px;color:var(--dv-body)}

.hud{position:fixed;left:12px;bottom:10px;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--dv-body);opacity:.75}

/* ---- the twenty recipes ---- */
@keyframes k1{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes k2{from{opacity:0}to{opacity:1}}
@keyframes k3{0%{transform:scale(.86);opacity:0}60%{transform:scale(1.04);opacity:1}100%{transform:scale(1)}}
@keyframes k4{from{opacity:0;transform:translateX(-26px)}to{opacity:1;transform:none}}
@keyframes k5{from{opacity:0;transform:translateX(26px)}to{opacity:1;transform:none}}
@keyframes k6{from{filter:blur(9px);opacity:0}to{filter:blur(0);opacity:1}}
@keyframes k7{from{transform:rotateX(72deg);opacity:0}to{transform:rotateX(0);opacity:1}}
@keyframes k8{from{transform:rotate(-9deg) scale(.9);opacity:0}to{transform:none;opacity:1}}
@keyframes k9{from{transform:translateY(-46px);opacity:0}to{transform:none;opacity:1}}
@keyframes k10{0%{transform:scale(.8)}45%{transform:scale(1.13)}70%{transform:scale(.96)}100%{transform:scale(1)}}
@keyframes k11{10%,90%{transform:translateX(-3px)}30%,70%{transform:translateX(6px)}50%{transform:translateX(-7px)}}
@keyframes k12{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
@keyframes k13{0%,100%{box-shadow:0 0 0 0 color-mix(in srgb,var(--dv-primary) 0%,transparent)}50%{box-shadow:0 0 0 14px color-mix(in srgb,var(--dv-primary) 26%,transparent)}}
@keyframes k14{from{background-position:-160% 0}to{background-position:160% 0}}
@keyframes k15{0%,100%{transform:translateY(0)}50%{transform:translateY(-11px)}}
@keyframes k16{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes k17{0%,100%{transform:translateY(0)}25%{transform:translateY(-7px)}50%{transform:translateY(0)}75%{transform:translateY(7px)}}
@keyframes k18{0%,49%{border-right-color:var(--dv-primary)}50%,100%{border-right-color:transparent}}
@keyframes k19{from{transform:translateX(-130%) skewX(-12deg)}to{transform:translateX(130%) skewX(-12deg)}}
@keyframes k20{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(12px,-9px,0)}}

${RECIPE_SELECTORS}{animation-fill-mode:both}
${RECIPE_RULES}
.fx-14{background-image:linear-gradient(100deg,transparent 32%,color-mix(in srgb,var(--dv-ink) 14%,transparent) 50%,transparent 68%);background-size:200% 100%}
.fx-16{transform-origin:50% 50%}
.fx-18{border-right:3px solid var(--dv-primary)}
.fx-19{position:relative;overflow:hidden}
.fx-19::after{content:"";position:absolute;inset:0;background:linear-gradient(100deg,transparent 35%,color-mix(in srgb,var(--dv-surface) 75%,transparent) 50%,transparent 65%);animation:k19 780ms var(--dv-ease) both}
</style>
</head>
<body data-layout="${controls.layout}">
<div class="stage">
  <header class="top">
    <div class="brand"><span class="dot"></span><span id="vibe">${escapeHtml(vibeName)}</span></div>
    <span class="pill">wireframe</span>
  </header>

  <section class="hero">
    <h1 class="hl">Design system<br /><em>in one canvas</em></h1>
    <div class="bars"><i class="bar w1"></i><i class="bar w2"></i><i class="bar w3"></i></div>
  </section>

  <section class="split">
    <div class="media"><span class="spark"></span><span class="tag">surface</span></div>
    <div class="copy">
      <strong>视觉层级</strong>
      <p>这里每一个颜色、圆角和缓动，都是左侧面板写进 CSS 变量的真实值。</p>
      <button class="btn" id="cta" type="button">主要操作</button>
    </div>
  </section>

  <section class="deck">
    <article class="card" id="card">
      <div class="thumb"></div>
      <b>悬浮卡片</b>
      <p>悬停看抬升与阴影，点左侧配方即刻播放。</p>
    </article>
  </section>
</div>
<div class="hud" id="hud">点击左侧配方即刻预览</div>
<script>
(function () {
  var names = ${RECIPE_NAMES};
  var lastNonce = 0;

  function play(index) {
    var card = document.getElementById("card");
    var hud = document.getElementById("hud");
    if (!card) return;
    card.className = "card";
    void card.offsetWidth;
    card.className = "card fx-" + index;
    if (hud) hud.textContent = "动效 " + index + "/" + names.length + " · " + (names[index - 1] || "");
  }

  function apply(state) {
    var root = document.documentElement.style;
    Object.keys(state.vars).forEach(function (key) { root.setProperty(key, state.vars[key]); });
    document.body.dataset.layout = state.layout;
    var vibe = document.getElementById("vibe");
    if (vibe) vibe.textContent = state.vibe;
  }

  window.addEventListener("message", function (event) {
    var data = event.data;
    if (!data || !data.dv) return;
    apply(data);
    if (data.recipe && data.nonce !== lastNonce) {
      lastNonce = data.nonce;
      play(data.recipe);
    }
  });

  document.addEventListener("mousemove", function (event) {
    var root = document.documentElement.style;
    root.setProperty("--px", ((event.clientX / window.innerWidth) * 2 - 1).toFixed(3));
    root.setProperty("--py", ((event.clientY / window.innerHeight) * 2 - 1).toFixed(3));
  });
})();
</script>
</body>
</html>`;
}

/** Minimal HTML escaping for the one interpolated string. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
