import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

// 仓库根（apps/web 的上两级），用于 env 与 tracing
const repoRoot = path.resolve(process.cwd(), "../..");
const envFile = path.join(repoRoot, ".env.local");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
}

const nextConfig: NextConfig = {
  outputFileTracingRoot: repoRoot,
  transpilePackages: [
    "@design-vault/core",
    "@design-vault/store",
    "@design-vault/adapters",
  ],
  reactStrictMode: true,
  // 本地自用工具：不对外部署，不做任何远程图片/字体域名配置。
  poweredByHeader: false,
};

export default nextConfig;
