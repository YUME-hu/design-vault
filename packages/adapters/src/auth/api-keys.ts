import { loadNamedSecret } from "@design-vault/store/secrets";

/** 加密保存的 key 优先（朋友不配 env 也能用），其次环境变量（兼容老用户 / CI） */
export function getDeepSeekKey(): string {
  const saved = loadNamedSecret("deepseek").trim();
  if (saved) return saved;
  return process.env.DEEPSEEK_API_KEY?.trim() ?? "";
}

export function deepSeekKeySource(): "encrypted" | "env" | "none" {
  if (loadNamedSecret("deepseek").trim()) return "encrypted";
  if (process.env.DEEPSEEK_API_KEY?.trim()) return "env";
  return "none";
}
