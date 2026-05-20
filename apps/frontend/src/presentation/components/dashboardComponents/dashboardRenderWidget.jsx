import PropTypes from "prop-types";
import { X } from 'lucide-react';
import React, { useState } from "react";
import "react-grid-layout/css/styles.css";
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
  stateTree,
  onQueryResult,
}) => {
  DashboardRenderWidget.propTypes = {
    widget: PropTypes.string.isRequired,
    tenantID: PropTypes.number.isRequired,
    index: PropTypes.number.isRequired,
    handleDelete: PropTypes.func,
    responsive: PropTypes.bool,
    editable: PropTypes.bool,
    stateTree: PropTypes.object,
    onQueryResult: PropTypes.func,
  };
  const widgetID = String(widget).split("_")[1];
  const [ref, size] = useComponentSize();
  const [isMouseHover, setIsMouseHover] = useState(false);

  return (
    <Card
      className={`!h-full !w-full flex-grow relative rounded-none overflow-hidden border bg-background/95 transition-all duration-200 ${isMouseHover
        ? "border-primary"
        : "border-border/80 shadow-sm"
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
          className="absolute right-0 top-0 z-50"
        >
          <Button
            onClick={() => {
              handleDelete(index);
            }}
            variant='destructive-ghost'
            size="sm"
            square
            className="rounded-none p-0 bg-primary/10 text-primary h-6 w-6"
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
            aria-label="Remove widget"
          >
            <X className="!text-[10px]" />
          </Button>
        </div>
      )}
      <div
        className="!flex-row justify-center !items-center !w-full !h-full"
        ref={ref}
      >
        <DashboardWidget
          widgetID={widgetID}
          tenantID={tenantID}
          height={size.height}
          width={size.width}
          stateTree={stateTree}
          onQueryResult={onQueryResult}
        />
      </div>
    </Card>
  );
};
