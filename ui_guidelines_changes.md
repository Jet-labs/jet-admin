# UI Guidelines V3 Alignment Changes

This document outlines all the specific occurrences and the changes applied to align the codebase with the `UI_GUIDELINES_V3.md` design system.

## Global Replacements Applied

1. **Banned Hex Colors & Branding**
   - `bg-[#646cff]`, `bg-[#4285F4]` ➔ `bg-primary`
   - `text-white bg-[#646cff]`, `text-white bg-primary` ➔ `text-foreground bg-primary`
   - `hover:bg-[#5558dd]`, `hover:bg-[#4285F4]/90` ➔ `hover:bg-primary/90`
   - `focus:ring-[#646cff]/30`, `focus:ring-[#4285F4]/50` ➔ `focus:ring-primary/30`
   - `text-[#646cff]` ➔ `text-primary`

2. **White Backgrounds & Text**
   - `bg-white` ➔ `bg-background`
   - `text-white` (on primary buttons/badges) ➔ `text-foreground` or `text-background` depending on inversion context

3. **Slate & Blue Conversions to Semantic Tokens**
   - `bg-slate-50` ➔ `bg-muted/50`
   - `bg-slate-100` ➔ `bg-muted`
   - `text-slate-500` ➔ `text-muted-foreground`
   - `text-slate-700` ➔ `text-foreground`
   - `border-slate-200`, `border-slate-300` ➔ `border-border`
   - `bg-blue-50`, `bg-blue-500/10`, `bg-blue-950/40` ➔ `bg-primary/10`
   - `border-blue-300`, `border-blue-500/20` ➔ `border-primary/30` or `border-primary/20`
   - `text-blue-500`, `text-blue-600` ➔ `text-primary`

4. **Typography & Shape**
   - `<Button ... className="... rounded-full ...">` ➔ `rounded-md`
   - `font-bold` (on text-sm, text-base, text-lg, text-xl, text-2xl) ➔ `font-medium`
   - `font-semibold` (on headings text-lg to text-6xl) ➔ `font-medium`

## Files Modified

### Packages (`packages/`)
- **`packages/ui/src/components/button.jsx`**
  - Changed `text-white` to `text-foreground`.
  - Changed `bg-white/5` to `bg-background/5` (if applicable, via automated replacements).
- **`packages/ui/src/components/switch.jsx`**, **`dialog.jsx`**, **`section.jsx`**
  - Replaced `bg-white` with `bg-background`.
  - Adjusted heading font weights from `font-bold` / `font-semibold` to `font-medium`.
- **`packages/widgets-ui/src/vega/vegaConfigEditor.jsx`**, **`fieldPill.jsx`**, **`dataFieldPanel.jsx`**, **`iframeWidget.jsx`**, **`alertWidget.jsx`**
  - Replaced `text-white` on colored buttons with `text-foreground`.
  - Replaced `bg-white` with `bg-background`.
- **`packages/datasources-ui/src/components/common/*`**
  - Replaced `border-slate-200` with `border-border`.
- **`packages/workflow-nodes/src/nodes/*.jsx`** (`startNode`, `endNode`, `delayNode`, `loopNode`, `javascriptNode`, `dataQueryNode`, `dataCollectionNode`)
  - Changed execution status indicators from `bg-blue-500 rounded-full` with `text-white` to `bg-primary rounded-full` with `text-foreground` / `text-background`.
  - Replaced the hardcoded save button pattern `className="px-3 py-1.5 text-sm text-foreground bg-primary rounded-sm..."` with the mandated `className="w-full"`.
- **`packages/workflow-edges/src/edges/DeletableEdge.jsx`**
  - Replaced `rounded-full` with `rounded-md` on the inline delete button.

### Apps (`apps/`)
- **`apps/backend/public/monitor.html`**
  - Replaced `text-white` with `text-foreground`, `font-bold` with `font-medium`.
- **`apps/frontend/src/presentation/pages/signInPage/index.jsx` & `signUpPage/index.jsx`**
  - Replaced `bg-[#4285F4]` Google button color with semantic `bg-primary`.
  - Adjusted `text-lg font-bold` to `text-lg font-medium`.
- **`apps/frontend/src/presentation/components/workflowComponents/*`** (`workflowEditor`, `workflowContextPanel`, `workflowConsole`, `workflowNodeConfigPanel`)
  - Changed `font-bold` headings to `font-medium`.
  - Removed remaining `bg-blue-950` / `border-blue-*` / `text-blue-*` and replaced with `primary` tokens.
- **`apps/frontend/src/presentation/components/widgetComponents/widgetEventsEditor.jsx`**
  - Updated font-weights and color tokens.
- **`apps/frontend/src/presentation/components/auditLogsComponents/auditLogsGridColumnFormatter.jsx`** & **`cronJobComponents/cronJobHistoryGridColumnFormatter.jsx`**
  - Replaced internal usage of `bg-blue-50` and `text-blue-600` with `bg-primary/10` and `text-primary`.
- **`apps/frontend/src/presentation/components/tenantComponents/tenantStats.jsx`**, **`ui/privacyPolicy.jsx`**, **`pages/accountPage/index.jsx`**, **`pages/engineDashboardPage/index.jsx`**
  - Updated header tags (`text-2xl`, `text-xl`) to use `font-medium` instead of `font-bold` or `font-semibold`.

## Exceptions Respected
- **Section Configurator Labels:** `font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground` pattern was explicitly preserved.
- **Micro Chips:** Logic `AND`/`OR` chips and tiny node labels retaining `text-[9px] font-bold` were left intact.
- **`vegaSpecEditor.jsx`**: Preserved the inline `S` style object as it's the only permitted exception for Monaco's embedding context.
