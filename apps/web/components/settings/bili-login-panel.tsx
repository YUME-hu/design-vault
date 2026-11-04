"use client";

import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";

type Status = {
  loggedIn: boolean;
  source: "session" | "env" | "none";
  uid: string;
  name: string;
  expiresAt: string;
  secretsReady: boolean;
};

type QrState = "idle" | "loading" | "waiting" | "scanned" | "confirmed" | "expired" | "error";

const LABELS: Record<QrState, string> = {
  idle: "未登录",
  loading: "正在生成二维码…",
  waiting: "等待扫码",
  scanned: "已扫码，请在手机上确认",
  confirmed: "登录成功",
  expired: "二维码已过期",
  error: "出错了",
};

export function BiliLoginPanel() {
  const [status, setStatus] = useState<Status | null>(null);
  const [qr, setQr] = useState("");
  const [state, setState] = useState<QrState>("idle");
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  async function loadStatus() {
    const response = await fetch("/api/auth/bili/status", { cache: "no-store" });
    const data = (await response.json()) as { ok?: boolean } & Status;
    if (data.ok) setStatus(data);
  }

  useEffect(() => {
    void loadStatus();
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  function stopPolling() {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }

  async function start() {
    stopPolling();
    setState("loading");
    setMessage("");
    setQr("");
    try {
      const response = await fetch("/api/auth/bili/qr/start", { method: "POST" });
      const data = (await response.json()) as { ok?: boolean; url?: string; error?: string };
      if (!response.ok || !data.ok || !data.url) {
        setState("error");
        setMessage(data.error ?? "生成二维码失败");
        return;
      }
      setQr(await QRCode.toDataURL(data.url, { margin: 1, width: 240 }));
      setState("waiting");

      let polls = 0;
      timer.current = setInterval(async () => {
        polls += 1;
        if (polls > 90) {
          stopPolling();
          setState("expired");
          return;
        }
        try {
          const poll = await fetch("/api/auth/bili/qr/poll", { cache: "no-store" });
          const result = (await poll.json()) as {
            ok?: boolean;
            status?: string;
            error?: string;
            uid?: string;
            name?: string;
          };
          if (result.status === "waiting" || result.status === "scanned") {
            setState(result.status);
            return;
          }
          if (result.status === "confirmed") {
            stopPolling();
            setState("confirmed");
            await loadStatus();
            return;
          }
          if (result.status === "expired" || poll.status === 410) {
            stopPolling();
            setState("expired");
            return;
          }
          if (!result.ok) {
            stopPolling();
            setState("error");
            setMessage(result.error ?? "轮询失败");
          }
        } catch {
          // 网络抖动继续轮询
        }
      }, 2000);
    } catch (error) {
      setState("error");
      setMessage((error as Error).message);
    }
  }

  async function logout() {
    await fetch("/api/auth/bili/session", { method: "DELETE" });
    setStatus(null);
    setQr("");
    setState("idle");
    await loadStatus();
  }

  const loggedIn = status?.loggedIn ?? false;

  return (
    <div data-testid="bili-panel" className="mt-4 border border-charcoal bg-white p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="label-strong">B 站账号</p>
        <p className="mono text-[9px] uppercase tracking-[0.12em] text-ink-faded">
          {loggedIn
            ? `已登录 · ${status?.name || status?.uid} · ${status?.source === "session" ? "扫码凭证" : "环境变量"}`
            : "未登录"}
        </p>
      </div>

      {loggedIn ? (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <p className="mono text-[10px] text-ink-soft">
            UID {status?.uid || "—"} · 过期 {status?.expiresAt ? status.expiresAt.slice(0, 10) : "未知"}
          </p>
          <button
            type="button"
            data-testid="bili-logout"
            onClick={logout}
            className="mono border border-[#B3261E] px-2 py-[3px] text-[8px] uppercase tracking-[0.12em] text-[#B3261E] hover:bg-[#B3261E] hover:text-white"
          >
            退出登录
          </button>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap items-start gap-4">
          <button
            type="button"
            data-testid="bili-start"
            onClick={start}
            className="mono h-9 border border-charcoal bg-charcoal px-4 text-[9px] uppercase tracking-[0.16em] text-paper"
          >
            {qr ? "重新生成二维码" : "扫码登录"}
          </button>

          {qr && (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt="B 站登录二维码" width={160} height={160} className="border border-hairline" />
              <div>
                <p data-testid="bili-qr-state" className="mono text-[10px] text-charcoal">
                  {LABELS[state]}
                </p>
                <p className="mono mt-1 text-[9px] leading-relaxed text-ink-faded">
                  用 B 站 App 扫码，2 秒轮询一次，最多 90 次。
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {status && !status.secretsReady && (
        <p className="mono mt-3 border border-[#B3261E] px-2 py-1 text-[9px] leading-relaxed text-[#B3261E]">
          未配置 DESIGN_VAULT_SECRET，扫码成功后无法保存凭证；请在 .env.local 添加 32 字节 base64 密钥。
        </p>
      )}
      {message && (
        <p data-testid="bili-error" className="mono mt-2 text-[9px] text-[#B3261E]">{message}</p>
      )}
    </div>
  );
}
