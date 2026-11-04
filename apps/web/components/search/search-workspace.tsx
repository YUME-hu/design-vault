"use client";

import { useState } from "react";
import { FavExplorer } from "./fav-explorer";
import { SearchConsole } from "./search-console";

/** 灵感采集中心：关键词搜索 + 我的收藏夹 */
export function SearchWorkspace() {
  const [tab, setTab] = useState<"search" | "favs">("search");

  return (
    <div className="mt-6">
      <div role="tablist" aria-label="采集方式" className="flex border border-charcoal bg-white">
        {[
          { id: "search" as const, zh: "关键词搜索", en: "Search" },
          { id: "favs" as const, zh: "我的收藏夹", en: "Favorites" },
        ].map((item) => (
          <button
            key={item.id}
            role="tab"
            type="button"
            data-testid={`tab-${item.id}`}
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={`mono flex h-10 flex-1 items-center justify-center gap-2 border-r border-hairline-strong text-[9px] uppercase tracking-[0.14em] last:border-r-0 ${
              tab === item.id ? "bg-charcoal text-paper" : "text-ink-soft hover:bg-paper"
            }`}
          >
            {item.zh} · {item.en}
          </button>
        ))}
      </div>

      {tab === "search" ? <SearchConsole /> : <FavExplorer />}
    </div>
  );
}
