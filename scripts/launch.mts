/**
 * Design Vault 一键启动器（给不想碰终端的同学）。
 *
 *   node --import tsx scripts/launch.mts          # 首次自动安装/构建，后台起 Web，开浏览器
 *   node --import tsx scripts/launch.mts --dev    # 用 dev 模式启动
 *   node --import tsx scripts/launch.mts stop     # 停止后台服务
 *   --no-open / --port <n> / --rebuild
 */
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const RUN_DIR = path.join(ROOT, ".run");
const PID_FILE = path.join(RUN_DIR, "web.pid");
const LOG_FILE = path.join(RUN_DIR, "web.log");
const BUILD_ID = path.join(ROOT, "apps", "web", ".next", "BUILD_ID");

const argv = process.argv.slice(2);
const stop = argv.includes("stop");
const dev = argv.includes("--dev");
const noOpen = argv.includes("--no-open");
const rebuild = argv.includes("--rebuild");
const portIndex = argv.indexOf("--port");
const port = portIndex >= 0 ? Number(argv[portIndex + 1]) || 3000 : Number(process.env.PORT) || 3000;

function say(message: string) {
  console.log(`\n[design-vault] ${message}`);
}

function fail(message: string): never {
  console.error(`\n[design-vault] ✖ ${message}`);
  process.exit(1);
}

function run(command: string, args: string[], options: { quiet?: boolean } = {}) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    stdio: options.quiet ? "ignore" : "inherit",
    shell: process.platform === "win32",
    env: process.env,
  });
  return result.status ?? 1;
}

function hasCommand(name: string): boolean {
  const probe = spawnSync(process.platform === "win32" ? "where" : "which", [name], { stdio: "ignore" });
  return probe.status === 0;
}

function ensureDependencies() {
  const marker = path.join(ROOT, "node_modules", "next", "package.json");
  if (fs.existsSync(marker) && !rebuild) return;
  say("第一次运行，正在安装依赖（可能需要几分钟，请保持网络）…");
  const command = hasCommand("pnpm") ? "pnpm" : "corepack";
  const args = command === "pnpm" ? ["install"] : ["pnpm", "install"];
  if (run(command, args) !== 0) fail("依赖安装失败，请检查网络后重试");
}

function currentCommit(): string {
  try {
    const result = spawnSync("git", ["rev-parse", "HEAD"], { cwd: ROOT, encoding: "utf8" });
    return result.status === 0 ? result.stdout.trim() : "";
  } catch {
    return "";
  }
}

function ensureDataDir() {
  const dataDir = path.join(ROOT, "data");
  fs.mkdirSync(dataDir, { recursive: true });
  const defaults: Record<string, string> = {
    "styles.json": "[]\n",
    "styles.draft.json": "[]\n",
    "pending.json": "[]\n",
    "effects.json": "[]\n",
    "components.json": "[]\n",
    "refs.json": "[]\n",
    "ingest-state.json": "{}\n",
  };
  for (const [file, body] of Object.entries(defaults)) {
    const full = path.join(dataDir, file);
    if (!fs.existsSync(full)) fs.writeFileSync(full, body, "utf8");
  }
}

function ensureBuild() {
  if (dev) return;
  const stampFile = path.join(RUN_DIR, "build.commit");
  const commit = currentCommit();
  const stamp = fs.existsSync(stampFile) ? fs.readFileSync(stampFile, "utf8").trim() : "";
  if (fs.existsSync(BUILD_ID) && !rebuild && (!commit || stamp === commit)) return;
  say("正在构建 Web（首次较慢）…");
  if (run("corepack", ["pnpm", "--filter", "@design-vault/web", "build"]) !== 0) {
    fail("构建失败，请把上面的报错发给维护者");
  }
  if (commit) fs.writeFileSync(stampFile, commit);
}

function portInUse(value: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.connect({ host: "127.0.0.1", port: value }, () => {
      socket.destroy();
      resolve(true);
    });
    socket.on("error", () => resolve(false));
    socket.setTimeout(800, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function waitForHealth(timeoutMs = 90_000): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/health`, { cache: "no-store" });
      if (response.ok) return true;
    } catch {
      // 还没起来
    }
    await new Promise((resolve) => setTimeout(resolve, 1200));
  }
  return false;
}

function openBrowser(url: string) {
  if (noOpen) return;
  try {
    if (process.platform === "win32") {
      spawn("cmd", ["/c", "start", "", url], { detached: true, stdio: "ignore" }).unref();
    } else if (process.platform === "darwin") {
      spawn("open", [url], { detached: true, stdio: "ignore" }).unref();
    } else {
      spawn("xdg-open", [url], { detached: true, stdio: "ignore" }).unref();
    }
  } catch {
    say(`自动打开浏览器失败，请手动访问 ${url}`);
  }
}

function portOwner(): number {
  if (process.platform !== "win32") return 0;
  const result = spawnSync("netstat", ["-ano"], { encoding: "utf8", windowsHide: true });
  for (const line of (result.stdout ?? "").split(/\r?\n/)) {
    if (!/[:.]3000\s/.test(line) || !/LISTENING/i.test(line)) continue;
    const parts = line.trim().split(/\s+/);
    const pid = Number(parts[parts.length - 1]);
    if (Number.isFinite(pid) && pid > 0) return pid;
  }
  return 0;
}

function stopServer() {
  const recorded = fs.existsSync(PID_FILE) ? Number(fs.readFileSync(PID_FILE, "utf8").trim()) : 0;
  fs.rmSync(PID_FILE, { force: true });
  const pid = recorded || portOwner();
  if (!pid) {
    say("没有找到后台服务记录（可能没启动过）");
    return;
  }
  try {
    if (process.platform === "win32") {
      spawnSync("taskkill", ["/PID", String(pid), "/T", "/F"], { stdio: "ignore" });
    } else {
      process.kill(-pid, "SIGTERM");
    }
    say(`已停止 Web 服务（PID ${pid}）`);
  } catch {
    say(`进程 ${pid} 可能已经退出`);
  }
}

async function main() {
  if (stop) {
    stopServer();
    return;
  }

  fs.mkdirSync(RUN_DIR, { recursive: true });

  if (await portInUse(port)) {
    const response = await fetch(`http://127.0.0.1:${port}/api/health`).catch(() => null);
    if (response?.ok) {
      say(`服务已经在 http://localhost:${port} 运行`);
      openBrowser(`http://localhost:${port}`);
      return;
    }
    fail(`端口 ${port} 被其他程序占用，请先关闭它（或设置 PORT=其他端口）`);
  }

  if (!hasCommand("node")) fail("没有检测到 Node.js，请先安装 Node 22+");

  ensureDependencies();
  ensureDataDir();
  ensureBuild();

  const webDir = path.join(ROOT, "apps", "web");
  const nextBin = [
    path.join(webDir, "node_modules", "next", "dist", "bin", "next"),
    path.join(ROOT, "node_modules", "next", "dist", "bin", "next"),
  ].find((candidate) => fs.existsSync(candidate));
  if (!nextBin) fail("找不到 Next.js 可执行文件，请先安装依赖");

  say(dev ? "正在后台启动开发服务…" : "正在后台启动 Web 服务…");

  // 启动脚本写到 .run/boot.cmd：WMI 创建进程时无法传 cwd/env，统一在这里设置。
  const bootPath = path.join(RUN_DIR, "boot.cmd");
  fs.writeFileSync(
    bootPath,
    [
      "@echo off",
      `cd /d "${webDir}"`,
      `set "PORT=${port}"`,
      `set "NODE_ENV=${dev ? "development" : "production"}"`,
      `"${process.execPath}" "${nextBin}" ${dev ? "dev" : "start"} >> "${LOG_FILE}" 2>&1`,
      "",
    ].join("\r\n"),
  );

  // 直接用 node 启动 Next：windowsHide 让子进程没有控制台窗口，
  // detached + unref 让它脱离当前终端（关掉黑框不会结束服务）。
  const child = spawn(process.execPath, [nextBin, dev ? "dev" : "start"], {
    cwd: webDir,
    detached: true,
    windowsHide: true,
    stdio: "ignore",
    env: { ...process.env, PORT: String(port), NODE_ENV: dev ? "development" : "production" },
  });
  child.unref();
  const pid = child.pid ?? 0;

  if (pid) fs.writeFileSync(PID_FILE, String(pid));

  const healthy = await waitForHealth();
  if (!healthy) {
    say(`服务没有在预期时间内就绪，请查看日志：${LOG_FILE}`);
    stopServer();
    process.exit(1);
  }

  const url = `http://localhost:${port}`;
  say(`就绪：${url}`);
  say(`日志：${LOG_FILE} · 停止：node --import tsx scripts/launch.mts stop`);
  openBrowser(url);
}

main().catch((error) => fail((error as Error).message));
