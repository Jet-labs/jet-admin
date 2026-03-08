import PropTypes from "prop-types";
import React, { useState } from "react";
import "react-grid-layout/css/styles.css";
import { FaTimes } from "react-icons/fa";
import "react-resizable/css/styles.css";
import { useComponentSize } from "../../../logic/hooks/useComponentSize";
import { DashboardWidget } from "./dashboardWidget";

import { Button, Card } from "@jet-admin/ui";
export const DashboardRenderWidget = ({
  widget,
  tenantID,
  index,
  handleDelete,
  responsive = true,
  editable = true,
}) => {
  DashboardRenderWidget.propTypes = {
    widget: PropTypes.string.isRequired,
    tenantID: PropTypes.number.isRequired,
    index: PropTypes.number.isRequired,
    handleDelete: PropTypes.func,
    responsive: PropTypes.bool,
    editable: PropTypes.bool,
  };
  const widgetID = String(widget).split("_")[1];
  const [ref, size] = useComponentSize();
  const [isMouseHover, setIsMouseHover] = useState(false);

  return (
    <Card
      className={`!h-full !w-full flex-grow relative overflow-hidden border bg-background/95 transition-all duration-200 ${isMouseHover
        ? "border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20"
        : "border-slate-200/80 shadow-sm"
        } ${editable ? "hover:-translate-y-0.5" : ""}`}
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
          className="absolute right-2 top-2 z-50"
        >
          <Button
            onClick={() => {
              handleDelete(index);
            }}
            variant="destructive-ghost"
            size="icon"
            className="h-7 w-7 rounded-md border border-red-100 bg-white/95 shadow-sm"
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
            aria-label="Remove widget"
          >
            <FaTimes className="!text-[10px]" />
          </Button>
        </div>
      )}
      <div
        className="!flex-row justify-center !items-center !w-full !h-full bg-gradient-to-br from-background via-background to-slate-50"
        ref={ref}
      >
        <DashboardWidget
          widgetID={widgetID}
          tenantID={tenantID}
          height={size.height}
          width={size.width}
        />
      </div>
    </Card>
  );
};
