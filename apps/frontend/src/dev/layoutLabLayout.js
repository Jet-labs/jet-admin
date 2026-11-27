const widget = (id, label, options = {}) => ({
  id,
  type: "widget",
  widgetKey: label,
  span: options.span ?? 6,
  sizing: options.sizing ?? "fill",
  ...(options.width != null ? { width: options.width } : {}),
  ...(options.height != null ? { height: options.height } : {}),
  ...(options.style ? { style: options.style } : {}),
  ...(options.condition ? { condition: options.condition } : {}),
  ...(options.hideMode ? { hideMode: options.hideMode } : {}),
  ...(options.keepMounted ? { keepMounted: true } : {}),
});

const layerStack = (id, background, children) => ({
  id,
  type: "stack",
  span: 12,
  sizing: "fill",
  direction: "vertical",
  gap: 0,
  align: "stretch",
  style: {
    padding: "16px",
    borderRadius: "0px",
    backgroundColor: background,
  },
  children,
});

export const LAB_LAYOUT = {
  id: "lab-root",
  type: "column",
  style: {
    padding: "0px",
    gap: "0px",
    borderRadius: "0px",
    backgroundImage:
      "linear-gradient(135deg, rgba(14,165,233,0.06), rgba(168,85,247,0.04) 55%, rgba(245,158,11,0.05))",
  },
  children: [
    {
      id: "lab-row-zero",
      type: "row",
      sizing: "auto",
      style: {
        gap: "0px",
        padding: "0px",
        margin: "0px",
        borderRadius: "0px",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "#334155",
        backgroundColor: "rgba(15,23,42,0.28)",
      },
      children: [
        widget("lab-widget-zero-1", "zero-grid-a", {
          span: 4,
          height: 96,
          style: {
            padding: "0px",
            margin: "0px",
            borderRadius: "0px",
            borderWidth: "2px",
            borderStyle: "solid",
            borderColor: "#f59e0b",
          },
        }),
        widget("lab-widget-zero-2", "zero-grid-b", { span: 4, height: 96 }),
        widget("lab-widget-zero-3", "zero-grid-c", { span: 4, height: 96 }),
      ],
    },
    {
      id: "lab-container-zero",
      type: "container",
      span: 12,
      sizing: "auto",
      style: {
        padding: "0px",
        margin: "0px",
        gap: "0px",
        borderRadius: "0px",
        borderWidth: "1px",
        borderStyle: "dashed",
        borderColor: "#475569",
        backgroundColor: "rgba(30,41,59,0.28)",
      },
      children: {
        id: "lab-container-inner",
        type: "column",
        style: { padding: "0px", gap: "0px" },
        children: [
          {
            id: "lab-container-row-a",
            type: "row",
            style: {
              gap: "24px",
              padding: "8px",
              borderRadius: "0px",
              backgroundColor: "rgba(59,130,246,0.07)",
            },
            children: [
              widget("lab-container-widget-a1", "container-a1", { span: 6, height: 88 }),
              widget("lab-container-widget-a2", "container-a2", { span: 6, height: 88 }),
            ],
          },
          {
            id: "lab-container-row-b",
            type: "row",
            style: {
              gap: "0px",
              padding: "0px",
              borderRadius: "0px",
              backgroundColor: "rgba(16,185,129,0.06)",
            },
            children: [
              widget("lab-container-widget-b1", "container-b1", { span: 4, height: 80 }),
              widget("lab-container-widget-b2", "container-b2", { span: 4, height: 80 }),
              widget("lab-container-widget-b3", "container-b3", { span: 4, height: 80 }),
            ],
          },
        ],
      },
    },
    {
      id: "lab-row-wrap",
      type: "row",
      sizing: "auto",
      style: {
        gap: "8px",
        padding: "0px",
        borderRadius: "0px",
        backgroundColor: "rgba(56,189,248,0.05)",
      },
      children: [
        widget("lab-wrap-widget-1", "wrap-span-8-a", { span: 8, height: 72 }),
        widget("lab-wrap-widget-2", "wrap-span-8-b", { span: 8, height: 72 }),
      ],
    },
    {
      id: "lab-row-fixed",
      type: "row",
      sizing: "fixed",
      fixedHeight: 120,
      style: {
        gap: "8px",
        padding: "8px",
        borderRadius: "0px",
        backgroundColor: "rgba(16,185,129,0.05)",
      },
      children: [
        widget("lab-fixed-widget-1", "fixed-row-a", { span: 6, sizing: "fill" }),
        widget("lab-fixed-widget-2", "fixed-row-b", { span: 6, sizing: "fill" }),
      ],
    },
    {
      id: "lab-row-sizing",
      type: "row",
      style: { gap: "8px", padding: "0px", borderRadius: "0px" },
      children: [
        {
          id: "lab-container-fixed",
          type: "container",
          span: 6,
          sizing: "fixed",
          fixedHeight: 160,
          style: {
            padding: "8px",
            borderRadius: "0px",
            backgroundColor: "rgba(14,165,233,0.06)",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "#0ea5e9",
          },
          children: {
            id: "lab-container-fixed-inner",
            type: "column",
            style: { padding: "0px", gap: "8px" },
            children: [
              {
                id: "lab-container-fixed-row",
                type: "row",
                style: { gap: "8px", padding: "0px" },
                children: [
                  widget("lab-container-fixed-widget-1", "fixed-container-a", {
                    span: 6,
                    height: 60,
                  }),
                  widget("lab-container-fixed-widget-2", "fixed-container-b", {
                    span: 6,
                    height: 60,
                  }),
                ],
              },
            ],
          },
        },
        {
          id: "lab-stack-fixed",
          type: "stack",
          span: 6,
          sizing: "fixed",
          fixedHeight: 160,
          direction: "vertical",
          gap: 8,
          align: "stretch",
          style: {
            padding: "8px",
            borderRadius: "0px",
            backgroundColor: "rgba(236,72,153,0.06)",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "#db2777",
          },
          children: [
            widget("lab-stack-fixed-widget-1", "fixed-stack-a", { height: 60 }),
            widget("lab-stack-fixed-widget-2", "fixed-stack-b", { height: 60 }),
          ],
        },
      ],
    },
    {
      id: "lab-row-nested",
      type: "row",
      style: {
        gap: "16px",
        padding: "8px",
        borderRadius: "12px",
        backgroundColor: "rgba(168,85,247,0.06)",
      },
      children: [
        {
          id: "lab-container-nested",
          type: "container",
          span: 6,
          sizing: "auto",
          style: {
            padding: "0px",
            gap: "8px",
            borderRadius: "0px",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "#7c3aed",
            backgroundColor: "rgba(168,85,247,0.10)",
          },
          children: {
            id: "lab-container-nested-inner",
            type: "column",
            style: { padding: "0px", gap: "8px" },
            children: [
              {
                id: "lab-container-nested-row",
                type: "row",
                style: { gap: "4px", padding: "0px" },
                children: [
                  widget("lab-nested-widget-1", "nested-1", { span: 6, height: 72 }),
                  widget("lab-nested-widget-2", "nested-2", { span: 6, height: 72 }),
                ],
              },
            ],
          },
        },
        {
          id: "lab-stack-h",
          type: "stack",
          span: 6,
          sizing: "auto",
          direction: "horizontal",
          wrap: true,
          gap: 0,
          align: "center",
          style: {
            padding: "0px",
            borderRadius: "0px",
            minHeight: "120px",
            backgroundColor: "rgba(20,184,166,0.10)",
          },
          children: [
            widget("lab-stack-widget-h1", "stack-horizontal-1", {
              width: 220,
              height: 76,
              style: { borderRadius: "0px" },
            }),
            widget("lab-stack-widget-h2", "stack-horizontal-2", { width: 220, height: 76 }),
            widget("lab-stack-widget-h3", "stack-horizontal-3", { width: 220, height: 76 }),
          ],
        },
      ],
    },
    {
      id: "lab-stack-v",
      type: "stack",
      span: 12,
      direction: "vertical",
      gap: 24,
      wrap: false,
      align: "center",
      style: {
        padding: "16px",
        borderRadius: "0px",
        backgroundColor: "rgba(245,158,11,0.08)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
      },
      children: [
        widget("lab-stack-widget-v1", "stack-vertical-100", { width: "100%", height: 72 }),
        widget("lab-stack-widget-v2", "stack-vertical-60", { width: "60%", height: 72 }),
        widget("lab-stack-widget-v3", "stack-vertical-fixed", { width: 180, height: 72 }),
        {
          id: "lab-stack-nested",
          type: "stack",
          direction: "horizontal",
          wrap: true,
          gap: 8,
          align: "center",
          sizing: "auto",
          style: {
            width: "100%",
            padding: "8px",
            borderRadius: "0px",
            backgroundColor: "rgba(56,189,248,0.10)",
          },
          children: [
            widget("lab-stack-deep-widget-1", "nested-stack-1", {
              width: 140,
              height: 60,
            }),
            widget("lab-stack-deep-widget-2", "nested-stack-2", {
              width: 180,
              height: 60,
            }),
          ],
        },
      ],
    },
    {
      id: "lab-zstack",
      type: "z-stack",
      span: 12,
      sizing: "auto",
      layerOpacities: [1, 0.55, 0.9],
      style: {
        padding: "0px",
        borderRadius: "0px",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "#db2777",
        backgroundColor: "rgba(236,72,153,0.06)",
        overflow: "hidden",
      },
      children: [
        layerStack("lab-z-layer-1", "rgba(14,165,233,0.18)", [
          widget("lab-z-widget-1", "z-layer-1", { span: 12, height: 200 }),
        ]),
        layerStack("lab-z-layer-2", "rgba(16,185,129,0.18)", [
          widget("lab-z-widget-2", "z-layer-2", { width: 320, height: 140 }),
        ]),
        layerStack("lab-z-layer-3", "rgba(245,158,11,0.18)", [
          widget("lab-z-widget-3", "z-layer-3", { width: 240, height: 100 }),
        ]),
      ],
    },
    {
      id: "lab-row-conditional-core",
      type: "row",
      style: { gap: "8px", padding: "0px", borderRadius: "0px" },
      children: [
        {
          id: "lab-container-conditional",
          type: "container",
          span: 6,
          sizing: "auto",
          condition: "{{ state.variables.showConditional }}",
          style: {
            padding: "8px",
            borderRadius: "0px",
            borderWidth: "1px",
            borderStyle: "dashed",
            borderColor: "#0ea5e9",
          },
          children: {
            id: "lab-container-conditional-inner",
            type: "column",
            style: { padding: "0px", gap: "0px" },
            children: [
              {
                id: "lab-container-conditional-row",
                type: "row",
                style: { padding: "0px", gap: "0px" },
                children: [
                  widget("lab-container-conditional-widget", "conditional-container", {
                    span: 12,
                    height: 64,
                  }),
                ],
              },
            ],
          },
        },
        {
          id: "lab-stack-conditional",
          type: "stack",
          span: 6,
          sizing: "auto",
          direction: "vertical",
          gap: 0,
          align: "stretch",
          condition: "{{ state.variables.showConditional }}",
          style: {
            padding: "8px",
            borderRadius: "0px",
            borderWidth: "1px",
            borderStyle: "dashed",
            borderColor: "#10b981",
          },
          children: [
            widget("lab-stack-conditional-widget", "conditional-stack", {
              height: 64,
            }),
          ],
        },
      ],
    },
    {
      id: "lab-row-conditional",
      type: "row",
      style: { gap: "8px", padding: "0px", borderRadius: "0px" },
      children: [
        widget("lab-widget-cond-a", "conditional-visible", {
          span: 4,
          height: 88,
          condition: "{{ state.variables.showConditional }}",
        }),
        widget("lab-widget-cond-b", "conditional-preserve-space", {
          span: 4,
          height: 88,
          condition: "{{ state.variables.showPromo }}",
          hideMode: "preserve-space",
          keepMounted: true,
        }),
        widget("lab-widget-cond-c", "conditional-collapse", {
          span: 4,
          height: 88,
          condition: "{{ state.variables.showPromo }}",
          hideMode: "collapse",
        }),
      ],
    },
    {
      id: "lab-repeat-row",
      type: "row",
      repeat: {
        collection: "{{ state.queries.demoItems.data }}",
        itemAlias: "item",
        indexAlias: "index",
      },
      style: { gap: "0px", padding: "0px", borderRadius: "0px" },
      children: [
        widget("lab-repeat-widget", "repeated-row", {
          span: 12,
          height: 64,
          style: { borderRadius: "0px" },
        }),
      ],
    },
  ],
};

export const LAB_STATE_TREE = {
  variables: {
    showConditional: true,
    showPromo: true,
    accent: "#38bdf8",
  },
  queries: {
    demoItems: {
      data: [
        { name: "Alpha", value: 12 },
        { name: "Beta", value: 34 },
        { name: "Gamma", value: 56 },
      ],
      isLoading: false,
      error: null,
    },
  },
  workflows: {},
  widgets: {},
  globals: { lab: true },
};
