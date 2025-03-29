import { useCallback } from "react";

const widgetOptions = [
  // Container CSS Options
  {
    name: "Container CSS Class",
    key: "databaseWidgetConfig.containerTailwindCss",
    type: "text",
    description: "Tailwind CSS classes for the container",
    relevantWidgets: [],
  },
  {
    name: "Widget CSS Class",
    key: "databaseWidgetConfig.widgetTailwindCss",
    type: "text",
    description: "Tailwind CSS classes for the widget",
    relevantWidgets: ["text"],
  },
  // Container Custom CSS
  {
    name: "Container Width",
    key: "databaseWidgetConfig.containerCss.width",
    type: "text",
    description: "Custom width for container (e.g., 100%, 200px)",
    relevantWidgets: [],
  },
  {
    name: "Container Height",
    key: "databaseWidgetConfig.containerCss.height",
    type: "text",
    description: "Custom height for container (e.g., 100%, 200px)",
    relevantWidgets: [],
  },
  {
    name: "Container Padding",
    key: "databaseWidgetConfig.containerCss.padding",
    type: "text",
    description: "Custom padding for container (e.g., 10px, 1rem)",
    relevantWidgets: [],
  },
  // Widget Custom CSS
  {
    name: "Widget Width",
    key: "databaseWidgetConfig.widgetCss.width",
    type: "text",
    description: "Custom width for widget (e.g., 100%, 200px)",
    relevantWidgets: ["text"],
  },
  {
    name: "Widget Height",
    key: "databaseWidgetConfig.widgetCss.height",
    type: "text",
    description: "Custom height for widget (e.g., 100%, 200px)",
    relevantWidgets: ["text"],
  },
  {
    name: "Widget Padding",
    key: "databaseWidgetConfig.widgetCss.padding",
    type: "text",
    description: "Custom padding for widget (e.g., 10px, 1rem)",
    relevantWidgets: ["text"],
  },
  // Widget Typography
  {
    name: "Font Family",
    key: "databaseWidgetConfig.widgetCss.fontFamily",
    type: "select",
    description: "Font family for the widget text",
    options: [
      "system-ui",
      "Arial",
      "Helvetica",
      "Times New Roman",
      "Georgia",
      "Courier New",
      "monospace",
      "sans-serif",
      "serif",
    ],
    relevantWidgets: ["text"],
  },
  {
    name: "Font Size",
    key: "databaseWidgetConfig.widgetCss.fontSize",
    type: "text",
    description: "Font size (e.g., 16px, 1.2rem)",
    relevantWidgets: ["text"],
  },
  {
    name: "Font Weight",
    key: "databaseWidgetConfig.widgetCss.fontWeight",
    type: "select",
    description: "Font weight for the text",
    options: [
      "normal",
      "bold",
      "100",
      "200",
      "300",
      "400",
      "500",
      "600",
      "700",
      "800",
      "900",
    ],
    relevantWidgets: ["text"],
  },
  {
    name: "Font Style",
    key: "databaseWidgetConfig.widgetCss.fontStyle",
    type: "select",
    description: "Font style for the text",
    options: ["normal", "italic", "oblique"],
    relevantWidgets: ["text"],
  },
  {
    name: "Text Decoration",
    key: "databaseWidgetConfig.widgetCss.textDecoration",
    type: "select",
    description: "Text decoration style",
    options: ["none", "underline", "overline", "line-through"],
    relevantWidgets: ["text"],
  },
  {
    name: "Text Transform",
    key: "databaseWidgetConfig.widgetCss.textTransform",
    type: "select",
    description: "Text transformation",
    options: ["none", "uppercase", "lowercase", "capitalize"],
    relevantWidgets: ["text"],
  },
  {
    name: "Letter Spacing",
    key: "databaseWidgetConfig.widgetCss.letterSpacing",
    type: "text",
    description: "Space between letters (e.g., 1px, 0.1em)",
    relevantWidgets: ["text"],
  },
  {
    name: "Word Spacing",
    key: "databaseWidgetConfig.widgetCss.wordSpacing",
    type: "text",
    description: "Space between words (e.g., 2px, 0.2em)",
    relevantWidgets: ["text"],
  },
  {
    name: "Line Height",
    key: "databaseWidgetConfig.widgetCss.lineHeight",
    type: "text",
    description: "Line height (e.g., 1.5, 24px)",
    relevantWidgets: ["text"],
  },
  {
    name: "Text Align",
    key: "databaseWidgetConfig.widgetCss.textAlign",
    type: "select",
    description: "Text alignment",
    options: ["left", "center", "right", "justify"],
    relevantWidgets: ["text"],
  },

  // Widget Colors and Background
  {
    name: "Text Color",
    key: "databaseWidgetConfig.widgetCss.color",
    type: "color",
    description: "Text color",
    relevantWidgets: ["text"],
  },
  {
    name: "Background Color",
    key: "databaseWidgetConfig.widgetCss.backgroundColor",
    type: "color",
    description: "Background color",
    relevantWidgets: ["text"],
  },
  {
    name: "Background Opacity",
    key: "databaseWidgetConfig.widgetCss.opacity",
    type: "text",
    description: "Background opacity (0-1)",
    relevantWidgets: ["text"],
  },

  // Widget Border
  {
    name: "Border Style",
    key: "databaseWidgetConfig.widgetCss.borderStyle",
    type: "select",
    description: "Border style",
    options: ["none", "solid", "dashed", "dotted", "double", "groove", "ridge"],
    relevantWidgets: ["text"],
  },
  {
    name: "Border Width",
    key: "databaseWidgetConfig.widgetCss.borderWidth",
    type: "text",
    description: "Border width (e.g., 1px, 2px)",
    relevantWidgets: ["text"],
  },
  {
    name: "Border Color",
    key: "databaseWidgetConfig.widgetCss.borderColor",
    type: "color",
    description: "Border color",
    relevantWidgets: ["text"],
  },
  {
    name: "Border Radius",
    key: "databaseWidgetConfig.widgetCss.borderRadius",
    type: "text",
    description: "Border radius (e.g., 4px, 0.5rem)",
    relevantWidgets: ["text"],
  },

  // Widget Shadow and Effects
  {
    name: "Box Shadow",
    key: "databaseWidgetConfig.widgetCss.boxShadow",
    type: "text",
    description: "Box shadow (e.g., 0 2px 4px rgba(0,0,0,0.1))",
    relevantWidgets: ["text"],
  },
  {
    name: "Text Shadow",
    key: "databaseWidgetConfig.widgetCss.textShadow",
    type: "text",
    description: "Text shadow (e.g., 1px 1px 2px rgba(0,0,0,0.5))",
    relevantWidgets: ["text"],
  },
  {
    name: "Backdrop Filter",
    key: "databaseWidgetConfig.widgetCss.backdropFilter",
    type: "text",
    description: "Backdrop filter (e.g., blur(5px))",
    relevantWidgets: ["text"],
  },

  // Widget Spacing
  {
    name: "Margin",
    key: "databaseWidgetConfig.widgetCss.margin",
    type: "text",
    description: "Outer spacing (e.g., 10px, 1rem)",
    relevantWidgets: ["text"],
  },
  {
    name: "Padding",
    key: "databaseWidgetConfig.widgetCss.padding",
    type: "text",
    description: "Inner spacing (e.g., 10px, 1rem)",
    relevantWidgets: ["text"],
  },

  // Widget Size and Position
  {
    name: "Width",
    key: "databaseWidgetConfig.widgetCss.width",
    type: "text",
    description: "Width (e.g., 100%, 200px)",
    relevantWidgets: ["text"],
  },
  {
    name: "Height",
    key: "databaseWidgetConfig.widgetCss.height",
    type: "text",
    description: "Height (e.g., 100%, 200px)",
    relevantWidgets: ["text"],
  },
  {
    name: "Min Width",
    key: "databaseWidgetConfig.widgetCss.minWidth",
    type: "text",
    description: "Minimum width (e.g., 100px)",
    relevantWidgets: ["text"],
  },
  {
    name: "Max Width",
    key: "databaseWidgetConfig.widgetCss.maxWidth",
    type: "text",
    description: "Maximum width (e.g., 500px)",
    relevantWidgets: ["text"],
  },
  {
    name: "Min Height",
    key: "databaseWidgetConfig.widgetCss.minHeight",
    type: "text",
    description: "Minimum height (e.g., 50px)",
    relevantWidgets: ["text"],
  },
  {
    name: "Max Height",
    key: "databaseWidgetConfig.widgetCss.maxHeight",
    type: "text",
    description: "Maximum height (e.g., 300px)",
    relevantWidgets: ["text"],
  },
  {
    name: "Overflow",
    key: "databaseWidgetConfig.widgetCss.overflow",
    type: "select",
    description: "Content overflow behavior",
    options: ["visible", "hidden", "scroll", "auto"],
    relevantWidgets: ["text"],
  },

  // Widget Transform and Transition
  {
    name: "Transform",
    key: "databaseWidgetConfig.widgetCss.transform",
    type: "text",
    description: "Transform (e.g., rotate(45deg), scale(1.1))",
    relevantWidgets: ["text"],
  },
  {
    name: "Transition",
    key: "databaseWidgetConfig.widgetCss.transition",
    type: "text",
    description: "Transition effects (e.g., all 0.3s ease)",
    relevantWidgets: ["text"],
  },
];

export const DatabaseWidgetAdvancedOptions = ({
  widgetForm,
  parentWidgetType,
  initialValues: initialOpts = {},
}) => {
  const renderOption = useCallback(
    (option) => {
      const {
        key,
        type,
        description,
        options: selectOptions,
        ...rest
      } = option;

      if (!option.relevantWidgets.includes(parentWidgetType)) return null;

      const formValue = key
        .split(".")
        .reduce((acc, part) => acc?.[part], widgetForm.values);

      const commonProps = {
        key,
        className:
          "w-full text-xs p-1.5 bg-slate-50 border border-slate-300 rounded",
        value: formValue || "",
        onChange: (e) => {
          const value =
            type === "number"
              ? +e.target.value
              : type === "boolean"
              ? e.target.value === "true"
              : e.target.value;

          widgetForm.setFieldValue(key, value);
        },
      };

      switch (type) {
        case "boolean":
          return (
            <select
              {...commonProps}
              className="placeholder:text-slate-400 text-xs bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block w-full px-1.5 py-1"
            >
              <option value={"true"} className="text-slate-500 text-xs">
                Yes
              </option>
              <option value={"false"} className="text-slate-500 text-xs">
                No
              </option>
            </select>
          );

        case "color":
          return <input type="color" {...commonProps} />;

        case "select":
          return (
            <select
              {...commonProps}
              className="placeholder:text-slate-400 text-xs bg-slate-50 border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 block w-full px-1.5 py-1"
            >
              {selectOptions.map((opt) => (
                <option key={opt} value={opt} className="text-slate-500 text-xs">
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </option>
              ))}
            </select>
          );

        default:
          return (
            <input
              {...commonProps}
              className={`placeholder:text-slate-400 w-full text-xs bg-slate-50 border border-slate-300 text-slate-700 rounded block py-1 px-1.5 focus:outline-none focus:border-slate-400`}
              type={type}
              placeholder={description}
            />
          );
      }
    },
    [widgetForm]
  );

  return (
    <div className="grid grid-cols-2 gap-4 p-0 mt-2">
      {widgetOptions.filter(
        (option) => option.relevantWidgets.includes(parentWidgetType)
      ).map((option) => (
        <div key={option.key} className="col-span-2">
          <label className="block mb-2 text-xs font-medium text-slate-600">
            {option.name}
            <span className="text-slate-400 text-[10px] block">
              {option.description}
            </span>
          </label>
          {widgetForm && renderOption(option)}
        </div>
      ))}
    </div>
  );
};
