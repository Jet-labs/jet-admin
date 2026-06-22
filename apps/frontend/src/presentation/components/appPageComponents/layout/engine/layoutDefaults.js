export const generateNodeId = (type) => {
  return `${type}_${Math.random().toString(36).substring(2, 9)}`;
};

export const createColumnNode = (children = []) => {
  return {
    id: generateNodeId("col"),
    type: "column",
    children,
  };
};

export const createRowNode = (children = []) => {
  return {
    id: generateNodeId("row"),
    type: "row",
    children,
  };
};

export const createWidgetNode = (widgetKey, span = 6, sizing = "fill") => {
  return {
    id: generateNodeId("slot"),
    type: "widget",
    widgetKey,
    span,
    sizing,
  };
};

export const createContainerNode = (span = 12, sizing = "auto") => {
  return {
    id: generateNodeId("container"),
    type: "container",
    span,
    sizing,
    children: createColumnNode([]),
  };
};

export const createZStackNode = (span = 12, sizing = "fill", children = []) => {
  return {
    id: generateNodeId("zstack"),
    type: "z-stack",
    span,
    sizing,
    children,
  };
};

export const createDefaultLayout = () => {
  return createColumnNode([
    createRowNode([])
  ]);
};
