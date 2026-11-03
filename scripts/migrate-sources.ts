/**
 * 数据迁移：source -> sources 数组（M3a）
 * 老文件里每条记录只有 `source`，这里包成 `sources: [source]`，保留缩进与结尾换行。
 * 幂等：已经是 sources 的记录不动。
 */
import fs from "node:fs";
import path from "node:path";

const FILES = ["data/styles.json", "data/styles.draft.json", "data/pending.json"];

let total = 0;

for (const file of FILES) {
  const full = path.join(process.cwd(), file);
  if (!fs.existsSync(full)) {
    console.log(`- ${file}: 不存在，跳过`);
    continue;
  }

  const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
  const json = JSON.parse(raw) as unknown;
  if (!Array.isArray(json)) {
    console.log(`- ${file}: 不是数组，跳过`);
    continue;
  }

  let changed = 0;
  const next = json.map((item) => {
    if (item && typeof item === "object" && !("related_effects" in item)) {
      (item as Record<string, unknown>).related_effects = [];
      changed += 1;
    }
    if (!item || typeof item !== "object") return item;
    const record = item as Record<string, unknown>;
    if (!("source" in record) || "sources" in record) return item;
    const { source, ...rest } = record;
    changed += 1;
    return { ...rest, sources: [source] };
  });

  if (changed > 0) {
    const temp = `${full}.tmp`;
    fs.writeFileSync(temp, `${JSON.stringify(next, null, 2)}\n`, "utf8");
    fs.renameSync(temp, full);
  }

  total += changed;
  console.log(`- ${file}: 迁移 ${changed} 条`);
}

console.log(`\n完成：共迁移 ${total} 条记录。`);
