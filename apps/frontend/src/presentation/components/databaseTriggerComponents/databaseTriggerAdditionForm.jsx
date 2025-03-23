import { CircularProgress } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React from "react";
import * as Yup from "yup";
import { CONSTANTS } from "../../../constants";
import { getAllDatabaseTablesAPI } from "../../../data/apis/databaseTable";
import { displayError, displaySuccess } from "../../../utils/notification";

import { createDatabaseTriggerAPI } from "../../../data/apis/databaseTrigger";

const triggerValidationSchema = Yup.object().shape({
  databaseTriggerName: Yup.string().required("Trigger name is required"),
  databaseTableName: Yup.string().required("Table name is required"),
  triggerFunctionName: Yup.string().required("Function name is required"),
  triggerEvents: Yup.array()
    .min(1, "At least one event must be selected")
    .required("Trigger events are required"),
  triggerTiming: Yup.string().required("Trigger timing is required"),
  forEach: Yup.string().required("For each option is required"),
});

export const DatabaseTriggerCreationForm = ({ tenantID, databaseSchemaName }) => {
  const queryClient = useQueryClient();
  const {
    isLoading: isLoadingDatabaseTables,
    data: databaseTables,
    error: loadDatabaseTablesError,
    isFetching: isFetchingDatabaseTables,
    isRefetching: isRefetechingDatabaseTables,
    refetch: refetchDatabaseTables,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.DATABASE_TABLES(tenantID, databaseSchemaName),
    ],
    queryFn: () => getAllDatabaseTablesAPI({ tenantID, databaseSchemaName }),
    refetchOnWindowFocus: false,
  });
  const {
    isPending: isAddingDatabaseTrigger,
    isSuccess: isAddingDatabaseTriggerSuccess,
    isError: isAddingDatabaseTriggerError,
    error: addTriggerError,
    mutate: addTrigger,
  } = useMutation({
    mutationFn: (data) => {
      return createDatabaseTriggerAPI({
        tenantID,
        databaseSchemaName,
        databaseTriggerData: data,
      });
    },
    retry: false,
    onSuccess: (data) => {
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
    validationSchema: triggerValidationSchema,
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
    <section className="max-w-3xl w-full">
      <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-700 md:text-2xl border-b border-slate-200 p-3">
        {CONSTANTS.STRINGS.ADD_TRIGGER_FORM_TITLE}
      </h1>

      <form
        class="space-y-3 md:space-y-4 mt-5 p-3"
        onSubmit={triggerAdditionForm.handleSubmit}
      >
        {/* Basic Information */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              {CONSTANTS.STRINGS.ADD_TRIGGER_FORM_TRIGGER_NAME_LABEL}
            </label>
            <input
              name="databaseTriggerName"
              placeholder={
                CONSTANTS.STRINGS.ADD_TRIGGER_FORM_TRIGGER_NAME_PLACEHOLDER
              }
              className="placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:border-slate-700 block w-full px-2.5 py-1.5 "
              onBlur={triggerAdditionForm.handleBlur}
              value={triggerAdditionForm.values.databaseTriggerName}
              onChange={triggerAdditionForm.handleChange}
            />
            {triggerAdditionForm.touched.databaseTriggerName &&
              triggerAdditionForm.errors.databaseTriggerName && (
                <div className="text-red-500 text-xs">
                  {triggerAdditionForm.errors.databaseTriggerName}
                </div>
              )}
          </div>
        </div>

        {/* Trigger Configuration */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <label className="block text-xs text-slate-500 mb-1">
              {CONSTANTS.STRINGS.ADD_TRIGGER_FORM_TABLE_NAME_LABEL}
            </label>
            {databaseTables && (
              <select
                name="databaseTableName"
                className="placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:border-slate-700 block w-full px-2.5 py-1.5 "
                onBlur={triggerAdditionForm.handleBlur}
                value={triggerAdditionForm.values.databaseTableName}
                onChange={triggerAdditionForm.handleChange}
              >
                {databaseTables.map((table) => (
                  <option
                    key={table.databaseTableName}
                    value={table.databaseTableName}
                  >
                    {table.databaseTableName}
                  </option>
                ))}
              </select>
            )}

            {triggerAdditionForm.touched.databaseTableName &&
              triggerAdditionForm.errors.databaseTableName && (
                <div className="text-red-500 text-xs">
                  {triggerAdditionForm.errors.databaseTableName}
                </div>
              )}
          </div>
          <div className="col-span-1">
            <label className="block text-xs text-slate-500 mb-1">
              {CONSTANTS.STRINGS.ADD_TRIGGER_FORM_TIMING_LABEL}
            </label>
            <select
              name="triggerTiming"
              className="placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:border-slate-700 block w-full px-2.5 py-1.5 "
              onBlur={triggerAdditionForm.handleBlur}
              value={triggerAdditionForm.values.triggerTiming}
              onChange={triggerAdditionForm.handleChange}
            >
              {CONSTANTS.PG_TRIGGER_FORM_TIMING_OPTIONS.map((timing) => (
                <option key={timing} value={timing}>
                  {timing}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-1">
            <label className="block text-xs text-slate-500 mb-1">
              {CONSTANTS.STRINGS.ADD_TRIGGER_FORM_FOR_EACH_LABEL}
            </label>
            <select
              name="forEach"
              className="placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:border-slate-700 block w-full px-2.5 py-1.5 "
              onBlur={triggerAdditionForm.handleBlur}
              value={triggerAdditionForm.values.forEach}
              onChange={triggerAdditionForm.handleChange}
            >
              {CONSTANTS.PG_TRIGGER_FORM_FOR_EACH_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-3">
            <label className="block text-xs text-slate-500 mb-1">
              {CONSTANTS.STRINGS.ADD_TRIGGER_FORM_EVENTS_LABEL}
            </label>
            <div className="flex w-full flex-row justify-between items-center">
              {CONSTANTS.PG_TRIGGER_FORM_EVENT_OPTIONS.map((event) => (
                <label
                  key={event}
                  className="flex items-center text-sm font-medium text-slate-700 gap-1"
                >
                  <input
                    type="checkbox"
                    checked={triggerAdditionForm.values.triggerEvents.includes(
                      event
                    )}
                    onChange={() => _toggleEvent(event)}
                    className="mr-1 accent-[#646cff]"
                  />
                  {event}
                </label>
              ))}
            </div>
            {triggerAdditionForm.errors.triggerEvents && (
              <div className="text-red-500 text-xs">
                {triggerAdditionForm.errors.triggerEvents}
              </div>
            )}
          </div>
        </div>

        {/* Function Reference */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">
            {CONSTANTS.STRINGS.ADD_TRIGGER_FORM_FUNCTION_NAME_LABEL}
          </label>
          <input
            name="triggerFunctionName"
            className="placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:border-slate-700 block w-full px-2.5 py-1.5 "
            onBlur={triggerAdditionForm.handleBlur}
            value={triggerAdditionForm.values.triggerFunctionName}
            onChange={triggerAdditionForm.handleChange}
          />
          {triggerAdditionForm.touched.triggerFunctionName &&
            triggerAdditionForm.errors.triggerFunctionName && (
              <div className="text-red-500 text-xs">
                {triggerAdditionForm.errors.triggerFunctionName}
              </div>
            )}
        </div>

        {/* Conditional Section */}
        <div className="space-y-4 border-t pt-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              {CONSTANTS.STRINGS.ADD_TRIGGER_FORM_WHEN_CONDITION_LABEL}
            </label>
            <textarea
              name="whenCondition"
              className="placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:border-slate-700 block w-full px-2.5 py-1.5 "
              onBlur={triggerAdditionForm.handleBlur}
              value={triggerAdditionForm.values.whenCondition}
              onChange={triggerAdditionForm.handleChange}
              placeholder="e.g., NEW.column_name > 100"
            />
          </div>

          {triggerAdditionForm.values.triggerTiming === "INSTEAD OF" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  {CONSTANTS.STRINGS.ADD_TRIGGER_FORM_REF_OLD_LABEL}
                </label>
                <input
                  name="referencingOld"
                  className="placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:border-slate-700 block w-full px-2.5 py-1.5 "
                  onBlur={triggerAdditionForm.handleBlur}
                  value={triggerAdditionForm.values.referencingOld}
                  onChange={triggerAdditionForm.handleChange}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  {CONSTANTS.STRINGS.ADD_TRIGGER_FORM_REF_NEW_LABEL}
                </label>
                <input
                  name="referencingNew"
                  className="placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:border-slate-700 block w-full px-2.5 py-1.5 "
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
                className="accent-[#646cff] w-4 h-4"
              />
              <span className="text-sm font-medium text-slate-700">
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
                className="accent-[#646cff] w-4 h-4 disabled:opacity-50"
              />
              <span className="text-sm font-medium text-slate-700">
                {CONSTANTS.STRINGS.ADD_TRIGGER_FORM_INITIALLY_DEFERRED_LABEL}
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            class="flex flex-row justify-center items-center px-3 py-2 text-xs font-medium text-center text-white bg-[#646cff] rounded hover:bg-[#646cff] focus:ring-4 focus:outline-none "
            disabled={isAddingDatabaseTrigger}
          >
            {isAddingDatabaseTrigger ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              CONSTANTS.STRINGS.ADD_TRIGGER_FORM_SUBMIT
            )}
          </button>
        </div>
      </form>
    </section>
  );
};
