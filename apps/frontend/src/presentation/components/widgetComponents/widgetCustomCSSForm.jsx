import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { CONSTANTS } from "../../../constants";
import { PiFileCssFill } from "react-icons/pi";

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
      <button
        type="button"
        onClick={_handleOpen}
        className="rounded text-xs m-0 inline-flex bg-slate-100 p-2 text-[#646cff] hover:text-[#646cff] outline-none focus:outline-none hover:outline-none border-0 focus:border-0 hover:border-0"
      >
        <PiFileCssFill className="!text-base mr-1" />
        {CONSTANTS.STRINGS.DASHBOARD_WIDGET_CUSTOM_CSS_BUTTON}
      </button>
      <Dialog
        open={open}
        onClose={_handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle className="!p-3 !text-sm !flex flex-row justify-between items-center w-full !font-semibold">
          {CONSTANTS.STRINGS.DASHBOARD_WIDGET_CUSTOM_CSS_FORM_TITLE}
        </DialogTitle>
        <DialogContent className="!px-3">
          <span className="!font-normal !text-sm">
            {CONSTANTS.STRINGS.DASHBOARD_WIDGET_CUSTOM_CSS_FORM_DESCRIPTION}
          </span>
          {widgetPreviewKey && (
            <div className="mt-4">
              <span className="!font-normal !text-sm">
                Widget class list: {widgetPreviewKey}
              </span>
            </div>
          )}
          {JSON.stringify(widgetClassList)}
        </DialogContent>
        <DialogActions className="!p-3 !pt-1">
          <button
            onClick={_handleClose}
            type="button"
            className={`px-2.5 py-1.5 text-sm !text-slate-600 border-0 hover:border-0 !border-slate-300 bg-slate-200 hover:!bg-slate-300 rounded  hover:outline-none  outline-none `}
          >
            {CONSTANTS.STRINGS.DASHBOARD_WIDGET_CUSTOM_CSS_FORM_CANCEL}
          </button>

          <button
            type="button"
            onClick={_handleOnAccepted}
            className={`px-2.5 py-1.5 text-white text-sm bg-[#646cff] rounded hover:outline-none hover:border-0 border-0 outline-none `}
          >
            {CONSTANTS.STRINGS.DASHBOARD_WIDGET_CUSTOM_CSS_FORM_CONFIRM}
          </button>
        </DialogActions>
      </Dialog>
    </>
  );
};
