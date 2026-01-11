import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { MdFunctions, MdPlayArrow } from "react-icons/md";
import { getStoredProcedureByNameAPI, executeStoredProcedureAPI } from "../../../data/apis/storedProcedure";
import { extractError } from "../../../utils/error";
import { useMutation } from "@tanstack/react-query";
import { displaySuccess, displayError } from "../../../utils/notification";

const ViewStoredProcedureDetailPage = () => {
  const { tenantID, databaseSchemaName, procedureName } = useParams();
  const [args, setArgs] = React.useState([]);
  const [executed, setExecuted] = React.useState(false);

  const {
    isLoading,
    data: procDetails,
    error,
  } = useQuery({
    queryKey: ["STORED_PROCEDURE_DETAIL", tenantID, databaseSchemaName, procedureName],
    queryFn: () => getStoredProcedureByNameAPI({ tenantID, databaseSchemaName, procedureName }),
    refetchOnWindowFocus: false,
  });

  const { mutate: executeProcedure, isPending: isExecuting } = useMutation({
    mutationFn: () => executeStoredProcedureAPI({ tenantID, databaseSchemaName, procedureName, args }),
    onSuccess: () => {
      setExecuted(true);
      displaySuccess("Procedure executed successfully");
    },
    onError: (err) => {
      displayError(`Execution failed: ${extractError(err)}`);
    },
  });

  React.useEffect(() => {
    if (procDetails?.parameters) {
      setArgs(procDetails.parameters.filter(p => p.mode === "IN" || p.mode === "INOUT").map(() => ""));
    }
  }, [procDetails]);

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
        <h3 className="font-semibold mb-1">Error loading procedure</h3>
        <p className="text-sm">{extractError(error)}</p>
      </div>
    );
  }

  const inputParams = procDetails?.parameters?.filter(p => p.mode === "IN" || p.mode === "INOUT") || [];

  return (
    <div className="p-4 h-full overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 rounded">
            <MdFunctions size={24} className="text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-700">{procedureName}</h1>
            <p className="text-sm text-slate-500">
              procedure • {procDetails?.language}
            </p>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded border border-slate-200">
          <h3 className="font-medium text-slate-700 mb-3">Properties</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Type:</span>
              <span className="font-medium">Procedure</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Language:</span>
              <span className="font-medium">{procDetails?.language}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Security Definer:</span>
              <span className="font-medium">{procDetails?.security_definer ? "Yes" : "No"}</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Procedures use CALL syntax and can control transactions (COMMIT/ROLLBACK)
          </p>
        </div>

        <div className="bg-white p-4 rounded border border-slate-200">
          <h3 className="font-medium text-slate-700 mb-3">Parameters</h3>
          {procDetails?.parameters && procDetails.parameters.length > 0 ? (
            <div className="space-y-1 max-h-48 overflow-auto">
              {procDetails.parameters.map((param, i) => (
                <div key={i} className="flex justify-between text-sm py-1 border-b border-slate-100 last:border-0">
                  <span className="font-mono text-slate-600">{param.name}</span>
                  <span className="text-slate-400">{param.mode} {param.type}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No parameters</p>
          )}
        </div>
      </div>

      {/* Execute Section */}
      <div className="bg-white p-4 rounded border border-slate-200 mb-6">
        <h3 className="font-medium text-slate-700 mb-3">Execute (CALL)</h3>
        {inputParams.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {inputParams.map((param, i) => (
              <div key={i}>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  {param.name} <span className="text-slate-400">({param.type})</span>
                </label>
                <input
                  type="text"
                  value={args[i] || ""}
                  onChange={(e) => {
                    const newArgs = [...args];
                    newArgs[i] = e.target.value;
                    setArgs(newArgs);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm focus:outline-none focus:border-[#646cff]"
                  placeholder={`Enter ${param.name}`}
                />
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => executeProcedure()}
          disabled={isExecuting}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 disabled:opacity-50"
        >
          <MdPlayArrow size={20} />
          {isExecuting ? "Executing..." : "Execute (CALL)"}
        </button>

        {executed && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-700">
              Procedure executed successfully. Procedures do not return result sets like functions.
            </p>
          </div>
        )}
      </div>

      {/* Source Code */}
      <div className="bg-white p-4 rounded border border-slate-200">
        <h3 className="font-medium text-slate-700 mb-3">Source Code</h3>
        <pre className="bg-slate-50 p-3 rounded text-sm font-mono text-slate-700 overflow-auto max-h-96">
          {procDetails?.source_code}
        </pre>
      </div>
    </div>
  );
};

export default ViewStoredProcedureDetailPage;
