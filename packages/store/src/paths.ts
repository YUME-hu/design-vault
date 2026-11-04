import fs from "node:fs";
import path from "node:path";

/**
 * 所有落盘路径的唯一来源：
 * - DESIGN_VAULT_HOME 未配置时回退到 process.cwd()，clone 下来即可跑
 * - 一律 path.join，跨 Windows / macOS / Linux
 */
export function workspaceRoot(start: string = process.cwd()): string {
  let dir = path.resolve(start);
  for (;;) {
    if (fs.existsSync(path.join(dir, "pnpm-workspace.yaml"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return path.resolve(start);
    dir = parent;
  }
}

export function vaultPointer(): string {
  const file = path.join(workspaceRoot(), ".design-vault-home");
  try {
    if (!fs.existsSync(file)) return "";
    const value = fs.readFileSync(file, "utf8").trim();
    return value ? path.resolve(value) : "";
  } catch {
    return "";
  }
}

export function vaultHomeSource(): "env" | "pointer" | "workspace" {
  if (process.env.DESIGN_VAULT_HOME?.trim()) return "env";
  if (vaultPointer()) return "pointer";
  return "workspace";
}

export function vaultHome(): string {
  const configured = process.env.DESIGN_VAULT_HOME?.trim();
  if (configured) return path.resolve(configured);
  const pointer = vaultPointer();
  return pointer || workspaceRoot();
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
