import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { getDatabaseViewByNameAPI, queryDatabaseViewAPI } from "../../../data/apis/databaseView";
import { extractError } from "../../../utils/error";
import { MdTableView, MdDelete } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDatabaseViewsActions } from "../../../logic/contexts/databaseViewsContext";
import { displaySuccess, displayError } from "../../../utils/notification";

const ViewDatabaseViewDetailPage = () => {
  const { tenantID, databaseSchemaName, databaseViewName } = useParams();
  const queryClient = useQueryClient();
  const { refetchDatabaseViews } = useDatabaseViewsActions();
  const [showData, setShowData] = React.useState(false);

  const {
    isLoading,
    data: viewDetails,
    error,
  } = useQuery({
    queryKey: ["DATABASE_VIEW_DETAIL", tenantID, databaseSchemaName, databaseViewName],
    queryFn: () => getDatabaseViewByNameAPI({ tenantID, databaseSchemaName, databaseViewName }),
    refetchOnWindowFocus: false,
  });

  const {
    isLoading: isLoadingData,
    data: viewData,
    refetch: fetchData,
  } = useQuery({
    queryKey: ["DATABASE_VIEW_DATA", tenantID, databaseSchemaName, databaseViewName],
    queryFn: () => queryDatabaseViewAPI({ tenantID, databaseSchemaName, databaseViewName, limit: 50 }),
    refetchOnWindowFocus: false,
    enabled: showData,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <CircularProgress size={24} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded m-4">
        <h3 className="font-semibold mb-1">Error loading view</h3>
        <p className="text-sm">{extractError(error)}</p>
      </div>
    );
  }

  return (
    <div className="p-4 h-full overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#eaebff] rounded-lg">
            <MdTableView size={24} className="text-[#646cff]" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-700">{databaseViewName}</h1>
            <p className="text-sm text-slate-500">
              {viewDetails?.is_updatable === "YES" ? "Updatable view" : "Read-only view"}
            </p>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <h3 className="font-medium text-slate-700 mb-3">View Properties</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Updatable:</span>
              <span className="font-medium">{viewDetails?.is_updatable}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Insertable:</span>
              <span className="font-medium">{viewDetails?.is_insertable_into}</span>
            </div>
            {viewDetails?.description && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Description:</span>
                <span className="font-medium">{viewDetails.description}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <h3 className="font-medium text-slate-700 mb-3">Columns ({viewDetails?.columns?.length || 0})</h3>
          <div className="space-y-1 max-h-48 overflow-auto">
            {viewDetails?.columns?.map((col) => (
              <div key={col.column_name} className="flex justify-between text-sm py-1 border-b border-slate-100 last:border-0">
                <span className="font-mono text-slate-600">{col.column_name}</span>
                <span className="text-slate-400">{col.udt_name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* View Definition */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 mb-6">
        <h3 className="font-medium text-slate-700 mb-3">View Definition</h3>
        <pre className="bg-slate-50 p-3 rounded text-sm font-mono text-slate-700 overflow-auto max-h-64">
          {viewDetails?.view_definition}
        </pre>
      </div>

      {/* Preview Data */}
      <div className="bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-slate-700">Data Preview</h3>
          <button
            onClick={() => { setShowData(true); fetchData(); }}
            className="text-sm px-3 py-1 bg-[#646cff] text-white rounded hover:bg-[#5558dd]"
          >
            {isLoadingData ? "Loading..." : "Load Data"}
          </button>
        </div>
        
        {viewData && viewData.rows && (
          <div className="overflow-auto max-h-96">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {viewData.fields?.map((f) => (
                    <th key={f.name} className="px-3 py-2 text-left font-medium text-slate-600 border-b">
                      {f.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {viewData.rows.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    {viewData.fields?.map((f) => (
                      <td key={f.name} className="px-3 py-2 border-b border-slate-100 text-slate-600">
                        {String(row[f.name] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-slate-400 mt-2">
              Showing {viewData.rowCount} of {viewData.totalCount} rows
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewDatabaseViewDetailPage;
