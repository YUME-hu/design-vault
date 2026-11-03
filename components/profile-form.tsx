"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BRAND_KEYWORDS,
  BRAND_KEYWORD_LABELS,
  COLOR_MODES,
  COLOR_MODE_LABELS,
  PAGE_TYPES,
  PAGE_TYPE_LABELS,
  TARGET_USERS,
  TARGET_USER_LABELS,
  profileToQuery,
  type Profile,
} from "@/lib/recommend";
import { PROJECT_TYPES, PROJECT_TYPE_LABELS, type ProjectType } from "@/lib/schema";
import { cn } from "@/lib/utils";

type TargetUser = (typeof TARGET_USERS)[number];
type PageType = (typeof PAGE_TYPES)[number];
type ColorMode = (typeof COLOR_MODES)[number];
type Keyword = (typeof BRAND_KEYWORDS)[number];

function Chip({
  selected,
  onClick,
  children,
  testId,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  testId?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      data-testid={testId}
      className={cn(
        "border px-2.5 py-1.5 text-[12px] leading-none",
        selected
          ? "border-charcoal bg-charcoal text-paper"
          : "border-hairline-strong bg-transparent text-charcoal hover:border-charcoal hover:bg-charcoal/5",
        className,
      )}
    >
      {children}
    </button>
  );
}

function Field({
  index,
  zh,
  en,
  hint,
  children,
}: {
  index: string;
  zh: string;
  en: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="grid gap-3 border-t border-charcoal py-5 first:border-t-0 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-4">
      <legend className="sr-only">{zh}</legend>
      <div className="min-w-0">
        <p className="label flex items-center gap-2">
          <span className="text-signal">{index}</span>
          <span>{en}</span>
        </p>
        <p className="mt-1 text-[14px] font-bold leading-tight text-charcoal">{zh}</p>
        {hint && <p className="mono mt-1 text-[9px] leading-relaxed tracking-[0.08em] text-ink-faded">{hint}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </fieldset>
  );
}

export function ProfileForm() {
  const router = useRouter();
  const [projectType, setProjectType] = useState<ProjectType | null>(null);
  const [targetUser, setTargetUser] = useState<TargetUser | null>(null);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [pageType, setPageType] = useState<PageType | null>(null);
  const [colorMode, setColorMode] = useState<ColorMode>("light");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<{ message: string; issues?: string[] } | null>(null);
  // 水合完成标记：浏览器里的点击在有 JS 之前是空操作，测试与调试需要一个确定信号
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const ready = Boolean(projectType && targetUser && pageType);

  function toggleKeyword(keyword: Keyword) {
    setKeywords((current) =>
      current.includes(keyword)
        ? current.filter((item) => item !== keyword)
        : current.length >= 6
          ? current
          : [...current, keyword],
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!projectType || !targetUser || !pageType) {
      setError({ message: "请先选完项目类型、目标用户和页面类型" });
      return;
    }

    const profile: Profile = { projectType, targetUser, keywords, pageType, colorMode };

    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = (await response.json()) as { error?: string; issues?: string[] };
      if (!response.ok) {
        setError({ message: data.error ?? `服务端返回 ${response.status}`, issues: data.issues });
        setPending(false);
        return;
      }
      router.push(`/result?${profileToQuery(profile)}`);
    } catch (cause) {
      setError({ message: `请求失败：${(cause as Error).message}` });
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6" data-testid="profile-form" data-hydrated={hydrated}>
      <Field index="01" zh="项目类型" en="Project Type" hint="单选 · 决定主推荐的基础标签">
        <div className="flex flex-wrap gap-2">
          {PROJECT_TYPES.map((type) => (
            <Chip
              key={type}
              selected={projectType === type}
              onClick={() => setProjectType(type)}
              testId={`project-type-${type}`}
            >
              {PROJECT_TYPE_LABELS[type]}
              <span className="mono ml-1.5 text-[9px] opacity-60">{type}</span>
            </Chip>
          ))}
        </div>
      </Field>

      <Field index="02" zh="目标用户" en="Target User" hint="单选 · 影响语气与信息密度">
        <div className="flex flex-wrap gap-2">
          {TARGET_USERS.map((user) => (
            <Chip
              key={user}
              selected={targetUser === user}
              onClick={() => setTargetUser(user)}
              testId={`target-user-${user}`}
            >
              {TARGET_USER_LABELS[user]}
            </Chip>
          ))}
        </div>
      </Field>

      <Field
        index="03"
        zh="品牌关键词"
        en="Brand Keywords"
        hint={`多选 · 最多 6 个 · 已选 ${keywords.length}`}
      >
        <div className="flex flex-wrap gap-2">
          {BRAND_KEYWORDS.map((keyword) => (
            <Chip
              key={keyword}
              selected={keywords.includes(keyword)}
              onClick={() => toggleKeyword(keyword)}
              testId={`keyword-${keyword}`}
            >
              {BRAND_KEYWORD_LABELS[keyword]}
            </Chip>
          ))}
        </div>
      </Field>

      <Field index="04" zh="页面类型" en="Page Type" hint="单选 · 落地页 / 应用 / 内容 / 目录 / 表单">
        <div className="flex flex-wrap gap-2">
          {PAGE_TYPES.map((type) => (
            <Chip
              key={type}
              selected={pageType === type}
              onClick={() => setPageType(type)}
              testId={`page-type-${type}`}
            >
              {PAGE_TYPE_LABELS[type]}
            </Chip>
          ))}
        </div>
      </Field>

      <Field index="05" zh="深浅色偏好" en="Color Mode" hint="单选 · 影响 light / dark 标签权重">
        <div className="flex flex-wrap gap-2">
          {COLOR_MODES.map((mode) => (
            <Chip
              key={mode}
              selected={colorMode === mode}
              onClick={() => setColorMode(mode)}
              testId={`color-mode-${mode}`}
            >
              {COLOR_MODE_LABELS[mode]}
            </Chip>
          ))}
        </div>
      </Field>

      <div className="mt-2 border border-charcoal bg-white">
        <div className="hazard h-[6px] w-full" aria-hidden />
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-ink-faded">
            规则打分 · 标签交集 · 可复现
            <br />
            不调用任何模型
          </p>
          <button
            type="submit"
            disabled={pending}
            data-testid="submit-profile"
            className="mono h-11 shrink-0 border border-charcoal bg-charcoal px-6 text-[11px] uppercase tracking-[0.22em] text-paper hover:border-signal hover:bg-signal disabled:opacity-40"
          >
            {pending ? "Scoring…" : "生成推荐 →"}
          </button>
        </div>
        {!ready && !error && (
          <p className="border-t border-hairline px-4 py-2 text-[11px] text-ink-faded">
            还需要选择：{[!projectType && "项目类型", !targetUser && "目标用户", !pageType && "页面类型"]
              .filter(Boolean)
              .join(" / ")}
          </p>
        )}
        {error && (
          <div
            role="alert"
            data-testid="form-error"
            className="border-t border-charcoal bg-paper px-4 py-3"
          >
            <p className="mono text-[10px] uppercase tracking-[0.14em] text-[#B3261E]">
              {error.message}
            </p>
            {error.issues && error.issues.length > 0 && (
              <ul className="mt-1 space-y-0.5">
                {error.issues.map((issue) => (
                  <li key={issue} className="mono text-[9px] leading-relaxed text-ink-faded">
                    · {issue}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
