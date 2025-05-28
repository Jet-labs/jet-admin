import React from "react";
import { CONSTANTS } from "../../../constants";
import PropTypes from "prop-types";

export const APIKeyEditor = ({ apiKeyEditorForm }) => {
  APIKeyEditor.propTypes = {
    apiKeyEditorForm: PropTypes.object.isRequired,
  };

  return (
    <div className="w-full flex flex-col justify-start items-stretch gap-2">
      <div>
        <label
          htmlFor="apiKeyTitle"
          className="block mb-1 text-xs font-medium text-slate-500"
        >
          {CONSTANTS.STRINGS.API_KEY_EDITOR_FORM_NAME_FIELD_LABEL}
        </label>
        <input
          type="text"
          name="apiKeyTitle"
          id="apiKeyTitle"
          className=" placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:outline-none focus:border-slate-400 block w-full px-1.5 py-1"
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
