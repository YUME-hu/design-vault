// REAL DATA GUARD：只允许通过 npm run verify:all（隔离 Vault）运行。
// 直接运行会触碰真实 data/，必须显式设置 ALLOW_REAL_DATA=1 才放行。
if (!process.env.DESIGN_VAULT_HOME && process.env.ALLOW_REAL_DATA !== "1") {
  console.error("拒绝直接运行：请使用 npm run verify:all（隔离临时 Vault）。若确需直接跑，设置 ALLOW_REAL_DATA=1。");
  process.exit(1);
}

import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { qrStatusFromCode, parseSetCookieHeaders } from "@design-vault/core/auth/bili-qr";

const results: { name: string; ok: boolean; detail?: string }[] = [];
const record = (name: string, ok: boolean, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? `  — ${detail}` : ""}`);
};

// 1) 扫码状态机 + Set-Cookie 解析
record(
  "扫码状态码映射",
  ["confirmed", "waiting", "scanned", "expired", "unknown"].join(",") ===
    [0, 86101, 86090, 86038, 999].map(qrStatusFromCode).join(","),
);

const parsed = parseSetCookieHeaders([
  "SESSDATA=abc; Path=/; Expires=Wed, 01 Jan 2027 00:00:00 GMT",
  "DedeUserID=42; Path=/",
  "bili_jct=tok; Path=/",
  "other=1; Path=/",
]);
record(
  "Set-Cookie 解析只保留登录相关、带 uid 与过期时间",
  parsed.cookie.includes("SESSDATA=abc") &&
    parsed.cookie.includes("DedeUserID=42") &&
    !parsed.cookie.includes("other=") &&
    parsed.uid === "42" &&
    parsed.expiresAt.startsWith("2027-01-01"),
  parsed.cookie,
);

// 2) 加密落盘
const home = fs.mkdtempSync(path.join(os.tmpdir(), "dv-m6-"));
process.env.DESIGN_VAULT_HOME = home;
process.env.DESIGN_VAULT_SECRET = crypto.randomBytes(32).toString("base64");

const secrets = await import("@design-vault/store/secrets");
const session = await import("@design-vault/adapters/auth/session");

const now = new Date();
secrets.saveBiliSession({
  uid: "42",
  name: "UP",
  cookie: "SESSDATA=abc; bili_jct=tok",
  createdAt: now.toISOString(),
  expiresAt: new Date(now.getTime() + 86400_000).toISOString(),
});
const loaded = secrets.loadBiliSession();
record("加密落盘后可解密读回", loaded?.uid === "42" && loaded?.cookie.includes("SESSDATA=abc"));

const file = path.join(home, "data", "secrets", "bili-session.enc");
const envelope = JSON.parse(fs.readFileSync(file, "utf8")) as { ciphertext: string };
const original = fs.readFileSync(file, "utf8");
envelope.ciphertext = Buffer.from("tampered").toString("base64");
fs.writeFileSync(file, JSON.stringify(envelope));
let tamperedThrew = false;
try {
  secrets.loadBiliSession();
} catch {
  tamperedThrew = true;
}
record("密文被篡改时解密失败（GCM 认证）", tamperedThrew);
fs.writeFileSync(file, original);

record(
  "加密会话优先于环境变量",
  session.getBiliCookie().source === "session" &&
    session.getBiliCookie().cookie.includes("SESSDATA=abc"),
);

secrets.clearBiliSession();
process.env.BILIBILI_SESSDATA = "SESSDATA=env-only";
record("无加密凭证时回退环境变量", session.getBiliCookie().source === "env");
delete process.env.BILIBILI_SESSDATA;
record("两者都没有时返回 none", session.getBiliCookie().source === "none");

// 3) fail closed
process.env.DESIGN_VAULT_SECRET = "";
let failClosed = false;
try {
  secrets.saveBiliSession({
    uid: "1",
    name: "",
    cookie: "SESSDATA=x",
    createdAt: now.toISOString(),
    expiresAt: now.toISOString(),
  });
} catch (error) {
  failClosed = (error as Error).message.includes("DESIGN_VAULT_SECRET");
}
record("没有 key 时拒绝落盘（fail closed）", failClosed && !fs.existsSync(file));

fs.rmSync(home, { recursive: true, force: true });

const failed = results.filter((item) => !item.ok);
console.log("");
if (failed.length > 0) {
  console.log(`✗ ${failed.length}/${results.length} 项未通过`);
  process.exit(1);
}
console.log(`✓ 全部 ${results.length} 项通过`);
