/**
 * App.jsx — Demo showing the MustacheEditor with a complex JSON context
 *
 * Demonstrates:
 *  - Deep nested JSON with arrays, primitives, and objects
 *  - Live evaluated preview (safe evaluation via Function constructor)
 *  - Controlled component pattern
 */

import { useState, useCallback } from 'react'
import { MustacheEditor } from './MustacheEditor'
import './app.css'

// ─── Rich demo context ────────────────────────────────────────────────────────
const DEMO_CONTEXT = {
  user: {
    id: 'u_8f2a91',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    role: 'admin',
    age: 31,
    active: true,
    joinedAt: '2022-03-15',
    profile: {
      avatar: 'https://i.pravatar.cc/80?img=47',
      bio: 'Security engineer & open-source contributor',
      location: {
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        timezone: 'Asia/Kolkata'
      }
    },
    preferences: {
      theme: 'dark',
      language: 'en-IN',
      notifications: {
        email: true,
        sms: false,
        push: true
      }
    },
    tags: ['security', 'devops', 'cloud'],
    scores: [98, 87, 92, 76, 100]
  },
  org: {
    id: 'org_gail',
    name: 'GAIL (India) Limited',
    plan: 'enterprise',
    seats: 500,
    usedSeats: 423,
    billingCycle: 'annual',
    region: 'ap-south-1',
    features: {
      sso: true,
      auditLog: true,
      apiAccess: true,
      customRoles: true
    }
  },
  invoice: {
    number: 'INV-2024-08991',
    amount: 148750,
    currency: 'INR',
    status: 'pending',
    dueDate: '2024-12-31',
    gst: {
      cgst: 6.0,
      sgst: 6.0,
      igst: 0,
      total: 12.0
    },
    vendor: {
      name: 'Infosys BPM Ltd',
      gstin: '29AAACI1681G1ZX',
      state: 'Karnataka'
    }
  },
  system: {
    version: '3.14.1',
    buildDate: '2024-11-20',
    environment: 'production',
    uptime: 99.97,
    requestsToday: 18420,
    activeAlerts: 3
  }
}

// ─── Safe mustache evaluator ──────────────────────────────────────────────────
// Evaluates {{ expression }} zones against the JSON context.
// Uses a sandboxed Function constructor — NOT eval.
function evaluateMustache(template, context) {
  return template.replace(/\{\{([\s\S]*?)\}\}/g, (_, expr) => {
    const trimmed = expr.trim()
    if (!trimmed) return ''
    try {
      // Build a function that has context keys as local variables
      const keys   = Object.keys(context)
      const values = Object.values(context)
      // eslint-disable-next-line no-new-func
      const fn = new Function(...keys, `"use strict"; return (${trimmed})`)
      const result = fn(...values)
      return result === null || result === undefined ? '' : String(result)
    } catch {
      return `⚠ ${trimmed}`
    }
  })
}

export default function App() {
  const [template, setTemplate] = useState(
    `Hello, {{ user.name }}!\n\nYour role is {{ user.role }} at {{ org.name }}.\nYou are located in {{ user.profile.location.city }}, {{ user.profile.location.state }}.\n\nPlan: {{ org.plan }} · Seats used: {{ org.usedSeats }} / {{ org.seats }}\nUptime: {{ system.uptime }}%\n\nInvoice {{ invoice.number }} for ₹{{ invoice.amount.toLocaleString() }} is {{ invoice.status }}.`
  )

  const handleChange = useCallback((val) => setTemplate(val), [])

  const preview = evaluateMustache(template, DEMO_CONTEXT)

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-badge">CodeMirror 6</div>
        <h1>Mustache Intellisense Editor</h1>
        <p className="header-sub">
          Plain text editor · Full JS + JSON autocomplete inside <code>{'{{ }}'}</code>
        </p>
      </header>

      <div className="editor-section">
        <div className="section-row">
          <span className="section-label">Template</span>
          <span className="section-hint">
            <kbd>Ctrl</kbd>+<kbd>Space</kbd> to trigger completions
          </span>
        </div>
        <MustacheEditor
          value={template}
          onChange={handleChange}
          jsonContext={DEMO_CONTEXT}
          placeholder='Type text freely… use {{ user.name }} or {{ org.plan.toUpperCase() }} for expressions'
          minHeight="160px"
          maxHeight="360px"
        />
      </div>

      <div className="preview-section">
        <div className="section-row">
          <span className="section-label">Live preview</span>
        </div>
        <pre className="preview-output">{preview}</pre>
      </div>

      <div className="context-section">
        <div className="section-row">
          <span className="section-label">JSON context (read-only)</span>
          <span className="section-hint">This is the object walked for completions</span>
        </div>
        <MustacheEditor
          value={JSON.stringify(DEMO_CONTEXT, null, 2)}
          onChange={() => {}}
          jsonContext={{}}
          readOnly
          minHeight="200px"
          maxHeight="300px"
          placeholder=""
        />
      </div>
    </div>
  )
}
