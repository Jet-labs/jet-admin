import React, { useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { FiChevronRight, FiChevronDown, FiCopy, FiCheck } from "react-icons/fi";
import { BiGitMerge } from "react-icons/bi";
import { MdInput, MdOutput } from "react-icons/md";

/**
 * Get icon for variable category
 */
const getCategoryIcon = (category) => {
  switch (category) {
    case 'input':
      return <MdInput className="w-3.5 h-3.5 text-green-500" />;
    case 'nodeOutput':
      return <BiGitMerge className="w-3.5 h-3.5 text-blue-500" />;
    case 'workflowOutput':
      return <MdOutput className="w-3.5 h-3.5 text-purple-500" />;
    default:
      return null;
  }
};

/**
 * Single variable item component
 */
const VariableItem = ({ variable, onSelect, isSelected }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = useCallback((e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(variable.path);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [variable.path]);
  
  const handleClick = useCallback(() => {
    if (onSelect) {
      onSelect(variable.path, variable);
    }
  }, [onSelect, variable]);
  
  return (
    <div
      className={`flex items-center gap-2 py-1.5 px-2 cursor-pointer bg-white hover:bg-slate-50 rounded text-xs group ${
        isSelected ? 'bg-blue-50 border-l-2 border-[#646cff]' : ''
      }`}
      onClick={handleClick}
    >
      {/* Variable name */}
      <span className="font-medium text-slate-700 truncate flex-1">
        {variable.name}
      </span>
      
      {/* Node title if available */}
      {variable.nodeTitle && (
        <span className="text-[10px] text-slate-400 truncate max-w-[80px]">
          {variable.nodeTitle}
        </span>
      )}
      
      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="p-0.5 hover:bg-slate-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        title="Copy path"
        type="button"
      >
        {copied ? (
          <FiCheck className="w-3 h-3 text-green-500" />
        ) : (
          <FiCopy className="w-3 h-3 text-slate-400" />
        )}
      </button>
    </div>
  );
};

VariableItem.propTypes = {
  variable: PropTypes.shape({
    path: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  onSelect: PropTypes.func,
  isSelected: PropTypes.bool,
};

/**
 * Category section component
 */
const VariableCategory = ({ 
  category, 
  title, 
  variables, 
  onSelect, 
  selectedPath,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  if (!variables || variables.length === 0) return null;
  
  return (
    <div className="mb-1 bg-white">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1.5 w-full px-2 py-1.5 bg-slate-50 hover:bg-slate-100 rounded text-left border border-slate-200"
      >
        {isExpanded ? (
          <FiChevronDown className="w-3 h-3 text-slate-500" />
        ) : (
          <FiChevronRight className="w-3 h-3 text-slate-500" />
        )}
        {getCategoryIcon(category)}
        <span className="text-[11px] font-medium text-slate-600 uppercase tracking-wide flex-1">
          {title}
        </span>
        <span className="text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
          {variables.length}
        </span>
      </button>
      
      {isExpanded && (
        <div className="ml-3 mt-1 border-l border-slate-200 pl-2 bg-white">
          {variables.map((variable) => (
            <VariableItem
              key={variable.path}
              variable={variable}
              onSelect={onSelect}
              isSelected={selectedPath === variable.path}
            />
          ))}
        </div>
      )}
    </div>
  );
};

VariableCategory.propTypes = {
  category: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  variables: PropTypes.array.isRequired,
  onSelect: PropTypes.func,
  selectedPath: PropTypes.string,
  defaultExpanded: PropTypes.bool,
};

/**
 * Extract workflow schema from workflow definition
 * Returns structured variables for inputs, node outputs, and workflow outputs
 * Uses mustache format {{ctx.path}} for variable paths
 * 
 * Works with Workflow model instances that use WorkflowNode/WorkflowEdge
 */
export const extractWorkflowSchema = (workflow) => {
  if (!workflow) return { inputs: [], nodeOutputs: [], workflowOutputs: [] };
  
  const schema = {
    inputs: [],
    nodeOutputs: [],
    workflowOutputs: [],
  };
  
  // 1. Extract workflow inputs from workflowOptions.args
  const args = workflow.workflowOptions?.args || workflow.inputs || [];
  schema.inputs = args.map(arg => ({
    path: `{{ctx.input.${arg.name}}}`,
    name: arg.name,
    type: arg.type || 'string',
    description: arg.description || `Workflow input parameter: ${arg.name}`,
    category: 'input',
    required: arg.required || false,
    defaultValue: arg.defaultValue,
  }));
  
  // 2. Extract node outputs
  // Works with WorkflowNode instances (which have hasOutput, contextPath, title)
  // or raw node arrays
  const nodes = workflow.nodes || [];
  
  for (const node of nodes) {
    // Check if it's a WorkflowNode instance or raw data
    const hasOutput = node.hasOutput !== undefined 
      ? node.hasOutput 
      : (node.outputVariable && node.type !== 'start' && node.type !== 'end');
    
    if (hasOutput) {
      const outputVar = node.outputVariable || node.data?.outputVariable;
      const nodeTitle = node.title || node.data?.title || node.type;
      
      schema.nodeOutputs.push({
        path: `{{ctx.${outputVar}}}`,
        name: outputVar,
        type: getNodeOutputType(node.type),
        description: `Output from ${nodeTitle} node`,
        category: 'nodeOutput',
        nodeType: node.type,
        nodeTitle: nodeTitle,
        nodeID: node.id,
      });
    }
  }
  
  // 3. Extract workflow outputs from end node
  // Works with both Workflow model (workflow.outputs) and raw data
  const outputs = workflow.outputs || [];
  const endNode = nodes.find(n => n.isEnd || n.type === 'end');
  const endOutputs = outputs.length > 0 ? outputs : (endNode?.data?.outputs || []);
  
  for (const output of endOutputs) {
    if (output.name) {
      schema.workflowOutputs.push({
        path: `{{ctx.output.${output.name}}}`,
        name: output.name,
        type: output.type || 'any',
        description: `Workflow output: ${output.name}`,
        category: 'workflowOutput',
        sourceVariable: output.value,
      });
    }
  }
  
  // If no explicit outputs, add a general output reference
  if (schema.workflowOutputs.length === 0 && schema.nodeOutputs.length > 0) {
    schema.workflowOutputs.push({
      path: `{{ctx.output}}`,
      name: 'output',
      type: 'any',
      description: 'Final workflow output (from end node)',
      category: 'workflowOutput',
    });
  }
  
  return schema;
};

/**
 * Get expected output type based on node type
 */
const getNodeOutputType = (nodeType) => {
  switch (nodeType) {
    case 'dataQuery':
      return 'object'; // Usually { rows: [], fields: [] }
    case 'javascript':
      return 'any';
    case 'condition':
      return 'boolean';
    case 'restapi':
      return 'object';
    case 'loop':
      return 'array';
    default:
      return 'any';
  }
};

/**
 * Variable Explorer Component (Schema-Based)
 * 
 * Displays available workflow variables based on workflow definition
 * No workflow execution required - uses static schema analysis
 */
export const VariableExplorer = ({
  workflow,
  context, // Optional: can still show runtime context if available
  onSelect,
  selectedPath = null,
  title = "Workflow Variables",
  showSearch = true,
  className = "",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Extract schema from workflow definition
  const schema = useMemo(() => {
    return extractWorkflowSchema(workflow);
  }, [workflow]);
  
  // Combine with runtime context if available
  const allVariables = useMemo(() => {
    const variables = {
      inputs: [...schema.inputs],
      nodeOutputs: [...schema.nodeOutputs],
      workflowOutputs: [...schema.workflowOutputs],
    };
    
    return variables;
  }, [schema]);
  
  // Filter based on search
  const filteredVariables = useMemo(() => {
    if (!searchQuery) return allVariables;
    
    const lowerQuery = searchQuery.toLowerCase();
    
    return {
      inputs: allVariables.inputs.filter(v => 
        v.path.toLowerCase().includes(lowerQuery) || 
        v.name.toLowerCase().includes(lowerQuery)
      ),
      nodeOutputs: allVariables.nodeOutputs.filter(v => 
        v.path.toLowerCase().includes(lowerQuery) || 
        v.name.toLowerCase().includes(lowerQuery) ||
        v.nodeTitle?.toLowerCase().includes(lowerQuery)
      ),
      workflowOutputs: allVariables.workflowOutputs.filter(v => 
        v.path.toLowerCase().includes(lowerQuery) || 
        v.name.toLowerCase().includes(lowerQuery)
      ),
    };
  }, [allVariables, searchQuery]);
  
  // Check if any variables exist
  const hasVariables = 
    schema.inputs.length > 0 || 
    schema.nodeOutputs.length > 0 || 
    schema.workflowOutputs.length > 0;
  
  return (
    <div className={`flex flex-col border border-slate-200 rounded bg-white ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 bg-slate-50 rounded-t">
        <h3 className="text-xs font-medium text-slate-600">{title}</h3>
      </div>
      
      {/* Search */}
      {showSearch && hasVariables && (
        <div className="px-2 py-2 border-b border-slate-100">
          <input
            type="text"
            placeholder="Search variables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-slate-400 text-slate-700 placeholder:text-slate-400"
          />
        </div>
      )}
      
      {/* Variables tree */}
      <div className="flex-1 overflow-auto max-h-64 py-2 px-1">
        {!hasVariables ? (
          <div className="text-center py-4 text-slate-400 text-xs">
            <p>No variables defined</p>
            <p className="mt-1 text-[10px]">Add workflow inputs or nodes with output variables</p>
          </div>
        ) : (
          <>
            <VariableCategory
              category="input"
              title="Workflow Inputs"
              variables={filteredVariables.inputs}
              onSelect={onSelect}
              selectedPath={selectedPath}
              defaultExpanded={true}
            />
            
            <VariableCategory
              category="nodeOutput"
              title="Node Outputs"
              variables={filteredVariables.nodeOutputs}
              onSelect={onSelect}
              selectedPath={selectedPath}
              defaultExpanded={true}
            />
            
            <VariableCategory
              category="workflowOutput"
              title="Workflow Outputs"
              variables={filteredVariables.workflowOutputs}
              onSelect={onSelect}
              selectedPath={selectedPath}
              defaultExpanded={true}
            />
          </>
        )}
      </div>
    </div>
  );
};

VariableExplorer.propTypes = {
  workflow: PropTypes.object,
  context: PropTypes.object,
  onSelect: PropTypes.func,
  selectedPath: PropTypes.string,
  title: PropTypes.string,
  showSearch: PropTypes.bool,
  className: PropTypes.string,
};

export default VariableExplorer;
