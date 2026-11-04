import { COMPONENT_CATEGORIES, type ComponentCategory } from "./schema";

const CATEGORY_SET = new Set<string>(COMPONENT_CATEGORIES);

export type NormalizedComponentCandidate = {
  name: string;
  category: ComponentCategory;
  description: string;
  framework: "react" | "html";
  code: string;
  dependencies: string[];
  states: { name: string; description: string }[];
};

export function normalizeComponentCandidate(raw: unknown): NormalizedComponentCandidate | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name.trim() : "";
  if (!name) return null;

  const category =
    typeof record.category === "string" && CATEGORY_SET.has(record.category)
      ? (record.category as ComponentCategory)
      : "other";
  const framework = record.framework === "html" ? "html" : "react";
  const code = typeof record.code === "string" ? record.code : "";
  const dependencies = Array.isArray(record.dependencies)
    ? record.dependencies.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
  const states = Array.isArray(record.states)
    ? record.states
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const state = item as Record<string, unknown>;
          const stateName = typeof state.name === "string" ? state.name.trim() : "";
          if (!stateName) return null;
          return {
            name: stateName,
            description: typeof state.description === "string" ? state.description : "",
          };
        })
        .filter((item): item is { name: string; description: string } => item !== null)
    : [];

  return {
    name,
    category,
    description: typeof record.description === "string" ? record.description : "",
    framework,
    code,
    dependencies,
    states,
  };
}

export type NormalizedEffectCandidate = {
  name: string;
  tech_stack: string[];
  description: string;
  code_snippet: string;
};

export function normalizeEffectCandidate(raw: unknown): NormalizedEffectCandidate | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name.trim() : "";
  if (!name) return null;
  return {
    name,
    tech_stack: Array.isArray(record.tech_stack)
      ? record.tech_stack.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      : [],
    description: typeof record.description === "string" ? record.description : "",
    code_snippet: typeof record.code_snippet === "string" ? record.code_snippet : "",
  };
}
