import { IconButton, useTheme } from "@mui/material";
import React, { useState } from "react";

import "react-grid-layout/css/styles.css";
import { FaTimes } from "react-icons/fa";
import "react-resizable/css/styles.css";
import { useComponentSize } from "../../../logic/hooks/useComponentSize";
import { DatabaseDashboardChartWidget } from "../widgetTypes/databaseDashboardChartWidget";
import { DatabaseDashboardQueryWidget } from "../widgetTypes/databaseDashboardQueryWidget";
import { DatabaseDashboardTextWidget } from "../widgetTypes/databaseDashboardTextWidget";

export const DatabaseDashboardRenderWidget = ({
  widget,
  tenantID,
  index,
  handleDelete,
  responsive = true,
  editable = true,
}) => {
  const theme = useTheme();
  const widgetType = String(widget).split("_")[0];
  const widgetID = String(widget).split("_")[1].split("-")[0];
  const [ref, size] = useComponentSize();
  const [isMouseHover, setIsMouseHover] = useState(false);

  return (
    <div
      className={`!h-full !w-full flex-grow relative  ${
        isMouseHover ? "border border-[#646cff]" : "border border-slate-200"
      }`}
      onMouseEnter={
        editable
          ? () => {
              setIsMouseHover(true);
            }
          : null
      }
      onMouseLeave={
        editable
          ? () => {
              setIsMouseHover(false);
            }
          : null
      }
      onClick={
        editable
          ? (e) => {
              e.stopPropagation();
            }
          : null
      }
    >
      {handleDelete && isMouseHover && responsive && editable && (
        <div
          className="!flex-row justify-end !items-center !w-full  absolute top-0 left-0 z-50"
          style={{}}
        >
          <button
            onClick={(e) => {
              handleDelete(index);
            }}
            className="p-1 rounded-none m-0 bg-[#646cff]"
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
          >
            <FaTimes className="!text-xs text-white" />
          </button>
        </div>
      )}
      <div
        className="!flex-row justify-center !items-center !w-full !h-full"
        ref={ref}
      >
        {widgetType == "chart" && (
          <DatabaseDashboardChartWidget
            databaseChartID={widgetID}
            tenantID={tenantID}
            height={size.height}
            width={size.width}
          />
        )}
        {widgetType == "query" && (
          <DatabaseDashboardQueryWidget
            databaseQueryID={widgetID}
            tenantID={tenantID}
            height={size.height}
            width={size.width}
          />
        )}
        {widgetType == "text" && (
          <DatabaseDashboardTextWidget
            databaseWidgetID={widgetID}
            tenantID={tenantID}
            height={size.height}
            width={size.width}
          />
        )}
      </div>
    </div>
  );
};
