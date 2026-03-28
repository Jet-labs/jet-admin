import React from "react";
import { FaTimes } from "react-icons/fa";
import PropTypes from "prop-types";

import { Button } from "@jet-admin/ui";

/**
 * Helper component to wrap the editor input and add a cancel button.
 */
export const EditCellWrapper = React.memo(({ children, params }) => {
  EditCellWrapper.propTypes = {
    children: PropTypes.node.isRequired,
    params: PropTypes.object.isRequired,
  };

  const handleCancel = (event) => {
    event.stopPropagation();
    params.api.stopCellEditMode({
      id: params.id,
      field: params.field,
      ignoreModifications: true,
    });
  };

  return (
    <div className="flex items-center w-full h-full box-border">
      <div className="flex-1 mr-0.5 h-full">
        {children}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        square
        onClick={handleCancel}
        aria-label="cancel editing"
        tabIndex={-1}
        className="h-6 w-6 ml-1 text-slate-400 hover:text-destructive hover:bg-destructive/10 shrink-0"
      >
        <FaTimes className="text-[10px]" />
      </Button>
    </div>
  );
});

EditCellWrapper.displayName = "EditCellWrapper";