import { IconButton, useTheme } from "@mui/material";
import React, { useState } from "react";

import "react-grid-layout/css/styles.css";
import { FaTimes } from "react-icons/fa";
import "react-resizable/css/styles.css";
import { useComponentSize } from "../../../hooks/use-component-size";
import { GraphWidgetComponent } from "../../GraphComponents/GraphWidgetComponent";
import "./styles.css";
import { QueryWidgetComponent } from "../../QueryComponents/QueryWidgetComponent";

export const RenderWidget = ({
  widget,
  index,
  handleDelete,
  responsive = true,
}) => {
  const theme = useTheme();
  const widget_type = String(widget).split("_")[0];
  const widget_id = parseInt(String(widget).split("_")[1]);
  const [ref, size] = useComponentSize();
  const [isMouseHover, setIsMouseHover] = useState(false);
  return (
    <div
      className="!p-1 !rounded !h-full !w-full flex-grow relative"
      style={{
        background:
          isMouseHover && responsive
            ? theme.palette.primary.main
            : theme.palette.background.default,

        // borderColor: isMouseHover ? theme.palette.primary.main : "transparent",
      }}
      onMouseEnter={() => {
        setIsMouseHover(true);
      }}
      onMouseLeave={() => {
        setIsMouseHover(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {handleDelete && isMouseHover && responsive && (
        <div
          className="!flex-row justify-end !items-center !w-full absolute top-1 left-1 z-50"
          style={{}}
        >
          <IconButton
            aria-label="delete"
            size="small"
            onClick={(e) => {
              handleDelete(index);
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
            style={{
              // background: theme.palette.background.default,
              borderRadius: 0,
              borderBottomRightRadius: 4,
              background: theme.palette.primary.main,
            }}
          >
            <FaTimes
              className="!text-xs"
              style={{
                color: theme.palette.common.white,
              }}
            />
          </IconButton>
        </div>
      )}
      <div
        className="!flex-row justify-center !items-center !w-full !h-full"
        ref={ref}
      >
        {widget_type === "graph" && (
          <GraphWidgetComponent
            id={widget_id}
            height={size.height}
            width={size.width}
          />
        )}
        {widget_type === "query" && (
          <QueryWidgetComponent
            id={widget_id}
            height={size?.height}
            width={size?.width}
          />
        )}
      </div>
    </div>
  );
};
