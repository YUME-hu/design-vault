"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@design-vault/adapters/utils";

type UpstreamRow = { uid: string; name: string; lastCheckedAt: string };

type JobProgress = {
  status: "running" | "done" | "failed";
  upstreamIndex: number;
  upstreamTotal: number;
  currentUpstream: string;
  currentUpstreamName: string;
  videoIndex: number;
  videoTotal: number;
  currentVideo: string;
  added: number;
  skipped: number;
  failed: number;
  message: string;
};

type Failure = { upstream: string; video: string; title: string; stage: string; reason: string };

type JobSnapshot = {
  jobId: string;
  status: "running" | "done" | "failed";
  progress: JobProgress;
  result: {
    summary: { added: number; skipped: number; failed: number; failures: Failure[] };
    error?: { code: string; message: string };
  } | null;
  error: { code: string; message: string } | null;
};

type Config = { hasSessdata: boolean; hasDeepseek: boolean; hasGithubToken: boolean };

type Props = {
  upstreams: UpstreamRow[];
  config: Config;
  pendingCount: number;
};

const POLL_MS = 900;

function pad(value: number) {
  return String(value).padStart(3, "0");
}

export function SubscriptionConsole({ upstreams, config, pendingCount }: Props) {
  const router = useRouter();
  const [job, setJob] = useState<JobSnapshot | null>(null);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);
  const [uidInput, setUidInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [addMessage, setAddMessage] = useState("");
  const [addError, setAddError] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const poll = useCallback(async () => {
    try {
      const response = await fetch("/api/ingest", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { job: JobSnapshot | null };
      setJob(data.job);
      if (data.job && data.job.status !== "running") {
        stopPolling();
        router.refresh();
      }
    } catch {
      // 轮询失败不打断页面，下一次再试
    }
  }, [router, stopPolling]);

  useEffect(() => {
    void poll();
    return stopPolling;
  }, [poll, stopPolling]);

  useEffect(() => {
    if (job?.status === "running" && !pollRef.current) {
      pollRef.current = setInterval(() => void poll(), POLL_MS);
    }
    if (job?.status && job.status !== "running") stopPolling();
  }, [job?.status, poll, stopPolling]);

  async function handleStart() {
    setStarting(true);
    setError("");
    try {
      const response = await fetch("/api/ingest", { method: "POST" });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setError(data.error ?? `启动失败（${response.status}）`);
        return;
      }
      const next = await fetch("/api/ingest", { cache: "no-store" });
      const nextData = (await next.json()) as { job: JobSnapshot | null };
      setJob(nextData.job);
    } catch (cause) {
      setError(`启动失败：${(cause as Error).message}`);
    } finally {
      setStarting(false);
    }
  }

  async function handleAddUpstream(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const uid = uidInput.trim();
    if (!/^\d{5,12}$/.test(uid)) {
      setAddError("UID 必须是 5–12 位数字");
      setAddMessage("");
      return;
    }
    setAdding(true);
    setAddError("");
    setAddMessage("");
    try {
      const response = await fetch("/api/upstreams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        upstream?: { uid: string; name: string };
        error?: string;
      };
      if (!response.ok || !data.ok) {
        setAddError(data.error ?? `添加失败（${response.status}）`);
        return;
      }
      setAddMessage(`已添加：${data.upstream?.name ?? uid}`);
      setUidInput("");
      router.refresh();
    } catch (cause) {
      setAddError(`请求失败：${(cause as Error).message}`);
    } finally {
      setAdding(false);
    }
  }

  async function handleRemoveUpstream(uid: string) {
    setRemoving(uid);
    setAddError("");
    setAddMessage("");
    try {
      const response = await fetch(`/api/upstreams?uid=${encodeURIComponent(uid)}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setAddError(data.error ?? `移除失败（${response.status}）`);
        return;
      }
      setAddMessage(`已移除 UID ${uid}`);
      router.refresh();
    } catch (cause) {
      setAddError(`请求失败：${(cause as Error).message}`);
    } finally {
      setRemoving(null);
    }
  }

  const running = job?.status === "running";
  const progress = job?.progress;
  const summary = job?.result?.summary;
  const sessionExpired =
    job?.error?.code === "SESSION_EXPIRED" ||
    job?.result?.error?.code === "SESSION_EXPIRED";

  const configured = config.hasSessdata && config.hasDeepseek;

  return (
    <div className="mt-6" data-testid="subscriptions-console">
      {/* 配置状态 */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border border-charcoal bg-white/40 px-3 py-2">
        <span className="label">Config</span>
        {[
          ["SESSDATA", config.hasSessdata],
          ["DEEPSEEK_KEY", config.hasDeepseek],
          ["GITHUB_TOKEN", config.hasGithubToken],
        ].map(([label, ok]) => (
          <span key={String(label)} className="mono flex items-center gap-1.5 text-[10px]">
            <span aria-hidden className={ok ? "h-[6px] w-[6px] bg-charcoal" : "h-[6px] w-[6px] bg-signal"} />
            <span className="uppercase tracking-[0.12em] text-ink-faded">{label}</span>
            <span className={ok ? "text-charcoal" : "text-[#B3261E]"}>{ok ? "OK" : "MISSING"}</span>
          </span>
        ))}
        <span className="mono ml-auto text-[9px] uppercase tracking-[0.12em] text-ink-faded">
          pending {pad(pendingCount)}
        </span>
      </div>

      {!configured && (
        <div
          data-testid="config-warning"
          className="mt-2 border border-charcoal border-l-[4px] border-l-signal bg-white p-3"
        >
          <p className="mono text-[10px] uppercase tracking-[0.14em] text-signal">
            缺少环境变量
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
            复制 <code className="mono border border-hairline bg-paper px-1">.env.example</code> 为{" "}
            <code className="mono border border-hairline bg-paper px-1">.env.local</code>，填入{" "}
            <code className="mono border border-hairline bg-paper px-1">BILIBILI_SESSDATA</code> 与{" "}
            <code className="mono border border-hairline bg-paper px-1">DEEPSEEK_API_KEY</code> 后重启 dev server。
          </p>
        </div>
      )}

      {sessionExpired && (
        <div
          data-testid="session-expired"
          role="alert"
          className="mt-2 border border-[#B3261E] bg-[#B3261E] px-3 py-2"
        >
          <p className="mono text-[10px] uppercase tracking-[0.14em] text-white">
            SESSDATA 已过期，请更新
          </p>
          <p className="mt-1 text-[11px] text-white/85">
            B 站返回 -101（账号未登录）。重新登录 B 站，把新的 SESSDATA 写进{" "}
            <code className="mono">.env.local</code>，重启后重试。
          </p>
        </div>
      )}

      {error && (
        <p role="alert" data-testid="start-error" className="mono mt-2 border border-[#B3261E] bg-white px-3 py-2 text-[10px] text-[#B3261E]">
          {error}
        </p>
      )}

      {/* 添加 UP 主 */}
      <form
        onSubmit={handleAddUpstream}
        data-testid="add-upstream-form"
        className="mt-4 flex flex-col gap-2 border border-charcoal bg-white p-3 sm:flex-row sm:items-end"
      >
        <div className="min-w-0 flex-1">
          <label
            htmlFor="upstream-uid"
            className="mono text-[9px] uppercase tracking-[0.14em] text-ink-faded"
          >
            添加 UP 主 / UID
          </label>
          <input
            id="upstream-uid"
            data-testid="upstream-uid-input"
            value={uidInput}
            onChange={(event) => setUidInput(event.target.value)}
            inputMode="numeric"
            placeholder="例如 40238601"
            className="mono mt-1 h-9 w-full border border-hairline-strong bg-paper px-2 text-[11px] text-charcoal placeholder:text-ink-faded focus:border-charcoal focus:outline-none"
          />
        </div>
        <button
          type="submit"
          data-testid="add-upstream"
          disabled={adding || running}
          className="mono h-9 shrink-0 border border-charcoal bg-charcoal px-4 text-[9px] uppercase tracking-[0.16em] text-paper hover:border-signal hover:bg-signal disabled:opacity-40"
        >
          {adding ? "查询中…" : "确定添加"}
        </button>
      </form>
      {addMessage && (
        <p data-testid="add-message" className="mono mt-2 border border-hairline-strong bg-white px-3 py-1.5 text-[9px] text-charcoal">
          {addMessage}
        </p>
      )}
      {addError && (
        <p role="alert" data-testid="add-error" className="mono mt-2 border border-[#B3261E] bg-white px-3 py-1.5 text-[9px] leading-relaxed text-[#B3261E]">
          {addError}
        </p>
      )}

      {/* 操作栏 */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border border-charcoal bg-white px-3 py-3">
        <div className="min-w-0">
          <p className="mono text-[10px] uppercase tracking-[0.14em] text-charcoal">
            {running ? "正在抓取" : "手动检查"}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-ink-faded">
            每个 UP 主取最近 5 个视频 · 简介 → GitHub README → DeepSeek → pending
          </p>
        </div>
        <button
          type="button"
          data-testid="check-now"
          onClick={handleStart}
          disabled={running || starting || !configured}
          className="mono h-10 shrink-0 border border-charcoal bg-charcoal px-5 text-[10px] uppercase tracking-[0.18em] text-paper hover:border-signal hover:bg-signal disabled:opacity-40"
        >
          {running ? "运行中…" : starting ? "启动中…" : "检查更新 →"}
        </button>
      </div>

      {/* 进度 */}
      {running && progress && (
        <div
          data-testid="job-progress"
          className="mt-3 border border-charcoal bg-white p-3"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="mono text-[11px] tracking-[0.04em] text-charcoal">
              第 {progress.upstreamIndex} / {progress.upstreamTotal} 个 UP 主
              <span className="mx-2 text-ink-faded">·</span>
              第 {progress.videoIndex} / {progress.videoTotal || 5} 个视频
            </p>
            <p className="mono text-[9px] uppercase tracking-[0.12em] text-ink-faded">
              {progress.message}
            </p>
          </div>
          <div className="mt-2 h-[8px] w-full border border-charcoal bg-paper" aria-hidden>
            <div
              className="h-full bg-signal"
              style={{
                width: `${
                  progress.upstreamTotal > 0
                    ? Math.min(
                        100,
                        Math.round(
                          ((progress.upstreamIndex - 1) / progress.upstreamTotal) * 100 +
                            (progress.videoTotal > 0
                              ? (progress.videoIndex / progress.videoTotal) *
                                (100 / progress.upstreamTotal)
                              : 0),
                        ),
                      )
                    : 0
                }%`,
              }}
            />
          </div>
          <p className="mono mt-2 text-[9px] uppercase tracking-[0.12em] text-ink-faded">
            +{progress.added} pending · skip {progress.skipped} · fail {progress.failed}
          </p>
        </div>
      )}

      {/* 摘要 */}
      {!running && summary && (
        <div data-testid="job-summary" className="mt-3 border border-charcoal bg-white">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-hairline px-3 py-2">
            <p className="label-strong">Summary / 本次结果</p>
            <p className="mono text-[9px] uppercase tracking-[0.12em] text-ink-faded">
              {job?.status === "failed" ? "failed" : "done"}
            </p>
          </div>
          <dl className="grid grid-cols-3 divide-x divide-hairline">
            {[
              ["新增", summary.added, "accent"],
              ["跳过", summary.skipped, "muted"],
              ["失败", summary.failed, "danger"],
            ].map(([label, value, tone]) => (
              <div key={String(label)} className="px-3 py-3">
                <dt className="label">{label}</dt>
                <dd
                  className={cn(
                    "mono mt-1 text-[24px] leading-none",
                    tone === "accent" && "text-charcoal",
                    tone === "muted" && "text-ink-faded",
                    tone === "danger" && summary.failed > 0 && "text-[#B3261E]",
                  )}
                  data-testid={`summary-${tone}`}
                >
                  {pad(Number(value))}
                </dd>
              </div>
            ))}
          </dl>
          {summary.failures.length > 0 && (
            <ul className="border-t border-hairline px-3 py-2">
              {summary.failures.map((failure) => (
                <li key={`${failure.video}-${failure.reason}`} className="mono text-[9px] leading-relaxed text-ink-faded">
                  · {failure.video} [{failure.stage}] {failure.reason}
                </li>
              ))}
            </ul>
          )}
          <p className="border-t border-hairline px-3 py-2 text-[11px] text-ink-faded">
            新条目已进 <a href="/pending" className="underline underline-offset-4 hover:text-charcoal">/pending</a> 等待人工审核（M2a 只读）。
          </p>
        </div>
      )}

      {/* UP 主列表 */}
      <div className="mt-4 border border-charcoal bg-white">
        <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-charcoal">
              {["UID", "昵称", "上次检查", "状态", "操作"].map((header) => (
                <th
                  key={header}
                  className={cn(
                    "mono whitespace-nowrap px-3 py-2 text-left text-[9px] uppercase tracking-[0.14em] text-ink-faded",
                    header === "上次检查" && "hidden sm:table-cell",
                  )}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {upstreams.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-[12px] text-ink-faded">
                  还没有订阅。<code className="mono border border-hairline bg-paper px-1">config/upstreams.json</code> 里填 UID。
                </td>
              </tr>
            )}
            {upstreams.map((upstream, index) => {
              const active = progress?.currentUpstream === upstream.uid && running;
              return (
                <tr
                  key={upstream.uid}
                  data-testid="upstream-row"
                  data-uid={upstream.uid}
                  className={cn(
                    "border-b border-hairline last:border-b-0",
                    active && "bg-charcoal/[0.05]",
                  )}
                >
                  <td className="mono px-3 py-2 text-[11px] text-charcoal">
                    {String(index + 1).padStart(2, "0")} · {upstream.uid}
                  </td>
                  <td className="px-3 py-2 text-[12px] text-charcoal">
                    {upstream.name || <span className="text-ink-faded">待解析</span>}
                  </td>
                  <td className="mono hidden px-3 py-2 text-[10px] text-ink-faded sm:table-cell">
                    {upstream.lastCheckedAt
                      ? upstream.lastCheckedAt.slice(0, 16).replace("T", " ")
                      : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={cn(
                        "mono border px-1.5 py-[1px] text-[8px] uppercase tracking-[0.12em]",
                        active
                          ? "border-signal text-signal"
                          : "border-hairline-strong text-ink-faded",
                      )}
                    >
                      {active ? "running" : "idle"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      data-testid="remove-upstream"
                      data-uid={upstream.uid}
                      onClick={() => handleRemoveUpstream(upstream.uid)}
                      disabled={running || removing === upstream.uid}
                      className="mono whitespace-nowrap border border-[#B3261E] px-2 py-[3px] text-[8px] uppercase tracking-[0.12em] text-[#B3261E] hover:bg-[#B3261E] hover:text-white disabled:opacity-40"
                    >
                      {removing === upstream.uid ? "移除中…" : "移除"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
