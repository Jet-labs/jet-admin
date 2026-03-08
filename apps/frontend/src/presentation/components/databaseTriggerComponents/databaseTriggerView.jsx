import { useQuery } from "@tanstack/react-query";
import PropTypes from "prop-types";
import React from "react";
import { CONSTANTS } from "../../../constants";
import { getDatabaseTriggerByNameAPI } from "../../../data/apis/databaseTrigger";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { DatabaseTriggerDeletionForm } from "./databaseTriggerDeletionForm";
import { Label } from "@jet-admin/ui";

export const DatabaseTriggerView = ({
  tenantID,
  databaseSchemaName,
  databaseTableName,
  databaseTriggerName,
}) => {
  DatabaseTriggerView.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    databaseSchemaName: PropTypes.string.isRequired,
    databaseTableName: PropTypes.string.isRequired,
    databaseTriggerName: PropTypes.string.isRequired,
  };
  const {
    isLoading: isLoadingDatabaseTrigger,
    data: databaseTrigger,
    error: databaseTriggerError,
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

  return (
    <div className="flex w-full h-full flex-col items-center overflow-y-auto p-4 md:p-8">
      <section className="max-w-2xl w-full">
        <h1 className="text-2xl font-semibold tracking-tight mb-6">
          {CONSTANTS.STRINGS.TRIGGER_VIEW_TITLE}
        </h1>

        <ReactQueryLoadingErrorWrapper
          isLoading={isLoadingDatabaseTrigger}
          error={databaseTriggerError}
        >
          {databaseTrigger && (
            <div className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="mb-2 block">
                    {CONSTANTS.STRINGS.TRIGGER_VIEW_TRIGGER_NAME}
                  </Label>
                  <div className="text-sm text-foreground">
                    {databaseTrigger.databaseTriggerName || "-"}
                  </div>
                </div>
              </div>

              {/* Trigger Configuration */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <Label className="mb-2 block">
                    {CONSTANTS.STRINGS.TRIGGER_VIEW_TABLE_NAME}
                  </Label>
                  <div className="text-sm text-foreground">
                    {databaseTrigger.databaseTableName || "-"}
                  </div>
                </div>
                <div className="col-span-1">
                  <Label className="mb-2 block">
                    {CONSTANTS.STRINGS.TRIGGER_VIEW_TRIGGER_TIMING}
                  </Label>
                  <div className="text-sm text-foreground">
                    {databaseTrigger.triggerTiming || "-"}
                  </div>
                </div>
                <div className="col-span-1">
                  <Label className="mb-2 block">
                    {CONSTANTS.STRINGS.TRIGGER_VIEW_FOR_EACH}
                  </Label>
                  <div className="text-sm text-foreground">
                    {databaseTrigger.forEach || "-"}
                  </div>
                </div>
                <div className="col-span-3">
                  <Label className="mb-2 block">
                    {CONSTANTS.STRINGS.TRIGGER_VIEW_TRIGGER_EVENTS}
                  </Label>
                  <div className="text-sm text-foreground">
                    {databaseTrigger.triggerEvents &&
                      databaseTrigger.triggerEvents.length > 0
                      ? databaseTrigger.triggerEvents.filter((v) => v).join(", ")
                      : "-"}
                  </div>
                </div>
              </div>

              {/* Function Reference */}
              <div>
                <Label className="mb-2 block">
                  {CONSTANTS.STRINGS.TRIGGER_VIEW_FUNCTION_NAME}
                </Label>
                <div className="text-sm text-foreground">
                  {databaseTrigger.triggerFunctionName || "-"}
                </div>
              </div>

              {/* Conditional Section */}
              <div className="space-y-4 border-t pt-4">
                {databaseTrigger.whenCondition && (
                  <div>
                    <Label className="mb-2 block">
                      {CONSTANTS.STRINGS.TRIGGER_VIEW_WHEN_CONDITION}
                    </Label>
                    <div className="text-sm text-foreground">
                      {databaseTrigger.whenCondition}
                    </div>
                  </div>
                )}

                {databaseTrigger.triggerTiming === "INSTEAD OF" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2 block">
                        {CONSTANTS.STRINGS.TRIGGER_VIEW_REFERENCING_OLD}
                      </Label>
                      <div className="text-sm text-foreground">
                        {databaseTrigger.referencingOld || "-"}
                      </div>
                    </div>
                    <div>
                      <Label className="mb-2 block">
                        {CONSTANTS.STRINGS.TRIGGER_VIEW_REFERENCING_NEW}
                      </Label>
                      <div className="text-sm text-foreground">
                        {databaseTrigger.referencingNew || "-"}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">
                      {CONSTANTS.STRINGS.TRIGGER_VIEW_DEFERRABLE}:
                    </span>
                    <div className="text-sm text-foreground">
                      {databaseTrigger.deferrable ? "Yes" : "No"}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">
                      {CONSTANTS.STRINGS.TRIGGER_VIEW_INITIALLY_DEFERRED}:
                    </span>
                    <div className="text-sm text-foreground">
                      {databaseTrigger.initiallyDeferred ? "Yes" : "No"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <DatabaseTriggerDeletionForm
                  tenantID={tenantID}
                  databaseTriggerName={databaseTriggerName}
                  databaseSchemaName={databaseSchemaName}
                  databaseTableName={databaseTableName}
                />
              </div>
            </div>
          )}
        </ReactQueryLoadingErrorWrapper>
      </section>
    </div>
  );
};
