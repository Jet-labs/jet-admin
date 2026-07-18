import { useEffect } from "react";

/**
 * Dynamically override the browser tab title for a specific page.
 * Use this in pages that need a title based on server data
 * (e.g. "Edit Query: my-query-name" after the query loads).
 *
 * The RootLayout already handles static titles via route `handle.title`.
 * This hook is for dynamic/async overrides only.
 *
 * @param {string | null | undefined} title - The page-specific title segment.
 *   Pass `null` or `undefined` to fall back to the static route title.
 */
export const usePageTitle = (title) => {
  useEffect(() => {
    if (!title) return;
    const prev = document.title;
    document.title = `${title} — Jet Admin`;
    return () => {
      document.title = prev;
    };
  }, [title]);
};
