# M3b 验收自检

> 结果：**verify:m3b 9/9 · m0 25 · m1a 34 · m1b 29 · m2a 41 · m2b 36 · m3a 18 · build / typecheck / validate 全绿**
> 七套 verify 全部在生产构建上跑过。

## 逐条对照

| # | 验收标准 | 结果 | 证据 |
| --- | --- | --- | --- |
| 1 | 无文本、无字幕的真实视频能触发视觉链路 | ⚠️ 部分 | 链路已接进搜索提取（文本全失败 → vision）；真实视频端到端未跑（见「已知边界」），mock 已验证触发条件 |
| 2 | 截帧、拼图正常，图片在 data/frames/ 可见 | ✅ | verify 断言 `data/frames/BVMOCK000002/montage.png` 存在；sharp 拼图横向合成 |
| 3 | 视觉输出 JSON 含语义描述、无 HEX | ✅ | zod 严格校验 + `#hex` 直接拒绝（verify 有对应用例） |
| 4 | /pending 展示拼图 + notes | ✅ | notes 含「视觉截帧提取」时展开显示 `montage-preview` 图片（`/api/frames/{bvid}`） |
| 5 | 全量测试通过，verify:m3b 通过 | ✅ | 七套全绿（生产构建） |

## 实现

- `lib/ingest/vision.ts`：下载（60s 超时）→ ffmpeg 截 10%/50%/90% 三帧（每帧 10s 超时）→ sharp 横向拼图 → 视觉模型（30s 超时）。
  - ffmpeg 用 `@ffmpeg-installer/ffmpeg` 自带的二进制（本机没装系统 ffmpeg），可用 `FFMPEG_PATH` 覆盖。
  - 临时视频放系统临时目录，`finally` 里必删；帧与拼图留在 `data/frames/{bvid}/`。
- `lib/search/extract.ts`：文本（README + 字幕）都拿不到且注入了 `vision` 时，走视觉分支。
  - 成功 → pending `confidence 0.7`，notes = 「来源：视觉截帧提取 <拼图路径>」。
  - 失败 → 原样报错，不写 pending。
- `lib/ingest/deepseek.ts#analyzeImage`：拼图转 base64 data URI，`response_format: json_object`，模型取 `VISION_MODEL`（默认 `deepseek-flash`）。
- `/api/frames/[bvid]`：只读返回拼图；`/pending` 展开时按 notes 判断是否展示。
- 前端进度：任务 step 会显示「下载中… / 截帧中… / 视觉分析中…」。

## 已知边界

- **真实视频的视觉链路没跑通**：本机 ffmpeg 是随 npm 包下载的（`@ffmpeg-installer`），但要从 B 站下载视频需要有效直链与风控放行；`deepseek-flash` 是否接受图片输入也没有实测（当前 DeepSeek 公开 API 的视觉能力有限）。
  因此第 1 条只做到「触发条件与链路正确、失败会明确报错」，没有真实产出一条 0.7 的视觉 pending。
- 截帧失败/模型不认图时，任务报错，pending 不变。
- `data/frames/` 下的拼图会随仓库保留，供人工核对。

## 复现

```bash
npm run verify:m3b   # 9 项：拼图 / 视觉兜底 / HEX 拒绝 / 0.7 入库 / 审核页展示
```
