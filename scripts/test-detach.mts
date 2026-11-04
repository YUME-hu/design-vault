/**
 * 验证「杀掉父进程后 Web 服务依然存活」。
 * 用法：npx tsx scripts/test-detach.mts
 */
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import process from "node:process";

const ROOT = process.cwd();
const PID_FILE = ".run/web.pid";

function health(): Promise<boolean> {
  return fetch("http://127.0.0.1:3000/api/health", { cache: "no-store" })
    .then((response) => response.ok)
    .catch(() => false);
}

async function waitForHealth(timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await health()) return true;
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  return false;
}

const wrapper = spawn(process.execPath, ["--import", "tsx", "scripts/launch.mts", "--no-open"], {
  cwd: ROOT,
  detached: true,
  stdio: "ignore",
  windowsHide: true,
});
wrapper.unref();

console.log("等待服务就绪…");
if (!(await waitForHealth(180_000))) {
  console.error("✗ 服务没有起来，测试中止");
  process.exit(1);
}
const serverPid = fs.readFileSync(PID_FILE, "utf8").trim();
console.log(`✓ 服务已就绪，PID ${serverPid}，父进程 PID ${wrapper.pid}`);

// 杀掉父进程及其进程树，模拟「关闭黑框 / 退出 DSH」
if (process.platform === "win32") {
  spawnSync("taskkill", ["/PID", String(wrapper.pid), "/T", "/F"], { stdio: "ignore" });
} else {
  try {
    process.kill(-(wrapper.pid ?? 0), "SIGKILL");
  } catch {
    // ignore
  }
}
await new Promise((resolve) => setTimeout(resolve, 3000));

const alive = await health();
const exists = spawnSync("tasklist", ["/FI", `PID eq ${serverPid}`], { encoding: "utf8" }).stdout?.includes(serverPid);
console.log(alive ? "✓ 父进程已杀，服务仍然可访问" : "✗ 服务随父进程死亡");
console.log(exists ? "✓ Node 进程仍在任务管理器可见" : "✗ 找不到 Node 进程");
process.exit(alive && exists ? 0 : 1);
