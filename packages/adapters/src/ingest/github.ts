import { fetchText } from "./http";
import type { ReadmeResult, RepoRef } from "./types";

/**
 * GitHub 适配器：只读 README。
 * 必须带 User-Agent；未认证时遵守 60 次/小时（超出会拿到 403，这里原样报错）。
 */

const GITHUB_UA = "design-vault/0.3 (local, read-only README fetcher)";

const NON_REPO_OWNERS = new Set([
  "topics",
  "collections",
  "sponsors",
  "about",
  "features",
  "marketplace",
  "orgs",
  "users",
  "login",
  "join",
  "settings",
  "notifications",
  "explore",
  "apps",
]);

/** 只认 github.com/{owner}/{repo} 两段路径；其余（/tree/…、/issues/…）取前两段 */
export function parseGithubRepo(text: string): RepoRef | null {
  if (!text) return null;
  const regex = /https?:\/\/(?:www\.)?github\.com\/([A-Za-z0-9][A-Za-z0-9-]*)\/([A-Za-z0-9._-]+)/gi;

  for (const match of text.matchAll(regex)) {
    const owner = match[1];
    const repo = match[2]
      .replace(/\.git$/i, "")
      .replace(/[.,;:!?)\]}'"»]+$/, "")
      .trim();
    if (!owner || !repo) continue;
    if (NON_REPO_OWNERS.has(owner.toLowerCase())) continue;
    return { owner, repo, url: `https://github.com/${owner}/${repo}` };
  }

  return null;
}

export type GithubOptions = {
  token?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  backoffMs?: number;
  maxBytes?: number;
};

export async function fetchReadme(
  repo: RepoRef,
  options: GithubOptions = {},
): Promise<ReadmeResult> {
  const res = await fetchText(
    `https://api.github.com/repos/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.repo)}/readme`,
    {
      headers: {
        Accept: "application/vnd.github.raw+json",
        "User-Agent": GITHUB_UA,
        "X-GitHub-Api-Version": "2022-11-28",
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
    },
    { fetchImpl: options.fetchImpl, timeoutMs: options.timeoutMs, backoffMs: options.backoffMs },
  );

  if (res.status === 404) {
    return { ok: false, reason: "404", message: "README 404" };
  }
  if (!res.ok) {
    return {
      ok: false,
      reason: "error",
      message: `GitHub 返回 ${res.status || res.error || "网络错误"}`,
    };
  }

  const maxBytes = options.maxBytes ?? 20_000;
  return { ok: true, text: res.text.slice(0, maxBytes) };
}
