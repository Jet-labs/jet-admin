

import { Box, IconButton } from "@mui/material"; // Import necessary MUI components
import React from "react";
import { FaTimes } from "react-icons/fa"; // Using FaTimes for consistency with other parts
// eslint-disable-next-line no-unused-vars
import PropTypes from "prop-types";

/**
 * Helper component to wrap the editor input and add a cancel button.
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - The editor component (e.g., InputBase, Select).
 * @param {object} props.params - The DataGrid renderCell/renderEditCell params object.
 * @returns {React.ReactElement} - The wrapped editor with a cancel button.
 */
export const EditCellWrapper = React.memo(({ children, params }) => {
  EditCellWrapper.propTypes = {
    children: PropTypes.node.isRequired,
    params: PropTypes.object.isRequired,
  };
  // Handler to stop editing and discard changes
  const handleCancel = (event) => {
    event.stopPropagation(); // Prevent other grid events
    // Tell the grid to stop editing this cell and ignore any modifications made
    params.api.stopCellEditMode({
      id: params.id,
      field: params.field,
      ignoreModifications: true,
    });
  };

  return (
    // Use Box for layout, ensuring elements are aligned and span the cell width
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Container for the actual input editor, allowing it to grow */}
      <Box sx={{ flexGrow: 1, mr: 0.5, height: "100%" }}>
        {" "}
        {/* Ensure child takes height */}
        {children}
      </Box>
      {/* Cancel button */}
      <IconButton
        size="small"
        onClick={handleCancel}
        aria-label="cancel editing"
        tabIndex={-1} // Keep it out of the main tab flow
        sx={{ visibility: "visible" }} // Make sure it's always visible during edit
      >
        {/* Using FaTimes for consistency */}
        <FaTimes style={{ fontSize: "0.8rem" }} />
      </IconButton>
    </Box>
  );
});

// Add display name to the component
EditCellWrapper.displayName = "EditCellWrapper";