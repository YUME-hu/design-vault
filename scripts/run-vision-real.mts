/**
 * 一次性真实视觉链路：B 站直链（ffmpeg 远程只取前 60s）→ 3 帧 → sharp 拼图 → deepseek-flash → pending 0.7
 * 用法：npx tsx scripts/run-vision-real.mts BV1xxxxxxxxx
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { appendPending } from "@design-vault/adapters/ingest/pending-store";
import { analyzeImage } from "@design-vault/adapters/ingest/deepseek";
import { FRAMES_ROOT, resolveFfmpeg, runProcess, runVisionFallback } from "@design-vault/adapters/ingest/vision";
import { buildCookie, extractSessdata, getBuvid3, getPlayUrl } from "@design-vault/adapters/ingest/bilibili";
import { pendingItemSchema } from "@design-vault/adapters/schema";

const bvid = process.argv[2] ?? "BV1oFnQ6dEG4";
const env = fs.readFileSync(".env.local", "utf8");
const sess = extractSessdata(env.match(/BILIBILI_SESSDATA=(.*)/)?.[1]?.trim() ?? "");
const apiKey = env.match(/DEEPSEEK_API_KEY=(.*)/)?.[1]?.trim() ?? "";
const buvid = await getBuvid3({ cookie: "" });
const cookie = buildCookie(sess, buvid);

const play = await getPlayUrl(bvid, { cookie });
if (!play) throw new Error("拿不到直链");

const view = await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`, {
  headers: { Cookie: cookie, Referer: "https://www.bilibili.com/", "User-Agent": "Mozilla/5.0" },
}).then((r) => r.json());
const title = view?.data?.title ?? bvid;
const author = view?.data?.owner?.name ?? "";
const mid = view?.data?.owner?.mid ?? 0;
console.log("video", bvid, title, author);

const ffmpeg = resolveFfmpeg();

const vision = await runVisionFallback(
  {
    download: async (url, dest) => {
      // ffmpeg 直接读远程流，只取前 60 秒，不在本地存整片
      await runProcess(
        ffmpeg,
        [
          "-y",
          "-headers",
          "Referer: https://www.bilibili.com/\r\nUser-Agent: Mozilla/5.0\r\n",
          "-i",
          url,
          "-t",
          "60",
          "-c",
          "copy",
          dest,
        ],
        60_000,
      );
    },
    extractFrames: async (videoPath, outDir, duration) => {
      const frames: string[] = [];
      for (const fraction of [0.1, 0.5, 0.9]) {
        const out = path.join(outDir, `frame-${Math.round(fraction * 100)}.png`);
        await runProcess(
          ffmpeg,
          ["-y", "-ss", String(Math.max(0.5, duration * fraction)), "-i", videoPath, "-frames:v", "1", "-vf", "scale=640:-1", out],
          10_000,
        );
        if (fs.existsSync(out)) frames.push(out);
      }
      return frames;
    },
    analyze: (imagePath) => analyzeImage(imagePath, { apiKey }),
  },
  { bvid, durationSec: Math.min(60, play.durationSec), playUrl: play.url },
  (step, message) => console.log(`[${step}] ${message}`),
);

if (!vision.ok) {
  console.error("VISION FAILED:", vision.error);
  process.exit(1);
}

const now = new Date();
const item = pendingItemSchema.parse({
  id: crypto.randomUUID(),
  status: "pending",
  created_at: now.toISOString().slice(0, 10),
  confidence: 0.7,
  sources: [{ type: "bilibili-search", url: "", upstream: `${author} (${mid})`, video: bvid }],
  upstream_name: author,
  video_title: title,
  name: vision.visual.name,
  candidate: {
    name: vision.visual.name,
    frontend_prompt: vision.visual.summary,
    project_tags: vision.visual.project_tags,
  },
  color_direction: vision.visual.color_direction,
  duplicate_of: null,
  reasoning: "视觉模型分析拼图得出",
  notes: `来源：视觉截帧提取 ${vision.montagePath}`,
  raw_response: JSON.stringify(vision.visual),
});
appendPending([item]);

console.log("PENDING", item.id, item.name, item.confidence);
console.log("FRAMES", vision.frames.join(", "));
console.log("MONTAGE", vision.montagePath);
console.log("JSON", JSON.stringify(vision.visual, null, 2));
void os;
