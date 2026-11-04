/**
 * Host half of design-vault-plugin.
 *
 * Keep this file free of browser APIs: it runs in the DSH Host process.
 * Replace the example with the service, tool or route this plugin owns.
 *
 * @module design-vault-plugin/host
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

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
function debug(line: string): void {
  try {
    fs.appendFileSync(
      path.join(os.tmpdir(), "dsh-design-vault-host.log"),
      `${new Date().toISOString()} ${line}\n`,
    );
  } catch {
    // 诊断日志失败不影响插件加载
  }
}

export function apply(ctx: any): void {
  debug(`apply webServer=${Boolean(ctx.webServer)} inject=${typeof ctx.inject}`);
  ctx.effect(() => {
    ctx.logger?.info?.(`[${NAME}] host half loaded`);
  }, `${NAME}: host`);

  // M10b spike：注册一个只读 ping 路由，验证宿主 HTTP 能力。
  // webServer 可能比本插件晚就绪，因此轮询等待，最多 60 秒。
  ctx.effect(() => {
    let dispose: (() => void) | null = null;
    let tries = 0;
    const timer = setInterval(() => {
      if (dispose) return;
      if (ctx.webServer) {
        debug("webServer ready, registering ping");
        try {
          dispose = registerPing(ctx);
          debug(`ping registered=${Boolean(dispose)}`);
          ctx.logger?.info?.(`[${NAME}] ping route registered`);
        } catch (error) {
          ctx.logger?.warn?.(`[${NAME}] ping route failed: ${(error as Error).message}`);
        }
        clearInterval(timer);
        return;
      }
      tries += 1;
      if (tries % 10 === 0) debug(`wait #${tries} webServer=${Boolean(ctx.webServer)}`);
      if (tries >= 60) clearInterval(timer);
    }, 1000);
    return () => {
      clearInterval(timer);
      dispose?.();
    };
  }, `${NAME}: ping route`);
}
