import PropTypes from "prop-types";
import React,{ useState, useCallback } from "react";
import { Box } from "@mui/material";
import { DatabaseTableGridJSONEditor } from "../databaseTableComponents/databaseTableGridJSONEditor";

export const JSONViewCell = ({ params }) => {
  JSONViewCell.propTypes = {
    params: PropTypes.object.isRequired,
  };
  const [isPopupOpen, setIsPopupOpen] = useState(true); // Start open when edit begins
  // Callback when Cancel is clicked in the popup or dialog is closed
  const handleCancel = useCallback(() => {
    params.api.stopCellEditMode({
      id: params.id,
      field: params.field,
      ignoreModifications: true,
    }); // Stop editing, discard changes
    setIsPopupOpen(false); // Close popup
  }, [params.api, params.id, params.field]);

  // Render the popup
  return (
    <>
      {/* Optional: Render something minimal in the cell itself while popup is open */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          height: "100%",
          pl: 1,
          fontStyle: "italic",
          color: "grey",
        }}
      >
        Viewing JSON...
      </Box>
      <DatabaseTableGridJSONEditor
        title={`View "${params.field}"`}
        isViewMode={true}
        open={isPopupOpen}
        value={params.value}
        onSave={handleCancel}
        onCancel={handleCancel}
      />
    </>
  );
};
