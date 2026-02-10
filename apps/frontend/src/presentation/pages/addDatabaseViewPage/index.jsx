import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircularProgress } from "@mui/material";
import { MdTableView } from "react-icons/md";
import { createDatabaseViewAPI } from "../../../data/apis/databaseView";
import { useDatabaseViewsActions } from "../../../logic/contexts/databaseViewsContext";
import { displaySuccess, displayError } from "../../../utils/notification";
import { extractError } from "../../../utils/error";
import { CONSTANTS } from "../../../constants";

const AddDatabaseViewPage = () => {
  const { tenantID, databaseSchemaName } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { refetchDatabaseViews } = useDatabaseViewsActions();

  const [viewName, setViewName] = useState("");
  const [selectQuery, setSelectQuery] = useState("SELECT ");
  const [orReplace, setOrReplace] = useState(false);
  const [materialized, setMaterialized] = useState(false);
  const [checkOption, setCheckOption] = useState("");

  const { mutate: createView, isPending } = useMutation({
    mutationFn: () => createDatabaseViewAPI({
      tenantID,
      databaseSchemaName,
      viewName,
      selectQuery,
      orReplace,
      materialized,
      checkOption: checkOption || null,
    }),
    onSuccess: () => {
      displaySuccess("View created successfully");
      refetchDatabaseViews();
      navigate(CONSTANTS.ROUTES.VIEW_DATABASE_VIEW_BY_NAME.path(tenantID, databaseSchemaName, viewName));
    },
    onError: (err) => {
      displayError(`Failed to create view: ${extractError(err)}`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!viewName.trim()) {
      displayError("View name is required");
      return;
    }
    if (!selectQuery.trim()) {
      displayError("SELECT query is required");
      return;
    }
    createView();
  };

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-[#eaebff] rounded">
            <MdTableView size={24} className="text-[#646cff]" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-700">Create View</h1>
            <p className="text-sm text-slate-500">Create a new database view in {databaseSchemaName}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* View Name */}
          <div className="bg-white p-4 rounded border border-slate-200 mb-4">
            <label className="block text-sm font-medium text-slate-600 mb-2">
              View Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
              placeholder="my_view"
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-[#646cff]"
            />
          </div>

          {/* Options */}
          <div className="bg-white p-4 rounded border border-slate-200 mb-4">
            <h3 className="font-medium text-slate-700 mb-3">Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={orReplace}
                  onChange={(e) => setOrReplace(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-slate-600">OR REPLACE</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={materialized}
                  onChange={(e) => setMaterialized(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-slate-600">MATERIALIZED</span>
              </label>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Check Option</label>
                <select
                  value={checkOption}
                  onChange={(e) => setCheckOption(e.target.value)}
                  className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:border-[#646cff]"
                  disabled={materialized}
                >
                  <option value="">None</option>
                  <option value="LOCAL">LOCAL</option>
                  <option value="CASCADED">CASCADED</option>
                </select>
              </div>
            </div>
          </div>

          {/* SELECT Query */}
          <div className="bg-white p-4 rounded border border-slate-200 mb-4">
            <label className="block text-sm font-medium text-slate-600 mb-2">
              SELECT Query <span className="text-red-500">*</span>
            </label>
            <textarea
              value={selectQuery}
              onChange={(e) => setSelectQuery(e.target.value)}
              placeholder="SELECT column1, column2 FROM table_name WHERE condition"
              rows={10}
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm font-mono focus:outline-none focus:border-[#646cff]"
            />
            <p className="text-xs text-slate-400 mt-2">
              Enter the SELECT statement that defines the view (without CREATE VIEW).
            </p>
          </div>

          {/* Preview */}
          <div className="bg-slate-50 p-4 rounded border border-slate-200 mb-4">
            <h3 className="font-medium text-slate-600 mb-2">SQL Preview</h3>
            <pre className="text-sm font-mono text-slate-700 whitespace-pre-wrap">
              {materialized ? "CREATE" : (orReplace ? "CREATE OR REPLACE" : "CREATE")}
              {materialized ? " MATERIALIZED VIEW" : " VIEW"} "{databaseSchemaName}"."{viewName || "view_name"}"{"\n"}
              AS {selectQuery}
              {!materialized && checkOption ? `\nWITH ${checkOption} CHECK OPTION` : ""}
            </pre>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-6 py-2 bg-[#646cff] text-white rounded hover:bg-[#5558dd] disabled:opacity-50"
            >
              {isPending && <CircularProgress size={16} color="inherit" />}
              Create View
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-slate-300 text-slate-600 rounded hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDatabaseViewPage;
