import { CONSTANTS } from "../../../constants";

export const DatabaseDashboardEditor = ({ databaseDashboardEditorForm }) => {
  return (
    <div className="w-full flex flex-col justify-start items-stretch gap-2 p-2">
      <div>
        <label
          for="databaseDashboardName"
          class="block mb-1 text-xs font-medium text-slate-500"
        >
          {CONSTANTS.STRINGS.DASHBOARD_EDITOR_FORM_NAME_FIELD_LABEL}
        </label>
        <input
          type="text"
          name="databaseDashboardName"
          id="databaseDashboardName"
          className=" placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:outline-none focus:border-slate-400 block w-full px-1.5 py-1"
          placeholder={
            CONSTANTS.STRINGS.DASHBOARD_EDITOR_FORM_NAME_FIELD_PLACEHOLDER
          }
          required={true}
          onChange={databaseDashboardEditorForm.handleChange}
          onBlur={databaseDashboardEditorForm.handleBlur}
          value={databaseDashboardEditorForm.values.databaseDashboardName}
        />
      </div>
      <div>
        <label
          for="databaseDashboardDescription"
          class="block mb-1 text-xs font-medium text-slate-500"
        >
          {
            CONSTANTS.STRINGS
              .DASHBOARD_EDITOR_FORM_DESCRIPTION_FIELD_PLACEHOLDER
          }
        </label>
        <input
          type="text"
          name="databaseDashboardDescription"
          id="databaseDashboardDescription"
          className=" placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:outline-none focus:border-slate-400 block w-full px-1.5 py-1"
          placeholder={
            CONSTANTS.STRINGS
              .DASHBOARD_EDITOR_FORM_DESCRIPTION_FIELD_PLACEHOLDER
          }
          onChange={databaseDashboardEditorForm.handleChange}
          onBlur={databaseDashboardEditorForm.handleBlur}
          value={
            databaseDashboardEditorForm.values.databaseDashboardDescription
          }
        />
      </div>
    </div>
  );
};