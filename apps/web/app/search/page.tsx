import type { Metadata } from "next";
import { SearchWorkspace } from "@/components/search/search-workspace";
import { ffmpegStatus } from "@design-vault/adapters/ingest/vision";

export const metadata: Metadata = {
  title: "特化搜索",
  description: "按关键词搜 B 站视频，把结果直接提取成 pending 候选。",
};

export const dynamic = "force-dynamic";

export default function SearchPage() {
  const hasSessdata = Boolean(process.env.BILIBILI_SESSDATA);
  const ffmpeg = ffmpegStatus();

  return (
    <div className="px-4 pb-10 pt-7 sm:px-6 lg:px-8">
      <div className="border-b border-charcoal pb-5">
        <p className="label-strong flex items-center gap-2">
          <span aria-hidden className="h-[6px] w-[6px] bg-signal" />
          INDEX 07 / SEARCH · M3a
        </p>
        <h1 className="mt-3 text-balance text-[28px] font-bold leading-[1.15] text-charcoal sm:text-[40px]">
          特化搜索
        </h1>
        <p className="mt-3 max-w-[56ch] text-[13px] leading-[1.9] text-ink-soft">
          想到什么就搜什么：风格名、技术栈、配色关键词。搜到的视频可以直接提取成候选，
          进 pending 审核；这类一次性搜索不会写进固定订阅。
        </p>
      </div>

      {!hasSessdata && (
        <p
          data-testid="search-config-warning"
          className="mono mt-4 border border-charcoal border-l-[4px] border-l-signal bg-white px-3 py-2 text-[10px] leading-relaxed text-ink-soft"
        >
          缺少 BILIBILI_SESSDATA，搜索不可用：复制 .env.example 为 .env.local 并填值后重启。
        </p>
      )}

      {!ffmpeg.ok && (
        <p
          data-testid="ffmpeg-warning"
          className="mono mt-2 border border-charcoal border-l-[4px] border-l-signal bg-white px-3 py-2 text-[10px] leading-relaxed text-ink-soft"
        >
          ffmpeg 环境未就绪（{ffmpeg.path}）：视觉兜底不可用，文本提取不受影响。
        </p>
      )}

      <SearchWorkspace />

      <p className="mono mt-6 border-t border-hairline pt-3 text-[9px] uppercase leading-relaxed tracking-[0.14em] text-ink-faded">
        B 站搜索与视频详情请求间 1–3s 随机延迟 · 提取复用 README / CC 字幕链路 · 无文本则不入库
      </p>
    </div>
  );
}
