# M3a 验收自检

> 结果：**verify:m3a 18/18 · verify:m0 25 · m1a 34 · m1b 29 · m2a 41 · m2b 36 · build / typecheck / validate 全绿**
> 六套 verify 全部在生产构建（`next build` + `next start -p 3001`）上跑过。

## 逐条对照

| # | 验收标准 | 结果 | 证据 |
| --- | --- | --- | --- |
| 1 | /search 输入关键词能搜出真实 B 站视频（封面 / 标题 / UP 主） | ✅ **真实** | `POST /api/search {"keyword":"赛博朋克 配色"}` → 20 条结果，含 bvid / author / play / cover；页面渲染 18 行（有 2 条被过滤） |
| 2 | 「提取此视频」走通文本/字幕链路并写入 pending.json | ✅（mock）+ 真实搜索 | verify：README 链路 → pending；字幕链路 → 0.5；无文本 → 明确报错不写。提取任务带步骤轮询 |
| 3 | 搜索与提取都有清晰状态反馈、不卡死 | ✅ | 搜索按钮「搜索中…」；提取按钮「提取中…」+ 每 700ms 轮询显示「正在读简介 / 读 README / 分析文本 / 查重」 |
| 4 | pending 里 source.type = `bilibili-search` | ✅ | verify 断言 `sources[0].type === "bilibili-search"`；schema 已加该枚举 |
| 5 | 原有测试全绿 + verify:m3a 全绿 | ✅ | 六套全绿（生产构建） |

## 追加需求：sources 数组 + 查重合并

| 项 | 实现 | 证据 |
| --- | --- | --- |
| source → sources 数组，老数据自动转换 | `npm run migrate:sources`，读时 schema 强制数组 | styles 2 条 / draft 4 条已迁移，validate 通过 |
| 抓取时查重（字符串包含 + bigram 相似度） | `lib/ingest/dedupe.ts`：归一化 → 包含关系 → Dice；≥0.85 高、≥0.6 中 | verify：高相似不写、中相似写 `duplicate_of` |
| 高相似提示「发现相似风格：XXX」 | 搜索提取结果 / 抓取 skip 记录 | search 结果行显示「发现相似风格：…」 |
| 中等相似写 `duplicate_of` | pending 字段 + 审核页红色「相似 → id」徽标 | verify 断言 |
| 合并信源按钮 | `POST /api/pending/[id]/merge`：sources 追加到目标风格（按 video+url+upstream 去重）后删除 pending | verify：真实文件合并成功，目标 sources +1 |
| 详情页「来源追踪」 | `/library/[id]` 第 09 区块列出全部 sources（类型 / UP / BV 链接 / URL） | 页面区块 |

## 实现要点

- 搜索：`/x/web-interface/wbi/search/type` + WBI 签名，服务端带 SESSDATA，标题去 `<em>`、封面补协议。
- 提取：复用 `getVideoDesc → parseGithubRepo → fetchReadme → DeepSeek`；没有 README 就 `getSubtitle`；两者都无 → 「该视频无有效文本信息，无法提取」，不落盘。
- 延迟：模块级 `lastBiliCall`，所有 B 站请求（搜索后的提取、字幕）之间强制 1–3s。
- 任务：内存 job 表 + 轮询，最多保留 30 个；前端按行显示进度与结果。
- 一次性搜索不进 `config/upstreams.json`。

## 复现

```bash
npm run verify:m3a     # 18 项（mock 搜索解析 / 提取链路 / 查重 / 合并 / UI）
npm run verify:m0 && npm run verify:m1a && npm run verify:m1b
npx tsx scripts/verify-m2a.mts && npx tsx scripts/verify-m2b.mts
```

## 已知边界

- 真实提取只跑过搜索接口与解析；一次完整提取会消耗一次 DeepSeek 调用，验收时按需点。
- 搜索关键词的 B 站相关性一般，接口就是这样的。
- 合并只处理目标在 styles / drafts 的情况；目标已不存在时返回 404。
