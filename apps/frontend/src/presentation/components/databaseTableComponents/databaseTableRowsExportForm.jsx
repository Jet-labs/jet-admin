import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import React, { useCallback, useState } from "react";
import { CONSTANTS } from "../../../constants";
import { databaseTableBulkRowExportAPI } from "../../../data/apis/databaseTable";
import { displayError, displaySuccess } from "../../../utils/notification";
import PropTypes from "prop-types";

export const DatabaseTableRowsExportForm = ({
  tenantID,
  databaseSchemaName,
  databaseTableName,
  filterQuery,
  isAllRowSelectChecked,
  databaseTableRowCount,
  rowSelectionModel,
  multipleSelectedQuery,
}) => {
  DatabaseTableRowsExportForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
    databaseSchemaName: PropTypes.string.isRequired,
    databaseTableName: PropTypes.string.isRequired,
    filterQuery: PropTypes.string,
    isAllRowSelectChecked: PropTypes.bool.isRequired,
    databaseTableRowCount: PropTypes.number.isRequired,
    rowSelectionModel: PropTypes.array.isRequired,
    multipleSelectedQuery: PropTypes.string,
  };
  const [isExportRowsConfirmationOpen, setIsExportRowsConfirmationOpen] =
    useState(false);
  const [exportFormat, setExportFormat] = useState("json");

  const {
    mutate: bulkExportDatabaseTableRows,
    isPending: isBulkExportingDatabaseTableRows,
  } = useMutation({
    mutationFn: ({ exportFormat }) =>
      databaseTableBulkRowExportAPI({
        tenantID,
        databaseSchemaName,
        databaseTableName,
        query: isAllRowSelectChecked ? filterQuery : multipleSelectedQuery,
        exportFormat,
      }),
    retry: false,
    onSuccess: () => {
      displaySuccess(
        CONSTANTS.STRINGS.DATABASE_TABLE_VIEW_CHANGES_EXPORTED_SUCCESS
      );
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _handleOpenExportRowsConfirmation = () =>
    setIsExportRowsConfirmationOpen(true);
  const _handleCloseExportRowsConfirmation = () =>
    setIsExportRowsConfirmationOpen(false);
  const _handleFormatChange = (event) => setExportFormat(event.target.value);
  const _handleExportRows = useCallback(
    () => bulkExportDatabaseTableRows({ exportFormat }),
    [exportFormat]
  );

  return (
    <>
      <button
        onClick={_handleOpenExportRowsConfirmation}
        disabled={isBulkExportingDatabaseTableRows}
        className={`flex items-center rounded px-2 py-0.5 text-xs mr-2 ${
          isBulkExportingDatabaseTableRows
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-white text-[#646cff] border border-[#646cff] hover:bg-[#e8e9ff]"
        }`}
      >
        {isBulkExportingDatabaseTableRows ? (
          <>
            Exporting selected rows...
            <CircularProgress size={16} color="inherit" className="ml-2" />
          </>
        ) : (
          `Export ${
            isAllRowSelectChecked
              ? databaseTableRowCount
              : rowSelectionModel?.length
          } ${rowSelectionModel?.length === 1 ? "row" : "rows"}`
        )}
      </button>

      <Dialog
        open={isExportRowsConfirmationOpen}
        onClose={_handleCloseExportRowsConfirmation}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle className="flex justify-between items-center text-lg !p-4 !pb-0">
          {CONSTANTS.STRINGS.ROW_EXPORT_CONFIRMATION_TITLE}
        </DialogTitle>

        <DialogContent className="!p-4">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              {CONSTANTS.STRINGS.ROW_EXPORT_CONFIRMATION_BODY}
            </label>

            <div className="space-y-2">
              {["json", "csv", "xlsx"].map((format) => (
                <label
                  key={format}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="export-format"
                    value={format}
                    checked={exportFormat === format}
                    onChange={_handleFormatChange}
                    className="sr-only"
                  />
                  <span
                    className={`${
                      exportFormat === format
                        ? "bg-blue-600 border-transparent"
                        : "bg-white border-gray-300"
                    } border-2 rounded-full h-4 w-4 flex items-center justify-center`}
                  >
                    {exportFormat === format && (
                      <span className="rounded-full bg-white h-2 w-2" />
                    )}
                  </span>
                  <span className="text-sm text-gray-700">
                    {format.toUpperCase()}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </DialogContent>

        <DialogActions className="p-4">
          <button
            onClick={_handleCloseExportRowsConfirmation}
            className="px-2.5 py-1.5 text-sm text-slate-600 bg-slate-200 hover:bg-slate-300 rounded"
          >
            {CONSTANTS.STRINGS.ROW_EXPORT_CONFIRMATION_CANCEL_BUTTON}
          </button>

          <button
            onClick={_handleExportRows}
            className="px-2.5 py-1.5 text-sm text-white bg-[#646cff] rounded"
          >
            {CONSTANTS.STRINGS.ROW_EXPORT_CONFIRMATION_BUTTON}
          </button>
        </DialogActions>
      </Dialog>
    </>
  );
};
