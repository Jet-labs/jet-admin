/**
 * Section templates
 *
 * Structural snippets that can be dropped or inserted into the page. They
 * intentionally contain empty rows instead of widget instances: widget keys
 * are tenant-specific, so templates create the layout scaffolding and the
 * user drops real widgets into the empty slots.
 *
 * Node rules match the Craft canvas:
 *   row        → children: container / stack / widget
 *   container  → one inner column; template children are column children (rows)
 *   stack      → direct children
 */

export const SECTION_TEMPLATES = [
  {
    id: "hero",
    label: "Hero section",
    description: "Full-width padded card with two content rows",
    tree: {
      type: "row",
      props: { sizing: "auto", style: { gap: "12px" } },
      children: [
        {
          type: "container",
          props: {
            span: 12,
            sizing: "auto",
            style: {
              padding: "28px",
              borderRadius: "14px",
              backgroundColor: "rgba(59, 130, 246, 0.08)",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "rgba(59, 130, 246, 0.3)",
            },
          },
          children: [
            { type: "row", props: { sizing: "auto" }, children: [] },
            { type: "row", props: { sizing: "auto" }, children: [] },
          ],
        },
      ],
    },
  },
  {
    id: "two-column",
    label: "Two columns",
    description: "Two equal cards side by side",
    tree: {
      type: "row",
      props: { sizing: "auto" },
      children: [
        {
          type: "container",
          props: { span: 6, sizing: "auto", style: { padding: "16px" } },
          children: [{ type: "row", props: { sizing: "auto" }, children: [] }],
        },
        {
          type: "container",
          props: { span: 6, sizing: "auto", style: { padding: "16px" } },
          children: [{ type: "row", props: { sizing: "auto" }, children: [] }],
        },
      ],
    },
  },
  {
    id: "sidebar",
    label: "Sidebar + content",
    description: "Narrow sidebar card beside a wide content card",
    tree: {
      type: "row",
      props: { sizing: "auto" },
      children: [
        {
          type: "container",
          props: { span: 4, sizing: "auto", style: { padding: "16px" } },
          children: [{ type: "row", props: { sizing: "auto" }, children: [] }],
        },
        {
          type: "container",
          props: { span: 8, sizing: "auto", style: { padding: "16px" } },
          children: [
            { type: "row", props: { sizing: "auto" }, children: [] },
            { type: "row", props: { sizing: "auto" }, children: [] },
          ],
        },
      ],
    },
  },
  {
    id: "three-cards",
    label: "Three cards",
    description: "Three equal stat or feature cards",
    tree: {
      type: "row",
      props: { sizing: "auto" },
      children: [4, 4, 4].map(() => ({
        type: "container",
        props: { span: 4, sizing: "auto", style: { padding: "16px" } },
        children: [{ type: "row", props: { sizing: "auto" }, children: [] }],
      })),
    },
  },
  {
    id: "cta-band",
    label: "CTA band",
    description: "Accent band with a single centered row",
    tree: {
      type: "row",
      props: { sizing: "auto" },
      children: [
        {
          type: "container",
          props: {
            span: 12,
            sizing: "auto",
            style: {
              padding: "20px",
              borderRadius: "12px",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "rgba(16, 185, 129, 0.3)",
            },
          },
          children: [{ type: "row", props: { sizing: "auto" }, children: [] }],
        },
      ],
    },
  },
];

export const findSectionTemplate = (templateId) =>
  SECTION_TEMPLATES.find((template) => template.id === templateId) || null;
