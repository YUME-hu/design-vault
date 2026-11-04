import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
