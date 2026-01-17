// Dynamic Args Control - Renders dynamic argument fields for workflow nodes
import React, { useState, useRef, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { TbVariable } from 'react-icons/tb';

export const DynamicArgsControl = (props) => {
  const { data, path, handleChange, uischema, errors } = props;
  const args = uischema?.options?.args || [];
  const workflowNodes = uischema?.options?.workflowNodes || [];
  const workflowEdges = uischema?.options?.workflowEdges || [];
  const workflowInputArgs = uischema?.options?.workflowInputArgs || [];
  const currentNodeId = uischema?.options?.currentNodeId || null;
  const argsData = data || {};

  const handleArgChange = (argKey, value) => {
    handleChange(path, { ...argsData, [argKey]: value });
  };

  // Get all upstream node IDs (predecessors in the DAG)
  const getUpstreamNodeIds = useMemo(() => {
    if (!currentNodeId || !workflowEdges || workflowEdges.length === 0) {
      return new Set();
    }

    const upstreamIds = new Set();
    const visited = new Set();
    const queue = [currentNodeId];

    // BFS to find all predecessors
    while (queue.length > 0) {
      const nodeId = queue.shift();
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      // Find all edges pointing to this node
      const incomingEdges = workflowEdges.filter(e => e.target === nodeId);
      for (const edge of incomingEdges) {
        if (!visited.has(edge.source)) {
          upstreamIds.add(edge.source);
          queue.push(edge.source);
        }
      }
    }

    return upstreamIds;
  }, [currentNodeId, workflowEdges]);

  // Get available output variables from upstream workflow nodes only
  const getAvailableVariables = () => {
    const variables = [];
    
    // Add specific workflow input parameters (from workflowInputArgs)
    // These are available as ctx.input.paramName
    if (workflowInputArgs && workflowInputArgs.length > 0) {
      workflowInputArgs.forEach(arg => {
        if (arg.key) {
          variables.push({
            nodeId: 'input',
            nodeTitle: 'Workflow Input',
            variableName: arg.key,
            contextPath: `ctx.input.${arg.key}`,
            category: 'input',
            type: arg.type || 'string',
          });
        }
      });
    }

    // Add node output variables - only from upstream nodes
    if (workflowNodes && workflowNodes.length > 0) {
      const nodeVariables = workflowNodes
        .filter(node => node.id !== currentNodeId) // Exclude current node
        .filter(node => getUpstreamNodeIds.has(node.id)) // Only upstream nodes
        .filter(node => node.data?.outputVariable) // Only nodes with output variables
        .map(node => ({
          nodeId: node.id,
          nodeTitle: node.data?.title || node.data?.label || node.type,
          variableName: node.data.outputVariable,
          contextPath: `ctx.${node.data.outputVariable}`,
          category: 'node',
        }));
      variables.push(...nodeVariables);
    }

    return variables;
  };

  const availableVariables = getAvailableVariables();

  if (args.length === 0) {
    return null;
  }

  return (
    <div className="border border-slate-200 rounded p-3 mt-2 bg-white">
      <label className="block mb-2 text-xs font-medium text-slate-500">
        Arguments
      </label>
      <div className="space-y-2">
        {args.map((arg, index) => {
          const argName = arg.key;
          return (
            <ArgInputWithVariablePicker
              key={`arg-${index}`}
              argName={argName}
              value={argsData[argName] || ''}
              onChange={(value) => handleArgChange(argName, value)}
              availableVariables={availableVariables}
            />
          );
        })}
      </div>
      {errors && errors.length > 0 && (
        <span className="text-red-500 text-xs mt-1">{errors}</span>
      )}
    </div>
  );
};

// Sub-component for arg input with variable picker
const ArgInputWithVariablePicker = ({ argName, value, onChange, availableVariables }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const insertVariable = (contextPath) => {
    // Insert mustache variable at cursor position or replace entire value
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const mustacheVar = `{{${contextPath}}}`;
      const newValue = value.substring(0, start) + mustacheVar + value.substring(end);
      onChange(newValue);
      // Move cursor after inserted text
      setTimeout(() => {
        input.focus();
        const newCursorPos = start + mustacheVar.length;
        input.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    } else {
      onChange(`{{${contextPath}}}`);
    }
    setShowDropdown(false);
  };

  // Group variables by category
  const inputVariables = availableVariables.filter(v => v.category === 'input');
  const nodeVariables = availableVariables.filter(v => v.category === 'node');

  return (
    <div className="flex flex-row justify-between items-center gap-2">
      <div className="flex-1">
        <label className="block mb-1 text-[10px] font-medium text-slate-400">
          {argName}
        </label>
        <div className="flex items-center gap-1">
          <input
            ref={inputRef}
            type="text"
            id={`arg-${argName}`}
            className="placeholder:text-slate-400 text-xs w-full bg-slate-50 border border-slate-200 text-slate-700 rounded focus:outline-none focus:border-slate-400 block px-2.5 py-1.5"
            placeholder={`Value for ${argName}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className={`flex-shrink-0 p-1.5 rounded transition-colors border border-slate-200 bg-slate-50 ${
                availableVariables.length > 0 
                  ? 'text-blue-500 hover:text-blue-700 hover:bg-blue-50' 
                  : 'text-slate-400 hover:text-slate-500 hover:bg-slate-100'
              }`}
              title="Insert variable from previous node"
            >
              <TbVariable className="w-4 h-4" />
            </button>
            {showDropdown && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-slate-200 rounded shadow-lg z-50 max-h-64 overflow-y-auto">
                {availableVariables.length === 0 ? (
                  <div className="px-2 py-3 text-xs text-slate-400 text-center">
                    No variables available yet.
                    <br />
                    <span className="text-[10px]">Add workflow inputs or connect upstream nodes.</span>
                  </div>
                ) : (
                    <>
                      {/* Input Parameters Section */}
                      {inputVariables.length > 0 && (
                        <>
                          <div className="px-2 py-1.5 text-[10px] font-semibold text-green-600 uppercase tracking-wider border-b border-slate-100 bg-green-50">
                            📥 Workflow Inputs
                          </div>
                          {inputVariables.map((variable, idx) => (
                            <button
                              key={`input-${idx}`}
                              type="button"
                              onClick={() => insertVariable(variable.contextPath)}
                              className="w-full bg-white text-left px-2 py-1.5 hover:bg-green-50 hover:border-none border-none rounded-none transition-colors border-b border-slate-50"
                            >
                              <div className="text-xs font-medium text-slate-700 font-mono">
                                {variable.contextPath}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                type: {variable.type || 'any'}
                              </div>
                            </button>
                          ))}
                        </>
                      )}

                      {/* Node Outputs Section */}
                      {nodeVariables.length > 0 && (
                        <>
                          <div className="px-2 py-1.5 text-[10px] font-semibold text-blue-600 uppercase tracking-wider border-b border-slate-100 bg-blue-50">
                            📤 Upstream Node Outputs
                          </div>
                          {nodeVariables.map((variable, idx) => (
                            <button
                            key={`node-${idx}`}
                            type="button"
                            onClick={() => insertVariable(variable.contextPath)}
                            className="w-full bg-white text-left px-2 py-1.5 hover:bg-blue-50 hover:border-none border-none rounded-none transition-colors border-b border-slate-50 last:border-b-0"
                          >
                            <div className="text-xs font-medium text-slate-700 font-mono">
                              {variable.contextPath}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              from: {variable.nodeTitle}
                            </div>
                          </button>
                        ))}
                        </>
                      )}
                    </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

DynamicArgsControl.propTypes = {
  data: PropTypes.object,
  path: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  uischema: PropTypes.object.isRequired,
  errors: PropTypes.arrayOf(PropTypes.string),
};

