/**
 * 隔离验收：把真实 data/ 与 config/ 临时换成副本，所有套件与隔离 Web 都跑在副本上，
 * 结束后（含异常）恢复真实目录。真实数据在测试期间不会被任何套件写入。
 *
 *   npx tsx scripts/verify-all.mts            # 全部 14 套
 *   npx tsx scripts/verify-all.mts m0 m9      # 只跑指定套件
 *
 * 安全性：
 * - 交换前写 `.verify-backup/marker.json` 标记；若上次异常退出留下标记，下一次启动先自动恢复；
 * - finally 中无论成败都恢复 data/ 与 config/；
 * - 套件 cwd 保持仓库根（脚本路径、backup.mts 等相对路径不变）。
 */
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";

const ROOT = process.cwd();
const PORT = Number(process.env.VERIFY_PORT ?? 3100);
const HOST = "127.0.0.1";
const BASE = `http://${HOST}:${PORT}`;
const BACKUP = path.join(ROOT, ".verify-backup");
const MARKER = path.join(BACKUP, "marker.json");

const SUITES: { name: string; file: string }[] = [
  { name: "m0", file: "verify-m0.mjs" },
  { name: "m1a", file: "verify-m1a.mjs" },
  { name: "m1b", file: "verify-m1b.mjs" },
  { name: "m2a", file: "verify-m2a.mts" },
  { name: "m2b", file: "verify-m2b.mts" },
  { name: "m3a", file: "verify-m3a.mts" },
  { name: "m3b", file: "verify-m3b.mts" },
  { name: "m4a", file: "verify-m4a.mts" },
  { name: "m4b", file: "verify-m4b.mts" },
  { name: "m5", file: "verify-m5.mts" },
  { name: "m6", file: "verify-m6.mts" },
  { name: "m7", file: "verify-m7.mts" },
  { name: "m8", file: "verify-m8.mts" },
  { name: "m9", file: "verify-m9.mts" },
];

const selected = process.argv.slice(2);
const suites = selected.length > 0 ? SUITES.filter((suite) => selected.includes(suite.name)) : SUITES;

function say(message: string): void {
  console.log(`\n[verify-all] ${message}`);
}

async function health(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE}/api/health`, { cache: "no-store" });
    return response.ok;
  } catch {
    return false;
  }
}

async function waitHealth(timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await health()) return true;
    await new Promise((resolve) => setTimeout(resolve, 1200));
  }
  return false;
}

function portFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => server.close(() => resolve(true)));
    server.listen(port, HOST);
  });
}

function recoverIfNeeded(): void {
  if (!fs.existsSync(MARKER)) return;
  say("发现上次未恢复的备份标记，先自动恢复…");
  const marker = JSON.parse(fs.readFileSync(MARKER, "utf8")) as { data: string; config: string };
  for (const kind of ["data", "config"] as const) {
    const live = path.join(ROOT, kind);
    const backup = marker[kind];
    if (fs.existsSync(backup)) {
      fs.rmSync(live, { recursive: true, force: true });
      fs.renameSync(backup, live);
    }
  }
  fs.rmSync(BACKUP, { recursive: true, force: true });
}

function swapIn(): void {
  fs.rmSync(BACKUP, { recursive: true, force: true });
  fs.mkdirSync(BACKUP, { recursive: true });
  const marker = { data: path.join(BACKUP, "data"), config: path.join(BACKUP, "config") };
  fs.writeFileSync(MARKER, `${JSON.stringify(marker, null, 2)}\n`, "utf8");

  for (const kind of ["data", "config"] as const) {
    const live = path.join(ROOT, kind);
    const backup = marker[kind];
    if (fs.existsSync(live)) fs.renameSync(live, backup);
    fs.mkdirSync(live, { recursive: true });
    if (fs.existsSync(backup)) fs.cpSync(backup, live, { recursive: true });
  }
}

function swapOut(): void {
  if (!fs.existsSync(MARKER)) return;
  const marker = JSON.parse(fs.readFileSync(MARKER, "utf8")) as { data: string; config: string };
  for (const kind of ["data", "config"] as const) {
    const live = path.join(ROOT, kind);
    const backup = marker[kind];
    if (!fs.existsSync(backup)) continue;
    fs.rmSync(live, { recursive: true, force: true });
    fs.renameSync(backup, live);
  }
  fs.rmSync(BACKUP, { recursive: true, force: true });
}

function runSuite(suite: { name: string; file: string }): Promise<number> {
  return new Promise((resolve) => {
    const script = path.join(ROOT, "scripts", suite.file);
    const isTs = suite.file.endsWith(".mts") || suite.file.endsWith(".ts");
    const tsxCli = path.join(ROOT, "node_modules", "tsx", "dist", "cli.mjs");
    const args = isTs ? [tsxCli, script] : [script];
    const child = spawn(process.execPath, args, {
      cwd: ROOT,
      env: {
        ...process.env,
        DESIGN_VAULT_HOME: ROOT,
        VERIFY_BASE_URL: BASE,
        PORT: String(PORT),
        VERIFY_PORT: String(PORT),
      },
      stdio: "inherit",
    });
    child.on("exit", (code) => resolve(code ?? 1));
  });
}

let server: ReturnType<typeof spawn> | null = null;

try {
  recoverIfNeeded();

  if (!(await portFree(PORT))) {
    throw new Error(`端口 ${PORT} 被占用；设置 VERIFY_PORT 换一个`);
  }
  if (!fs.existsSync(path.join(ROOT, "apps", "web", ".next", "BUILD_ID"))) {
    say("没有构建产物，先 next build…");
    const build = spawnSync("corepack", ["pnpm", "--filter", "@design-vault/web", "build"], {
      cwd: ROOT,
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    if (build.status !== 0) throw new Error("构建失败");
  }

  swapIn();
  say("真实 data/ 与 config/ 已备份，套件运行在副本上（测试结束后恢复）");

  const nextBin = [
    path.join(ROOT, "apps", "web", "node_modules", "next", "dist", "bin", "next"),
    path.join(ROOT, "node_modules", "next", "dist", "bin", "next"),
  ].find((candidate) => fs.existsSync(candidate));
  if (!nextBin) throw new Error("找不到 next 可执行文件");

  say(`在 ${BASE} 启动隔离 Web…`);
  server = spawn(process.execPath, [nextBin, "start"], {
    cwd: path.join(ROOT, "apps", "web"),
    env: { ...process.env, DESIGN_VAULT_HOME: ROOT, PORT: String(PORT), NODE_ENV: "production" },
    stdio: "ignore",
    windowsHide: true,
  });
  if (!(await waitHealth(120_000))) throw new Error("隔离 Web 未就绪");
  say("隔离 Web 就绪，开始跑套件");

  const failed: string[] = [];
  for (const suite of suites) {
    say(`▶ ${suite.name}`);
    const code = await runSuite(suite);
    if (code !== 0) {
      failed.push(suite.name);
      console.log(`✗ ${suite.name} 退出码 ${code}`);
    } else {
      console.log(`✓ ${suite.name}`);
    }
  }

  if (failed.length > 0) {
    console.log(`\n[verify-all] ✗ 失败：${failed.join(", ")}`);
    process.exitCode = 1;
  } else {
    console.log(`\n[verify-all] ✓ ${suites.length} 套全部通过（数据已隔离）`);
  }
} catch (error) {
  console.error(`\n[verify-all] ✖ ${(error as Error).message}`);
  process.exitCode = 1;
} finally {
  if (server?.pid) {
    spawnSync(
      process.platform === "win32" ? "taskkill" : "kill",
      process.platform === "win32" ? ["/PID", String(server.pid), "/T", "/F"] : ["-9", String(-server.pid)],
      { stdio: "ignore" },
    );
  }
  try {
    swapOut();
    say("真实 data/ 与 config/ 已恢复");
  } catch (error) {
    console.error(`[verify-all] 恢复失败：${(error as Error).message}（备份在 ${BACKUP}）`);
    process.exitCode = 1;
  }
}
