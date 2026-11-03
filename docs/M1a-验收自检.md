# M1a 验收自检

> 对应本轮 7 条验收标准 + 4 条约束。自检脚本跑在**生产构建**（`npm run build` + `next start -p 3001`）上，
> 不是 dev 模式 —— 也就是说这些结论对 `npm start` 同样成立。
>
> 环境：Windows · Node v22.14.0 · Next 15.5.28 · Playwright 1.49（本机 Edge）
> 结果：**verify:m0 25/25 ✅ · verify:m1a 34/34 ✅ · build / typecheck / validate 全绿**

## 逐条对照

| # | 验收标准 | 结果 | 证据 |
| --- | --- | --- | --- |
| 1 | `/library` 两个 tab 都能看到数据，草案 tab 有 4 条，每条带官方文档链接 | ✅ | tab 计数 `已确认 CONFIRMED 001 / 草案 DRAFTS 004`；草案 4 行 id 互不相同；每条链接均为 https——`m3.material.io`、`carbondesignsystem.com`、`primer.style`、`docs.stripe.com` |
| 2 | 点草案「确认」后，条目从 draft 消失、出现在已确认 tab、styles.json 通过 validate | ✅ | 真点 UI 按钮后：draft 4 → 3、styles 1 → 2、已确认 tab 出现「Material 3 基线（Baseline Light）」；`npm run validate` 退出码 0；测试结束自动还原并再次校验 |
| 3 | 画像表单提交后，`/result` 展示 1 主 + 2 备选，每条显示命中的标签 | ✅ | 主推荐 1 个、备选 2 个；主推荐命中 4 个标签、两条备选分别命中 4 / 3 个标签 |
| 4 | 相同输入两次提交，推荐结果一致（规则打分确定性） | ✅ | 同一画像连续 POST `/api/recommend` 两次，响应 JSON 逐字节相同；结果页两次加载 digest 相同（`B0CF8166`） |
| 5 | `/result` 的复制面板能复制 CSS / Tailwind / 提示词，内容来自推荐的主风格 | ✅ | 剪贴板取回后用 `CSSStyleSheet` 解析出 `:root` 18 个变量；Tailwind 文本可被 `new Function` 编译且含 `theme.extend`；提示词与主风格 `frontend_prompt` 逐字一致（572 字符，`ibm-carbon-white`） |
| 6 | 1280 / 375 无横向溢出 | ✅ | `/`、`/library`、`/library?tab=draft`、`/result?...` 四个路由 × 两档宽度，8 项 `scrollWidth ≤ clientWidth` 全通过 |
| 7 | `build` / `typecheck` / `validate` / `verify:m0` / `verify:m1a` 全绿 | ✅ | 见下方命令输出 |

## 约束对照

| 约束 | 落实方式 |
| --- | --- |
| 继续穿 NASA-Punk 外壳 | 新页面全部复用 `.hazard` / `.panel` / `.rivet` / 零圆角 / 1px 炭黑边 / 蓝图网格；`verify:m0` 的「全站零圆角」「警示斜纹存在」「铆钉存在」在改动后仍然通过 |
| 不接任何外部 API | 运行时没有任何第三方请求；字体走 `@fontsource` 自托管；推荐是纯函数。`verify` 里的 console error 计数为 0 |
| 草案确认和表单提交走后端校验 | `/api/drafts/confirm` 重新读盘 → `styleSchema` 整条校验 → 查重 → 整体数组校验 → 原子写；`/api/recommend` 用 `profileSchema` 校验；`/result` 页面自身也会重新解析并校验 query。非法输入分别返回 400 / 404 / 409 / 422 |
| 保持 verify:m0 全绿，新增 verify:m1a | `npm run verify:m0` 25/25；`npm run verify:m1a` 34/34 |

## 复现命令

```bash
npm run dev                       # 另开终端
npm run validate                  # 5 个 JSON + 一致性
npm run typecheck
npm run build
npm run verify:m0                 # 25 项
npm run verify:m1a                # 34 项（会临时改数据，结束自动还原）
```

想跑在生产构建上（本次就是这么验的）：

```bash
npm run build
npx next start -p 3001
$env:VERIFY_BASE_URL="http://localhost:3001"
node scripts/verify-m0.mjs
node scripts/verify-m1a.mjs
```

## verify:m1a 输出（节选）

```text
✓ tab 计数正确（001 / 004）  — 已确认 CONFIRMED 001 | 草案 DRAFTS 004
✓ 草案 tab 有 4 条  — 4 条
✓ 每条草案都带官方文档链接（https）  — material-3-baseline → m3.material.io | ibm-carbon-white → carbondesignsystem.com | github-primer-light → primer.style | stripe-elements-default → docs.stripe.com
✓ 确认后从 draft 消失  — material-3-baseline · draft 4 → 3
✓ 确认后出现在 styles.json  — styles 1 → 2
✓ 确认后 styles.json 通过 npm run validate  — validate 退出码 0
✓ 同一画像连续两次请求结果完全一致  — 5 条结果 · 首位 ibm-carbon-white
✓ 结果页有 1 条主推荐
✓ 结果页有 2 条备选
✓ 主推荐显示命中标签  — 4 个标签
✓ 每条备选都显示命中标签  — 4 / 3
✓ 同输入两次加载结果指纹一致  — B0CF8166
✓ 复制前端提示词 = 主推荐的 frontend_prompt  — ibm-carbon-white · 572 字符
✓ 非法画像被服务端拒绝（400）/ 不存在的草案返回 404 / 缺 id 返回 400 / GET 返回 405
✓ 全部 34 项通过
```

## 截图

| 文件 | 内容 |
| --- | --- |
| `.shots/form-1280.png` / `form-375.png` | 项目画像表单 |
| `.shots/draft-1280.png` / `draft-375.png` | 草案 tab（4 条，带官方文档链接与确认按钮） |
| `.shots/result-1280.png` / `result-375.png` | 推荐结果（1 主 + 2 备选 + 复制面板） |
| `.shots/draft-detail-1280.png` / `draft-detail-375.png` | 草案详情页（顶部带「确认入库」） |

## 两件需要你拍板的事

1. **Stripe 的 `muted` 槽位**：官方只公开 4 个颜色变量的默认值，没有 secondary text 的 hex。
   我把 `muted` 映射成同一文档里的输入框描边色 `#E0E6EB`（语义取「弱化/分隔」），没有编新颜色。
   细节见 [`M1a-提取记录.md`](M1a-提取记录.md)。觉得不合适就改这条草案，或者我把它从草案里删掉。
2. **Linear 没进草案**：官方品牌页只有 Mercury White `#F4F5F8` 与 Nordic Gray `#222326` 两个 hex，
   品牌主色只有文字描述，5 个语义槽位填不满，按「提取不到就换一个系统」弃用。

## 没有做的事（避免范围膨胀）

- 没做 M1b 的调色器 / OKLCH 色阶 / 对比度检测。
- 没做手动新建风格表单（`/library` 里还是 JSON 直改）。
- 推荐没有引入 LLM 或 embedding，也没有做「解释性排序」以外的花活。
