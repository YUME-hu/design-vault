"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Effect = {
  id: string;
  name: string;
  tech_stack: string[];
  description: string;
  code_snippet: string;
  performance_notes: string;
  related_styles: string[];
};

export function EffectEditor({ effect }: { effect: Effect }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: effect.name,
    tech_stack: effect.tech_stack.join(", "),
    description: effect.description,
    code_snippet: effect.code_snippet,
    performance_notes: effect.performance_notes,
    related_styles: effect.related_styles.join(", "),
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/effects/${effect.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          tech_stack: form.tech_stack.split(",").map((item) => item.trim()).filter(Boolean),
          description: form.description,
          code_snippet: form.code_snippet,
          performance_notes: form.performance_notes,
          related_styles: form.related_styles.split(",").map((item) => item.trim()).filter(Boolean),
        }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string; issues?: string[] };
      if (!response.ok || !data.ok) {
        setError([data.error, ...(data.issues ?? [])].filter(Boolean).join(" · ") ?? "保存失败");
        return;
      }
      setEditing(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (!editing) {
    return (
      <button type="button" data-testid="effect-edit" onClick={() => setEditing(true)} className="mono border border-charcoal px-3 py-[3px] text-[8px] uppercase tracking-[0.12em] text-charcoal hover:bg-charcoal hover:text-paper">
        编辑
      </button>
    );
  }

  return (
    <div data-testid="effect-editor" className="border border-charcoal bg-white p-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="label">名称</span>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mono mt-1 h-8 w-full border border-hairline-strong px-2 text-[11px]" />
        </label>
        <label className="block">
          <span className="label">技术栈（逗号）</span>
          <input value={form.tech_stack} onChange={(e) => setForm({ ...form, tech_stack: e.target.value })} className="mono mt-1 h-8 w-full border border-hairline-strong px-2 text-[11px]" />
        </label>
      </div>
      <label className="mt-2 block">
        <span className="label">实现思路</span>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="mono mt-1 w-full border border-hairline-strong p-2 text-[11px]" />
      </label>
      <label className="mt-2 block">
        <span className="label">代码片段</span>
        <textarea value={form.code_snippet} onChange={(e) => setForm({ ...form, code_snippet: e.target.value })} rows={8} className="mono mt-1 w-full border border-hairline-strong p-2 text-[11px]" />
      </label>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="label">性能备注</span>
          <input value={form.performance_notes} onChange={(e) => setForm({ ...form, performance_notes: e.target.value })} className="mono mt-1 h-8 w-full border border-hairline-strong px-2 text-[11px]" />
        </label>
        <label className="block">
          <span className="label">关联风格（逗号 id）</span>
          <input value={form.related_styles} onChange={(e) => setForm({ ...form, related_styles: e.target.value })} className="mono mt-1 h-8 w-full border border-hairline-strong px-2 text-[11px]" />
        </label>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button type="button" data-testid="effect-save" onClick={save} disabled={busy} className="mono h-9 border border-charcoal bg-charcoal px-4 text-[9px] uppercase tracking-[0.14em] text-paper disabled:opacity-40">
          {busy ? "保存中…" : "保存"}
        </button>
        <button type="button" onClick={() => setEditing(false)} className="mono text-[9px] uppercase tracking-[0.12em] text-ink-faded underline underline-offset-4">
          取消
        </button>
        {error && <span className="mono text-[9px] text-[#B3261E]">{error}</span>}
      </div>
    </div>
  );
}
