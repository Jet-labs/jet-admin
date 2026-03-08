import { useMutation } from "@tanstack/react-query";
import React, { useCallback, useState } from "react";
import { CONSTANTS } from "../../../constants";
import { databaseTableBulkRowExportAPI } from "../../../data/apis/databaseTable";
import { displayError, displaySuccess } from "../../../utils/notification";
import PropTypes from "prop-types";

import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, Label, RadioGroup, RadioGroupItem, Spinner } from "@jet-admin/ui";
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
  const _handleFormatChange = (value) => setExportFormat(value);
  const _handleExportRows = useCallback(
    () => bulkExportDatabaseTableRows({ exportFormat }),
    [exportFormat]
  );

  return (
    <>
      <Button
        variant="primary-outline" size="sm"
        onClick={_handleOpenExportRowsConfirmation}
        disabled={isBulkExportingDatabaseTableRows}
        className="mr-2"
      >
        {isBulkExportingDatabaseTableRows ? (
          <>
            Exporting selected rows...
            <Spinner size={16} className="ml-2" />
          </>
        ) : (
          `Export ${
            isAllRowSelectChecked
              ? databaseTableRowCount
              : rowSelectionModel?.length
          } ${rowSelectionModel?.length === 1 ? "row" : "rows"}`
        )}
      </Button>

      <Dialog open={isExportRowsConfirmationOpen} onOpenChange={(v) => { if (!v) _handleCloseExportRowsConfirmation(); }}>
        <DialogContent className="max-w-xs p-4">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-sm font-semibold">
              {CONSTANTS.STRINGS.ROW_EXPORT_CONFIRMATION_TITLE}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              {CONSTANTS.STRINGS.ROW_EXPORT_CONFIRMATION_BODY}
            </label>

            <RadioGroup value={exportFormat} onValueChange={_handleFormatChange} className="space-y-2">
              {["json", "csv", "xlsx"].map((format) => (
                <div key={format} className="flex items-center space-x-2">
                  <RadioGroupItem value={format} id={`export-format-${format}`} />
                  <Label htmlFor={`export-format-${format}`} className="text-sm text-gray-700 cursor-pointer">
                    {format.toUpperCase()}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={_handleCloseExportRowsConfirmation}
            >
              {CONSTANTS.STRINGS.ROW_EXPORT_CONFIRMATION_CANCEL_BUTTON}
            </Button>

            <Button
              onClick={_handleExportRows}
            >
              {CONSTANTS.STRINGS.ROW_EXPORT_CONFIRMATION_BUTTON}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
