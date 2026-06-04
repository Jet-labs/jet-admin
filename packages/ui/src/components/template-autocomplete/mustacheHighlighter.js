/**
 * mustacheHighlighter.js
 *
 * A lightweight CodeMirror 6 ViewPlugin that:
 *   1. Highlights {{ and }} delimiters with a distinct color
 *   2. Adds a subtle background tint to the JS zone between them
 *   3. Marks {{ }} zones with a CSS class so external CSS can style them
 *
 * Uses Mark decorations (inline ranges) — zero re-render cost.
 */

import { ViewPlugin, Decoration } from '@codemirror/view'
import { RangeSetBuilder } from '@codemirror/state'

// Decoration types — created once, reused
const delimMark = Decoration.mark({ class: 'cm-mustache-delim' })
const zoneMark  = Decoration.mark({ class: 'cm-mustache-zone'  })

function buildDecorations(view) {
  const builder = new RangeSetBuilder()
  const doc = view.state.doc
  const text = doc.toString()

  let searchFrom = 0

  while (searchFrom < text.length) {
    const open = text.indexOf('{{', searchFrom)
    if (open === -1) break

    const close = text.indexOf('}}', open + 2)
    if (close === -1) break

    // Ranges MUST be added in ascending `from` position order.
    // Open delimiter → zone interior → close delimiter.
    builder.add(open, open + 2, delimMark)        // {{
    if (close > open + 2) {
      builder.add(open + 2, close, zoneMark)      // interior
    }
    builder.add(close, close + 2, delimMark)       // }}

    searchFrom = close + 2
  }

  return builder.finish()
}

export const mustacheHighlighter = ViewPlugin.fromClass(
  class {
    constructor(view) {
      this.decorations = buildDecorations(view)
    }

    update(update) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = buildDecorations(update.view)
      }
    }
  },
  { decorations: v => v.decorations }
)
