/**
 * The design guidance the canvas and any generated code must follow.
 *
 * Imported from the motion-web skill (github.com/feitangyuan/motion-web):
 * `SKILL.md` (priority order, build order), `references/design-slop.md` (the
 * AI-tell gates), `references/motion-tokens.md` (duration scale, easing
 * dictionary, spring configs, stagger, transform budget), `references/handfeel.md`
 * (spring physics, velocity coupling, following filters), `references/page-design.md`
 * (measured type scale and palette room), `references/components.md` (dialects and
 * the component state matrix).
 *
 * Single source of truth: the preview document reads `motion` for its recipe
 * labels **and its CSS duration/easing**, the exported DesignConfig embeds all
 * three lists, and the prompt panel renders them for a human or a model.
 *
 * @module design-vault-plugin/shared/guidance
 */

/** One motion recipe: a name, the effect, and the tokens that drive it. */
export type MotionRecipe = {
  /** Stable key; the canvas CSS class is positional (`fx-<n>`). */
  id: string;
  /** Display name. */
  name: string;
  /** What it does, in the terms a generator can implement. */
  spec: string;
  /** CSS duration, straight from the motion-tokens duration scale. */
  duration: string;
  /** CSS easing, straight from the motion-tokens easing dictionary. */
  easing: string;
  /** Repeat count for ambient/attention loops; omitted means play once. */
  iterations?: number;
};

/** One rule, numbered on render. `id` is stable so edits are diffable. */
export type GuidanceRule = { id: string; text: string };

export type GuidanceSource = "placeholder" | "motion-web";

export type Guidance = {
  /** Bump whenever the lists change; it travels inside the export. */
  version: string;
  source: GuidanceSource;
  /** Twenty recipes; the canvas implements each as a CSS keyframe. */
  motion: MotionRecipe[];
  /** Rules that keep generated UI from reading as AI slop. */
  antiSlop: GuidanceRule[];
  /** Measured hard specs: durations, physics, type scale, component states. */
  hardSpecs: GuidanceRule[];
};

export const GUIDANCE: Guidance = {
  version: "1.0.0",
  source: "motion-web",
  motion: [
    {
      id: "fade-up",
      name: "淡入上浮",
      spec: "区块入场：translateY 16px→0 + opacity 0→1",
      duration: "480ms",
      easing: "cubic-bezier(0.16,1,0.3,1)",
    },
    {
      id: "fade-in",
      name: "淡入",
      spec: "不改变布局的显隐：仅 opacity",
      duration: "200ms",
      easing: "cubic-bezier(0.16,1,0.3,1)",
    },
    {
      id: "scale-pop",
      name: "缩放弹出",
      spec: "焦点卡片：scale .86→1.04→1，轻微过冲",
      duration: "340ms",
      easing: "cubic-bezier(0.34,1.56,0.64,1)",
    },
    {
      id: "slide-left",
      name: "左侧滑入",
      spec: "translateX -26px→0 + opacity",
      duration: "460ms",
      easing: "cubic-bezier(0.16,1,0.3,1)",
    },
    {
      id: "slide-right",
      name: "右侧滑入",
      spec: "translateX 26px→0 + opacity",
      duration: "460ms",
      easing: "cubic-bezier(0.16,1,0.3,1)",
    },
    {
      id: "blur-in",
      name: "模糊聚焦",
      spec: "blur 9px→0 + opacity，用于图片/图层进入",
      duration: "700ms",
      easing: "cubic-bezier(0.16,1,0.3,1)",
    },
    {
      id: "flip-x",
      name: "翻转入场",
      spec: "rotateX 72°→0，需要 perspective",
      duration: "500ms",
      easing: "cubic-bezier(0.16,1,0.3,1)",
    },
    {
      id: "rotate-in",
      name: "旋转入场",
      spec: "rotate -9° + scale .9 → 1",
      duration: "450ms",
      easing: "cubic-bezier(0.16,1,0.3,1)",
    },
    {
      id: "drop-in",
      name: "下落弹入",
      spec: "translateY -46px→0，带重力感",
      duration: "650ms",
      easing: "cubic-bezier(0.16,1,0.3,1)",
    },
    {
      id: "elastic",
      name: "弹性回弹",
      spec: "scale .8→1.13→.96→1，两端都过冲，节制使用",
      duration: "800ms",
      easing: "cubic-bezier(0.68,-0.6,0.32,1.6)",
    },
    {
      id: "shake-x",
      name: "横向抖动",
      spec: "错误反馈：三段横向位移",
      duration: "200ms",
      easing: "cubic-bezier(0.76,0,0.24,1)",
      iterations: 3,
    },
    {
      id: "pulse",
      name: "呼吸脉冲",
      spec: "吸引注意：scale 1→1.06→1",
      duration: "300ms",
      easing: "cubic-bezier(0.76,0,0.24,1)",
      iterations: 2,
    },
    {
      id: "glow",
      name: "辉光扩散",
      spec: "成功态：box-shadow 环由内向外扩散",
      duration: "450ms",
      easing: "cubic-bezier(0,0.55,0.45,1)",
    },
    {
      id: "shimmer",
      name: "流光扫过",
      spec: "加载占位：背景光带横扫",
      duration: "900ms",
      easing: "linear",
      iterations: 2,
    },
    {
      id: "float",
      name: "悬浮浮动",
      spec: "空状态装饰：translateY ±11px 循环",
      duration: "2.4s",
      easing: "cubic-bezier(0.76,0,0.24,1)",
      iterations: 2,
    },
    {
      id: "orbit",
      name: "环绕旋转",
      spec: "加载指示：0→360° 旋转",
      duration: "1.2s",
      easing: "linear",
      iterations: 2,
    },
    {
      id: "wave",
      name: "波浪起伏",
      spec: "列表错峰：上下交替位移",
      duration: "900ms",
      easing: "cubic-bezier(0.76,0,0.24,1)",
      iterations: 2,
    },
    {
      id: "caret",
      name: "光标闪烁",
      spec: "输入提示：竖线明暗切换",
      duration: "1s",
      easing: "steps(1,end)",
      iterations: 3,
    },
    {
      id: "sweep",
      name: "掠光扫过",
      spec: "卡片强调：斜向高光掠过表面",
      duration: "700ms",
      easing: "cubic-bezier(0,0.55,0.45,1)",
    },
    {
      id: "drift",
      name: "视差漂移",
      spec: "空间层次：translate3d 跟随指针",
      duration: "1.6s",
      easing: "cubic-bezier(0.76,0,0.24,1)",
      iterations: 2,
    },
  ],
  antiSlop: [
    {
      id: "a1-default-hero",
      text: "默认英雄区：全幅 + 居中 H1 + 一行副标题 + 两个按钮（一实一虚）。必须打破居中、两个按钮、badge 三者中至少一项；动效页的 hero 常常就是机制本身",
    },
    {
      id: "a2-three-cards",
      text: "居中三栏特性卡：图标在上、粗体名词、两行灰字。若真是三个同级内容，也要用不等权重、堆叠编辑式列表、索引表或一提两降来表达",
    },
    {
      id: "a3-same-section",
      text: "每一屏都是「标题 + 段落，居中」。一页至少要有三种不同的 section 形状——结构多样性才是区分两个设计的东西，配色多样性不是",
    },
    {
      id: "a4-violet-gradient",
      text: "紫蓝渐变（#6366F1→#A855F7）、紫蓝 mesh 背景、发光紫球。两色 + 一个中性色才是调色板，光谱不是；不要把彩虹当主题",
    },
    {
      id: "a5-decoration",
      text: "用装饰代替设计：噪点叠加、漂浮色块、网格底纹、全局辉光。它们不解决空洞，只是把空洞做旧；空洞是结构问题（字号太小、section 太像、没有尺度对比）",
    },
    {
      id: "a6-no-scale-contrast",
      text: "全部字号挤在 16–48px 之间。当前获奖站的显示字号中位数 108px、正文 16px，比值约 8×；低于 4× 就是没有尺度对比",
    },
    {
      id: "a7-fake-chrome",
      text: "假浏览器窗口（红绿灯圆点）、假手机边框、把 pre 包进假 IDE。要么放真实截图进 figure，要么不要框",
    },
    {
      id: "a8-invented-proof",
      text: "编造的社会证明：「+47% 转化」「50,000+ 团队信赖」、五个 logo 占位、编的证言。用户没给的数字不许上页面，改用标注清楚的占位块",
    },
    {
      id: "b1-uniform-hover",
      text: "所有卡片统一 hover 抬升 translateY(-4px) + 阴影。这是动效版的三栏特性卡——用在了所有地方就等于什么都没说；说得出它在表达什么才留",
    },
    {
      id: "b2-scroll-fadeup",
      text: "全页统一的滚动淡入上浮（opacity 0→1、translateY 20px）。多数内容应该本来就在那儿；入场只留给真正受益的两三处，且到达方式要各不相同",
    },
    {
      id: "b3-one-easing",
      text: "全站一个 0.3s ease。要有至少三档时长 token，该有物理感的地方用 spring",
    },
    {
      id: "b4-hero-budget",
      text: "预算全烧在首屏，之后八屏静止。滚动时间轴是排期不是烟花，要把动作分配到全页",
    },
    {
      id: "b5-unrelated-motion",
      text: "动效与内容无关：B2B 页面背后飘粒子、读书会背后转球体。机制必须来自主题自身的物理；换成别的选题也能用，那就是装饰",
    },
    {
      id: "b6-parallax-only",
      text: "把视差当成唯一纵深手段。纵深更多来自遮挡与轮廓交叠，而不是各层速率差",
    },
    {
      id: "b7-trailing-cursor",
      text: "跟着鼠标的小圆点光标（lerp 追尾、不连接任何东西）。2019 年的签名，现在是默认值；要么让光标真正做事（揭示、放大、携带状态），要么用系统光标",
    },
    {
      id: "b8-reduced-motion",
      text: "开启 prefers-reduced-motion 后页面变空白或崩坏。静帧才是页面本体，动效是增强；减弱动效版本不可用等于 A 类闸门从未真正通过",
    },
  ],
  hardSpecs: [
    // ── duration scale（motion-tokens.md）──────────────────────────────
    { id: "dur-instant", text: "instant 80–100ms：光标反馈、tooltip 显隐" },
    { id: "dur-fast", text: "fast 150–200ms：hover 态、按钮按下、开关" },
    { id: "dur-standard", text: "standard 280–350ms：卡片展开、面板滑入、抽屉" },
    { id: "dur-medium", text: "medium 400–500ms：区块揭示、图片打开、滚动触发" },
    { id: "dur-slow", text: "slow 600–800ms：页面进入、hero 文字揭示、路由切换" },
    { id: "dur-cinematic", text: "cinematic 1000–1400ms：冷开场、幕布擦除、戏剧性入场" },
    { id: "dur-ambient", text: "ambient 持续：背景循环、粒子场、呼吸光" },
    { id: "dur-halve", text: "说不出某个时长对应哪种意图，就把它减半" },

    // ── easing dictionary（motion-tokens.md）───────────────────────────
    { id: "ease-out-expo", text: "ease-out-expo cubic-bezier(0.16,1,0.3,1)：快进柔落，揭示类默认" },
    { id: "ease-in-expo", text: "ease-in-expo cubic-bezier(0.7,0,0.84,0)：慢起硬出，只用于退场" },
    {
      id: "ease-in-out-quart",
      text: "ease-in-out-quart cubic-bezier(0.76,0,0.24,1)：对称平滑，适合自动循环",
    },
    {
      id: "ease-out-back",
      text: "ease-out-back cubic-bezier(0.34,1.56,0.64,1)：轻微过冲落地，俏皮 hover",
    },
    { id: "ease-out-circ", text: "ease-out-circ cubic-bezier(0,0.55,0.45,1)：极快减速，机械清脆" },
    { id: "ease-sharp", text: "ease-sharp cubic-bezier(0.65,0,0.45,1)：硬品牌感，横向开场" },
    {
      id: "ease-standard",
      text: "ease-standard cubic-bezier(0.4,0,0.2,1)：Material 默认，安全基线",
    },
    {
      id: "ease-expressive",
      text: "ease-expressive cubic-bezier(0.68,-0.6,0.32,1.6)：两端都过冲，极少用",
    },
    { id: "ease-linear", text: "linear：滚动擦除、shader uniform 必须用它" },
    {
      id: "ease-linear-fn",
      text: "CSS 要真过冲回弹用 linear() 采样点（cubic-bezier 表达不了），如 linear(0,.32 8%,.79 20%,1.03 30%,1.01 46%,1)",
    },

    // ── spring presets（motion-tokens.md）──────────────────────────────
    {
      id: "spring-gentle",
      text: "spring-gentle stiffness 100 / damping 15 / mass 1：柔和无回弹，氛围揭示",
    },
    { id: "spring-default", text: "spring-default 200 / 22 / 1：自然手感，卡片 hover、抽屉" },
    { id: "spring-snappy", text: "spring-snappy 350 / 28 / 1：高级快弹，按钮反馈" },
    { id: "spring-bouncy", text: "spring-bouncy 200 / 10 / 1：俏皮过冲，游戏化图标" },
    { id: "spring-heavy", text: "spring-heavy 150 / 35 / 1.5：厚重迟缓，大面板" },
    { id: "spring-stiff", text: "spring-stiff 500 / 40 / 1：近乎瞬时，鼠标跟随" },

    // ── stagger（motion-tokens.md）─────────────────────────────────────
    { id: "stagger-tight", text: "stagger tight-grid 0.04s/项：数据行、开发工具面板" },
    { id: "stagger-list", text: "stagger standard-list 0.07–0.08s：卡片列表、特性网格、导航项" },
    { id: "stagger-editorial", text: "stagger editorial-line 0.08–0.1s/行：文字揭示、文章段落" },
    { id: "stagger-cascade", text: "stagger dramatic-cascade 0.12–0.18s：获奖站 hero、横向开场" },
    { id: "stagger-none", text: "stagger no-stagger 0s：单一决定性 CTA 入场、脆的品牌动作" },
    {
      id: "stagger-native",
      text: "原生错峰无需逐项 index：animation-delay: calc(sibling-index() * 60ms)，Chromium 优先，保留无延迟版本兜底",
    },

    // ── physics（handfeel.md）──────────────────────────────────────────
    {
      id: "phys-spring",
      text: "欠阻尼弹簧替代 lerp：vel += (target-x)*STIFFNESS*dt（STIFFNESS 60–90），vel *= DAMPING（0.86 弹跳 / 0.90 果冻 / 0.93 平静），x += vel*dt；dt 钳到 1/30",
    },
    {
      id: "phys-velocity",
      text: "速度耦合：lean = clamp(vel*GAIN, -MAX, MAX)（如 GAIN 0.5、MAX ±22°），元素朝行进方向倾斜，停下自然回正",
    },
    {
      id: "phys-wheel",
      text: "滚轮惯性防抖：累积阈值 ~90px 触发一步，锁 550–650ms 吃掉触控板惯性尾巴，acc 每帧 ×0.92 衰减",
    },
    {
      id: "phys-jelly",
      text: "次级果冻：主运动速度喂进松弹簧（阻尼 ~0.90），体积守恒 scale(1+j·k, 1-j·k)，各元素增益/方向/相位不同（×1.0/×1.6/×2.1）",
    },
    {
      id: "phys-follow-exp",
      text: "跟随必须帧率无关：x += (target-x) * (1 - exp(-k*dt))，k 是 1/s 的紧度不是每帧比例；实测 k：相机跟随 4.5、yaw 回中 2.2、pitch 回平 0.35",
    },
    {
      id: "phys-follow-lead",
      text: "跟随移动目标会稳定落后 speed/k：aim = targetPos + targetVel/k 抵消；「跟手但总差一点」是缺前馈项，不是弹簧不够硬",
    },
    {
      id: "phys-one-filter",
      text: "一个量只能有一个滤波器、一个目标；在滤波之后再叠加修正会导致每帧回拉（抖动的真实成因）",
    },
    {
      id: "phys-critical",
      text: "该停住的量用临界阻尼 c = 2√k，零过冲；k=120（≈0.09s 到 63%）适合姿态，k=200（≈0.14s）适合尺寸生长",
    },
    {
      id: "phys-accel",
      text: "姿态由加速度驱动而不是输入驱动：读输入会让身体「宣告」输入，读加速度才让它「回应」世界",
    },
    {
      id: "phys-verify-fps",
      text: "任何声称帧率无关的公式，都要在 30/60/120fps 下跑同一输入并对比轨迹",
    },

    // ── performance（motion-tokens.md）─────────────────────────────────
    {
      id: "perf-cheap",
      text: "便宜档：transform（translate/scale/rotate/skew）与 opacity 永远安全",
    },
    { id: "perf-medium", text: "中等档：filter blur/brightness、clip-path，面积小可以用" },
    {
      id: "perf-expensive",
      text: "昂贵档：width/height/padding/margin/top/left 触发 layout，动画里避免；要动尺寸用 scaleX/scaleY + transform-origin",
    },
    {
      id: "perf-very-expensive",
      text: "极贵：大模糊 box-shadow、缩放中的 border-radius（重绘），动画里避免",
    },
    { id: "perf-will-change", text: "will-change 只给正在动的元素，动画结束移除，绝不全局声明" },

    // ── type & layout（page-design.md 实测）────────────────────────────
    {
      id: "type-ratio",
      text: "显示字号 ÷ 正文字号 ≥ 4×；当前获奖站中位数约 8×（显示 108px / 正文 16px，n=12），区间 3.3×–14×",
    },
    {
      id: "type-display",
      text: "最大字号中位数 108px，区间 52–218px；正文 16px，区间 10–16px，多站用 12px 正文让大字号更显大",
    },
    {
      id: "type-families",
      text: "字体家族中位数 2 个（1–4）：一个 grotesk 打底 + 一个衬线做对比即可",
    },
    {
      id: "layout-no-maxwidth",
      text: "15/15 获奖站都没有给 body 设全局 max-width——度量按元素设定；全局居中列读起来像文档不像设计",
    },
    {
      id: "layout-palette",
      text: "主导色中位数 4 个（1–6），#FFFFFF 出现 15/15、#000000 14/15；饱和色通常只有 1 个色相且用得克制",
    },
    { id: "layout-no-gradient-bg", text: "渐变当背景在这批样本里 0/15；紫蓝系全样本只出现 1 次" },
    {
      id: "layout-sections",
      text: "每页不同的 section 形状：创意站中位数 2.5，产品站中位数 5；每页至少 3 种",
    },
    { id: "layout-h1", text: "每页恰好一个 h1；section 标题左对齐约为居中的 3 倍（76% vs 21%）" },
    { id: "layout-grid4", text: "间距落在 4 的网格上：4/6/8/12/16/24 为主" },

    // ── components（components.md 实测）────────────────────────────────
    {
      id: "comp-dialect",
      text: "先定组件方言：创意站 border-radius 中位数 1 种、按钮圆角多为 0px、box-shadow 中位数 0；产品站圆角中位数 8 种、阴影中位数 17.5",
    },
    {
      id: "comp-dialect-check",
      text: "方言属于「画布」而非「控件」：创意画布可以内含产品控件；把产品画布（导航+CTA+hero+三卡+五列页脚）套在创意内容上才是 AI 味来源",
    },
    {
      id: "comp-nav",
      text: "两种方言都同意：导航高度 ≈64px，按钮文字 ≈14px，页脚创意站 2 列 4 链接、产品站 5 列 35 链接",
    },
    {
      id: "comp-states",
      text: "每个交互组件都要交齐状态矩阵：rest / hover / active / focus-visible / disabled / loading / error / empty / success",
    },
    {
      id: "comp-focus",
      text: "用 :focus-visible 而不是 :focus；outline: 2px solid、offset 3px，绝不 outline:none 却不给替代",
    },
    {
      id: "comp-hover-query",
      text: "hover 样式必须包在 @media (hover: hover) and (pointer: fine) 里，触屏不能有粘住的 hover",
    },
    { id: "comp-active", text: "按下要有真实反馈：scale 0.98 或一个颜色台阶，≤80ms" },
    { id: "comp-error", text: "错误信息贴住控件、配 aria-describedby，永远不只用颜色表达" },
    {
      id: "comp-images",
      text: "图片预留盒子：创意站仅 37% 预留、产品站 76%；srcset 创意 15%、产品 48%",
    },

    // ── layout archetypes（data/visual-bank.json v1.1, l-01…l-05）────────
    {
      id: "bank-l01-bento",
      text: "Bento 网格：12 列 CSS Grid，gap 1px 本身就是边框；max-width 1100–1200px 居中；区块间距 5–6rem；768px 坍成一列并保留圆角",
    },
    {
      id: "bank-l02-editorial",
      text: "编辑单列：单列居中 680–720px；区块间距 6–10rem（留白就是设计）；移动端满宽 + 1.5rem 内边距，字号不变",
    },
    {
      id: "bank-l03-asymmetric",
      text: "非对称分栏：2:1 或 3:1 主内容 + 侧栏；max-width 1100px；区块间距 4rem；768px 反转为单列、侧栏内容下移",
    },
    {
      id: "bank-l04-fullbleed",
      text: "满幅沉浸：100vw 分区，内容在内部定位，无全局容器（或内部 1400px 封顶）；区块间距 0——边界是视觉的，不是空间的",
    },
    {
      id: "bank-l05-masonry",
      text: "瀑布流图墙：CSS columns 或 JS masonry，行高可变；max-width 1400px；1024px 两列、640px 单列",
    },
  ],
};
