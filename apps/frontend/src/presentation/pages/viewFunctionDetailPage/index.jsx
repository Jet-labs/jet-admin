import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { TbMathFunction } from "react-icons/tb";
import { getFunctionByNameAPI, executeFunctionAPI } from "../../../data/apis/databaseFunction";
import { extractError } from "../../../utils/error";
import { MdPlayArrow } from "react-icons/md";
import { useMutation } from "@tanstack/react-query";
import { displaySuccess, displayError } from "../../../utils/notification";

const ViewFunctionDetailPage = () => {
  const { tenantID, databaseSchemaName, functionName } = useParams();
  const [args, setArgs] = React.useState([]);
  const [result, setResult] = React.useState(null);

  const {
    isLoading,
    data: funcDetails,
    error,
  } = useQuery({
    queryKey: ["FUNCTION_DETAIL", tenantID, databaseSchemaName, functionName],
    queryFn: () => getFunctionByNameAPI({ tenantID, databaseSchemaName, functionName }),
    refetchOnWindowFocus: false,
  });

  const { mutate: executeFunction, isPending: isExecuting } = useMutation({
    mutationFn: () => executeFunctionAPI({ tenantID, databaseSchemaName, functionName, args }),
    onSuccess: (data) => {
      setResult(data);
      displaySuccess("Function executed successfully");
    },
    onError: (err) => {
      displayError(`Execution failed: ${extractError(err)}`);
    },
  });

  React.useEffect(() => {
    if (funcDetails?.parameters) {
      setArgs(funcDetails.parameters.filter(p => p.mode === "IN" || p.mode === "INOUT").map(() => ""));
    }
  }, [funcDetails]);

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
        <h3 className="font-semibold mb-1">Error loading function</h3>
        <p className="text-sm">{extractError(error)}</p>
      </div>
    );
  }

  const inputParams = funcDetails?.parameters?.filter(p => p.mode === "IN" || p.mode === "INOUT") || [];

  return (
    <div className="p-4 h-full overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#eaebff] rounded">
            <TbMathFunction size={24} className="text-[#646cff]" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-700">{functionName}</h1>
            <p className="text-sm text-slate-500">
              function • {funcDetails?.language} • → {funcDetails?.return_type}
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
              <span className="text-slate-500">Language:</span>
              <span className="font-medium">{funcDetails?.language}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Volatility:</span>
              <span className="font-medium">{funcDetails?.volatility}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Returns Set:</span>
              <span className="font-medium">{funcDetails?.returns_set ? "Yes" : "No"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Strict:</span>
              <span className="font-medium">{funcDetails?.strict ? "Yes" : "No"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Security Definer:</span>
              <span className="font-medium">{funcDetails?.security_definer ? "Yes" : "No"}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded border border-slate-200">
          <h3 className="font-medium text-slate-700 mb-3">Parameters</h3>
          {funcDetails?.parameters && funcDetails.parameters.length > 0 ? (
            <div className="space-y-1 max-h-48 overflow-auto">
              {funcDetails.parameters.map((param, i) => (
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
        <h3 className="font-medium text-slate-700 mb-3">Execute</h3>
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
          onClick={() => executeFunction()}
          disabled={isExecuting}
          className="flex items-center gap-2 px-4 py-2 bg-[#646cff] text-white rounded hover:bg-[#5558dd] disabled:opacity-50"
        >
          <MdPlayArrow size={20} />
          {isExecuting ? "Executing..." : "Execute"}
        </button>

        {result && (
          <div className="mt-4 overflow-auto max-h-64">
            <h4 className="text-sm font-medium text-slate-600 mb-2">Result ({result.rowCount} rows)</h4>
            {result.rows && result.rows.length > 0 ? (
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {result.fields?.map((f) => (
                      <th key={f.name} className="px-3 py-2 text-left font-medium text-slate-600 border-b">
                        {f.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      {result.fields?.map((f) => (
                        <td key={f.name} className="px-3 py-2 border-b border-slate-100 text-slate-600">
                          {String(row[f.name] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <pre className="bg-slate-50 p-3 rounded text-sm">{JSON.stringify(result, null, 2)}</pre>
            )}
          </div>
        )}
      </div>

      {/* Source Code */}
      <div className="bg-white p-4 rounded border border-slate-200">
        <h3 className="font-medium text-slate-700 mb-3">Source Code</h3>
        <pre className="bg-slate-50 p-3 rounded text-sm font-mono text-slate-700 overflow-auto max-h-96">
          {funcDetails?.source_code}
        </pre>
      </div>
    </div>
  );
};

export default ViewFunctionDetailPage;
