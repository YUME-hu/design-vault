#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "未检测到 Node.js，请先安装 Node.js 22+：https://nodejs.org"
  exit 1
fi

if [ ! -f node_modules/next/package.json ]; then
  echo "首次运行：正在安装依赖..."
  corepack pnpm install
fi

exec node --import tsx scripts/launch.mts "$@"
