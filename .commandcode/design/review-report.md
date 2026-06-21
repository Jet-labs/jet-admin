# Design Review: Jet Admin

**Product Register:** Product — app UI / admin internal-tool builder  
**Surface audited:** Sign-in, sign-up, protected layout (nav + sidebar), app page builder  
**Date:** 2026-06-20  
**Reviewer:** CommandCode Design  

---

## First Impression

The dark indigo theme signals "developer tool" immediately — and correctly. The three-panel builder (editor sidebar | canvas | console) looks like the right tool for the job. Resizable panels and a custom drag-and-drop layout engine say the team has invested in the hard problems.

But the product's visual personality stops at "competent dark theme." The sign-in page is interchangeable with any SaaS product. The nav bar has a 2px purple bottom border that draws the eye but carries no meaning. The builder works well but doesn't leave a memorable impression beyond "it looks like Retool's dark mode."

**Score: 7/10** — Functional and fitting but lacks a memorable point of view.

---

## Hierarchy — Walkthrough

**Entry (Sign-in):** Centered card layout — logo row at top, form below. Clear focus hierarchy: logo → form → submit → Google button → sign-up link. The `Section` card component provides a visual container. Label placement above inputs follows convention well.

**Protected Layout:** Three-tier nesting (Root > Protected > AppPageLayout) is sound architecture. The top nav has logo (left), breadcrumbs (center), user avatar (right) — well-balanced. The sidebar uses resizable panels (20/80 default) with Radix accordion for collapsed sections. Active state highlighting on nav items uses `bg-primary/5` — visible but subtle.

**Builder Surface:** The three-zone layout (editor 20% | canvas 80% vertically stacked above console at 25%) creates clear operational hierarchy. Canvas is the dominant surface, as it should be. The floating `LayoutNodeToolbar` appearing on selection is a good space-saver.

**Typographic hierarchy** is weaker. All heading levels use `font-weight: 400` — no weight contrast between h1, h2, h3. Only `line-height` distinguishes them. This flattens the perceived hierarchy. Sidebar nav items use `font-semibold` which creates a mismatch where nav labels feel heavier than page headings.

**Score: 7/10** — Layout hierarchy is strong. Typographic hierarchy needs weight contrast.

---

## Color Voice

The palette commits to one hue: `#7582ff` (indigo-purple). This hue serves as primary, accent, link color, focus ring, success state, and active nav indicator — all simultaneously. The brand's entire semantic color system runs on a single hue plus gray neutrals.

**What works:** The dark theme is cohesive. `--brand-dark: #171717` and `--brand-dark-card: #1F1F1F` create a subtle surface distinction. Border steps (`--brand-border`, `--brand-border-mid`, `--brand-border-light`) show the team thought about depth.

**What doesn't:**

- **Success = Primary.** The MUI theme maps `success.main` to `#7582ff` — the same purple. There is no green anywhere. This means "success" and "primary action" are visually identical, which breaks the semantic contract.
- **No warning color.** Only destructive (red) exists as a differentiated semantic color. Warning states have no dedicated color.
- **Naming confusion.** Class `.link-lime` styles links in blue (`#3e71cf`). Class `.link-purple` styles links in *white* (`#fafafa`). The names describe neither the color nor the function.
- **Google SSO button** hardcodes `bg-[#4285F4]` inline — brand blue on a branded dark surface. It's visually heavy and breaks the design system's color discipline.
- **Chroma near black.** The darkest surfaces (`#0f0f0f`, `#171717`) are pure neutral. A whisper of indigo chroma in the dark tones would make them feel authored rather than default.

**Score: 6/10** — Cohesive dark palette undermined by confused semantics, naming mismatches, and a missing green.

---

## Type Voice

The font stack aims for "Circular" — a paid Lineto typeface. If licensed, this is a distinctive choice. If not, the fallback (Helvetica Neue, Arial) is generic system text.

**Issues:**

- **No type system.** There is no defined scale. Headings inherit font-size from MUI defaults or browser defaults. No `clamp()`, no fluid type, no leading trim.
- **Heading weight is flat.** All headings use `font-weight: 400`. On a dark background, light headings recede instead of commanding attention. A bolder weight (600-700) for h1/h2 would add structure.
- **h1 line-height: 1.00.** This is extremely tight — descenders on letters like "g" and "j" will collide with the line above. Most h1 settings in the app are page titles that should breathe.
- **Single label style.** `.label-caps` provides one uppercase monospace label at 12px. Useful but not a system. There's no secondary, tertiary, or caption size defined.
- **Body weight is 400 on dark.** `font-weight: 400` at `16px` on `#171717` background is readable but not comfortable for longer content. The side panel text and form labels work fine at this weight — but data-heavy tables in the grid could benefit from slightly more presence.
- **Font mismatch.** The MUI theme sets `fontFamily` to Circular, and the CSS also explicitly sets it on MUI component overrides. This means *every* element is fighting for a premium font that may not be present. If Circular isn't loaded, nothing is left but system fallbacks.

**Score: 6/10** — Aspirational typeface choice but no type system, flat weight hierarchy, and potential licensing gap.

---

## Interaction Feel

**Strengths:**
- Drag-and-drop in the layout editor has thorough visual feedback: drop indicators glow purple on `drag-over`, resize handles appear on hover, row borders highlight, empty drop zones have dashed borders
- Undo system with "N unsaved changes" badge is a UX win — users can explore freely
- Floating `LayoutNodeToolbar` appears contextually on selection, disappearing when not needed
- Toast system (react-toastify) is visually consistent with the dark theme
- `ReactQueryLoadingErrorWrapper` provides consistent loading/error/empty states across all resource pages

**Weaknesses:**
- **`outline: none !important` on buttons** — `button:focus { outline: 0 !important; }` removes the native focus indicator. The custom `box-shadow` fallback works for keyboard users on supported elements but `!important` blocks any override. For buttons that use custom components, the focus ring may not appear at all.
- **No visible disabled states audit** — The codebase uses `disabled` attributes but the visual style of disabled buttons/inputs wasn't verifiable from the HTML alone. Common issue: gray-on-gray disabled states with insufficient contrast.
- **Google SSO button** is a full-width branded button with a hardcoded hover style — it doesn't participate in the design system's interaction patterns.
- **The error state on sign-in** uses `bg-red-950/40` with `text-red-400` — visible but the message "Sign in error! Please check your credentials and try again!" is generic. Tells the user nothing actionable.
- **Keyboard navigation** in the layout editor (drag-and-drop is HTML5 native DnD) — native DnD has poor keyboard support. Users relying on keyboard navigation may not be able to reorder widgets.
- **The sign-up form** serializes the raw error object: `{JSON.stringify(signUpState.error)}` — this displays technical error messages to the user instead of a human-readable message.

**Score: 7/10** — Strong canvas interactions and undo system. Focus management, disabled states, and error copy need attention.

---

## Smell Check

| Smell | Present? | Evidence |
|---|---|---|
| Generic tech palette (blue-purple CTA, blue-to-cyan gradient) | **Yes — partial** | The indigo primary is better than the usual blue-purple gradient, but success=same-purple and no green makes it read as one-note |
| Centered hero, repeated cards, pill buttons | **No** | Builder avoids this pattern; sign-in uses a single centered card (appropriate for auth) |
| Inter/Plus Jakarta/Roboto system font default | **No** | Circular is an actual design decision, albeit an expensive one |
| "AI made this" category reflex | **No** | The custom layout engine, resizable panels, and build-time architecture are specific product decisions, not template reflexes |
| No states beyond idle (loading/error/empty) | **Minimal** | Loading/error/empty states exist via ReactQueryLoadingErrorWrapper — good. Disabled and overflow states are unverified |
| Flat hero, no depth or texture | **Yes — auth pages** | Sign-in and sign-up are flat cards on a solid background. No shadow, no texture, no atmosphere |
| Over-designed empty states | **No** | Empty states use a simple `NoEntityUI` component — appropriate restraint |
| Color as decoration rather than information | **Yes** | Purple is used for *everything* — primary, success, focus, active, accent. When a color means everything, it means nothing |

---

## Scoring Summary

| Lens | Score | Notes |
|---|---|---|
| First impression | 7/10 | Competent dark tool, lacks personality |
| Hierarchy | 7/10 | Strong layout hierarchy, weak typographic hierarchy |
| Color voice | 6/10 | Confused semantics, missing green, naming mismatch |
| Type voice | 6/10 | No type system, flat weight, aspirational font |
| Interaction feel | 7/10 | Great DnD + undo, focus/disabled states need work |
| **Total** | **33/50** | Solid foundation with clear interventions that would lift it |

---

## Top Recommendations (by Impact)

1. **Redesign color semantics** — Add a green for success states (distinct from primary). Add an amber for warnings. Keep purple as primary only. This would fix the most confusing visual bug in the system. *(Mode: recolor)*

2. **Build a type system** — Define a 5-step type scale (h1, h2, h3, body, caption) with distinct weights: h1/h2 at 600-700, body at 400, caption at 500. Add `clamp()` for fluid sizing. *(Mode: typeset)*

3. **Fix heading weight on dark** — Increase h1/h2 to `font-weight: 600-700` and relax h1 `line-height` from 1.00 to at least 1.15. Headings on dark need weight to command attention. *(Mode: refine)*

4. **Add interaction state audit** — Audit disabled states across all inputs and buttons (gray-on-gray is common). Restore keyboard-visible focus outlines by removing `outline: none !important`. *(Mode: interaction)*

5. **Add brand atmosphere to auth pages** — The sign-in and sign-up cards sit on a flat dark background with no texture, shadow, or depth. A subtle gradient, pattern, or atmospheric element would make the entry feel authored. *(Mode: refine or surface)*

6. **Rename `.link-lime` and `.link-purple`** — Call them what they are: `link-brand`, `link-muted`, or similar. The current names describe neither the color nor the function. *(Mode: refine)*

7. **Improve error messages** — Replace "Sign in error! Please check your credentials" with the actual reason (wrong password, account not found, network error). Replace `JSON.stringify(error)` on sign-up with formatted message. *(Mode: writing)*
