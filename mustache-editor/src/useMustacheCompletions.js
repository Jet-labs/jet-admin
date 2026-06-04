/**
 * useMustacheCompletions.js
 *
 * Core logic: walks a JSON object at mount time (memoised) to build
 * flat dot-notation paths, then provides a CodeMirror 6 completion source
 * that only activates when the cursor is inside a {{ }} zone.
 */

import { useMemo } from 'react'
import { javascriptLanguage } from '@codemirror/lang-javascript'
import { snippetCompletion } from '@codemirror/autocomplete'

// ─── 1. JSON schema walker ────────────────────────────────────────────────────
// Recursively walks any JSON-serialisable object and returns flat dot-notation
// paths with type info and example values.
// Depth-limited to avoid blowing the stack on pathological inputs.

function walkSchema(obj, prefix = '', depth = 0, maxDepth = 6, results = []) {
  if (depth > maxDepth) return results

  const type = Array.isArray(obj) ? 'array' : typeof obj

  if (prefix) {
    const entry = { label: prefix, type }
    if (type !== 'object' && type !== 'array') {
      entry.detail = `${type}: ${JSON.stringify(obj)}`
      entry.boost = 1 // surface leaf nodes higher in the list
    } else {
      entry.detail = type
    }
    results.push(entry)
  }

  if (type === 'object' && obj !== null) {
    for (const key of Object.keys(obj)) {
      const childPrefix = prefix ? `${prefix}.${key}` : key
      walkSchema(obj[key], childPrefix, depth + 1, maxDepth, results)
    }
  } else if (type === 'array') {
    // Walk first 3 array items to infer schema; index them as [0], [1], [2]
    for (let i = 0; i < Math.min(obj.length, 3); i++) {
      walkSchema(obj[i], `${prefix}[${i}]`, depth + 1, maxDepth, results)
    }
  }

  return results
}

// ─── 2. Zone detector ─────────────────────────────────────────────────────────
// Given a CodeMirror EditorState, checks if `pos` sits inside a {{ ... }} zone.
// Uses a simple linear scan of the document text — fast enough for typical
// template strings (< 10 000 chars). For huge documents, consider a Lezer
// grammar instead (see README section 5).

export function getCursorZone(state, pos) {
  const doc = state.doc.toString()
  let searchFrom = 0

  while (searchFrom < doc.length) {
    const open = doc.indexOf('{{', searchFrom)
    if (open === -1) break
    const close = doc.indexOf('}}', open + 2)
    if (close === -1) break

    if (pos > open + 1 && pos <= close) {
      // cursor is inside this {{ }} zone
      // return the sub-string from {{ to cursor so we know what was typed
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

export function useMustacheCompletions(jsonContext) {
  // Memoised: re-walk only when the jsonContext reference changes
  const schemaPaths = useMemo(() => {
    if (!jsonContext || typeof jsonContext !== 'object') return []
    return walkSchema(jsonContext)
  }, [jsonContext])

  // JS keyword/snippet completions from the official CM6 JS language support
  const jsCompletions = useMemo(() => {
    return javascriptLanguage.data.of({
      autocomplete: (ctx) => {
        // Only activate inside a {{ }} zone
        const zone = getCursorZone(ctx.state, ctx.pos)
        if (!zone.inZone) return null
        // Delegate to the built-in JS word matcher
        const word = ctx.matchBefore(/[\w.[\]]*/)
        if (!word || (word.from === word.to && !ctx.explicit)) return null
        return null // let the dedicated source below handle it
      }
    })
  }, [])

  // Schema + JS keyword completion source
  const mustacheCompletionSource = useMemo(() => {
    return (ctx) => {
      const zone = getCursorZone(ctx.state, ctx.pos)
      if (!zone.inZone) return null

      // Match the current word being typed (including dots and brackets)
      const word = ctx.matchBefore(/[\w.[\]"']*/)
      if (!word) return null
      if (word.from === word.to && !ctx.explicit) return null

      const query = word.text.toLowerCase()

      // --- Schema path completions ---
      const schemaOptions = schemaPaths
        .filter(p => p.label.toLowerCase().startsWith(query))
        .slice(0, 50) // cap at 50 to avoid huge dropdowns
        .map(p => ({
          label: p.label,
          detail: p.detail,
          type: p.type === 'object' ? 'namespace'
              : p.type === 'array'  ? 'namespace'
              : p.type === 'function' ? 'function'
              : 'variable',
          boost: p.boost ?? 0,
          info: p.detail ? `Value: ${p.detail}` : undefined
        }))

      // --- JS keyword / snippet completions ---
      const jsKeywords = [
        'if', 'else', 'return', 'const', 'let', 'var', 'function',
        'true', 'false', 'null', 'undefined', 'typeof', 'instanceof',
        'new', 'this', 'class', 'import', 'export', 'default',
        'async', 'await', 'try', 'catch', 'finally', 'throw',
        'for', 'while', 'do', 'break', 'continue', 'switch', 'case',
        'Math.round', 'Math.floor', 'Math.ceil', 'Math.abs', 'Math.max', 'Math.min',
        'JSON.stringify', 'JSON.parse',
        'Array.isArray', 'Object.keys', 'Object.values', 'Object.entries',
        'parseInt', 'parseFloat', 'isNaN', 'String', 'Number', 'Boolean',
        'Date.now', 'new Date',
        '.toString()', '.toFixed(', '.toUpperCase()', '.toLowerCase()',
        '.trim()', '.split(', '.join(', '.map(', '.filter(', '.find(',
        '.reduce(', '.forEach(', '.some(', '.every(', '.includes(',
        '.length', '.slice(', '.replace(', '.indexOf('
      ]

      const jsOptions = jsKeywords
        .filter(k => k.toLowerCase().startsWith(query))
        .slice(0, 30)
        .map(k => ({
          label: k,
          type: k.startsWith('.') ? 'method'
              : /^[A-Z]/.test(k) ? 'class'
              : 'keyword',
          boost: -1 // rank below schema paths
        }))

      const allOptions = [...schemaOptions, ...jsOptions]
      if (allOptions.length === 0 && !ctx.explicit) return null

      return {
        from: word.from,
        options: allOptions,
        validFor: /^[\w.[\]"']*$/
      }
    }
  }, [schemaPaths])

  return mustacheCompletionSource
}
