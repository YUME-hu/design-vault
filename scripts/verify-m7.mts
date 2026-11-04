import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { parseFavFolders, parseFavVideos, filterNewVideos } from "@design-vault/core/favorites";
import { readIngestState, writeIngestState, ingestStateSchema } from "@design-vault/store/state";

const results: { name: string; ok: boolean; detail?: string }[] = [];
const record = (name: string, ok: boolean, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? `  — ${detail}` : ""}`);
};

// 1) 收藏夹解析
const folders = parseFavFolders({
  data: {
    list: [
      { id: 123, title: "设计灵感", media_count: 42 },
      { id: "456", title: "动效", media_count: 7 },
      { id: 789, title: "" },
      { id: null, title: "坏数据" },
    ],
  },
});
record(
  "收藏夹解析：保留合法项、数字 id 转字符串",
  folders.length === 2 && folders[0].id === "123" && folders[1].count === 7,
  folders.map((folder) => `${folder.id}:${folder.title}`).join(", "),
);
record("空 payload 返回空数组", parseFavFolders(null).length === 0);

// 2) 视频解析
const page = parseFavVideos({
  data: {
    has_more: true,
    info: { media_count: 42 },
    medias: [
      { bvid: "BV1", title: "A", upper: { name: "UP-A" }, cover: "//i0.hdslb.com/a.jpg", duration: 120, pubtime: 100 },
      { bvid: "BV2", title: "B", upper: { name: "UP-B" }, cover: "https://i0.hdslb.com/b.jpg", duration: 60, pubtime: 200 },
      { title: "没有 bvid" },
    ],
  },
});
record(
  "收藏夹视频解析：封面补协议、带 UP 与时长",
  page.videos.length === 2 &&
    page.videos[0].cover === "https://i0.hdslb.com/a.jpg" &&
    page.videos[1].author === "UP-B" &&
    page.hasMore === true &&
    page.total === 42,
  `${page.videos.length} 条 · hasMore ${page.hasMore}`,
);

// 3) 增量过滤
const videos = page.videos;
record(
  "增量过滤：只保留 pubtime 更新的视频",
  filterNewVideos(videos, 150).length === 1 && filterNewVideos(videos, 150)[0].bvid === "BV2",
);
record("lastPubtime 为 0 时返回全部", filterNewVideos(videos, 0).length === 2);

// 4) 状态读写
const home = fs.mkdtempSync(path.join(os.tmpdir(), "dv-m7-"));
process.env.DESIGN_VAULT_HOME = home;
const file = path.join(home, "state.json");
const base = ingestStateSchema.parse({});
record("旧状态文件缺少 favorites 时默认空对象", Object.keys(base.favorites).length === 0);

writeIngestState(
  {
    ...base,
    favorites: {
      "123": { title: "设计灵感", lastScannedAt: "2026-11-05T00:00:00Z", lastVideoPubtime: 200, lastPage: 2 },
    },
  },
  file,
);
const loaded = readIngestState(file);
record(
  "收藏夹游标可写入并读回",
  loaded.favorites["123"]?.lastVideoPubtime === 200 && loaded.favorites["123"]?.lastPage === 2,
  JSON.stringify(loaded.favorites["123"]),
);

fs.rmSync(home, { recursive: true, force: true });

const failed = results.filter((item) => !item.ok);
console.log("");
if (failed.length > 0) {
  console.log(`✗ ${failed.length}/${results.length} 项未通过`);
  process.exit(1);
}
console.log(`✓ 全部 ${results.length} 项通过`);
