import type { Metadata } from "next";
import "@fontsource/space-mono/400.css";
import "@fontsource/space-mono/700.css";
import "@fontsource/noto-sans-sc/400.css";
import "@fontsource/noto-sans-sc/500.css";
import "@fontsource/noto-sans-sc/700.css";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteNav } from "@/components/site-nav";
import { getVaultCounts } from "@design-vault/adapters/data";

export const metadata: Metadata = {
  title: {
    default: "DESIGN VAULT / 设计资产库",
    template: "%s · DESIGN VAULT",
  },
  description:
    "个人前端设计风格库：可检索、可复制、可调色的风格资产、配色、提示词与设计令牌。",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const counts = getVaultCounts();

  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-paper text-charcoal antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:border focus:border-charcoal focus:bg-charcoal focus:px-3 focus:py-2 focus:text-paper"
        >
          跳到主内容
        </a>

        {/* 蓝图网格：整页 24px 底纹，不参与交互 */}
        <div className="blueprint pointer-events-none fixed inset-0 -z-10" aria-hidden />

        <SiteHeader />

        <div className="mx-auto flex w-full max-w-console flex-col lg:flex-row">
          <div className="lg:sticky lg:top-[63px] lg:h-[calc(100vh-63px)] lg:self-start lg:overflow-y-auto">
            <SiteNav counts={counts} />
          </div>
          <main id="main" className="ef-skin min-w-0 flex-1">
            {children}
          </main>
        </div>

        <SiteFooter />
      </body>
    </html>
  );
}
