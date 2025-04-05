import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { CodeEditorField } from "../ui/codeEditorField";

export const JsonPopupEditor = ({ value, onSave, onCancel }) => {
  const [open, setOpen] = useState(true); // Start with dialog open
  const [jsonValue, setJsonValue] = useState(value);
  
  const handleClose = () => {
    setOpen(false);
    if (onCancel) onCancel();
  };
  
  const handleSave = () => {
    try {
      onSave(jsonValue);
      setOpen(false);
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
      <DialogTitle className="!p-4 !pb-2">Edit JSON</DialogTitle>
      <DialogContent className="!p-4 !pt-2">
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
      <DialogActions className="!p-3">
        <button 
          onClick={handleClose}
          className="px-3 py-1 text-slate-700 border border-slate-300 rounded hover:bg-slate-100 text-xs"
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          className="px-3 py-1 bg-[#646cff] text-white rounded hover:bg-[#535bf2] text-xs"
        >
          Save
        </button>
      </DialogActions>
    </Dialog>
  );
};
