import PropTypes from "prop-types";
import React, { useState, useCallback } from "react";
import { DatabaseTableGridJSONEditor } from "../databaseTableComponents/databaseTableGridJSONEditor";

export const JSONViewCell = ({ params }) => {
  JSONViewCell.propTypes = {
    params: PropTypes.object.isRequired,
  };
  const [isPopupOpen, setIsPopupOpen] = useState(true);

  const handleCancel = useCallback(() => {
    params.api.stopCellEditMode({
      id: params.id,
      field: params.field,
      ignoreModifications: true,
    });
    setIsPopupOpen(false);
  }, [params.api, params.id, params.field]);

  return (
    <>
      <div className="flex items-center w-full h-full pl-2 italic text-gray-400">
        Viewing JSON...
      </div>
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
