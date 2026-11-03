# M2a 验收自检

> 说明：M2b 已经把 `/pending` 从「只读」升级为可操作（通过 / 调色 / 丢弃）。
> 本文里出现的「只读」只代表 M2a 当时的状态，当前行为见 [`M2b-验收自检.md`](M2b-验收自检.md)。

> 对应本轮 13 条验收标准 + 6 条约束。
> 结果：**verify:m2a 42/42 · verify:m0 25/25 · verify:m1a 34/34 · verify:m1b 29/29 · build / typecheck / validate 全绿**
> 而且：**真实抓取也跑通了** —— 1 条 video 走完「简介 → GitHub README → DeepSeek → pending(0.6)」，token 已落盘。

## 真实抓取结果（不是 mock）

`.env.local` 在中途补上了（SESSDATA 216 字符 / DEEPSEEK_API_KEY 35 字符 / GITHUB_TOKEN 留空），于是真跑了一轮。

```text
订阅 4 个 UP 主 → 取到 3 个 UP 主的视频（另 2 个被 B 站 412 风控拦下）
→ 10 条 pending：
   · 1 条 confidence 0.6：NovelAI Prompt Studio / BV1TDnm6TEf4
     GitHub: https://github.com/LBEILC/NovelAIPromptStudio
     色彩方向：neutral / muted / medium（无任何 HEX）
     标签：clean, data-dense, developer, light, minimal, systematic, technical, tonal
   · 9 条 confidence 0.3：notes = 无 GitHub 链接
→ data/llm-usage.log：{"prompt_tokens":3876,"completion_tokens":390,"total_tokens":4266,...}
```

真实跑出来的三条经验（都已修）：

1. **搜索接口的简介是截断的**。`arc/search` 返回的 `description` 只有一小段，GitHub 链接经常在被截掉的部分。
   修法：逐条补 `/x/web-interface/view?bvid=` 取完整简介，失败就退回列表里的简介。
   （这条就是第一轮全部 8 条都是「无 GitHub 链接」的原因。）
2. **`DEEPSEEK_BASE_URL=` 空值不能当默认值**。`.env.local` 里留空的变量会变成空字符串，
   直接拼出 `/chat/completions`，报 `Failed to parse URL`。修法：trim + 空串回退官方地址。
3. **一个 UP 主失败不该拖垮整轮**。B 站 412 风控拦了第 3、4 个 UP 主时，
   现在会记一条 failure 并继续跑后面的，任务最后是「完成 + 失败 K 条」而不是整体失败。
   只有 `-101`（SESSDATA 失效）才会中止全部。

## 逐条对照

| # | 验收标准 | 结果 | 证据 |
| --- | --- | --- | --- |
| 1 | `/subscriptions` 展示 4 个 UP 主，点「检查更新」能触发抓取 | ✅ | 真实页面显示 4 个 UID + 昵称（路北路陈 / ALPDM / AI个体指南 / ooooohmygosh）+ 上次检查时间；点按钮后任务真的跑了 |
| 2 | 抓取过程中显示进度，不卡死 | ✅ | 真实轮询看到 `up=1/4 vid=2/5 +1` → `up=4/4 vid=5/5 +10`；UI stub 另验了进度文案与摘要 |
| 3 | 至少 1 个视频成功走通「简介 → GitHub README → DeepSeek → pending」 | ✅ **真实** | BV1TDnm6TEf4 → LBEILC/NovelAIPromptStudio → pending 0.6，`raw_response` 964 字符 |
| 4 | 至少 1 个视频因「无 GitHub 链接」进 pending，confidence 0.3，notes 有原因 | ✅ **真实** | 9 条 0.3，notes 全为「无 GitHub 链接」 |
| 5 | pending 带 `source.video` / `source.upstream` / `source.url` | ✅ | 真实条目：`bilibili · 40238601 · BV1TDnm6TEf4 · https://github.com/LBEILC/NovelAIPromptStudio` |
| 6 | DeepSeek 输出通过 zod 校验，失败重试一次，仍失败 confidence 0 + 原始响应 | ✅ | mock 用例：两次坏输出 → confidence 0 + raw；适配器「第一次坏第二次好」→ attempts=2；HEX 写进色彩方向被 zod 拒绝 |
| 7 | 配色方向只含语义描述，不含 HEX | ✅ | 真实条目的 `color_direction` 恰好 4 个键；schema 层直接拒绝 `semantic_hint` 里的 `#hex` |
| 8 | `/pending` 展示所有条目，可展开看详情 | ✅ | 10 条全部列出；展开可见 Source / Color direction / Candidate JSON / Raw response |
| 9 | Cookie 失效时页面显式提示 | ✅ | 注入 `SESSION_EXPIRED` 状态 → 「SESSDATA 已过期，请更新」+ -101 文案 |
| 10 | `data/llm-usage.log` 有本次调用的 token 记录 | ✅ **真实** | 4266 tokens 一行 JSONL（见上） |
| 11 | 相同视频重复抓取不产生重复 pending | ✅ | mock 第二轮 `added 0 / skipped 5`；真实轮之间为对比效果手动清空过 pending |
| 12 | build / typecheck / validate / verify:m0 / m1a / m1b 全绿 | ✅ | 四套 verify 在生产构建上全跑过 |
| 13 | 新增 verify:m2a，用 mock 验证抓取链路 | ✅ | `scripts/verify-m2a.mts`，42 项，全程不依赖真实 B 站 / GitHub / DeepSeek |

## 约束对照

| 约束 | 落实方式 |
| --- | --- |
| 继续穿 NASA-Punk 外壳 | 订阅页/审核页都是 0 圆角、1px 炭黑边、警示斜纹、mono 标签；`verify:m0` 仍然全绿 |
| 所有外部请求超时 + 重试 | `lib/ingest/http.ts`：10s 超时、最多 2 次重试、300/600ms 指数退避；DeepSeek 单独放宽到 30s |
| B 站请求间 1–3 秒随机延迟 | pipeline 在每次 B 站调用（含完整简介）前 sleep 1000–3000ms；verify 断言 9 次样本都在区间内 |
| GitHub 带 User-Agent + 60 次/小时 | `design-vault/0.3 (local, read-only README fetcher)`；4xx 不重试 |
| DeepSeek token 落盘 | `data/llm-usage.log`，JSONL 追加（真实调用已写入） |
| Cookie 失效显式提示 | `-101` → `SessionExpiredError` → 任务 `SESSION_EXPIRED` → 页面红色横幅 |

## 复现命令

```bash
npm run dev
npm run verify:m2a         # 42 项，mock 链路 + UI stub，会临时写 pending 并还原
npm run verify:m0 && npm run verify:m1a && npm run verify:m1b
npm run validate && npm run typecheck && npm run build
```

真实抓取：配好 `.env.local` 后打开 `/subscriptions` 点「检查更新」（或 `POST /api/ingest`）。

生产构建上跑（本次就是这么验的）：

```bash
npm run build
npx next start -p 3001
$env:VERIFY_BASE_URL="http://localhost:3001"
node scripts/verify-m0.mjs ; node scripts/verify-m1a.mjs ; node scripts/verify-m1b.mjs
npx tsx scripts/verify-m2a.mts
```

## verify:m2a 输出（节选）

```text
✓ 抓取链路跑通并产出了 pending  — added 5 · pending 5
✓ 成功链路：简介 → README → DeepSeek → pending（confidence 0.6）
✓ 无 GitHub 链接：confidence 0.3 且 notes 写明原因  — 0.3 · 无 GitHub 链接
✓ README 404 / README 无设计信息 各 0.3
✓ 模型两次输出都不合格：confidence 0 + 记录原始响应
✓ 色彩方向只含语义字段且不含 HEX
✓ B 站请求之间有 1–3 秒随机延迟  — 共 9 次
✓ 相同视频重复抓取不产生重复 pending  — 第二次 added 0 · skipped 5
✓ B 站 -101 会中止任务并带出 SESSION_EXPIRED
✓ project_tags 按枚举过滤（不在枚举里的被丢弃）  — industrial
✓ llm-usage.log 记录了 token 用量（JSONL）
✓ 模型第一次输出坏、重试一次后成功  — attempts 2
✓ 色彩方向里出现 HEX 会被 zod 拒绝
✓ /subscriptions 展示 4 个 UP 主 / 进度 / 摘要
✓ Cookie 失效时页面显式提示
✓ /pending 列出全部条目并可展开
✓ 全部 42 项通过
```

## 截图

| 文件 | 内容 |
| --- | --- |
| `.shots/subscriptions-1280.png` / `subscriptions-375.png` | 订阅页：4 个 UP 主（真实昵称）、上次检查时间、pending 010 |
| `.shots/pending-1280.png` / `pending-375.png` | 审核队列：10 条真实候选 |
| `.shots/pending-expanded-1280.png` | 展开 NovelAI 那条 0.6 候选：GitHub 链接、色彩方向、候选 JSON、原始响应 |

## 已知边界

- **B 站 412 风控**：真实轮里第 3、4 个 UP 主被 412 拦下，任务记为「失败 2」并继续。
  这是 B 站侧的风控，不是签名错误（前两个 UP 主正常）。严重时可以隔一会儿再点，或换网络环境。
- **任务状态在内存里**：dev server 重启会丢正在跑的任务（pending 已落盘不受影响）。
- **没有 M2b 的审核动作**：通过 / 调色 / 丢弃留给下一轮。
- 视觉兜底（截帧）没有做，按计划属于 M3。
