import React from "react";
import { CONSTANTS } from "../../../constants";
import PropTypes from "prop-types";
import { Input, Label } from "@jet-admin/ui";


export const APIKeyEditor = ({ apiKeyEditorForm }) => {
  APIKeyEditor.propTypes = {
    apiKeyEditorForm: PropTypes.object.isRequired,
  };

  return (
    <div className="w-full space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="apiKeyTitle">
          {CONSTANTS.STRINGS.API_KEY_EDITOR_FORM_NAME_FIELD_LABEL}
        </Label>
        <Input
          type="text"
          name="apiKeyTitle"
          id="apiKeyTitle"
          className="w-full"
          placeholder={
            CONSTANTS.STRINGS.API_KEY_EDITOR_FORM_NAME_FIELD_PLACEHOLDER
          }
          required={true}
          onChange={apiKeyEditorForm.handleChange}
          onBlur={apiKeyEditorForm.handleBlur}
          value={apiKeyEditorForm.values.apiKeyTitle}
        />
      </div>
    </div>
  );
};
