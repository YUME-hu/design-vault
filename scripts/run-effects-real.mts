import fs from "node:fs";
import crypto from "node:crypto";
import { buildCookie, extractSessdata, getBuvid3 } from "@design-vault/adapters/ingest/bilibili";
import { collectAllowedTags } from "@design-vault/adapters/ingest/tags";
import { extractStyle } from "@design-vault/adapters/ingest/deepseek";
import { appendPending } from "@design-vault/adapters/ingest/pending-store";
import { pendingItemSchema } from "@design-vault/adapters/schema";

const bvid = process.argv[2] ?? "BV1e5SCBiEQF";
const env = fs.readFileSync(".env.local", "utf8");
const sess = extractSessdata(env.match(/BILIBILI_SESSDATA=(.*)/)?.[1]?.trim() ?? "");
const apiKey = env.match(/DEEPSEEK_API_KEY=(.*)/)?.[1]?.trim() ?? "";
const buvid = await getBuvid3({ cookie: "" });
const cookie = buildCookie(sess, buvid);

const view = await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`, {
  headers: { Cookie: cookie, Referer: "https://www.bilibili.com/", "User-Agent": "Mozilla/5.0" },
}).then((r) => r.json());
const title = view?.data?.title ?? bvid;
const desc = view?.data?.desc ?? "";
const author = view?.data?.owner?.name ?? "";
const mid = view?.data?.owner?.mid ?? 0;
console.log("VIDEO", bvid, title, "| desc", desc.length, "chars");

const extraction = await extractStyle(
  { upstreamName: author, video: { bvid, title, desc, pubdate: 0 }, readme: desc, repoUrl: "", sourceKind: "readme" },
  { apiKey, allowedTags: collectAllowedTags() },
);

if (!extraction.ok) {
  console.error("EXTRACT FAILED", extraction.error);
  process.exit(1);
}
console.log("hasDesignInfo", extraction.hasDesignInfo);
console.log("EFFECTS", JSON.stringify(extraction.extractedEffects, null, 2));

if (extraction.hasDesignInfo && extraction.extractedEffects?.length) {
  const now = new Date();
  const item = pendingItemSchema.parse({
    id: crypto.randomUUID(),
    status: "pending",
    created_at: now.toISOString().slice(0, 10),
    confidence: 0.6,
    sources: [{ type: "bilibili-search", url: "", upstream: `${author} (${mid})`, video: bvid }],
    upstream_name: author,
    video_title: title,
    name: extraction.candidate.name ?? title,
    candidate: extraction.candidate,
    color_direction: extraction.colorDirection,
    duplicate_of: null,
    extracted_effects: extraction.extractedEffects,
    reasoning: extraction.reasoning,
    notes: "补丁验证：真实文本提取（含技术方案）",
    raw_response: extraction.raw,
  });
  appendPending([item]);
  console.log("PENDING", item.id, item.name, "effects", item.extracted_effects.length);
}
