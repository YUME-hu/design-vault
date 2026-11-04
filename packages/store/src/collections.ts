import {
  componentsSchema,
  effectsSchema,
  refsSchema,
  stylesSchema,
  type ComponentItem,
  type Effect,
  type Ref,
  type Style,
} from "../../core/src/schema";
import fs from "node:fs";
import { readCollection, writeJsonAtomic } from "./io";
import { dataPath } from "./paths";

/** data/*.json 的集合读写；缓存交给 lib 层（React cache 不进 store） */
export const STYLES_FILE = "styles.json";
export const DRAFT_FILE = "styles.draft.json";
export const EFFECTS_FILE = "effects.json";
export const REFS_FILE = "refs.json";
export const COMPONENTS_FILE = "components.json";

export const readStylesFile = (): Style[] => readCollection(STYLES_FILE, stylesSchema);
export const readDraftFile = (): Style[] => readCollection(DRAFT_FILE, stylesSchema);
export const readEffectsFile = (): Effect[] => readCollection(EFFECTS_FILE, effectsSchema);
export const readRefsFile = (): Ref[] => readCollection(REFS_FILE, refsSchema);
export const readComponentsFile = (): ComponentItem[] =>
  fs.existsSync(dataPath(COMPONENTS_FILE))
    ? readCollection(COMPONENTS_FILE, componentsSchema)
    : [];

export function writeStylesFile(styles: Style[]): void {
  writeJsonAtomic(STYLES_FILE, styles);
}
export function writeDraftFile(drafts: Style[]): void {
  writeJsonAtomic(DRAFT_FILE, drafts);
}
export function writeEffectsFile(effects: Effect[]): void {
  writeJsonAtomic(EFFECTS_FILE, effects);
}
export function writeRefsFile(refs: Ref[]): void {
  writeJsonAtomic(REFS_FILE, refs);
}
export function writeComponentsFile(components: ComponentItem[]): void {
  writeJsonAtomic(COMPONENTS_FILE, components);
}
