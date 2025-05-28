import { CONSTANTS } from "../../../constants";
import React from "react";
import PropTypes from "prop-types";

export const DashboardEditor = ({ dashboardEditorForm }) => {
  DashboardEditor.propTypes = {
    dashboardEditorForm: PropTypes.object.isRequired,
  };
  return (
    <div className="w-full flex flex-col justify-start items-stretch gap-2 p-2">
      <div>
        <label
          htmlFor="dashboardTitle"
          className="block mb-1 text-xs font-medium text-slate-500"
        >
          {CONSTANTS.STRINGS.DASHBOARD_EDITOR_FORM_NAME_FIELD_LABEL}
        </label>
        <input
          type="text"
          name="dashboardTitle"
          id="dashboardTitle"
          className=" placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:outline-none focus:border-slate-400 block w-full px-1.5 py-1"
          placeholder={
            CONSTANTS.STRINGS.DASHBOARD_EDITOR_FORM_NAME_FIELD_PLACEHOLDER
          }
          required={true}
          onChange={dashboardEditorForm.handleChange}
          onBlur={dashboardEditorForm.handleBlur}
          value={dashboardEditorForm.values.dashboardTitle}
        />
      </div>
      <div>
        <label
          htmlFor="dashboardDescription"
          className="block mb-1 text-xs font-medium text-slate-500"
        >
          {
            CONSTANTS.STRINGS
              .DASHBOARD_EDITOR_FORM_DESCRIPTION_FIELD_PLACEHOLDER
          }
        </label>
        <input
          type="text"
          name="dashboardDescription"
          id="dashboardDescription"
          className=" placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:outline-none focus:border-slate-400 block w-full px-1.5 py-1"
          placeholder={
            CONSTANTS.STRINGS
              .DASHBOARD_EDITOR_FORM_DESCRIPTION_FIELD_PLACEHOLDER
          }
          onChange={dashboardEditorForm.handleChange}
          onBlur={dashboardEditorForm.handleBlur}
          value={dashboardEditorForm.values.dashboardDescription}
        />
      </div>
    </div>
  );
};