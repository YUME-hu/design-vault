@echo off
chcp 65001 >nul
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo 未检测到 Node.js。请先安装 Node.js 22 或更新版本：https://nodejs.org
  pause
  exit /b 1
)

if not exist "node_modules\next\package.json" (
  echo.
  echo 首次运行：正在安装依赖，请保持网络连接...
  corepack pnpm install
  if errorlevel 1 (
    echo 依赖安装失败，请检查网络后重试。
    pause
    exit /b 1
  )
)

call "node_modules\.bin\tsx.cmd" scripts\launch.mts %*
if errorlevel 1 pause
