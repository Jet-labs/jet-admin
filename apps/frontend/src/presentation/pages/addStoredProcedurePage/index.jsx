import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { CircularProgress } from "@mui/material";
import { MdFunctions, MdAdd, MdDelete } from "react-icons/md";
import { createStoredProcedureAPI } from "../../../data/apis/storedProcedure";
import { useStoredProceduresActions } from "../../../logic/contexts/storedProceduresContext";
import { displaySuccess, displayError } from "../../../utils/notification";
import { extractError } from "../../../utils/error";
import { CONSTANTS } from "../../../constants";

const AddStoredProcedurePage = () => {
  const { tenantID, databaseSchemaName } = useParams();
  const navigate = useNavigate();
  const { refetchStoredProcedures } = useStoredProceduresActions();

  const [procedureName, setProcedureName] = useState("");
  const [language, setLanguage] = useState("plpgsql");
  const [securityDefiner, setSecurityDefiner] = useState(false);
  const [orReplace, setOrReplace] = useState(false);
  const [parameters, setParameters] = useState([]);
  const [body, setBody] = useState("BEGIN\n  -- Your code here\n  -- Procedures can COMMIT/ROLLBACK\nEND;");

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

  const { mutate: createProcedure, isPending } = useMutation({
    mutationFn: () => createStoredProcedureAPI({
      tenantID,
      databaseSchemaName,
      procedureName,
      parameters,
      language,
      body,
      securityDefiner,
      orReplace,
    }),
    onSuccess: () => {
      displaySuccess("Procedure created successfully");
      refetchStoredProcedures();
      navigate(CONSTANTS.ROUTES.VIEW_STORED_PROCEDURE_BY_NAME.path(tenantID, databaseSchemaName, procedureName));
    },
    onError: (err) => {
      displayError(`Failed to create procedure: ${extractError(err)}`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!procedureName.trim()) {
      displayError("Procedure name is required");
      return;
    }
    if (!body.trim()) {
      displayError("Procedure body is required");
      return;
    }
    createProcedure();
  };

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-50 rounded">
            <MdFunctions size={24} className="text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-700">Create Procedure</h1>
            <p className="text-sm text-slate-500">Create a new procedure in {databaseSchemaName}</p>
            <p className="text-xs text-slate-400">Requires PostgreSQL 11+</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="bg-white p-4 rounded border border-slate-200 mb-4">
            <h3 className="font-medium text-slate-700 mb-3">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Procedure Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={procedureName}
                  onChange={(e) => setProcedureName(e.target.value)}
                  placeholder="my_procedure"
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
                <input type="checkbox" checked={securityDefiner} onChange={(e) => setSecurityDefiner(e.target.checked)} className="rounded" />
                <span className="text-sm text-slate-600">SECURITY DEFINER</span>
              </label>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Note: Procedures don&apos;t have return types or volatility settings (unlike functions)
            </p>
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

          {/* Procedure Body */}
          <div className="bg-white p-4 rounded border border-slate-200 mb-4">
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Procedure Body <span className="text-red-500">*</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm font-mono focus:outline-none focus:border-[#646cff]"
            />
            <p className="text-xs text-slate-400 mt-2">
              Procedures can use COMMIT and ROLLBACK for transaction control (unlike functions)
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
              Create Procedure
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

export default AddStoredProcedurePage;
