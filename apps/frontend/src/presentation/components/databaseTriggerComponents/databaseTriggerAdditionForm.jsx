import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React from "react";
import { CONSTANTS } from "../../../constants";
import { getAllDatabaseTablesAPI } from "../../../data/apis/databaseTable";
import { createDatabaseTriggerAPI } from "../../../data/apis/databaseTrigger";
import { formValidations } from "../../../utils/formValidation";
import { displayError, displaySuccess } from "../../../utils/notification";
import PropTypes from "prop-types";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";

import { Button, Spinner, Textarea, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label } from "@jet-admin/ui";

export const DatabaseTriggerAdditionForm = ({
  tenantID,
  databaseSchemaName,
}) => {
  DatabaseTriggerAdditionForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    databaseSchemaName: PropTypes.string.isRequired,
  };
  const queryClient = useQueryClient();
  const {
    isLoading: isLoadingDatabaseTables,
    data: databaseTables,
    error: loadDatabaseTablesError,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.DATABASE_TABLES(tenantID, databaseSchemaName),
    ],
    queryFn: () => getAllDatabaseTablesAPI({ tenantID, databaseSchemaName }),
    refetchOnWindowFocus: false,
  });
  const { isPending: isAddingDatabaseTrigger, mutate: addTrigger } =
    useMutation({
      mutationFn: (data) => {
        return createDatabaseTriggerAPI({
          tenantID,
          databaseSchemaName,
          databaseTriggerData: data,
        });
      },
      retry: false,
      onSuccess: () => {
        displaySuccess(CONSTANTS.STRINGS.ADD_TRIGGER_FORM_TRIGGER_CREATED);
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
  const triggerAdditionForm = useFormik({
    initialValues: {
      databaseSchemaName: "public",
      databaseTableName: "",
      databaseTriggerName: "",
      triggerTiming: "AFTER",
      triggerEvents: ["INSERT"],
      triggerFunctionName: "",
      forEach: "ROW",
      whenCondition: "",
      referencingOld: "",
      referencingNew: "",
      deferrable: false,
      initiallyDeferred: false,
    },
    validationSchema: formValidations.triggerAdditionFormValidationSchema,
    onSubmit: async (data) => {
      addTrigger(data);
    },
  });

  const _toggleEvent = (event) => {
    const currentEvents = triggerAdditionForm.values.triggerEvents;
    const newEvents = currentEvents.includes(event)
      ? currentEvents.filter((e) => e !== event)
      : [...currentEvents, event];
    triggerAdditionForm.setFieldValue("triggerEvents", newEvents);
  };

  return (
    <div className="flex w-full h-full flex-col items-center overflow-y-auto p-4 md:p-8">
      <section className="max-w-2xl w-full">
        <h1 className="text-2xl font-semibold tracking-tight mb-6">
          {CONSTANTS.STRINGS.ADD_TRIGGER_FORM_TITLE}
        </h1>

        <ReactQueryLoadingErrorWrapper
          isLoading={isLoadingDatabaseTables}
          error={loadDatabaseTablesError}
        >
          <form
            className="space-y-4"
            onSubmit={triggerAdditionForm.handleSubmit}
          >
            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label className="mb-2 block">
                  {CONSTANTS.STRINGS.ADD_TRIGGER_FORM_TRIGGER_NAME_LABEL}
                </Label>
                <Input
                  name="databaseTriggerName"
                  placeholder={
                    CONSTANTS.STRINGS.ADD_TRIGGER_FORM_TRIGGER_NAME_PLACEHOLDER
                  }
                  onBlur={triggerAdditionForm.handleBlur}
                  value={triggerAdditionForm.values.databaseTriggerName}
                  onChange={triggerAdditionForm.handleChange}
                />
                {triggerAdditionForm.touched.databaseTriggerName &&
                  triggerAdditionForm.errors.databaseTriggerName && (
                    <div className="text-red-500 text-xs mt-1">
                      {triggerAdditionForm.errors.databaseTriggerName}
                    </div>
                  )}
              </div>
            </div>

            {/* Trigger Configuration */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <Label className="mb-2 block">
                  {CONSTANTS.STRINGS.ADD_TRIGGER_FORM_TABLE_NAME_LABEL}
                </Label>
                {databaseTables && (
                  <Select value={triggerAdditionForm.values.databaseTableName} onValueChange={(val) => triggerAdditionForm.setFieldValue('databaseTableName', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {databaseTables.map((table) => (
                        <SelectItem
                          key={table.databaseTableName}
                          value={table.databaseTableName}
                        >
                          {table.databaseTableName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {triggerAdditionForm.touched.databaseTableName &&
                  triggerAdditionForm.errors.databaseTableName && (
                    <div className="text-red-500 text-xs mt-1">
                      {triggerAdditionForm.errors.databaseTableName}
                    </div>
                  )}
              </div>
              <div className="col-span-1">
                <Label className="mb-2 block">
                  {CONSTANTS.STRINGS.ADD_TRIGGER_FORM_TIMING_LABEL}
                </Label>
                <Select value={triggerAdditionForm.values.triggerTiming} onValueChange={(val) => triggerAdditionForm.setFieldValue('triggerTiming', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONSTANTS.PG_TRIGGER_FORM_TIMING_OPTIONS.map((timing) => (
                      <SelectItem key={timing} value={timing}>
                        {timing}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1">
                <Label className="mb-2 block">
                  {CONSTANTS.STRINGS.ADD_TRIGGER_FORM_FOR_EACH_LABEL}
                </Label>
                <Select value={triggerAdditionForm.values.forEach} onValueChange={(val) => triggerAdditionForm.setFieldValue('forEach', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONSTANTS.PG_TRIGGER_FORM_FOR_EACH_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-3">
                <Label className="mb-2 block">
                  {CONSTANTS.STRINGS.ADD_TRIGGER_FORM_EVENTS_LABEL}
                </Label>
                <div className="flex w-full flex-row justify-between items-center mt-2">
                  {CONSTANTS.PG_TRIGGER_FORM_EVENT_OPTIONS.map((event) => (
                    <label
                      key={event}
                      className="flex items-center gap-1 text-sm font-medium text-foreground"
                    >
                      <input
                        type="checkbox"
                        checked={triggerAdditionForm.values.triggerEvents.includes(
                          event
                        )}
                        onChange={() => _toggleEvent(event)}
                        className="mr-1 h-4 w-4 rounded border-border accent-primary"
                      />
                      {event}
                    </label>
                  ))}
                </div>
                {triggerAdditionForm.errors.triggerEvents && (
                  <div className="mt-1 text-xs text-destructive">
                    {triggerAdditionForm.errors.triggerEvents}
                  </div>
                )}
              </div>
            </div>

            {/* Function Reference */}
            <div>
              <Label className="mb-2 block">
                {CONSTANTS.STRINGS.ADD_TRIGGER_FORM_FUNCTION_NAME_LABEL}
              </Label>
              <Input
                name="triggerFunctionName"
                onBlur={triggerAdditionForm.handleBlur}
                value={triggerAdditionForm.values.triggerFunctionName}
                onChange={triggerAdditionForm.handleChange}
              />
              {triggerAdditionForm.touched.triggerFunctionName &&
                triggerAdditionForm.errors.triggerFunctionName && (
                  <div className="text-red-500 text-xs mt-1">
                    {triggerAdditionForm.errors.triggerFunctionName}
                  </div>
                )}
            </div>

            {/* Conditional Section */}
            <div className="space-y-4 border-t pt-4">
              <div>
                <Label className="mb-2 block">
                  {CONSTANTS.STRINGS.ADD_TRIGGER_FORM_WHEN_CONDITION_LABEL}
                </Label>
                <Textarea
                  name="whenCondition"
                  onBlur={triggerAdditionForm.handleBlur}
                  value={triggerAdditionForm.values.whenCondition}
                  onChange={triggerAdditionForm.handleChange}
                  placeholder="e.g., NEW.column_name > 100"
                />
              </div>

              {triggerAdditionForm.values.triggerTiming === "INSTEAD OF" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 block">
                      {CONSTANTS.STRINGS.ADD_TRIGGER_FORM_REF_OLD_LABEL}
                    </Label>
                    <Input
                      name="referencingOld"
                      onBlur={triggerAdditionForm.handleBlur}
                      value={triggerAdditionForm.values.referencingOld}
                      onChange={triggerAdditionForm.handleChange}
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">
                      {CONSTANTS.STRINGS.ADD_TRIGGER_FORM_REF_NEW_LABEL}
                    </Label>
                    <Input
                      name="referencingNew"
                      onBlur={triggerAdditionForm.handleBlur}
                      value={triggerAdditionForm.values.referencingNew}
                      onChange={triggerAdditionForm.handleChange}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="deferrable"
                    checked={triggerAdditionForm.values.deferrable}
                    onChange={triggerAdditionForm.handleChange}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                  <span className="text-sm font-medium text-foreground">
                    {CONSTANTS.STRINGS.ADD_TRIGGER_FORM_DEFERRABLE_LABEL}
                  </span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="initiallyDeferred"
                    checked={triggerAdditionForm.values.initiallyDeferred}
                    onChange={triggerAdditionForm.handleChange}
                    disabled={!triggerAdditionForm.values.deferrable}
                    className="h-4 w-4 rounded border-border accent-primary disabled:opacity-50"
                  />
                  <span className="text-sm font-medium text-foreground">
                    {CONSTANTS.STRINGS.ADD_TRIGGER_FORM_INITIALLY_DEFERRED_LABEL}
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isAddingDatabaseTrigger}>
                {isAddingDatabaseTrigger && <Spinner size={16} className="mr-2" />}
                {CONSTANTS.STRINGS.ADD_TRIGGER_FORM_SUBMIT}
              </Button>
            </div>
          </form>
        </ReactQueryLoadingErrorWrapper>
      </section>
    </div>
  );
};
