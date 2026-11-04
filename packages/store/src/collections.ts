import {
  effectsSchema,
  refsSchema,
  stylesSchema,
  type Effect,
  type Ref,
  type Style,
} from "../../core/src/schema";
import { readCollection, writeJsonAtomic } from "./io";

/** data/*.json 的集合读写；缓存交给 lib 层（React cache 不进 store） */
export const STYLES_FILE = "styles.json";
export const DRAFT_FILE = "styles.draft.json";
export const EFFECTS_FILE = "effects.json";
export const REFS_FILE = "refs.json";

export const readStylesFile = (): Style[] => readCollection(STYLES_FILE, stylesSchema);
export const readDraftFile = (): Style[] => readCollection(DRAFT_FILE, stylesSchema);
export const readEffectsFile = (): Effect[] => readCollection(EFFECTS_FILE, effectsSchema);
export const readRefsFile = (): Ref[] => readCollection(REFS_FILE, refsSchema);

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
