import fs from "node:fs";
import path from "node:path";
import type { z } from "zod";
import { dataDir, dataPath } from "./paths";

/** 读写失败要吵，不要静默——路径与错误码都带上 */
function fail(action: string, target: string, error: unknown): never {
  const code = (error as NodeJS.ErrnoException)?.code ?? "UNKNOWN";
  throw new Error(`${action} ${target} 失败（${code}）：${(error as Error).message}`);
}

export class DataValidationError extends Error {
  constructor(
    readonly file: string,
    readonly issues: z.ZodIssue[],
  ) {
    const detail = issues
      .map((issue) => `  · ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");
    super(`data/${file} 未通过 zod 校验：\n${detail}`);
    this.name = "DataValidationError";
  }
}

export function readCollection<T>(
  file: string,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  baseDir: string = dataDir(),
): T {
  const fullPath = path.join(baseDir, file);
  let raw: string;
  try {
    raw = fs.readFileSync(fullPath, "utf8").replace(/^\uFEFF/, "");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      // 纯净环境（首次 clone / 空 Vault）没有集合文件是正常的：
      // 静默创建空数组并返回，绝不让 Next 的预渲染崩溃。
      try {
        fs.mkdirSync(baseDir, { recursive: true });
        fs.writeFileSync(fullPath, "[]\n", "utf8");
      } catch {
        // 只读文件系统等场景：仍然返回空集合
      }
      const empty = schema.safeParse([]);
      return (empty.success ? empty.data : ([] as unknown as T));
    }
    fail("读取", fullPath, error);
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (error) {
    throw new Error(`data/${file} 不是合法 JSON：${(error as Error).message}`);
  }

  const result = schema.safeParse(json);
  if (!result.success) throw new DataValidationError(file, result.error.issues);
  return result.data;
}

/** 先写临时文件再 rename：避免写一半崩掉留下半截 JSON。 */
export function writeJsonAtomic(
  file: string,
  data: unknown,
  baseDir: string = dataDir(),
): void {
  const fullPath = path.join(baseDir, file);
  const tempPath = `${fullPath}.tmp`;
  try {
    fs.mkdirSync(baseDir, { recursive: true });
    fs.writeFileSync(tempPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    fs.renameSync(tempPath, fullPath);
  } catch (error) {
    fs.rmSync(tempPath, { force: true });
    fail("写入", fullPath, error);
  }
}

export { dataPath, dataDir };
