import path from "node:path";

/**
 * 所有落盘路径的唯一来源：
 * - DESIGN_VAULT_HOME 未配置时回退到 process.cwd()，clone 下来即可跑
 * - 一律 path.join，跨 Windows / macOS / Linux
 */
export function vaultHome(): string {
  const configured = process.env.DESIGN_VAULT_HOME?.trim();
  return configured ? path.resolve(configured) : process.cwd();
}

export function dataDir(): string {
  return path.join(vaultHome(), "data");
}

export function dataPath(file: string): string {
  return path.join(dataDir(), file);
}

export function configPath(...segments: string[]): string {
  return path.join(vaultHome(), "config", ...segments);
}
