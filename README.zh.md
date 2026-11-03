# design-vault-plugin

一个 DeepSeek Harness 插件。

[English](README.md)

## 要求

Node 24+，pnpm 12（npm 可兜底）。

## 安装

```bash
dsh plugin --profile web add design-vault-plugin
```

桌面端请使用应用内插件页；`desktop` profile 由应用管理。

## 验证

```bash
dsh --profile web --dump-config | grep -A2 "id: design-vault-plugin"
```

## 开发

```bash
pnpm install
pnpm verify   # 格式 → lint → 类型 → 测试 → 构建 → 打包
```
npm 也可用：`npm install && npm run verify`。

- `src/host/`：宿主半侧（Node）；
- `src/client/`：浏览器半侧，ModuleLoader 包装由 `tsdown.config.ts` 生成；
- `lib/`：构建产物，提交进仓库（`link:` 安装不会构建）；
- `tests/`：宿主与客户端测试；
- `AGENTS.md` / `llms.txt`：给 agent 的上下文；
- `PUBLISHING.md`：发布清单。

## 许可

MIT
