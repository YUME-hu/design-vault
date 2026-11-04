"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ComponentItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  framework: string;
  code: string;
  dependencies: string[];
  notes: string;
  related_styles: string[];
};

const CATEGORIES = [
  "navigation", "hero", "card", "form", "button",
  "table", "feedback", "overlay", "layout", "animation", "other",
];

export function ComponentEditor({ component }: { component: ComponentItem }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: component.name,
    category: component.category,
    description: component.description,
    framework: component.framework,
    code: component.code,
    dependencies: component.dependencies.join(", "),
    notes: component.notes,
    related_styles: component.related_styles.join(", "),
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/components/${component.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          description: form.description,
          framework: form.framework,
          code: form.code,
          dependencies: form.dependencies.split(",").map((item) => item.trim()).filter(Boolean),
          notes: form.notes,
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
      <button
        type="button"
        data-testid="component-edit"
        onClick={() => setEditing(true)}
        className="mono border border-charcoal px-3 py-[3px] text-[8px] uppercase tracking-[0.12em] text-charcoal hover:bg-charcoal hover:text-paper"
      >
        编辑
      </button>
    );
  }

  return (
    <div data-testid="component-editor" className="border border-charcoal bg-white p-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="label">名称</span>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mono mt-1 h-8 w-full border border-hairline-strong px-2 text-[11px]" />
        </label>
        <label className="block">
          <span className="label">分类</span>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mono mt-1 h-8 w-full border border-hairline-strong px-2 text-[11px]">
            {CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="label">框架</span>
          <select value={form.framework} onChange={(e) => setForm({ ...form, framework: e.target.value })} className="mono mt-1 h-8 w-full border border-hairline-strong px-2 text-[11px]">
            <option value="react">react</option>
            <option value="html">html</option>
          </select>
        </label>
        <label className="block">
          <span className="label">依赖（逗号分隔）</span>
          <input value={form.dependencies} onChange={(e) => setForm({ ...form, dependencies: e.target.value })} className="mono mt-1 h-8 w-full border border-hairline-strong px-2 text-[11px]" />
        </label>
      </div>
      <label className="mt-2 block">
        <span className="label">描述</span>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="mono mt-1 w-full border border-hairline-strong p-2 text-[11px]" />
      </label>
      <label className="mt-2 block">
        <span className="label">源码</span>
        <textarea value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} rows={12} className="mono mt-1 w-full border border-hairline-strong p-2 text-[11px]" />
      </label>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="label">关联风格（逗号分隔 id）</span>
          <input value={form.related_styles} onChange={(e) => setForm({ ...form, related_styles: e.target.value })} className="mono mt-1 h-8 w-full border border-hairline-strong px-2 text-[11px]" />
        </label>
        <label className="block">
          <span className="label">备注</span>
          <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mono mt-1 h-8 w-full border border-hairline-strong px-2 text-[11px]" />
        </label>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button type="button" data-testid="component-save" onClick={save} disabled={busy} className="mono h-9 border border-charcoal bg-charcoal px-4 text-[9px] uppercase tracking-[0.14em] text-paper disabled:opacity-40">
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
