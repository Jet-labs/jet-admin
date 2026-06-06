/**
 * useMustacheCompletions.js
 *
 * Provides a CodeMirror 6 completion source that only activates when the cursor
 * is inside a {{ }} zone. All suggestions are produced by the unified
 * `@jet-admin/expression-engine` via its mode-aware `getCompletions` API, so the
 * intellisense shown here always matches what the engine can actually resolve.
 */

import { useMemo } from 'react'
import { getCompletions, MODES } from '@jet-admin/expression-engine'

// ─── 1. Map an expression-engine suggestion → CodeMirror completion option ────
// The engine returns { value, label, detail, type, category }. CodeMirror wants
// { label, apply, detail, type, boost, info }.

function engineTypeToCmType(type) {
  switch (type) {
    case 'object':
    case 'array':
      return 'namespace'
    case 'method':
      return 'method'
    case 'function':
      return 'function'
    case 'property':
      return 'property'
    case 'snippet':
      return 'text'
    default:
      return 'variable'
  }
}

function toCmOption(s) {
  return {
    label: s.label,
    apply: s.value ?? s.label,
    detail: s.detail,
    type: engineTypeToCmType(s.type),
    // Live-state paths rank highest, then member methods, then built-ins.
    boost: s.category === 'live-state'
      ? 2
      : (typeof s.category === 'string' && s.category.endsWith('member'))
        ? 1
        : 0,
    info: s.detail ? `Value: ${s.detail}` : undefined,
  }
}

// ─── 2. Zone detector ─────────────────────────────────────────────────────────
// Given a CodeMirror EditorState, checks if `pos` sits inside a {{ ... }} zone.

export function getCursorZone(state, pos) {
  const doc = state.doc.toString()
  let searchFrom = 0

  while (searchFrom < doc.length) {
    const open = doc.indexOf('{{', searchFrom)
    if (open === -1) break
    const close = doc.indexOf('}}', open + 2)
    if (close === -1) break

    if (pos > open + 1 && pos <= close) {
      return {
        inZone: true,
        zoneStart: open + 2,
        zoneEnd: close,
        typed: doc.slice(open + 2, pos).trim()
      }
    }
    searchFrom = close + 2
  }

  return { inZone: false }
}

// ─── 3. Build CM6 completion source ──────────────────────────────────────────

/**
 * Returns a CodeMirror 6 completion source backed by the unified expression
 * engine. Suggestions are produced by `getCompletions`, so they respect the
 * active `mode` (safe-path → object keys only; js-template/isolated-js → object
 * keys + JS built-ins + member methods).
 *
 * @param {object} jsonContext  The live context/state tree to suggest against.
 * @param {string} [mode]       Expression-engine mode (defaults to js-template).
 */
export function useMustacheCompletions(jsonContext, mode = MODES.JS_TEMPLATE) {
  return useMemo(() => {
    const stateTree =
      jsonContext && typeof jsonContext === 'object' ? jsonContext : null

    return (ctx) => {
      const zone = getCursorZone(ctx.state, ctx.pos)
      if (!zone.inZone) return null

      // Match the current word being typed (including dots and brackets)
      const word = ctx.matchBefore(/[\w.[\]"']*/)
      if (!word) return null
      if (word.from === word.to && !ctx.explicit) return null

      const filter = word.text
      const query = filter.toLowerCase()

      // Delegate to the unified engine — single source of truth for what is
      // resolvable in the active mode.
      const suggestions = getCompletions({ filter, stateTree, mode })

      const options = suggestions
        .filter((s) => {
          if (!query) return true
          const value = (s.value || s.label || '').toLowerCase()
          const label = (s.label || '').toLowerCase()
          return value.includes(query) || label.includes(query)
        })
        .slice(0, 80) // cap to avoid huge dropdowns
        .map(toCmOption)

      if (options.length === 0 && !ctx.explicit) return null

      return {
        from: word.from,
        options,
        validFor: /^[\w.[\]"']*$/,
      }
    }
  }, [stateTreeKey(jsonContext), mode]) // eslint-disable-line react-hooks/exhaustive-deps
}

// Stable-ish dependency key so the memo only rebuilds when the context identity
// changes (the consumer already memoises the object it passes in).
function stateTreeKey(jsonContext) {
  return jsonContext && typeof jsonContext === 'object' ? jsonContext : null
}
