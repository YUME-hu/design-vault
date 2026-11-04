/**
 * Host half of design-vault-plugin.
 *
 * Keep this file free of browser APIs: it runs in the DSH Host process.
 * Read-only vault access plus the deterministic `DesignConfig` builder.
 *
 * 注意：宿主侧不注册任何 HTTP 路由，也不访问宿主 HTTP 服务；Client 通过本机
 * Web（localhost:3000）的 /api/vault/styles-lite 取数。
 *
 * @module design-vault-plugin/host
 */

import { NAME } from "../shared/constants.ts";

export { buildDesignConfig, renderDesignConfig, type DesignConfig } from "./design-config.ts";
export { readVaultStyles, renderStyleList, vaultRoot, type VaultStyles } from "./vault-reader.ts";

/** Cordis plugin name; must equal the package name so the client bundle id matches. */
export const name = NAME;

/** Host services this plugin reads. Declare them so the loader waits for them. */
export const inject: string[] = [];

/**
 * @param ctx - the Host Cordis context.
 */
export function apply(ctx: any): void {
  ctx.effect(() => {
    ctx.logger?.info?.(`[${NAME}] host half loaded`);
  }, `${NAME}: host`);
}
