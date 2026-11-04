/**
 * 颜色引擎单元测试：npm run test:color
 * 不引测试框架，用 node:assert + tsx，跑完打印通过条数。
 */
import assert from "node:assert/strict";
import {
  SCALE_STEPS,
  contrastChecks,
  contrastRatio,
  formatRatio,
  generateScale,
  hexToOklch,
  isHexColor,
  lightnessDeltas,
  normalizeHex,
  oklchToHex,
  relativeLuminance,
} from "@design-vault/adapters/color";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    passed += 1;
    console.log(`✓ ${name}`);
  } catch (error) {
    failed += 1;
    console.log(`✗ ${name}`);
    console.log(`    ${(error as Error).message.split("\n").slice(0, 3).join("\n    ")}`);
  }
}

function variance(values: number[]): number {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
}

// ---------- HEX ----------

test("normalizeHex 展开三位写法并转大写", () => {
  assert.equal(normalizeHex("#abc"), "#AABBCC");
  assert.equal(normalizeHex("#d63a2c"), "#D63A2C");
  assert.equal(normalizeHex("  #D63A2C "), "#D63A2C");
});

test("normalizeHex 拒绝非法输入", () => {
  for (const bad of ["", "red", "#12", "#GGGGGG", "D63A2C", "#d63a2cff"]) {
    assert.equal(normalizeHex(bad), null, `${bad} 不应通过`);
  }
});

test("isHexColor 只认 #RGB / #RRGGBB", () => {
  assert.equal(isHexColor("#fff"), true);
  assert.equal(isHexColor("#FFFFFF"), true);
  assert.equal(isHexColor("fff"), false);
});

// ---------- 亮度与对比度 ----------

test("WCAG 相对亮度：黑 0、白 1", () => {
  assert.ok(Math.abs(relativeLuminance("#000000") - 0) < 1e-9);
  assert.ok(Math.abs(relativeLuminance("#FFFFFF") - 1) < 1e-9);
});

test("WCAG 对比度：黑白 21:1，同色 1:1", () => {
  assert.ok(Math.abs(contrastRatio("#000000", "#FFFFFF") - 21) < 1e-6);
  assert.ok(Math.abs(contrastRatio("#191919", "#191919") - 1) < 1e-9);
  assert.equal(formatRatio(2.1), "2.10:1");
});

test("对比度对调前景背景不变", () => {
  assert.ok(
    Math.abs(contrastRatio("#D63A2C", "#ECE5D6") - contrastRatio("#ECE5D6", "#D63A2C")) < 1e-12,
  );
});

// ---------- 色阶 ----------

test("色阶长度与档位固定 50–900", () => {
  const scale = generateScale("#D63A2C");
  assert.equal(scale.entries.length, SCALE_STEPS.length);
  assert.deepEqual(
    scale.entries.map((entry) => entry.step),
    [...SCALE_STEPS],
  );
});

test("锚点阶精确等于输入值（RGB 等价）", () => {
  for (const input of ["#D63A2C", "#6750A4", "#0F62FE", "#ECE5D6", "#191919", "#FFFFFF"]) {
    const scale = generateScale(input);
    const anchor = scale.entries.find((entry) => entry.anchor);
    assert.ok(anchor, `${input} 缺少锚点`);
    assert.equal(anchor!.hex, normalizeHex(input), `${input} 锚点值不匹配`);
    assert.equal(scale.anchorStep, anchor!.step);
    assert.equal(scale.base, normalizeHex(input));
    assert.equal(scale.entries.filter((entry) => entry.anchor).length, 1);
  }
});

test("色阶亮度单调递减（50 最亮 → 900 最暗）", () => {
  const entries = generateScale("#D63A2C").entries;
  for (let index = 1; index < entries.length; index += 1) {
    assert.ok(
      entries[index].l < entries[index - 1].l,
      `${entries[index].step} 的 L 应低于 ${entries[index - 1].step}`,
    );
  }
});

test("相邻阶 ΔL 均匀（方差 < 1e-4）", () => {
  const deltas = lightnessDeltas(generateScale("#D63A2C").entries);
  const spread = variance(deltas);
  assert.ok(spread < 1e-4, `ΔL 方差 ${spread} 过大：${deltas.map((d) => d.toFixed(4)).join(", ")}`);
  for (const delta of deltas) {
    assert.ok(Math.abs(delta - 0.08) < 0.012, `ΔL 偏离 0.08 过多：${delta}`);
  }
});

test("所有阶都落在 sRGB 内（输出为合法 HEX）", () => {
  for (const input of ["#D63A2C", "#00FF00", "#0000FF", "#FF00FF", "#6750A4"]) {
    const entries = generateScale(input).entries;
    for (const entry of entries) {
      assert.ok(isHexColor(entry.hex), `${input} 的 ${entry.step} 阶不是合法 HEX：${entry.hex}`);
      assert.equal(entry.hex, normalizeHex(entry.hex));
    }
  }
});

test("灰色输入生成低彩度色阶", () => {
  const entries = generateScale("#808080").entries;
  for (const entry of entries) {
    assert.ok(entry.c < 0.01, `${entry.step} 阶彩度过高：${entry.c}`);
  }
});

test("oklchToHex 对超色域彩度收敛而不是裁通道", () => {
  const hex = oklchToHex({ l: 0.6, c: 0.4, h: 20 });
  assert.ok(isHexColor(hex));
  const back = hexToOklch(hex);
  assert.ok(Math.abs(back.l - 0.6) < 0.01, `L 应保持 0.6，实际 ${back.l}`);
});

test("超浅 / 超深输入也能生成完整色阶", () => {
  for (const input of ["#FFFFFF", "#000000", "#FEFEFE"]) {
    const entries = generateScale(input).entries;
    assert.equal(entries.length, 10);
    assert.ok(entries.every((entry) => entry.l >= 0 && entry.l <= 1));
  }
});

// ---------- 对比度检查 ----------

test("低对比 text/bg 会被判不通过并给出实际比值", () => {
  const checks = contrastChecks({
    primary: "#0570DE",
    bg: "#FFFFFF",
    surface: "#FFFFFF",
    text: "#CCCCCC",
    muted: "#59636E",
  });
  const textBg = checks.find((check) => check.id === "text-bg");
  assert.ok(textBg);
  assert.equal(textBg!.pass, false);
  assert.equal(textBg!.threshold, 4.5);
  assert.ok(textBg!.ratio < 4.5);
  assert.equal(formatRatio(textBg!.ratio), `${textBg!.ratio.toFixed(2)}:1`);
});

test("高对比配色全部通过", () => {
  const checks = contrastChecks({
    primary: "#0F62FE",
    bg: "#FFFFFF",
    surface: "#FFFFFF",
    text: "#161616",
    muted: "#525252",
  });
  assert.ok(checks.length === 4);
  assert.ok(checks.every((check) => check.pass));
});

test("缺色或非法色值时跳过对应检查", () => {
  const checks = contrastChecks({ primary: "#0F62FE", bg: "#FFFFFF" });
  assert.ok(checks.every((check) => check.id === "primary-bg"));
});

console.log("");
if (failed > 0) {
  console.log(`✗ ${failed} 个用例失败，${passed} 个通过`);
  process.exit(1);
}
console.log(`✓ 全部 ${passed} 个用例通过`);
