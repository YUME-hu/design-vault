/**
 * Turn one vault style into a `DesignConfig`: the deterministic artefact a
 * consuming project can be generated from.
 *
 * Every colour here comes out of the shared colour engine, never out of a model
 * call, so the same style always produces the same config. Pure: no IO, no
 * clock reads unless the caller passes one in.
 *
 * @module design-vault-plugin/host/design-config
 */

import {
  buildScales,
  contrastChecks,
  formatRatio,
  type ColorScale,
  type ContrastCheck,
} from "../shared/color.ts";
import type { Style } from "../shared/schema.ts";

export type DesignConfigContrast = {
  id: ContrastCheck["id"];
  label: string;
  foreground: string;
  background: string;
  ratio: number;
  ratioLabel: string;
  threshold: number;
  kind: ContrastCheck["kind"];
  pass: boolean;
};

export type DesignConfig = {
  schema: "design-vault/design-config@1";
  generatedAt: string;
  source: {
    styleId: string;
    styleName: string;
    /** Vault file the style came from, when the caller knows it. */
    file?: string;
  };
  palette: Style["palette"];
  /** 50–900 ramp per palette key, generated in OKLCH. */
  scales: Record<string, ColorScale>;
  /** WCAG checks the palette actually passes or fails. */
  contrast: DesignConfigContrast[];
};

export type BuildDesignConfigOptions = {
  /** Vault file the style was read from, recorded for traceability. */
  file?: string;
  /** Fixed clock for reproducible output. */
  now?: Date;
};

function toContrast(check: ContrastCheck): DesignConfigContrast {
  return {
    id: check.id,
    label: check.label,
    foreground: check.foreground,
    background: check.background,
    ratio: Number(check.ratio.toFixed(2)),
    ratioLabel: formatRatio(check.ratio),
    threshold: check.threshold,
    kind: check.kind,
    pass: check.pass,
  };
}

/** Build the config for a single style. Pure: same input, same output. */
export function buildDesignConfig(
  style: Style,
  options: BuildDesignConfigOptions = {},
): DesignConfig {
  const now = options.now ?? new Date();
  return {
    schema: "design-vault/design-config@1",
    generatedAt: now.toISOString(),
    source: {
      styleId: style.id,
      styleName: style.name,
      ...(options.file === undefined ? {} : { file: options.file }),
    },
    palette: style.palette,
    scales: buildScales(style.palette),
    contrast: contrastChecks(style.palette).map(toContrast),
  };
}

/** Serialise for writing to disk: stable 2-space JSON with a trailing newline. */
export function renderDesignConfig(config: DesignConfig): string {
  return `${JSON.stringify(config, null, 2)}\n`;
}
