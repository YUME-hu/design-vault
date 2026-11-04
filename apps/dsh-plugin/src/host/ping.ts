import type { IncomingMessage, ServerResponse } from "node:http";

import { NAME } from "../shared/constants.ts";
import { readVaultStyles, vaultRoot } from "./vault-reader.ts";

export const PING_PATH = "/plugins/design-vault/ping";

/** M10b spike：验证宿主能否注册 HTTP 路由、客户端能否同源访问 */
export function pingHandler(req: IncomingMessage, res: ServerResponse): void {
  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  const count = Math.min(Math.max(Number(url.searchParams.get("n") ?? "0") || 0, 0), 500);
  const styles = readVaultStyles();

  const body = {
    ok: true,
    plugin: NAME,
    vault: vaultRoot(),
    styles: Array.isArray(styles) ? styles.length : 0,
    n: count,
    items: Array.from({ length: count }, (_, index) => ({
      index,
      bvid: `BVspike${String(index).padStart(4, "0")}`,
      title: `spike payload ${index}`,
    })),
    at: new Date().toISOString(),
  };

  res.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(body));
}

/** 在宿主注册 ping 路由；返回 disposer（webServer 不可用时为 null） */
export function registerPing(ctx: {
  webServer?: {
    register(route: { kind: "exact"; path: string; handler: typeof pingHandler }): () => void;
  };
  logger?: { warn?: (message: string) => void };
}): (() => void) | null {
  if (!ctx.webServer) {
    ctx.logger?.warn?.(`[${NAME}] webServer unavailable, ping route skipped`);
    return null;
  }
  return ctx.webServer.register({ kind: "exact", path: PING_PATH, handler: pingHandler });
}
