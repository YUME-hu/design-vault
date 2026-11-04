import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { dataPath, vaultHome } from "./paths";

/**
 * B 站登录凭证的加密落盘：AES-256-GCM，key 来自 DESIGN_VAULT_SECRET。
 * 没有 key 就 fail closed（拒绝写入），不降级成明文。
 */

export type BiliSession = {
  uid: string;
  name: string;
  cookie: string;
  createdAt: string;
  expiresAt: string;
};

type Envelope = {
  v: 1;
  alg: "aes-256-gcm";
  iv: string;
  tag: string;
  ciphertext: string;
  createdAt: string;
};

export const SECRETS_DIR = path.join(vaultHome(), "data", "secrets");
export const SESSION_FILE = path.join(SECRETS_DIR, "bili-session.enc");

export function secretsKey(): Buffer | null {
  const raw = process.env.DESIGN_VAULT_SECRET?.trim();
  if (!raw) return null;
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) return null;
  return key;
}

export function secretsReady(): boolean {
  return secretsKey() !== null;
}

function readEnvelope(file: string): Envelope | null {
  if (!fs.existsSync(file)) return null;
  const parsed = JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "")) as Envelope;
  if (parsed.v !== 1 || parsed.alg !== "aes-256-gcm") {
    throw new Error(`无法识别的凭证格式：${file}`);
  }
  return parsed;
}

export function saveBiliSession(session: BiliSession, file: string = SESSION_FILE): void {
  const key = secretsKey();
  if (!key) {
    throw new Error("缺少 DESIGN_VAULT_SECRET（32 字节 base64），已拒绝写入登录凭证");
  }
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(session), "utf8"), cipher.final()]);
  const envelope: Envelope = {
    v: 1,
    alg: "aes-256-gcm",
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    ciphertext: ciphertext.toString("base64"),
    createdAt: session.createdAt,
  };

  const dir = path.dirname(file);
  fs.mkdirSync(dir, { recursive: true });
  const temp = `${file}.tmp`;
  fs.writeFileSync(temp, `${JSON.stringify(envelope, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  fs.renameSync(temp, file);
}

export function loadBiliSession(file: string = SESSION_FILE): BiliSession | null {
  const key = secretsKey();
  if (!key) return null;
  const envelope = readEnvelope(file);
  if (!envelope) return null;

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(envelope.iv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(envelope.tag, "base64"));
  const plain = Buffer.concat([
    decipher.update(Buffer.from(envelope.ciphertext, "base64")),
    decipher.final(),
  ]).toString("utf8");
  return JSON.parse(plain) as BiliSession;
}

export function clearBiliSession(file: string = SESSION_FILE): void {
  fs.rmSync(file, { force: true });
}

export { dataPath };
