import type { Lang } from "./i18n";

/**
 * Prefix an internal path with `/fr` on French routes; pass through unchanged
 * on English. `"/"` maps to `/fr` (no trailing slash). Single source of truth
 * for the per-locale link helpers used across the app (homepage, SiteNav, etc.).
 */
export function localize(lang: Lang, path: string): string {
  if (lang !== "fr") return path;
  return path === "/" ? "/fr" : `/fr${path}`;
}
