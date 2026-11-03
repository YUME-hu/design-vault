# M1b 验收自检

> 对应本轮 11 条验收标准 + 4 条约束。
> verify 脚本跑在**生产构建**（`npm run build` + `next start -p 3001`）上。
>
> 环境：Windows · Node v22.14.0 · Next 15.5.28 · culori 4.0 · Playwright 1.49（本机 Edge）
> 结果：**test:color 17/17 · verify:m0 25/25 · verify:m1a 34/34 · verify:m1b 29/29 · build / typecheck / validate 全绿**

## 逐条对照

| # | 验收标准 | 结果 | 证据 |
| --- | --- | --- | --- |
| 1 | 改 primary 为任意 HEX，色阶 50~900 实时更新，锚点阶精确等于输入值 | ✅ | 输入 `#0570DE` 后 10 阶即时渲染，锚点落在 500 且 `data-hex = #0570DE`；375 下输入 `#0F62FE` 同样命中锚点 |
| 2 | 色阶在 OKLCH 空间生成，相邻阶 ΔL 方差小于阈值 | ✅ | 用 culori 把 10 阶转回 OKLCH：ΔL ≈ 0.0800，方差 `1.46e-6`（阈值 1e-4） |
| 3 | text 改为低对比色时标红并显示实际比值 | ✅ | `#CFC8B8` on `#ECE5D6` → `1.33:1 < 4.5 FAIL`，红色文字 + 红色 FAIL 徽标；页面比值与独立 WCAG 实现一致到小数点后两位 |
| 4 | 小组件预览随拾色器即时更新，无闪烁 | ✅ | 预览按钮背景 `rgb(5, 112, 222)` = 新 primary；卡片用 surface；全部是 React state 重渲染，无刷新、无重挂载 |
| 5 | 导出 CSS Variables 可被 CSSStyleSheet 解析，含完整色阶 | ✅ | `:root` 单规则、77 个自定义属性，含 `--color-primary-500` 等 10 阶 |
| 6 | 导出 Tailwind config 可被 new Function 编译，含完整色阶 | ✅ | 编译通过，`colors.primary` 里有 `DEFAULT` + `"50" … "900"` |
| 7 | `/library/new` 提交非法数据被服务端拒绝，返回具体字段错误 | ✅ | 页面显示 `id: id 必须是 kebab-case（小写字母/数字/连字符）`；直接打 API 同样 400 + `issues` |
| 8 | 提交合法数据后条目出现在 `/library` 已确认 tab，validate 通过 | ✅ | 创建 `m1b-verify-style` 后 `/library` 能看到；`npm run validate` 退出码 0 |
| 9 | 详情页编辑保存后数据更新且通过 validate | ✅ | 改名字 + 把 primary 改成 `#7C3AED`，保存后详情页与 `styles.json` 同步更新，validate 通过 |
| 10 | 1280 / 375 无横向溢出，调色器在 375 下可操作 | ✅ | `/library/new`、`/library/[id]/edit` × 两档宽度 4 项全过；375 下改 hex 仍能生成 10 阶并命中锚点 |
| 11 | `build` / `typecheck` / `validate` / `verify:m0` / `verify:m1a` / `verify:m1b` 全绿 | ✅ | 见下 |

## 约束对照

| 约束 | 落实方式 |
| --- | --- |
| 继续穿 NASA-Punk 外壳 | 调色器与表单都是 0 圆角、1px 炭黑边、顶部警示斜纹、.rivet 铆钉、蓝图网格；`verify:m0` 的零圆角/斜纹/铆钉检查在三套改动后仍然通过 |
| 色阶与对比度写成 `lib/color.ts` 纯函数 + 单元测试 | `npm run test:color` 17 个用例，覆盖 HEX 归一化、WCAG 亮度/对比度、锚点、单调性、ΔL 方差、色域收敛、极端输入 |
| 不接任何外部 API | 颜色计算只有 culori（本地库）；页面无第三方请求；verify 的 console error 计数为 0（只忽略故意触发 400 的那条网络噪声） |
| 保持 verify:m0 / m1a 全绿，新增 verify:m1b | 25 / 34 / 29 全过 |

## 复现命令

```bash
npm run dev
npm run test:color        # 17 个颜色引擎用例
npm run validate
npm run typecheck
npm run verify:m0
npm run verify:m1a
npm run verify:m1b        # 会临时写入 styles.json，结束自动还原
npm run build
```

生产构建上验证（本次就是这么跑的）：

```bash
npm run build
npx next start -p 3001
$env:VERIFY_BASE_URL="http://localhost:3001"
node scripts/verify-m0.mjs ; node scripts/verify-m1a.mjs ; node scripts/verify-m1b.mjs
```

## verify:m1b 输出（节选）

```text
✓ lib/color.ts 单元测试通过  — ✓ 全部 17 个用例通过
✓ 新建页内嵌完整调色器（7 个语义槽）  — 7 槽
✓ 色阶为完整的 50–900 共 10 阶  — 50/100/200/300/400/500/600/700/800/900
✓ 锚点阶精确等于输入值  — 锚点 500 = #0570DE
✓ OKLCH 相邻阶 ΔL 均匀（方差 < 1e-4）  — ΔL≈0.0800 · 方差 1.46e-6
✓ 低对比 text/bg 判为不通过并标红  — 正文 text / bg 1.33:1 < 4.5 FAIL
✓ 显示实际比值且与 WCAG 公式一致  — 页面 1.33:1 / 公式 1.33:1
✓ 小组件预览跟随 primary 实时更新  — rgb(5, 112, 222)
✓ 导出 CSS 可解析且含完整色阶  — 77 个变量
✓ 导出 Tailwind 可编译且含完整色阶  — "500": "#0570DE" 存在
✓ 导出 palette JSON 可解析  — 7 个键
✓ 非法数据被服务端拒绝并显示字段路径  — id: id 必须是 kebab-case…
✓ POST /api/styles 合法体创建成功  — id m1b-verify-style
✓ 新条目出现在已确认 tab
✓ 编辑保存后详情页显示新值  — M1b 验收风格（改过）
✓ 编辑结果落到 styles.json 且颜色已更新  — #7C3AED
✓ 375 下调色器可操作（色阶随输入更新）  — 10 阶 · 锚点 ok
✓ 测试结束已还原数据文件
✓ 全部 29 项通过
```

## 截图

| 文件 | 内容 |
| --- | --- |
| `.shots/new-1280.png` / `new-375.png` | 新建表单 + 内嵌调色器 |
| `.shots/edit-1280.png` | 编辑 NASA-Punk（预填 + 8 个色槽含 sand） |
| `.shots/stripe-detail-1280.png` | Stripe 草案详情：新增「人工备注」段与「编辑 · 打开调色器」入口 |

## 实现备注

- 色阶固定 10 档（50–900），ΔL = 0.08；锚点阶直接输出输入值，不经过色彩空间往返，所以是逐位相同。
- 超色域时二分降彩度、保 L 与 H，这样 ΔL 才不被裁通道破坏。
- 新建/编辑共用 `components/library/style-form.tsx`，配色区就是完整的 `PaletteEditor`，没有简化版。
- 服务端写入统一走 `lib/style-write.ts`：zod → 查重（含草案）→ 整体数组校验 → 临时文件 + rename。
- Stripe 的 `colorTextSecondary` 复核结论见 [`M1a-提取记录.md`](M1a-提取记录.md)：变量存在但没有公开默认 HEX，`muted` 保留 `#E0E6EB` 并在条目 `notes` 里写明。

## 没有做的事（避免范围膨胀）

- 没有做多套色阶曲线切换、没有做自动对比度修复（只检测，不自动改色）。
- 没有做批量调色（一次只能编辑一条风格）。
- 没有进 M2 的抓取/审核逻辑。
