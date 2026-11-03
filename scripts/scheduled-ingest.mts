/**
 * 定时抓取入口（不绑定任何 cron）：
 *   npx tsx scripts/scheduled-ingest.mts --all
 *   npx tsx scripts/scheduled-ingest.mts --upstream 40238601 --upstream 35328143
 * 由 Windows 任务计划程序 / GitHub Actions 定期调用即可。
 */
import fs from "node:fs";
import path from "node:path";
import { getSnapshot, startIngest } from "../lib/ingest/job";

// 手动加载 .env.local（脚本不该依赖框架的 env 注入）
const envFile = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match) process.env[match[1]] ??= match[2].replace(/^["']|["']$/g, "");
  }
}

const args = process.argv.slice(2);
const upstreams: string[] = [];
for (let index = 0; index < args.length; index += 1) {
  if (args[index] === "--upstream") {
    const value = args[index + 1];
    if (value) upstreams.push(value);
    index += 1;
  }
}

if (args.includes("--help") || args.includes("-h")) {
  console.log("用法：scheduled-ingest.mts --all | --upstream <uid> [--upstream <uid>...]");
  process.exit(0);
}

const started = startIngest({ upstreams: upstreams.length > 0 ? upstreams : undefined });
if (!started.ok) {
  console.error(`启动失败：${started.error}`);
  process.exit(1);
}

console.log(`任务已启动 ${started.jobId}（${upstreams.length > 0 ? upstreams.join(", ") : "全部订阅"}）`);

const deadline = Date.now() + 30 * 60 * 1000;
while (Date.now() < deadline) {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const snapshot = getSnapshot();
  if (!snapshot || snapshot.jobId !== started.jobId) continue;
  if (snapshot.status === "running") continue;

  const result = snapshot.result;
  console.log(
    JSON.stringify(
      {
        status: snapshot.status,
        added: result?.summary.added ?? 0,
        skipped: result?.summary.skipped ?? 0,
        failed: result?.summary.failed ?? 0,
        failures: result?.summary.failures ?? [],
        duplicates: result?.summary.duplicates ?? [],
        error: result?.error?.message ?? "",
      },
      null,
      2,
    ),
  );
  process.exit(snapshot.status === "done" ? 0 : 1);
}

console.error("任务超时（30 分钟）");
process.exit(1);
