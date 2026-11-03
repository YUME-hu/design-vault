/**
 * 数据备份：data/*.json + config/upstreams.json → backup/design-vault-YYYYMMDD-HHmmss.zip
 * 只保留最近 10 份。
 *   npx tsx scripts/backup.mts
 *   npx tsx scripts/backup.mts --dir D:\backups
 */
import fs from "node:fs";
import path from "node:path";
import AdmZip from "adm-zip";

const args = process.argv.slice(2);
const dirIndex = args.indexOf("--dir");
const backupDir = dirIndex >= 0 && args[dirIndex + 1] ? path.resolve(args[dirIndex + 1]) : path.join(process.cwd(), "backup");
const keep = 10;

function stamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

const dataDir = path.join(process.cwd(), "data");
const configFile = path.join(process.cwd(), "config", "upstreams.json");
const zip = new AdmZip();
let entries = 0;

for (const file of fs.readdirSync(dataDir)) {
  if (!file.endsWith(".json")) continue;
  zip.addLocalFile(path.join(dataDir, file), "data");
  entries += 1;
}
if (fs.existsSync(configFile)) {
  zip.addLocalFile(configFile, "config");
  entries += 1;
}

if (entries === 0) {
  console.error("没有可备份的数据");
  process.exit(1);
}

fs.mkdirSync(backupDir, { recursive: true });
const target = path.join(backupDir, `design-vault-${stamp(new Date())}.zip`);
zip.writeZip(target);

// 清理旧备份，只留最近 keep 份
const backups = fs
  .readdirSync(backupDir)
  .filter((name) => /^design-vault-\d{8}-\d{6}\.zip$/.test(name))
  .sort()
  .reverse();
for (const old of backups.slice(keep)) {
  fs.rmSync(path.join(backupDir, old), { force: true });
}

console.log(JSON.stringify({ ok: true, target, entries, kept: Math.min(backups.length, keep) }));
