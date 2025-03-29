import { CONSTANTS } from "../../../constants";

export const APIKeyEditor = ({tenantID, apiKeyEditorForm,isLoadingAPIKeyEditorForm }) => {

  return (
    <div className="w-full flex flex-col justify-start items-stretch gap-2">
      
      <div>
        <label
          for="apiKeyName"
          class="block mb-1 text-xs font-medium text-slate-500"
        >
          {CONSTANTS.STRINGS.API_KEY_EDITOR_FORM_NAME_FIELD_LABEL}
        </label>
        <input
          type="text"
          name="apiKeyName"
          id="apiKeyName"
          className=" placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:outline-none focus:border-slate-400 block w-full px-1.5 py-1"
          placeholder={
            CONSTANTS.STRINGS.API_KEY_EDITOR_FORM_NAME_FIELD_PLACEHOLDER
          }
          required={true}
          onChange={apiKeyEditorForm.handleChange}
          onBlur={apiKeyEditorForm.handleBlur}
          value={apiKeyEditorForm.values.apiKeyName}
        />
      </div>
      
    </div>
  );
};