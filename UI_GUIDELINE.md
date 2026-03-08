# UI Guidelines

This document serves as the single source of truth for the aesthetics, dimensions, and component usage to ensure consistency across the application. Any new component or page should adhere to these specifications.

## Layouts & Dimensions

### Forms & Centered Content
- **Max Width**: `max-w-2xl` is the preferred standard for forms and centered reading content. Avoid using percentages (like `w-2/3`) for max width to ensure consistent scaling on ultra-wide monitors.
- **Container Structure**:
  ```jsx
  <div className="flex w-full h-full flex-col items-center overflow-y-auto p-4 md:p-8">
    <section className="max-w-2xl w-full">
      {/* Content */}
    </section>
  </div>
  ```

### Cards & Sections
- **Background**: `bg-background` (paired with `text-foreground`) for primary content areas. Avoid using `bg-card`, `border`, or `shadow` to create boxed layouts for main forms, as a flat, borderless aesthetic is preferred for better reading experience and seamless dark mode support.
- **Padding**: `p-6` or `p-8` for outer form containers to maintain visual rhythm.

## Typography & Colors

### Text & Headings
- **Page Titles**: `text-2xl font-semibold tracking-tight` (omit explicit text color to inherit `text-card-foreground` or use `text-foreground`).
- **Sub-Titles / Explanations**: `text-sm text-muted-foreground`
- **Section Headers**: `text-lg font-semibold`

### Labels & Inputs
- **Labels**: Standard shadcn `@jet-admin/ui` `Label` component.
- **Inputs**: Use the standard shadcn `@jet-admin/ui` `Input` component without aggressive color overrides. The default rings (`focus-visible:ring-2`) and background colors provide the best accessibility.

## Components

### Buttons
- Use the standard shadcn `Button` component from `@jet-admin/ui`.
- **Primary Actions**: `variant="default"` (often omitted as it is the default).
- **Secondary/Cancel Actions**: `variant="outline"` or `variant="ghost"`.
- **Destructive Actions**: `variant="destructive"` or `variant="destructive-ghost"`.
- **Icon Alignment**: When using icons alongside text in buttons, use `mr-2` for left-aligned icons and `w-4 h-4` for the icon sizing.

#### Button Sizing Rules
Based on the codebase standard (`~215` buttons), adhere to the following strict sizing rules:
1. **Default (`size="default"` or omitted)**: 
   - **Use Case**: Top-level page actions, primary entity forms (Addition/Updation forms), authentication pages, and prominent user flows.
   - **Specs**: `h-8 py-1.5 px-3`
2. **Small (`size="sm"`)**: 
   - **Use Case**: High-density interfaces. This is the standard for nested panels, data tables, complex builders (Workflow Editor, Widget Configs, Vega Editor), and compact modal dialogs where vertical space is premium.
   - **Specs**: `h-7 px-2.5 text-xs`
3. **Icon (`size="icon"`)**:
   - **Use Case**: Buttons that contain *only* an icon without any text label. Common in table row actions, collapsible sidebar toggles, and adjacent input actions (like copy-to-clipboard).
   - **Specs**: Square `h-8 w-8` (or scaled down with `className="h-6 w-6"` for extreme density).
4. **Large (`size="lg"`)**:
   - **Use Case**: Generally avoided in this admin interface. Reserve strictly for major marketing calls-to-action or massive empty state flows.
   - **Specs**: `h-10 px-6`
5. **Sizing Consistency**: When grouping related actions side-by-side (like "Submit" and "Delete" or "Save" and "Cancel"), ensure they use the **exact same size** property to prevent jarring structural layouts.

### Spacing
- **Vertical Spacing**: Use `space-y-3` or `space-y-4` for stacked form fields and items to ensure a compact, dense visual rhythm. Avoid excessive `space-y-6` unless creating large distinct sections.
- **Margins**: Avoid hardcoded margins where `space-y-*` or `gap-*` (in flex grids) can be used. Use `mb-3` or `mt-3` for specific element offsets instead of larger margins.

### Drawer / Sidebar Lists
- **Container**: `bg-background` (paired with `border-r border-border` only if the drawer is *not* already encapsulated within a ResizablePanel component, in which case the panel handles the dividing border). Use `p-2` or `p-3` for container padding.
- **Top-Level Actions**: If the drawer starts with an action button (e.g., "Add Item"), use `variant="primary-ghost"`. Its bottom margin should match the container's padding (if container is `p-2`, use `mb-2` for the button) to ensure balanced spacing.
- **Scroll Lists**: Scrollable lists of items within the drawer must have ample bottom padding (e.g., `pb-10`) so that when the user scrolls to the very bottom, the final item is not sitting flush against the edge of the screen/drawer.
- **Primary Items**:
  - **Active State**: Use `bg-primary/10 text-primary`.
  - **Inactive State**: Use `text-slate-700 hover:bg-slate-100 hover:text-slate-900` (for main drawer) or `text-muted-foreground hover:bg-muted hover:text-foreground` (for nested/secondary drawers).
- **Secondary/Sub Items**: Use smaller icons and `text-muted-foreground`.

### Empty States & Loading
- Use pulsing skeletons (`animate-pulse bg-muted`) designed to match the shape of the content they are replacing.
- Loading buttons should display the `<Spinner size={16} className="mr-2" />` disabled state.
