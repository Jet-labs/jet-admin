import PropTypes from "prop-types";
import { FileCode } from 'lucide-react';
import React, { useEffect, useState } from "react";
import { CONSTANTS } from "../../../constants";
import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@jet-admin/ui";
export const WidgetCustomCSSForm = ({ tenantID, widgetID, }) => {
  WidgetCustomCSSForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
    widgetID: PropTypes.number.isRequired,
  };
  const widgetPreviewKey = `widgetPreview_${tenantID}_${widgetID}`;
  const [widgetClassList, setWidgetClassList] = useState([]);
  const [open, setOpen] = React.useState(false);
  const _handleOpen = () => {
    setOpen(true);
  };
  const _handleClose = () => {
    setOpen(false);
  };
  const _handleOnAccepted = () => {
    _handleClose();
  };

  useEffect(() => {
    if (!open || !widgetPreviewKey) {
      setWidgetClassList([]);
      return;
    }
    const timer = setTimeout(() => {
      const element = document.getElementById(widgetPreviewKey);

      if (element) {
        const classList = element.classList;
        const classArray = Array.from(classList);
        setWidgetClassList(classArray);
      } else {
        console.warn(
          `DynamicCssOverrideForm: Element with ID "${widgetPreviewKey}" not found.`
        );
      }
    }, 50);

    // Cleanup the timer if the component unmounts or dependencies change
    return () => clearTimeout(timer);
  }, [tenantID, widgetID, widgetPreviewKey, open]);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={_handleOpen}
        className="text-xs bg-muted text-primary hover:bg-foreground/10 hover:text-primary"
      >
        <FileCode className="text-base mr-1" />
        {CONSTANTS.STRINGS.APP_PAGE_WIDGET_CUSTOM_CSS_BUTTON}
      </Button>
      <Dialog open={open} onOpenChange={(v) => { if (!v) _handleClose(); }}>
        <DialogContent className="max-w-lg p-4">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-sm font-semibold">
              {CONSTANTS.STRINGS.APP_PAGE_WIDGET_CUSTOM_CSS_FORM_TITLE}
            </DialogTitle>
          </DialogHeader>
          <div className="px-0">
            <span className="font-normal text-sm">
              {CONSTANTS.STRINGS.APP_PAGE_WIDGET_CUSTOM_CSS_FORM_DESCRIPTION}
            </span>
            {widgetPreviewKey && (
              <div className="mt-4">
                <span className="font-normal text-sm">
                  Widget class list: {widgetPreviewKey}
                </span>
              </div>
            )}
            {JSON.stringify(widgetClassList)}
          </div>
          <DialogFooter className="gap-2">
            <Button
              onClick={_handleClose}
              type="button"
              variant="secondary"
            >
              {CONSTANTS.STRINGS.APP_PAGE_WIDGET_CUSTOM_CSS_FORM_CANCEL}
            </Button>

            <Button
              type="button"
              onClick={_handleOnAccepted}

            >
              {CONSTANTS.STRINGS.APP_PAGE_WIDGET_CUSTOM_CSS_FORM_CONFIRM}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
