import React from "react";
import { CONSTANTS } from "../../../constants";
import PropTypes from "prop-types";
import { Input, Label, Section } from "@jet-admin/ui";


export const APIKeyEditor = ({ apiKeyEditorForm }) => {
  APIKeyEditor.propTypes = {
    apiKeyEditorForm: PropTypes.object.isRequired,
  };

  return (
    <div className="w-full space-y-4">
      <Section title="Identity" description="General information about your API key.">
        <div className="space-y-1.5">
          <Label htmlFor="apiKeyTitle">
            {CONSTANTS.STRINGS.API_KEY_EDITOR_FORM_NAME_FIELD_LABEL}{" "}
            <span className="text-destructive">*</span>
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
          {apiKeyEditorForm.touched.apiKeyTitle && apiKeyEditorForm.errors.apiKeyTitle && (
            <p className="text-xs text-red-500">
              {apiKeyEditorForm.errors.apiKeyTitle}
            </p>
          )}
        </div>
      </Section>
    </div>
  );
};
