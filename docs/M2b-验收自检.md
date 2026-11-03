# M2b 验收自检

> 对应 7 条验收标准 + 约束。
> 结果：**verify:m2b 36/36 · verify:m2a 41/41 · verify:m0 25/25 · verify:m1a 34/34 · verify:m1b 29/29 · build / typecheck / validate 全绿**
> 五套 verify 都在生产构建（`npm run build` + `next start`）上跑过。

## 逐条对照

| # | 验收标准 | 结果 | 证据 |
| --- | --- | --- | --- |
| 1 | 输入新 UID 添加，列表出现带正确昵称的新 UP 主，upstreams.json 更新 | ✅ **真实** | 真实请求 `POST /api/upstreams {uid:"946974"}` → B 站返回昵称「影视飓风」→ 列表第 05 行立刻出现 `946974 影视飓风`，`config/upstreams.json` 写入成功 |
| 2 | 点移除，列表消失，upstreams.json 更新 | ✅ **真实** | `DELETE /api/upstreams?uid=946974` → 200，列表回到 4 行，配置文件同步删除 |
| 3 | 真实 0.6 记录「通过并入库」→ 进 /library，validate 通过，pending 消失 | ✅ | 用真实 0.6 记录的**完整副本**跑全链路：入库为 `verify-approve-style`、/library 可见、validate 通过、pending 移除（真实那条留给你手动点，见下方说明） |
| 4 | 「去调色」进编辑页，保存后入库 | ✅ | `/library/new?pending=<id>` 预填（名称/提示词/配色/令牌都在），保存后跳到 `/library/verify-polish-style`，pending 同步清空 |
| 5 | 「丢弃」后记录从 pending 消失 | ✅ | 点击后行数 3 → 2，`data/pending.json` 里该 id 已移除 |
| 6 | 字幕降级：无 GitHub 但有字幕 → 0.5 且 notes 标明来源 | ✅（mock） | pipeline 假实现：有字幕 → `confidence 0.5`、`notes = "来源：字幕提取"`、`source.url` 为空；无字幕 → 维持 0.3 |
| 7 | build / typecheck / validate / 五套 verify 全绿 | ✅ | 见下方 |

## 真实证据：订阅增删

```text
POST /api/upstreams {uid:"946974"}
→ 200 {"ok":true,"upstream":{"uid":"946974","name":"影视飓风"},"count":5}

/subscriptions 列表：
01 · 40238601 路北路陈
02 · 35328143 ALPDM
03 · 19307699 AI个体指南
04 · 38053181 ooooohmygosh
05 · 946974   影视飓风        ← 新增

DELETE /api/upstreams?uid=946974 → 200 {"ok":true,"count":4}
列表回到 4 行，config/upstreams.json 同步删除。
```

添加时服务端用 SESSDATA 调 B 站 `web-interface/card` 查真实昵称；UID 非数字 / 不存在 / 接口失败都会返回具体错误（400 / 502 / 409），不会写脏数据。

## 关于「真实 0.6 记录」的一个选择

真实那条（NovelAI Prompt Studio / BV1TDnm6TEf4）我没有替你按下去 —— 通过入库是不可撤销的策展决定。
`verify:m2b` 用的是它的**完整副本**（同样的 candidate、color_direction、source），链路完全一样：
补全 → 校验 → 写 styles → 清 pending。你手动点真实那条时，走的是同一段代码。

## 通过入库的补全规则

候选往往缺 palette（模型只给色彩方向）或令牌（信源没写）。补全策略是确定性的，不是编：

- **palette**：`color_direction` → OKLCH 映射（温度定色相 55/250/260，饱和定彩度 0.06/0.12/0.18，对比定背景与文字亮度），`palette_source = "direction-mapped"`，同时把映射说明写进 `notes`。
- **typography / tokens**：值为「未提及 / 无 / 未知」时替换成基线（system-ui / 零圆角 / 8px 网格），并在 `notes` 里注明需要复核。
- **components**：占位值会被过滤；全空时写一条「待人工补充」。
- id 冲突自动加 `-2` 后缀；入库前跑完整 `styleSchema`，不合法就不写。

## 约束对照

| 约束 | 落实方式 |
| --- | --- |
| 保持 NASA-Punk 外壳 | 订阅页表单/按钮、审核动作区都是 0 圆角 + 1px 炭黑边 + 警示斜纹 + mono 标签；`verify:m0` 仍全绿 |
| 新增 verify:m2b | `scripts/verify-m2b.mts`，36 项，覆盖增删 UP 主、通过入库、丢弃、去调色、字幕降级 |
| 原子写 | 配置、pending、styles 全部临时文件 + rename；`verify` 断言不残留 `.tmp` |
| 保留 config 缩进 | 检测首条条目的缩进（2/4 空格或 tab），写回时沿用；`verify` 用 2 空格和 4 空格两份文件各测一次 |

## 几条实现说明

- **upstreams.json 会变成对象数组**：第一次通过页面增删后，原来只有 UID 的字符串条目会补成 `{ uid, name }`（昵称从 `ingest-state` 回填）。缩进保持原样，仍是 2 空格。
- **字幕降级**：`view` 拿 cid → `player/v2` 拿字幕列表 → 下载字幕 JSON → 拼文本 → DeepSeek。没有 CC 字幕就回到 0.3，不做 ASR（按你说的「有就抓，没有就算」）。
- **用量统计**：`GET /api/usage` + 订阅页底部面板（本次真实数据：1 次调用 / 4266 tokens）。
- **审核动作**是客户端按钮 + 服务端接口，成功后 `router.refresh()` 实时刷新列表。

## 复现

```bash
npm run dev
npm run verify:m2b        # 36 项，会临时改 config/pending/styles 并还原
npm run verify:m0 && npm run verify:m1a && npm run verify:m1b
npx tsx scripts/verify-m2a.mts
npm run validate && npm run typecheck && npm run build
```

生产构建：

```bash
npm run build
npx next start -p 3001
$env:VERIFY_BASE_URL="http://localhost:3001"
node scripts/verify-m0.mjs ; node scripts/verify-m1a.mjs ; node scripts/verify-m1b.mjs
npx tsx scripts/verify-m2a.mts ; npx tsx scripts/verify-m2b.mts
```

## verify:m2b 输出（节选）

```text
✓ 添加 UP 主并保留 2 空格缩进  — indent 2 · 3 条
✓ 追加条目带上服务端查到的昵称
✓ 重复添加会被拒绝
✓ 删除 UP 主后写回文件
✓ 写入后不残留 .tmp 文件
✓ 原文件是 4 空格缩进时保持 4 空格  — indent 4
✓ 缺 palette 时按色彩方向确定性映射  — #597797 · direction-mapped
✓ 占位符被替换成基线值 / 补全说明写进 notes
✓ 同一份色彩方向 → 同一份 palette（可复现）
✓ id 撞车时自动加后缀
✓ 有 CC 字幕时降级提取到 0.5 且 notes 标明来源
✓ 没有字幕时维持 0.3
✓ 新 UID 出现在订阅列表且带昵称 / upstreams.json 写入 / 移除后消失
✓ 添加表单与移除按钮的请求与提示
✓ 「通过并入库」写进 styles 并从 pending 移除 / /library 可见 / validate 通过
✓ 「丢弃」删除条目
✓ 「去调色」预填 + 保存入库 + 清 pending
✓ 用量统计接口 / 1280·375 溢出 / 还原与 validate
✓ 全部 36 项通过
```

## 截图

| 文件 | 内容 |
| --- | --- |
| `.shots/subscriptions-1280.png` / `subscriptions-375.png` | 订阅页：添加表单、移除按钮、LLM 用量面板 |
| `.shots/upstream-added-1280.png` | 真实添加「影视飓风」后的 5 行列表 |
| `.shots/pending-actions-1280.png` | 审核页：展开后的通过 / 去调色 / 丢弃 |
| `.shots/polish-1280.png` | 从 pending 进调色器（预填 + 来源横幅） |

## 没有做的事 / 已知边界

- 真实那条 0.6 没有消费（理由见上），你手动点一下即可。
- 字幕降级没有做真实视频验证：B 站 CC 字幕不是每个视频都有，且本轮真实抓取被 412 风控打断过，只用 mock 验了链路。
- 订阅增删没有做「批量导入」——按需再加。
- 任务状态仍在内存里（M5 的定时任务再一起收拾）。
