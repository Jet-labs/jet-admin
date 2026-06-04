/**
 * MustacheEditor.jsx
 *
 * A React component that renders a CodeMirror 6 editor which behaves like a
 * plain-text input, but provides full JS + JSON-schema intellisense when the
 * cursor is inside a {{ }} mustache zone.
 *
 * Props:
 *   value          {string}   Controlled value
 *   onChange       {fn}       Called with new string on every change
 *   jsonContext    {object}   The JSON object to derive completions from
 *   placeholder    {string}   Placeholder text (optional)
 *   minHeight      {string}   CSS min-height (default: "120px")
 *   maxHeight      {string}   CSS max-height for scroll (default: "400px")
 *   readOnly       {boolean}  (optional)
 *   className      {string}   Extra class on the wrapper (optional)
 */

import { useEffect, useRef, useMemo, useCallback } from 'react'
import { EditorView, keymap, placeholder as cmPlaceholder } from '@codemirror/view'
import { EditorState, Compartment } from '@codemirror/state'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import {
  autocompletion,
  completionKeymap,
  closeBrackets,
  closeBracketsKeymap
} from '@codemirror/autocomplete'

import { useMustacheCompletions } from './useMustacheCompletions'
import { mustacheHighlighter } from './mustacheHighlighter'

// Compartments allow hot-swapping extensions without destroying the editor
const readOnlyCompartment  = new Compartment()
const completionCompartment = new Compartment()

export function MustacheEditor({
  value = '',
  onChange,
  jsonContext = {},
  placeholder = 'Type freely… use {{ }} for JS expressions with autocomplete',
  minHeight = '120px',
  maxHeight = '400px',
  readOnly = false,
  className = ''
}) {
  const containerRef = useRef(null)
  const viewRef      = useRef(null)
  // Track if the current change originated from inside the editor (avoid loops)
  const internalChange = useRef(false)

  // Build the completion source (memoised on jsonContext)
  const mustacheSource = useMustacheCompletions(jsonContext)

  // Base extensions that don't change between renders
  const baseExtensions = useMemo(() => [
    // Undo/redo
    history(),

    // Highlighting of {{ }} zones
    mustacheHighlighter,

    // Autocomplete — our custom source only
    autocompletion({
      override: [mustacheSource],
      defaultKeymap: true,
      closeOnBlur: true,
      activateOnTyping: true,
      maxRenderedOptions: 50
    }),

    // Auto-close brackets/quotes inside JS zones feels natural
    closeBrackets(),

    // Keymaps
    keymap.of([
      ...defaultKeymap,
      ...historyKeymap,
      ...completionKeymap,
      ...closeBracketsKeymap
    ]),

    // Make the editor look like a plain textarea
    EditorView.lineWrapping,

    // Update listener → propagate changes upward
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        internalChange.current = true
        onChange?.(update.state.doc.toString())
      }
    }),

    // Theme — minimal, blends with any design system
    EditorView.theme({
      '&': {
        fontFamily: 'var(--font-mono, "JetBrains Mono", "Fira Code", monospace)',
        fontSize: '14px',
        lineHeight: '1.7',
        outline: 'none',
        background: 'transparent',
        color: 'var(--color-text-primary, #1a1a1a)'
      },
      '.cm-content': {
        padding: '12px 14px',
        minHeight: minHeight,
        maxHeight: maxHeight,
        caretColor: 'var(--color-text-primary, #1a1a1a)'
      },
      '.cm-scroller': {
        overflow: 'auto',
        maxHeight: maxHeight
      },
      '.cm-focused': { outline: 'none' },
      '.cm-cursor': {
        borderLeftColor: 'var(--color-text-primary, #1a1a1a)'
      },
      '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
        background: 'rgba(59,109,17,0.15)'
      },
      // {{ }} delimiter styling
      '.cm-mustache-delim': {
        color: '#185FA5',
        fontWeight: '600',
        opacity: '0.9'
      },
      // Zone interior background tint
      '.cm-mustache-zone': {
        background: 'rgba(24,95,165,0.06)',
        borderRadius: '2px'
      },
      // Autocomplete dropdown
      '.cm-tooltip.cm-tooltip-autocomplete': {
        border: '0.5px solid rgba(0,0,0,0.15)',
        borderRadius: '8px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        background: 'var(--color-background-primary, #fff)',
        fontSize: '13px',
        overflow: 'hidden',
        maxHeight: '260px'
      },
      '.cm-tooltip-autocomplete > ul': {
        fontFamily: 'var(--font-mono, monospace)',
        maxHeight: '260px',
        scrollbarWidth: 'thin'
      },
      '.cm-tooltip-autocomplete > ul > li': {
        padding: '5px 12px',
        lineHeight: '1.5',
        color: 'var(--color-text-primary, #1a1a1a)'
      },
      '.cm-tooltip-autocomplete > ul > li[aria-selected]': {
        background: 'rgba(24,95,165,0.12)',
        color: 'var(--color-text-primary, #1a1a1a)'
      },
      '.cm-completionLabel': {
        color: 'var(--color-text-primary, #1a1a1a)'
      },
      '.cm-completionDetail': {
        color: '#888',
        fontSize: '11px',
        marginLeft: '8px'
      },
      '.cm-completionIcon': {
        marginRight: '4px',
        opacity: '0.7'
      },
      // Placeholder
      '.cm-placeholder': {
        color: 'var(--color-text-tertiary, #aaa)',
        fontStyle: 'italic'
      }
    })
  ], [mustacheSource, minHeight, maxHeight]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Mount the editor once ────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return

    const state = EditorState.create({
      doc: value,
      extensions: [
        ...baseExtensions,
        cmPlaceholder(placeholder),
        readOnlyCompartment.of(EditorState.readOnly.of(readOnly)),
        completionCompartment.of([])
      ]
    })

    const view = new EditorView({ state, parent: containerRef.current })
    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, []) // intentionally empty — mount once

  // ── Sync external value changes INTO the editor ──────────────────────────
  useEffect(() => {
    const view = viewRef.current
    if (!view) return

    // Skip if this change originated inside the editor (we already have it)
    if (internalChange.current) {
      internalChange.current = false
      return
    }

    const current = view.state.doc.toString()
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value }
      })
    }
  }, [value])

  // ── Hot-swap readOnly ────────────────────────────────────────────────────
  useEffect(() => {
    viewRef.current?.dispatch({
      effects: readOnlyCompartment.reconfigure(EditorState.readOnly.of(readOnly))
    })
  }, [readOnly])

  return (
    <div
      ref={containerRef}
      className={`mustache-editor-wrapper ${className}`}
      style={{
        border: '0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.15))',
        borderRadius: '8px',
        background: 'var(--color-background-primary, #fff)',
        transition: 'border-color 0.15s ease',
        cursor: 'text'
      }}
      onFocus={() => {
        if (containerRef.current) {
          containerRef.current.style.borderColor = 'var(--color-border-primary, rgba(0,0,0,0.4))'
          containerRef.current.style.boxShadow = '0 0 0 3px rgba(24,95,165,0.1)'
        }
      }}
      onBlur={() => {
        if (containerRef.current) {
          containerRef.current.style.borderColor = ''
          containerRef.current.style.boxShadow = ''
        }
      }}
    />
  )
}
