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
