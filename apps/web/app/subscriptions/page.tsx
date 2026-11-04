import { getDeepSeekKey } from "@design-vault/adapters/auth/api-keys";
import type { Metadata } from "next";
import { SubscriptionConsole } from "@/components/subscriptions/subscription-console";
import { readUpstreams } from "@design-vault/adapters/ingest/config";
import { readPending } from "@design-vault/adapters/ingest/pending-store";
import { readIngestState } from "@design-vault/adapters/ingest/state";
import { readUsage } from "@design-vault/adapters/ingest/usage";

export const metadata: Metadata = {
  title: "订阅",
  description: "固定 UP 主列表与手动抓取：B 站简介 → GitHub README → DeepSeek → pending。",
};

export const dynamic = "force-dynamic";

export default function SubscriptionsPage() {
  const upstreams = readUpstreams();
  const state = readIngestState();
  const pending = readPending();
  const usage = readUsage();

  const rows = upstreams.map((upstream) => ({
    uid: upstream.uid,
    name: state.upstreams[upstream.uid]?.name || upstream.name || "",
    lastCheckedAt: state.upstreams[upstream.uid]?.lastCheckedAt || "",
  }));

  const config = {
    hasSessdata: Boolean(process.env.BILIBILI_SESSDATA),
    hasDeepseek: Boolean(getDeepSeekKey()),
    hasGithubToken: Boolean(process.env.GITHUB_TOKEN),
  };

  const lastRun = state.lastRun;

  return (
    <div className="px-4 pb-10 pt-7 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-5 border-b border-charcoal pb-5 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="label-strong flex items-center gap-2">
            <span aria-hidden className="h-[6px] w-[6px] bg-signal" />
            INDEX 06 / SUBSCRIPTIONS · M2b
          </p>
          <h1 className="mt-3 text-balance text-[28px] font-bold leading-[1.15] text-charcoal sm:text-[40px]">
            订阅与抓取
          </h1>
          <p className="mt-3 max-w-[56ch] text-[13px] leading-[1.9] text-ink-soft">
            固定 UP 主每周看一次就够。可以直接加/减 UP 主（服务端查真实昵称），手动点「检查更新」跑链路；
            产物全部进 pending，等你审核、调色或丢弃。
          </p>
        </div>

        <dl className="flex shrink-0 items-end gap-6">
          <div>
            <dt className="label">Upstreams</dt>
            <dd className="mono mt-1 text-[26px] leading-none text-charcoal">
              {String(upstreams.length).padStart(3, "0")}
            </dd>
          </div>
          <div>
            <dt className="label">Pending</dt>
            <dd className="mono mt-1 text-[26px] leading-none text-charcoal">
              {String(pending.length).padStart(3, "0")}
            </dd>
          </div>
          <div>
            <dt className="label">Last run</dt>
            <dd className="mono mt-1 text-[11px] leading-none tracking-[0.06em] text-ink-faded">
              {lastRun?.finishedAt ? lastRun.finishedAt.slice(0, 16).replace("T", " ") : "—"}
            </dd>
          </div>
        </dl>
      </div>

      <SubscriptionConsole upstreams={rows} config={config} pendingCount={pending.length} />

      <div data-testid="usage-panel" className="mt-4 border border-charcoal bg-white">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-charcoal px-3 py-2">
          <p className="label-strong">LLM 用量 / Usage</p>
          <p className="mono text-[9px] uppercase tracking-[0.12em] text-ink-faded">
            data/llm-usage.log
          </p>
        </div>
        <dl className="grid grid-cols-2 divide-x divide-hairline sm:grid-cols-4">
          {[
            ["Calls", usage.calls],
            ["Prompt", usage.promptTokens],
            ["Completion", usage.completionTokens],
            ["Total", usage.totalTokens],
          ].map(([label, value]) => (
            <div key={String(label)} className="px-3 py-3">
              <dt className="label">{label}</dt>
              <dd className="mono mt-1 text-[20px] leading-none text-charcoal">
                {Number(value).toLocaleString("en-US")}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mono border-t border-hairline px-3 py-2 text-[9px] uppercase tracking-[0.12em] text-ink-faded">
          最近一次 {usage.lastAt ? usage.lastAt.slice(0, 19).replace("T", " ") : "—"}
          {Object.keys(usage.byModel).length > 0
            ? ` · ${Object.entries(usage.byModel)
                .map(([model, bucket]) => `${model} ${bucket.calls} 次 / ${bucket.totalTokens} tokens`)
                .join(" · ")}`
            : ""}
        </p>
      </div>

      <p className="mono mt-6 border-t border-hairline pt-3 text-[9px] uppercase leading-relaxed tracking-[0.14em] text-ink-faded">
        只读账号 · 请求间 1–3s 随机延迟 · 失败不自动降级到视觉分析（M3） · 审核动作在 M2b
      </p>
    </div>
  );
}
