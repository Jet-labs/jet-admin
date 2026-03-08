import { CONSTANTS } from "../../../constants";
import React from "react";
import PropTypes from "prop-types";
import { Input, Label } from "@jet-admin/ui";


export const DashboardEditor = ({ dashboardEditorForm }) => {
  DashboardEditor.propTypes = {
    dashboardEditorForm: PropTypes.object.isRequired,
  };
  return (
    <div className="w-full space-y-3 p-3">
      <div className="space-y-1.5">
        <Label htmlFor="dashboardTitle">
          {CONSTANTS.STRINGS.DASHBOARD_EDITOR_FORM_NAME_FIELD_LABEL}
        </Label>
        <Input
          type="text"
          name="dashboardTitle"
          id="dashboardTitle"
          className="w-full"
          placeholder={
            CONSTANTS.STRINGS.DASHBOARD_EDITOR_FORM_NAME_FIELD_PLACEHOLDER
          }
          required={true}
          onChange={dashboardEditorForm.handleChange}
          onBlur={dashboardEditorForm.handleBlur}
          value={dashboardEditorForm.values.dashboardTitle}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="dashboardDescription">
          {CONSTANTS.STRINGS.DASHBOARD_EDITOR_FORM_DESCRIPTION_FIELD_LABEL}
        </Label>
        <Input
          type="text"
          name="dashboardDescription"
          id="dashboardDescription"
          className="w-full"
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