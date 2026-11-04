# Design Vault

把「看到的风格」变成「可复用的设计资产」：从 B 站视频、收藏夹、GitHub README、网页截图里抓取真实设计，抽成结构化条目（配色、字阶、组件、提示词、动效方案），再导出给 AI 或直接预览。

- 主应用：Next.js（`apps/web`），本地跑在 3000 端口；
- DSH 插件：DeepSeek Harness 里的实时预览与导出面板（`apps/dsh-plugin`）；
- 共用内核：`packages/core`（schema / 配色 / 查重）、`packages/store`（JSON 读写 / 加密）、`packages/adapters`（B 站 / DeepSeek / GitHub / 截图）。

---

## 第一次使用（给同学）

**只需要两步：**

1. 装 [Node.js 22+](https://nodejs.org)（安装时保持默认选项即可）；
2. 双击 `start-silent.vbs`（**推荐，全程无黑框**）或 `start.bat`（Windows）；macOS / Linux 执行 `./start.sh`。

第一次启动会自动安装依赖并构建，**大约 1–3 分钟**，之后会自动打开浏览器：

```
http://localhost:3000
```

关闭：再次运行时脚本会复用已有服务；停止服务用：

```bash
node --import tsx scripts/launch.mts stop
# 或 npm run stop
```

- **关掉启动窗口 / 退出 DSH 都不会停止服务**：Web 进程由 WMI 创建，父进程是 WmiPrvSE，完全脱离终端与 DSH 的 Job；
- 停止服务：双击 `stop-silent.vbs`（或 `npm run stop`）；
- 日志：`.run/web.log`
- 自动化验证：`npx tsx scripts/test-detach.mts`（杀掉父进程后检查服务仍存活）
- 端口被占用：脚本会提示；可用 `PORT=3010 ./start.sh`（Windows：`set PORT=3010` 后运行）
- 首次使用没有密钥也能打开页面，但抓取/分析需要先配置 `.env.local`（见下）

---

## 能做什么

| 页面 | 用途 |
| --- | --- |
| `/library` | 风格库：已确认 / 草案，详情含配色、令牌、来源追踪、配套技术方案、参考网站 |
| `/pending` | 审核队列：存入风格库 / 动效库 / 组件库、去调色、合并到相似风格、丢弃 |
| `/search` | 灵感采集：关键词搜 B 站 + 我的收藏夹（勾选批量提取，单次最多 20 条） |
| `/subscriptions` | 订阅 UP 主、手动抓取、进度与 LLM 用量 |
| `/components` | 组件库：代码查看 / 复制 / 编辑 |
| `/effects` | 效果库：技术栈、实现思路、代码片段、编辑 |
| `/refs` | 参考库：URL 截图 → 设计令牌 → AI 分析 → 代码骨架 |
| `/settings` | B 站扫码登录、DeepSeek Key、Vault 目录、订阅 UP 主 |

---

## 配置（`.env.local`）

复制 `.env.example` 为 `.env.local`，按需填写：

| 变量 | 用途 | 必填 |
| --- | --- | --- |
| `BILIBILI_SESSDATA` | B 站搜索 / 收藏夹 / 视频详情的 Cookie | 抓取时需要 |
| `DEEPSEEK_API_KEY` | 文本与视觉分析 | 抓取/分析时需要 |
| `DESIGN_VAULT_SECRET` | 扫码登录凭证的 AES-256-GCM 密钥（32 字节 base64） | 扫码登录时需要 |
| `DEEPSEEK_BASE_URL` | 自建/代理地址，留空走官方 | 否 |
| `VISION_MODEL` | 视觉分析模型，默认 `deepseek-flash` | 否 |
| `GITHUB_TOKEN` | 提高 GitHub README 抓取配额 | 否 |
| `CAPTURE_DELAY_MS` | 参考库截图等待毫秒数，默认 2500；WebGL 站可调 5000 | 否 |

生成 `DESIGN_VAULT_SECRET`：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

所有密钥只存在本机 `.env.local` 与 `data/secrets/`，两者都已被 `.gitignore` 排除。

### B 站扫码登录

打开 `/settings` → 「扫码登录（覆盖环境变量）」→ B 站 App 扫码。登录成功会加密写入 `data/secrets/bili-session.enc`；没有配置 `DESIGN_VAULT_SECRET` 时会拒绝保存（fail closed），页面会提示。

优先级：**加密会话 > `.env.local` 的 `BILIBILI_SESSDATA`**。

---

## 数据与备份

```
data/styles.json        已确认风格
data/styles.draft.json  草案
data/pending.json       待审核候选
data/effects.json       技术方案
data/components.json    组件
data/refs.json          参考网站
data/ingest-state.json  抓取/收藏夹游标
data/llm-usage.log      LLM token 用量
data/secrets/           加密凭证（不入 git）
refs/                   参考库截图（不入 git）
```

备份（打包为 `backup/design-vault-*.zip`，保留最近 10 份）：

```bash
npm run backup
```

切换 Vault 目录：`/settings` → 「Vault 目录」→ 写指针文件 `.design-vault-home`，**重启后生效**。

---

## 开发者

```bash
corepack pnpm install          # 或 npm run launch 首次自动安装
corepack pnpm dev              # 直接跑 Next（3000）
corepack pnpm build            # 生产构建
corepack pnpm typecheck        # 根 + web 类型检查
corepack pnpm validate         # 数据 schema 与一致性
```

验收（14 套，共 253 项，全部幂等）：

```bash
node scripts/verify-m0.mjs
npm run verify:m1a && npm run verify:m1b
npx tsx scripts/verify-m2a.mts && npx tsx scripts/verify-m2b.mts
npx tsx scripts/verify-m3a.mts && npx tsx scripts/verify-m3b.mts
npx tsx scripts/verify-m4a.mts && npx tsx scripts/verify-m4b.mts
npx tsx scripts/verify-m5.mts && npx tsx scripts/verify-m6.mts
npx tsx scripts/verify-m7.mts && npx tsx scripts/verify-m8.mts && npx tsx scripts/verify-m9.mts
```

Monorepo 结构：

```
apps/web            Next.js 应用（页面 / API / 组件）
apps/dsh-plugin     DSH 插件（预览与导出）
packages/core       纯领域逻辑（schema / OKLCH / 查重 / 解析）
packages/store      JSON 读写、加密凭证、路径解析
packages/adapters   B 站 / DeepSeek / GitHub / 截图 / 提取链路
scripts             验收、启动器、备份、迁移
data/ config/       本地数据与订阅配置
```

约束：写文件一律「临时文件 + rename」；所有读写过 zod；B 站请求 1–3s 随机延迟；不编造信源里没有的信息。

### DSH 插件

插件在 `apps/dsh-plugin`（monorepo 子包，已随主仓提交）：

```bash
corepack pnpm --filter design-vault-plugin build
corepack pnpm --filter design-vault-plugin verify
```

把构建产物安装进 DSH 的方式见 `apps/dsh-plugin/README.md`。

---

## 常见问题

**启动脚本一闪而过？**
在终端里运行 `start.bat`（或 `bash start.sh`）查看报错；常见原因是 Node 版本过低或首次安装网络失败。

**端口 3000 被占用？**
关掉占用程序，或 `PORT=3010 ./start.sh`；脚本检测到已有健康服务时会直接复用并打开浏览器。

**扫码登录失败？**
先确认 `.env.local` 里有 `DESIGN_VAULT_SECRET`（32 字节 base64），否则会 fail closed；B 站返回 -101 时会自动清除旧凭证，重新扫码即可。

**抓取报「缺少 B 站登录凭证」？**
去 `/settings` 扫码，或配置 `BILIBILI_SESSDATA`。

**视觉兜底失败？**
需要 ffmpeg；默认使用 `@ffmpeg-installer/ffmpeg` 自带二进制，可用 `FFMPEG_PATH` 覆盖。

**数据存在哪？**
默认仓库根目录的 `data/`；设置页可切换 Vault 目录（需重启）。

---

## 许可

MIT。数据与截图属于各自来源，仅用于个人学习与设计参考。
