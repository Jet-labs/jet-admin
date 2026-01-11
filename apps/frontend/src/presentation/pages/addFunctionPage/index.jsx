import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { CircularProgress } from "@mui/material";
import { MdAdd, MdDelete } from "react-icons/md";
import { TbMathFunction } from "react-icons/tb";
import { createFunctionAPI } from "../../../data/apis/databaseFunction";
import { useFunctionsActions } from "../../../logic/contexts/functionsContext";
import { displaySuccess, displayError } from "../../../utils/notification";
import { extractError } from "../../../utils/error";
import { CONSTANTS } from "../../../constants";

const AddFunctionPage = () => {
  const { tenantID, databaseSchemaName } = useParams();
  const navigate = useNavigate();
  const { refetchFunctions } = useFunctionsActions();

  const [functionName, setFunctionName] = useState("");
  const [returnType, setReturnType] = useState("void");
  const [returnsSet, setReturnsSet] = useState(false);
  const [language, setLanguage] = useState("plpgsql");
  const [volatility, setVolatility] = useState("VOLATILE");
  const [securityDefiner, setSecurityDefiner] = useState(false);
  const [strict, setStrict] = useState(false);
  const [orReplace, setOrReplace] = useState(false);
  const [parameters, setParameters] = useState([]);
  const [body, setBody] = useState("BEGIN\n  -- Your code here\n  RETURN;\nEND;");

  const addParameter = () => {
    setParameters([...parameters, { name: "", type: "text", mode: "IN", default: "" }]);
  };

  const removeParameter = (index) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const updateParameter = (index, field, value) => {
    const updated = [...parameters];
    updated[index][field] = value;
    setParameters(updated);
  };

  const { mutate: createFunction, isPending } = useMutation({
    mutationFn: () => createFunctionAPI({
      tenantID,
      databaseSchemaName,
      functionName,
      parameters,
      returnType,
      language,
      body,
      volatility,
      securityDefiner,
      strict,
      orReplace,
      returnsSet,
    }),
    onSuccess: () => {
      displaySuccess("Function created successfully");
      refetchFunctions();
      navigate(CONSTANTS.ROUTES.VIEW_FUNCTION_BY_NAME.path(tenantID, databaseSchemaName, functionName));
    },
    onError: (err) => {
      displayError(`Failed to create function: ${extractError(err)}`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!functionName.trim()) {
      displayError("Function name is required");
      return;
    }
    if (!body.trim()) {
      displayError("Function body is required");
      return;
    }
    createFunction();
  };

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-[#eaebff] rounded">
            <TbMathFunction size={24} className="text-[#646cff]" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-700">Create Function</h1>
            <p className="text-sm text-slate-500">Create a new function in {databaseSchemaName}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="bg-white p-4 rounded border border-slate-200 mb-4">
            <h3 className="font-medium text-slate-700 mb-3">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Function Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={functionName}
                  onChange={(e) => setFunctionName(e.target.value)}
                  placeholder="my_function"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm focus:outline-none focus:border-[#646cff]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm focus:outline-none focus:border-[#646cff]"
                >
                  <option value="plpgsql">PL/pgSQL</option>
                  <option value="sql">SQL</option>
                  <option value="plpython3u">PL/Python</option>
                  <option value="plv8">PLV8 (JavaScript)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Return Type</label>
                <input
                  type="text"
                  value={returnType}
                  onChange={(e) => setReturnType(e.target.value)}
                  placeholder="void"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm focus:outline-none focus:border-[#646cff]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Volatility</label>
                <select
                  value={volatility}
                  onChange={(e) => setVolatility(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm focus:outline-none focus:border-[#646cff]"
                >
                  <option value="VOLATILE">VOLATILE</option>
                  <option value="STABLE">STABLE</option>
                  <option value="IMMUTABLE">IMMUTABLE</option>
                </select>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="bg-white p-4 rounded border border-slate-200 mb-4">
            <h3 className="font-medium text-slate-700 mb-3">Options</h3>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={orReplace} onChange={(e) => setOrReplace(e.target.checked)} className="rounded" />
                <span className="text-sm text-slate-600">OR REPLACE</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={returnsSet} onChange={(e) => setReturnsSet(e.target.checked)} className="rounded" />
                <span className="text-sm text-slate-600">RETURNS SETOF</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={strict} onChange={(e) => setStrict(e.target.checked)} className="rounded" />
                <span className="text-sm text-slate-600">STRICT</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={securityDefiner} onChange={(e) => setSecurityDefiner(e.target.checked)} className="rounded" />
                <span className="text-sm text-slate-600">SECURITY DEFINER</span>
              </label>
            </div>
          </div>

          {/* Parameters */}
          <div className="bg-white p-4 rounded border border-slate-200 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-slate-700">Parameters</h3>
              <button
                type="button"
                onClick={addParameter}
                className="flex items-center gap-1 px-2 py-1 text-sm text-[#646cff] hover:bg-[#eaebff] rounded"
              >
                <MdAdd size={16} /> Add Parameter
              </button>
            </div>
            {parameters.length === 0 ? (
              <p className="text-sm text-slate-400">No parameters defined</p>
            ) : (
              <div className="space-y-2">
                {parameters.map((param, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <select
                      value={param.mode}
                      onChange={(e) => updateParameter(i, "mode", e.target.value)}
                      className="px-2 py-1 bg-white border border-slate-300 rounded text-sm w-20"
                    >
                      <option value="IN">IN</option>
                      <option value="OUT">OUT</option>
                      <option value="INOUT">INOUT</option>
                      <option value="VARIADIC">VARIADIC</option>
                    </select>
                    <input
                      type="text"
                      value={param.name}
                      onChange={(e) => updateParameter(i, "name", e.target.value)}
                      placeholder="param_name"
                      className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded text-sm"
                    />
                    <input
                      type="text"
                      value={param.type}
                      onChange={(e) => updateParameter(i, "type", e.target.value)}
                      placeholder="type"
                      className="w-32 px-2 py-1 bg-white border border-slate-300 rounded text-sm"
                    />
                    <input
                      type="text"
                      value={param.default}
                      onChange={(e) => updateParameter(i, "default", e.target.value)}
                      placeholder="default"
                      className="w-24 px-2 py-1 bg-white border border-slate-300 rounded text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeParameter(i)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <MdDelete size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Function Body */}
          <div className="bg-white p-4 rounded border border-slate-200 mb-4">
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Function Body <span className="text-red-500">*</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm font-mono focus:outline-none focus:border-[#646cff]"
            />
            <p className="text-xs text-slate-400 mt-2">
              For PL/pgSQL: include BEGIN...END block. For SQL: just the SQL statements.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-6 py-2 bg-[#646cff] text-white rounded hover:bg-[#5558dd] disabled:opacity-50"
            >
              {isPending && <CircularProgress size={16} color="inherit" />}
              Create Function
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

export default AddFunctionPage;
