import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { FaPlus, FaTrash } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";

/**
 * Panel for editing workflow input parameter schema (workflowOptions.args).
 * Allows users to define the expected input parameters for a workflow.
 */
export const WorkflowInputArgsPanel = ({ workflowForm }) => {
  WorkflowInputArgsPanel.propTypes = {
    workflowForm: PropTypes.object.isRequired,
  };

  const args = workflowForm.values.workflowOptions?.args || [];

  const _handleAddArg = useCallback(() => {
    const newArgs = [
      ...args,
      { key: "", type: "string", required: false },
    ];
    workflowForm.setFieldValue("workflowOptions.args", newArgs);
  }, [args, workflowForm]);

  const _handleRemoveArg = useCallback((index) => {
    const newArgs = [...args];
    newArgs.splice(index, 1);
    workflowForm.setFieldValue("workflowOptions.args", newArgs);
  }, [args, workflowForm]);

  const _handleUpdateArg = useCallback((index, field, value) => {
    const newArgs = [...args];
    newArgs[index] = { ...newArgs[index], [field]: value };
    workflowForm.setFieldValue("workflowOptions.args", newArgs);
  }, [args, workflowForm]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row items-center gap-2">
          <IoSettingsOutline className="text-slate-500 text-sm" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Input Parameters
          </span>
        </div>
        <button
          type="button"
          onClick={_handleAddArg}
          className="flex bg-white flex-row items-center gap-1 text-[10px] text-[#646cff] hover:bg-[#646cff]/10 px-1.5 py-0.5 rounded focus:outline-none border-none hover:border-none"
        >
          <FaPlus className="w-2.5 h-2.5" />
          Add
        </button>
      </div>

      {args.length === 0 ? (
        <p className="text-[10px] text-slate-400 italic">
          No input parameters defined.
        </p>
      ) : (
        <div className="space-y-2">
          {args.map((arg, index) => (
            <div key={index} className="flex flex-col gap-1.5 p-2 bg-slate-50 rounded border border-slate-200">
              <div className="flex flex-row gap-2 items-center">
                <input
                  type="text"
                  placeholder="Name"
                  className="placeholder:text-slate-400 text-xs flex-1 min-w-0 bg-white border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 px-2 py-1"
                  value={arg.key || ""}
                  onChange={(e) => _handleUpdateArg(index, "key", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => _handleRemoveArg(index)}
                  className="p-1 bg-red-100 text-red-500 hover:bg-red-50 rounded focus:outline-none flex-shrink-0 border-none hover:border-none"
                >
                  <FaTrash className="w-2.5 h-2.5" />
                </button>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <select
                  className="text-xs bg-white border border-slate-300 text-slate-700 rounded focus:outline-none focus:border-slate-400 px-2 py-1 flex-1 min-w-0"
                  value={arg.type || "string"}
                  onChange={(e) => _handleUpdateArg(index, "type", e.target.value)}
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="object">Object</option>
                  <option value="array">Array</option>
                </select>
                <label className="flex items-center gap-1 text-[10px] text-slate-600 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={arg.required || false}
                    onChange={(e) => _handleUpdateArg(index, "required", e.target.checked)}
                    className="w-3 h-3 text-[#646cff] rounded border-slate-300 focus:ring-[#646cff]"
                  />
                  Required
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
