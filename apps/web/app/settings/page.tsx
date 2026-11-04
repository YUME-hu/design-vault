import type { Metadata } from "next";
import { BiliLoginPanel } from "@/components/settings/bili-login-panel";
import { SettingsPanels } from "@/components/settings/settings-panels";
import { getDeepSeekKey, deepSeekKeySource } from "@design-vault/adapters/auth/api-keys";
import { maskSecret } from "@design-vault/store/secrets";
import { vaultHome, vaultHomeSource } from "@design-vault/store/paths";
import { readUpstreams } from "@design-vault/adapters/ingest/config";
import { readIngestState } from "@design-vault/store/state";

export const metadata: Metadata = { title: "设置" };
export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const key = getDeepSeekKey();
  const masked = maskSecret(key);
  const state = readIngestState();
  const upstreams = readUpstreams().map((upstream) => ({
    uid: upstream.uid,
    name: state.upstreams[upstream.uid]?.name ?? upstream.name ?? "",
    lastCheckedAt: state.upstreams[upstream.uid]?.lastCheckedAt ?? "",
  }));
  const hasSecret = Boolean(process.env.DESIGN_VAULT_SECRET?.trim());

  return (
    <div className="px-4 pb-10 pt-7 sm:px-6 lg:px-8">
      <div className="border-b border-charcoal pb-5">
        <p className="label-strong flex items-center gap-2">
          <span aria-hidden className="h-[6px] w-[6px] bg-signal" />
          INDEX 08 / SETTINGS · V2
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-charcoal sm:text-[40px]">设置</h1>
        <p className="mt-3 max-w-[56ch] text-[13px] leading-7 text-ink-soft">
          扫码登录后，抓取与搜索会自动使用加密保存的凭证；也可以继续用{" "}
          <code className="mono">BILIBILI_SESSDATA</code> 作为兜底。
        </p>
      </div>

      {!hasSecret && (
        <p data-testid="secret-warning" className="mono mt-4 border border-charcoal border-l-[4px] border-l-signal bg-white px-3 py-2 text-[10px] leading-relaxed text-ink-soft">
          未配置 DESIGN_VAULT_SECRET（32 字节 base64），扫码登录会失败（fail closed）。
        </p>
      )}

      <BiliLoginPanel />
      <SettingsPanels
        deepseek={{ ...masked, source: deepSeekKeySource() }}
        vault={{ path: vaultHome(), source: vaultHomeSource() }}
        upstreams={upstreams}
      />
    </div>
  );
}
