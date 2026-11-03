"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Effect = {
  id: string;
  name: string;
  tech_stack: string[];
  description: string;
  code_snippet: string;
  performance_notes: string;
  related_styles: string[];
};

export function EffectForm({ initial }: { initial?: Effect }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    tech_stack: (initial?.tech_stack ?? []).join(", "),
    description: initial?.description ?? "",
    code_snippet: initial?.code_snippet ?? "",
    performance_notes: initial?.performance_notes ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const payload = {
        ...(initial ? { id: initial.id } : {}),
        name: form.name,
        tech_stack: form.tech_stack.split(",").map((v) => v.trim()).filter(Boolean),
        description: form.description,
        code_snippet: form.code_snippet,
        performance_notes: form.performance_notes,
        related_styles: initial?.related_styles ?? [],
      };
      const response = await fetch("/api/effects", {
        method: initial ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setMessage(data.error ?? "保存失败");
        return;
      }
      setMessage("已保存");
      router.refresh();
      if (!initial) setForm({ name: "", tech_stack: "", description: "", code_snippet: "", performance_notes: "" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} data-testid="effect-form" className="mt-4 border border-charcoal bg-white p-4">
      <p className="label-strong">{initial ? `编辑：${initial.name}` : "新建技术方案"}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mono text-[9px] uppercase tracking-[0.14em] text-ink-faded">名称</span>
          <input data-testid="effect-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mono mt-1 h-9 w-full border border-hairline-strong px-2 text-[11px]" required />
        </label>
        <label className="block">
          <span className="mono text-[9px] uppercase tracking-[0.14em] text-ink-faded">技术栈（逗号分隔）</span>
          <input data-testid="effect-tech" value={form.tech_stack} onChange={(e) => setForm({ ...form, tech_stack: e.target.value })} className="mono mt-1 h-9 w-full border border-hairline-strong px-2 text-[11px]" />
        </label>
      </div>
      <label className="mt-3 block">
        <span className="mono text-[9px] uppercase tracking-[0.14em] text-ink-faded">实现思路</span>
        <textarea data-testid="effect-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="mono mt-1 w-full border border-hairline-strong p-2 text-[11px]" required />
      </label>
      <label className="mt-3 block">
        <span className="mono text-[9px] uppercase tracking-[0.14em] text-ink-faded">代码片段（可选）</span>
        <textarea data-testid="effect-code" value={form.code_snippet} onChange={(e) => setForm({ ...form, code_snippet: e.target.value })} rows={4} className="mono mt-1 w-full border border-hairline-strong p-2 text-[11px]" />
      </label>
      <div className="mt-3 flex items-center gap-3">
        <button type="submit" data-testid="effect-submit" disabled={busy} className="mono h-9 border border-charcoal bg-charcoal px-4 text-[9px] uppercase tracking-[0.16em] text-paper disabled:opacity-40">
          {busy ? "保存中…" : initial ? "保存修改" : "新建方案"}
        </button>
        {message && <span data-testid="effect-message" className="mono text-[9px] text-ink-soft">{message}</span>}
      </div>
    </form>
  );
}
