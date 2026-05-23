import React from "react";
import LayoutRow from "./LayoutRow.jsx";
import LayoutWidgetSlot from "./LayoutWidgetSlot.jsx";
import LayoutContainer from "./LayoutContainer.jsx";
import LayoutStack from "./LayoutStack.jsx";
import "./layout.css";

export default function LayoutRenderer({
  node,
  renderWidget,
  mode = "view",
  activeNodeId = null,
  onNodeClick = null,
  ...rest
}) {
  if (!node) return null;

  const nodeProps = {
    renderWidget,
    mode,
    activeNodeId,
    onNodeClick,
    ...rest,
  };

  switch (node.type) {
    case "column":
      return (
        <div className="layout-column" id={node.id}>
          {node.children?.map((child) => (
            <LayoutRenderer key={child.id} node={child} {...nodeProps} />
          ))}
        </div>
      );

    case "row":
      return (
        <LayoutRow key={node.id} node={node} mode={mode}>
          {node.children?.map((child) => (
            <LayoutRenderer key={child.id} node={child} {...nodeProps} />
          ))}
        </LayoutRow>
      );

    case "widget":
      return (
        <LayoutWidgetSlot
          key={node.id}
          node={node}
          renderWidget={renderWidget}
          mode={mode}
          activeNodeId={activeNodeId}
          onNodeClick={onNodeClick}
        />
      );

    case "container":
      return (
        <LayoutContainer
          key={node.id}
          node={node}
          mode={mode}
          activeNodeId={activeNodeId}
          onNodeClick={onNodeClick}
        >
          <LayoutRenderer node={node.children} {...nodeProps} />
        </LayoutContainer>
      );

    case "stack":
      return (
        <LayoutStack
          key={node.id}
          node={node}
          mode={mode}
          activeNodeId={activeNodeId}
          onNodeClick={onNodeClick}
        >
          {node.children?.map((child) => (
            <LayoutRenderer key={child.id} node={child} {...nodeProps} />
          ))}
        </LayoutStack>
      );

    default:
      return null;
  }
}
