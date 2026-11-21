import { appendWidgetToAppPageConfig } from "../src/presentation/components/appPageComponents/editor/appPageLayoutUtils";

describe("appendWidgetToAppPageConfig", () => {
  test("adds exactly one widget placement to a legacy v1 page config", () => {
    const config = { widgets: [], layouts: {}, dataSources: [], variables: [] };
    const next = appendWidgetToAppPageConfig(config, "widget-1");

    expect(next.widgets).toEqual(["widget_widget-1_1"]);
    expect(next.layouts.lg).toHaveLength(1);
    expect(next.layouts.lg[0].i).toBe("widget_widget-1_1");
  });

  test("adds exactly one widget node to a v2 layout", () => {
    const config = {
      widgets: [],
      layoutVersion: 2,
      layout: { id: "ROOT", type: "column", children: [] },
    };
    const next = appendWidgetToAppPageConfig(config, "widget-2");

    expect(next.widgets).toHaveLength(1);
    const widgetNodes = next.layout.children.flatMap((row) => row.children || []);
    expect(widgetNodes.filter((node) => node.type === "widget")).toHaveLength(1);
  });
});
