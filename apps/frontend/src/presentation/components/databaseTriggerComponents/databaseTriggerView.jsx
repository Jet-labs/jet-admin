import React from "react";
import { CONSTANTS } from "../../../constants";
import {
  deleteDatabaseTriggerByNameAPI,
  getDatabaseTriggerByNameAPI,
} from "../../../data/apis/databaseTrigger";
import { CircularProgress } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useGlobalUI } from "../../../logic/contexts/globalUIContext";
import { displayError, displaySuccess } from "../../../utils/notification";

export const DatabaseTriggerView = ({
  tenantID,
  databaseSchemaName,
  databaseTableName,
  databaseTriggerName,
}) => {
  const queryClient = useQueryClient();
  const { showConfirmation } = useGlobalUI();
  const {
    isLoading: isLoadingDatabaseTrigger,
    isFetching: isFetchingDatabaseTrigger,
    isRefetching: isRefetchingDatabaseTrigger,
    data: databaseTrigger,
    error: databaseTriggerError,
    refetch: refetchDatabaseTrigger,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.DATABASE_TRIGGER_BY_NAME(
        tenantID,
        databaseSchemaName,
        databaseTableName,
        databaseTriggerName
      ),
    ],
    queryFn: () =>
      getDatabaseTriggerByNameAPI({
        tenantID,
        databaseSchemaName,
        databaseTableName,
        databaseTriggerName,
      }),
    refetchOnWindowFocus: false,
  });
  const {
    isPending: isDeletingDatabaseTrigger,
    isSuccess: isDeletingDatabaseTriggerSuccess,
    isError: isDeletingDatabaseTriggerError,
    error: deleteDatabaseTriggerError,
    mutate: deleteDatabaseTrigger,
  } = useMutation({
    mutationFn: () => {
      return deleteDatabaseTriggerByNameAPI({
        tenantID,
        databaseSchemaName,
        databaseTableName,
        databaseTriggerName,
      });
    },
    retry: false,
    onSuccess: (data) => {
      displaySuccess(CONSTANTS.STRINGS.TRIGGER_VIEW_DELETE_SUCCESS);
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.DATABASE_TRIGGERS(
          tenantID,
          databaseSchemaName
        ),
      ]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const handleDelete = async () => {
    try {
      await showConfirmation({
        title: CONSTANTS.STRINGS.TRIGGER_VIEW_DELETE_DIALOG_TITLE,
        message: CONSTANTS.STRINGS.TRIGGER_VIEW_DELETE_DIALOG_MESSAGE,
        confirmText: "Delete",
        cancelText: "Cancel",
      });

      deleteDatabaseTrigger();
    } catch {
      console.log("Deletion cancelled");
    }
  };
  return (
    <section className="max-w-3xl w-full">
      <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-700 md:text-2xl border-b border-slate-200 p-3">
        {CONSTANTS.STRINGS.TRIGGER_VIEW_TITLE}
      </h1>

      {isLoadingDatabaseTrigger ? (
        <CircularProgress size={20} />
      ) : (
        <div className="space-y-3 md:space-y-4 p-3">
          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                {CONSTANTS.STRINGS.TRIGGER_VIEW_TRIGGER_NAME}
              </label>
              <div className="overflow-x-auto text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded block w-full px-2.5 py-1.5">
                {databaseTrigger.databaseTriggerName || "-"}
              </div>
            </div>
          </div>

          {/* Trigger Configuration */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-xs text-slate-500 mb-1">
                {CONSTANTS.STRINGS.TRIGGER_VIEW_TABLE_NAME}
              </label>
              <div className="overflow-x-auto text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded block w-full px-2.5 py-1.5">
                {databaseTrigger.databaseTableName || "-"}
              </div>
            </div>
            <div className="col-span-1">
              <label className="block text-xs text-slate-500 mb-1">
                {CONSTANTS.STRINGS.TRIGGER_VIEW_TRIGGER_TIMING}
              </label>
              <div className="text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded block w-full px-2.5 py-1.5">
                {databaseTrigger.triggerTiming || "-"}
              </div>
            </div>
            <div className="col-span-1">
              <label className="block text-xs text-slate-500 mb-1">
                {CONSTANTS.STRINGS.TRIGGER_VIEW_FOR_EACH}
              </label>
              <div className="text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded block w-full px-2.5 py-1.5">
                {databaseTrigger.forEach || "-"}
              </div>
            </div>
            <div className="col-span-3">
              <label className="block text-xs text-slate-500 mb-1">
                {CONSTANTS.STRINGS.TRIGGER_VIEW_TRIGGER_EVENTS}
              </label>
              <div className="text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded block w-full px-2.5 py-1.5">
                {databaseTrigger.triggerEvents &&
                databaseTrigger.triggerEvents.length > 0
                  ? databaseTrigger.triggerEvents.filter((v) => v).join(", ")
                  : "-"}
              </div>
            </div>
          </div>

          {/* Function Reference */}
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              {CONSTANTS.STRINGS.TRIGGER_VIEW_FUNCTION_NAME}
            </label>
            <div className="text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded block w-full px-2.5 py-1.5">
              {databaseTrigger.triggerFunctionName || "-"}
            </div>
          </div>

          {/* Conditional Section */}
          <div className="space-y-4 border-t pt-4">
            {databaseTrigger.whenCondition && (
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  {CONSTANTS.STRINGS.TRIGGER_VIEW_WHEN_CONDITION}
                </label>
                <div className="overflow-x-auto text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded block w-full px-2.5 py-1.5">
                  {databaseTrigger.whenCondition}
                </div>
              </div>
            )}

            {databaseTrigger.triggerTiming === "INSTEAD OF" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    {CONSTANTS.STRINGS.TRIGGER_VIEW_REFERENCING_OLD}
                  </label>
                  <div className="text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded block w-full px-2.5 py-1.5">
                    {databaseTrigger.referencingOld || "-"}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    {CONSTANTS.STRINGS.TRIGGER_VIEW_REFERENCING_NEW}
                  </label>
                  <div className="text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded block w-full px-2.5 py-1.5">
                    {databaseTrigger.referencingNew || "-"}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500">
                  {CONSTANTS.STRINGS.TRIGGER_VIEW_DEFERRABLE}:
                </span>
                <div className="text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded block px-2.5 py-1.5">
                  {databaseTrigger.deferrable ? "Yes" : "No"}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500">
                  {CONSTANTS.STRINGS.TRIGGER_VIEW_INITIALLY_DEFERRED}:
                </span>
                <div className="text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded block px-2.5 py-1.5">
                  {databaseTrigger.initiallyDeferred ? "Yes" : "No"}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-row justify-end">
            <button
              onClick={handleDelete}
              className="px-2.5 py-1.5 text-white text-sm bg-red-500 rounded hover:bg-red-600 hover:outline-none hover:border-0 border-0 outline-none"
            >
              {CONSTANTS.STRINGS.TRIGGER_VIEW_DELETE_BUTTON}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
