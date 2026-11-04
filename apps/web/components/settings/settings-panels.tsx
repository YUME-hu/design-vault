"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeepSeek = { configured: boolean; last4: string; source: string };
type Vault = { path: string; source: string };
type Upstream = { uid: string; name: string; lastCheckedAt: string };

export function SettingsPanels({
  deepseek,
  vault,
  upstreams,
}: {
  deepseek: DeepSeek;
  vault: Vault;
  upstreams: Upstream[];
}) {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [keyMessage, setKeyMessage] = useState("");
  const [ds, setDs] = useState(deepseek);
  const [vaultInput, setVaultInput] = useState(vault.path);
  const [vaultMessage, setVaultMessage] = useState("");
  const [uid, setUid] = useState("");
  const [upstreamError, setUpstreamError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function saveKey() {
    setBusy("key");
    setKeyMessage("");
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deepseekKey: key }),
      });
      const data = (await response.json()) as { ok?: boolean; deepseek?: DeepSeek; error?: string };
      if (!response.ok || !data.ok) {
        setKeyMessage(data.error ?? "保存失败");
        return;
      }
      setDs(data.deepseek ?? ds);
      setKey("");
      setKeyMessage("已加密保存");
    } finally {
      setBusy(null);
    }
  }

  async function clearKey() {
    setBusy("key");
    setKeyMessage("");
    try {
      const response = await fetch("/api/settings", { method: "DELETE" });
      const data = (await response.json()) as { ok?: boolean; deepseek?: DeepSeek; error?: string };
      if (!response.ok || !data.ok) {
        setKeyMessage(data.error ?? "清除失败");
        return;
      }
      setDs(data.deepseek ?? { configured: false, last4: "", source: "none" });
      setKeyMessage("已清除加密密钥");
    } finally {
      setBusy(null);
    }
  }

  async function saveVault() {
    setBusy("vault");
    setVaultMessage("");
    try {
      const response = await fetch("/api/settings/vault", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: vaultInput }),
      });
      const data = (await response.json()) as { ok?: boolean; path?: string; error?: string };
      if (!response.ok || !data.ok) {
        setVaultMessage(data.error ?? "保存失败");
        return;
      }
      setVaultMessage("指针已写入，重启 dev server 后生效");
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function addUpstream(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("upstream");
    setUpstreamError("");
    try {
      const response = await fetch("/api/upstreams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setUpstreamError(data.error ?? "添加失败");
        return;
      }
      setUid("");
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function removeUpstream(target: string) {
    setBusy(target);
    setUpstreamError("");
    try {
      const response = await fetch(`/api/upstreams?uid=${encodeURIComponent(target)}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setUpstreamError(data.error ?? "移除失败");
        return;
      }
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-6 space-y-4">
      <section data-testid="settings-deepseek" className="border border-charcoal bg-white p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="label-strong">DeepSeek API Key</p>
          <p className="mono text-[9px] uppercase tracking-[0.12em] text-ink-faded">
            {ds.configured
              ? `已配置 · 尾号 ${ds.last4} · ${ds.source === "encrypted" ? "加密保存" : "环境变量"}`
              : "未配置"}
          </p>
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="password"
            value={key}
            onChange={(event) => setKey(event.target.value)}
            placeholder="sk-..."
            data-testid="settings-key"
            className="mono h-9 min-w-0 flex-1 border border-hairline-strong px-2 text-[11px]"
          />
          <button
            type="button"
            onClick={saveKey}
            disabled={busy === "key" || key.trim().length < 10}
            className="mono h-9 border border-charcoal bg-charcoal px-3 text-[9px] uppercase tracking-[0.14em] text-paper disabled:opacity-40"
          >
            加密保存
          </button>
          <button
            type="button"
            onClick={clearKey}
            disabled={busy === "key" || !ds.configured}
            className="mono h-9 border border-[#B3261E] px-3 text-[9px] uppercase tracking-[0.14em] text-[#B3261E] disabled:opacity-40"
          >
            清除
          </button>
        </div>
        {keyMessage && <p className="mono mt-2 text-[9px] text-ink-soft">{keyMessage}</p>}
      </section>

      <section data-testid="settings-vault" className="border border-charcoal bg-white p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="label-strong">Vault 目录</p>
          <p className="mono text-[9px] uppercase tracking-[0.12em] text-ink-faded">
            {vault.source === "env" ? "环境变量" : vault.source === "pointer" ? "指针文件" : "仓库根目录"}
          </p>
        </div>
        <p className="mono mt-2 break-all text-[9px] text-ink-soft">{vault.path}</p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            value={vaultInput}
            onChange={(event) => setVaultInput(event.target.value)}
            data-testid="settings-vault-path"
            className="mono h-9 min-w-0 flex-1 border border-hairline-strong px-2 text-[11px]"
          />
          <button
            type="button"
            onClick={saveVault}
            disabled={busy === "vault" || vaultInput.trim() === vault.path}
            className="mono h-9 border border-charcoal px-3 text-[9px] uppercase tracking-[0.14em] text-charcoal disabled:opacity-40"
          >
            更换目录
          </button>
        </div>
        {vaultMessage && <p className="mono mt-2 text-[9px] text-ink-soft">{vaultMessage}</p>}
        <p className="mono mt-2 text-[8px] uppercase leading-relaxed tracking-[0.1em] text-ink-faded">
          切换后需要重启 dev server；data/ 与 refs/ 都会跟随新目录
        </p>
      </section>

      <section data-testid="settings-upstreams" className="border border-charcoal bg-white p-4">
        <p className="label-strong">订阅 UP 主</p>
        <form onSubmit={addUpstream} className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={uid}
            onChange={(event) => setUid(event.target.value)}
            placeholder="UID，例如 40238601"
            data-testid="settings-uid"
            className="mono h-9 min-w-0 flex-1 border border-hairline-strong px-2 text-[11px]"
          />
          <button
            type="submit"
            disabled={busy === "upstream" || !/^\d{5,12}$/.test(uid)}
            className="mono h-9 border border-charcoal bg-charcoal px-3 text-[9px] uppercase tracking-[0.14em] text-paper disabled:opacity-40"
          >
            添加
          </button>
        </form>
        <ul className="mt-3 border border-hairline">
          {upstreams.map((upstream) => (
            <li key={upstream.uid} className="flex items-center justify-between border-b border-hairline px-2 py-2 last:border-b-0">
              <span className="mono text-[10px] text-ink-soft">
                {upstream.uid} · {upstream.name || "—"}
              </span>
              <button
                type="button"
                onClick={() => removeUpstream(upstream.uid)}
                disabled={busy === upstream.uid}
                className="mono border border-[#B3261E] px-2 py-[2px] text-[8px] uppercase tracking-[0.12em] text-[#B3261E] disabled:opacity-40"
              >
                移除
              </button>
            </li>
          ))}
          {upstreams.length === 0 && <li className="px-2 py-3 text-[11px] text-ink-faded">还没有订阅。</li>}
        </ul>
        {upstreamError && <p className="mono mt-2 text-[9px] text-[#B3261E]">{upstreamError}</p>}
      </section>
    </div>
  );
}
