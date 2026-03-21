import React, { useState, useEffect } from "react";
import { CodeEditor } from "@jet-admin/ui";
import PropTypes from "prop-types";
import { CONSTANTS } from "../../../constants";

import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@jet-admin/ui";
export const DatabaseTableGridJSONEditor = ({
  title,
  open,
  value,
  onSave,
  onCancel,
  isViewMode = false,
}) => {
  DatabaseTableGridJSONEditor.propTypes = {
    title: PropTypes.string,
    open: PropTypes.bool.isRequired,
    value: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func,
    isViewMode: PropTypes.bool,
  };
  const [jsonValue, setJsonValue] = useState(value);

  const handleClose = (e) => {
    e.preventDefault();
    if (onCancel) onCancel();
  };

  const handleSave = (e) => {
    e.preventDefault();
    try {
      onSave(jsonValue);
    } catch (error) {
      console.error("Error saving JSON:", error);
    }
  };

  // If value changes externally, update internal state
  useEffect(() => {
    setJsonValue(value);
  }, [value]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && handleClose) handleClose(new Event('close')); }}>
      <DialogContent className="max-w-md p-4">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-sm font-semibold">
            {title ? title : "Edit JSON"}
          </DialogTitle>
        </DialogHeader>
        <div>
          <div className="border border-border focus-within:ring-1 focus-within:ring-ring rounded-md overflow-hidden min-w-[300px]">
            <CodeEditor
              value={JSON.stringify(jsonValue, null, 2)}
              onChange={(newValue) => {
                try {
                  const parsedValue = JSON.parse(newValue);
                  setJsonValue(parsedValue);
                } catch (error) {
                  // Wait for valid JSON
                }
              }}
              language="json"
              height={400}
              className="border-0 shadow-none rounded-none"
              showHeader={false}
              showLineNumbers={false}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            onClick={handleClose}
            type="button"
            className="px-3 py-1 text-slate-700 border border-slate-300 rounded hover:bg-slate-100 text-xs bg-slate-100"
          >
            {CONSTANTS.STRINGS.DATAGRID_JSON_POPUP_CANCEL_BUTTON}
          </Button>
          {!isViewMode && (
            <Button
              onClick={handleSave}
              type="button"
              className="px-3 py-1 bg-primary text-white rounded hover:bg-primary/90 text-xs"
            >
              {CONSTANTS.STRINGS.DATAGRID_JSON_POPUP_SAVE_BUTTON}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
