/**
 * Host half of design-vault-plugin.
 *
 * Keep this file free of browser APIs: it runs in the DSH Host process.
 * Replace the example with the service, tool or route this plugin owns.
 *
 * @module design-vault-plugin/host
 */

import { NAME } from "../shared/constants.ts";
import { registerPing } from "./ping.ts";

/**
 * Read-only vault access plus the deterministic `DesignConfig` builder.
 * Re-exported so the host half owns them; the demo in `scripts/read-vault.ts`
 * exercises the same entry points.
 */
export { buildDesignConfig, renderDesignConfig, type DesignConfig } from "./design-config.ts";
export { readVaultStyles, renderStyleList, vaultRoot, type VaultStyles } from "./vault-reader.ts";
export { PING_PATH, pingHandler, registerPing } from "./ping.ts";

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

  // M10b spike：注册一个只读 ping 路由，验证宿主 HTTP 能力
  ctx.effect(() => {
    const dispose = registerPing(ctx);
    return () => dispose?.();
  }, `${NAME}: ping route`);
}
