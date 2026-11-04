import { vaultHome } from "@design-vault/store/paths";
import { execFile } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { z } from "zod";

/**
 * 视觉兜底：下载 → 截 3 帧 → sharp 拼图 → 视觉模型（JSON 输出）。
 * 所有重活都走依赖注入，verify:m3b 用 mock 拦掉 ffmpeg / 模型。
 */

export const FRAMES_ROOT = path.join(vaultHome(), "data", "frames");

export function resolveFfmpeg(): string {
  if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH;

  // 1) 让 @ffmpeg-installer 自己报告绝对路径（Next 打包后 require 可能被改写，所以用 createRequire）
  try {
    const requireFromHere = createRequire(import.meta.url);
    const installer = requireFromHere("@ffmpeg-installer/ffmpeg") as { path?: string };
    if (installer.path && fs.existsSync(installer.path)) return installer.path;
  } catch {
    // 继续用下面的路径探测
  }

  // 2) 直接找 node_modules 里的二进制（Windows 是 ffmpeg.exe）
  const binary = process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg";
  const packages = ["win32-x64", "win32-ia32", "linux-x64", "linux-arm64", "darwin-x64", "darwin-arm64"];
  for (const name of packages) {
    const candidate = path.join(vaultHome(), "node_modules", "@ffmpeg-installer", name, binary);
    if (fs.existsSync(candidate)) return candidate;
  }

  return "ffmpeg";
}

/** ffmpeg 是否可用（启动任务前先查，避免跑一半 ENOENT） */
export function ffmpegStatus(): { ok: boolean; path: string } {
  const resolved = resolveFfmpeg();
  return { ok: path.isAbsolute(resolved) && fs.existsSync(resolved), path: resolved };
}

const visualSchema = z
  .object({
    name: z.string().min(1).max(60),
    summary: z.string().min(1).max(400),
    color_direction: z.object({
      temperature: z.enum(["warm", "cool", "neutral"]),
      saturation: z.enum(["muted", "balanced", "vivid"]),
      contrast: z.enum(["low", "medium", "high"]),
      semantic_hint: z.string().min(1).max(80),
    }),
    project_tags: z.array(z.string()).default([]),
  })
  .strict();

export type VisualExtraction = z.infer<typeof visualSchema>;

export type VisionDeps = {
  /** 下载视频到本地（60s 超时） */
  download(playUrl: string, dest: string): Promise<void>;
  /** ffmpeg 截 3 帧（10s 超时） */
  extractFrames(videoPath: string, outDir: string, durationSec: number): Promise<string[]>;
  /** 视觉模型分析拼图（30s 超时） */
  analyze(imagePath: string): Promise<unknown>;
  now?: () => Date;
};

export type VisionResult =
  | { ok: true; montagePath: string; frames: string[]; visual: VisualExtraction }
  | { ok: false; error: string };

export function runProcess(command: string, args: string[], timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    execFile(command, args, { timeout: timeoutMs, windowsHide: true, shell: false }, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

export async function defaultDownload(playUrl: string, dest: string): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60_000);
  try {
    const response = await fetch(playUrl, {
      headers: { Referer: "https://www.bilibili.com/", "User-Agent": "Mozilla/5.0" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`视频下载失败：${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, buffer);
  } finally {
    clearTimeout(timer);
  }
}

export async function defaultExtractFrames(
  videoPath: string,
  outDir: string,
  durationSec: number,
): Promise<string[]> {
  const ffmpeg = resolveFfmpeg();
  const fractions = [0.1, 0.5, 0.9];
  const frames: string[] = [];
  for (const fraction of fractions) {
    const output = path.join(outDir, `frame-${Math.round(fraction * 100)}.png`);
    const time = Math.max(0.1, durationSec * fraction);
    await runProcess(
      ffmpeg,
      ["-y", "-ss", String(time), "-i", videoPath, "-frames:v", "1", "-vf", "scale=640:-1", output],
      10_000,
    );
    if (fs.existsSync(output)) frames.push(output);
  }
  return frames;
}

export async function makeMontage(frames: string[], output: string): Promise<void> {
  if (frames.length === 0) throw new Error("没有可用帧");
  const images = await Promise.all(frames.map((file) => sharp(file).toBuffer()));
  const meta = await Promise.all(images.map((buffer) => sharp(buffer).metadata()));
  const height = Math.min(...meta.map((item) => item.height ?? 360));
  const resized = await Promise.all(
    images.map((buffer) => sharp(buffer).resize({ height }).toBuffer()),
  );
  const widths = await Promise.all(resized.map((buffer) => sharp(buffer).metadata()));
  const totalWidth = widths.reduce((sum, item) => sum + (item.width ?? 0), 0);

  await sharp({
    create: { width: totalWidth, height, channels: 3, background: "#ffffff" },
  })
    .composite(
      resized.map((buffer, index) => ({
        input: buffer,
        left: widths.slice(0, index).reduce((sum, item) => sum + (item.width ?? 0), 0),
        top: 0,
      })),
    )
    .png()
    .toFile(output);
}

function pick<T extends string>(value: unknown, mapping: [RegExp, T][], fallback: T): T {
  const text = typeof value === "string" ? value : "";
  for (const [pattern, result] of mapping) if (pattern.test(text)) return result;
  return fallback;
}

/** 模型偶尔把长句塞进枚举字段，这里按关键词收敛，避免整条丢弃 */
export function normalizeVisual(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const record = { ...(raw as Record<string, unknown>) };
  const direction = record.color_direction;
  if (direction && typeof direction === "object") {
    const d = direction as Record<string, unknown>;
    const hint = typeof d.semantic_hint === "string" ? d.semantic_hint : "";
    record.color_direction = {
      temperature: pick(d.temperature, [[/暖|warm/i, "warm"], [/冷|cool/i, "cool"]], "neutral"),
      saturation: pick(d.saturation, [[/高饱和|鲜艳|vivid/i, "vivid"], [/低饱和|灰|muted/i, "muted"]], "balanced"),
      contrast: pick(d.contrast, [[/高|high/i, "high"], [/低|low/i, "low"]], "medium"),
      semantic_hint: (hint || String(d.temperature ?? "") || "视觉模型未给出色彩描述").slice(0, 80),
    };
  }
  return record;
}

export async function runVisionFallback(
  deps: VisionDeps,
  input: { bvid: string; durationSec: number; playUrl: string },
  onStep?: (step: "download" | "frames" | "vision", message: string) => void,
): Promise<VisionResult> {
  const dir = path.join(FRAMES_ROOT, input.bvid);
  fs.mkdirSync(dir, { recursive: true });
  const videoPath = path.join(os.tmpdir(), `dv-${input.bvid}-${Date.now()}.mp4`);

  try {
    onStep?.("download", "下载中…");
    await deps.download(input.playUrl, videoPath);

    onStep?.("frames", "截帧中…");
    const frames = await deps.extractFrames(videoPath, dir, input.durationSec);
    if (frames.length === 0) return { ok: false, error: "截帧失败：没有取到画面" };

    const montagePath = path.join(dir, "montage.png");
    await makeMontage(frames, montagePath);

    onStep?.("vision", "视觉分析中…");
    const raw = await deps.analyze(montagePath);
    const parsed = visualSchema.safeParse(normalizeVisual(raw));
    if (!parsed.success) {
      return { ok: false, error: `视觉模型输出不合法：${parsed.error.issues[0]?.message}` };
    }
    if (/#[0-9a-f]{3,8}\b/i.test(JSON.stringify(parsed.data.color_direction))) {
      return { ok: false, error: "视觉模型输出包含 HEX 色值，已拒绝" };
    }

    return { ok: true, montagePath, frames, visual: parsed.data };
  } catch (error) {
    return { ok: false, error: `视觉兜底失败：${(error as Error).message}` };
  } finally {
    // 临时视频一定清掉，帧和拼图留在 data/frames/{bvid}/
    fs.rmSync(videoPath, { force: true });
  }
}
