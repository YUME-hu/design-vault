/**
 * Clipboard helper for the browser half: async clipboard first, `execCommand`
 * as the fallback for older browsers and non-secure contexts. Everything runs
 * locally; no service is involved.
 *
 * Ported from the original vault's `lib/clipboard.ts`.
 *
 * @module design-vault-plugin/client/clipboard
 */

/**
 * Copy `text` to the clipboard.
 *
 * @param text - the exact string to place on the clipboard.
 * @returns whether the copy succeeded.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the textarea path below.
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-1000px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
