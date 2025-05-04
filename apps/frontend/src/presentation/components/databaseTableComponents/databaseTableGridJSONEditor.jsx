import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { CodeEditorField } from "../ui/codeEditorField";
import PropTypes from "prop-types";
import { CONSTANTS } from "../../../constants";

export const DatabaseTableGridJSONEditor = ({
  title,
  open,
  value,
  onSave,
  onCancel,
}) => {
  DatabaseTableGridJSONEditor.propTypes = {
    title: PropTypes.string,
    open: PropTypes.bool.isRequired,
    value: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func,
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
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      disableEscapeKeyDown={false}
    >
      <DialogTitle className="!p-4 !pb-0">
        {title ? title : "Edit JSON"}
      </DialogTitle>
      <DialogContent className="!p-4 !pb-0">
        <CodeEditorField
          code={JSON.stringify(jsonValue, null, 2)}
          setCode={(newValue) => {
            try {
              const parsedValue = JSON.parse(newValue);
              setJsonValue(parsedValue);
            } catch (error) {
              console.error("Invalid JSON:", error);
              // Continue editing even if JSON is invalid
            }
          }}
          language="json"
          height="400px"
        />
      </DialogContent>
      <DialogActions className="!p-4">
        <button
          onClick={handleClose}
          type="button"
          className="px-3 py-1 text-slate-700 border border-slate-300 rounded hover:bg-slate-100 text-xs bg-slate-100"
        >
          {CONSTANTS.STRINGS.DATAGRID_JSON_POPUP_CANCEL_BUTTON}
        </button>
        <button
          onClick={handleSave}
          type="button"
          className="px-3 py-1 bg-[#646cff] text-white rounded hover:bg-[#535bf2] text-xs"
        >
          {CONSTANTS.STRINGS.DATAGRID_JSON_POPUP_SAVE_BUTTON}
        </button>
      </DialogActions>
    </Dialog>
  );
};
