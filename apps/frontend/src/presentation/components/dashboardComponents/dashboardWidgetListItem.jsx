import React from "react";
import PropTypes from "prop-types";
import { useDrag } from "react-dnd";
import { CONSTANTS } from "../../../constants";

export const DashboardWidgetListItem = ({ id, type, children }) => {
  DashboardWidgetListItem.propTypes = {
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    // Expecting a function that receives the drag ref
    children: PropTypes.func.isRequired,
  };

  const [{ isDragging }, drag, dragPreview] = useDrag(
    () => ({
      type: CONSTANTS.DASHBOARD_ITEM_TYPES.WIDGET,
      item: () => {
        const instanceId = `${id}-${Date.now()}`;
        console.log(`Dragging started for item: ${instanceId}, type: ${type}`);
        return {
          id: instanceId,
          originalId: id,
          type: type,
          defaultSize: { w: 4, h: 6 },
        };
      },
      end: (item, monitor) => {
        if (monitor.didDrop()) {
          console.log(`Dropped item: ${item.id}`);
        } else {
          console.log(`Drag ended without drop for item: ${item.id}`);
        }
      },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [id, type]
  );

  // Call the children function, passing the drag ref
  const renderedChildren = children(drag);

  return (
    // Attach the drag preview handler to the element returned by the children function
    <div ref={dragPreview} style={{ opacity: isDragging ? 0.5 : 1 }}>
      {/* Render the result of calling the children function */}
      {renderedChildren}
    </div>
  );
};
