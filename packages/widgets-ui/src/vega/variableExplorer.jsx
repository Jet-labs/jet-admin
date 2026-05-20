import React, { useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { Button, Input } from "@jet-admin/ui";
import { ChevronDown, ChevronRight, Copy, Check, GitMerge, ArrowRightToLine, ArrowRightFromLine } from 'lucide-react';

// ─── Category icon ────────────────────────────────────────────────────────────

const getCategoryIcon = (category) => {
  switch (category) {
    case 'input': return <ArrowRightToLine className="w-3.5 h-3.5 text-emerald-500" />;
    case 'nodeOutput': return <GitMerge className="w-3.5 h-3.5 text-primary" />;
    case 'workflowOutput': return <ArrowRightFromLine className="w-3.5 h-3.5 text-purple-500" />;
    default: return null;
  }
};

// ─── VariableItem ─────────────────────────────────────────────────────────────

const VariableItem = ({ variable, onSelect, isSelected }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback((e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(variable.path);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [variable.path]);

  const handleClick = useCallback(() => {
    if (onSelect) onSelect(variable.path, variable);
  }, [onSelect, variable]);

  return (
    <div
      onClick={handleClick}
      className={`
        flex items-center gap-2 py-1.5 px-2 cursor-pointer rounded-sm text-xs group
        transition-colors
        ${isSelected
          ? 'bg-primary/10 text-primary border-l-2 border-primary'
          : 'hover:bg-muted text-foreground'
        }
      `}
    >
      <span className="font-medium truncate flex-1">{variable.name}</span>

      {variable.nodeTitle && (
        <span className="text-[10px] truncate max-w-[80px] text-muted-foreground">
          {variable.nodeTitle}
        </span>
      )}

      <Button
        onClick={handleCopy}
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Copy path"
        type="button"
      >
        {copied
          ? <Check className="w-3 h-3 text-emerald-500" />
          : <Copy className="w-3 h-3 text-muted-foreground" />
        }
      </Button>
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

// ─── VariableCategory ─────────────────────────────────────────────────────────

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
    <div className="mb-1">
      {/* Category header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-sm cursor-pointer bg-muted/50 border border-border hover:bg-muted transition-colors"
      >
        {isExpanded
          ? <ChevronDown className="w-3 h-3 text-muted-foreground" />
          : <ChevronRight className="w-3 h-3 text-muted-foreground" />
        }
        {getCategoryIcon(category)}
        <span className="text-[11px] font-medium uppercase tracking-wide flex-1 text-muted-foreground">
          {title}
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-brand-dark border border-border text-muted-foreground">
          {variables.length}
        </span>
      </div>

      {isExpanded && (
        <div className="ml-3 mt-1 pl-2 border-l border-border">
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

// ─── extractWorkflowSchema ────────────────────────────────────────────────────
// (unchanged — pure logic, no UI)

export const extractWorkflowSchema = (workflow) => {
  if (!workflow) return { inputs: [], nodeOutputs: [], workflowOutputs: [] };

  const schema = { inputs: [], nodeOutputs: [], workflowOutputs: [] };

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

  const nodes = workflow.nodes || [];
  for (const node of nodes) {
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
        nodeTitle,
        nodeID: node.id,
      });
    }
  }

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

const getNodeOutputType = (nodeType) => {
  switch (nodeType) {
    case 'dataQuery': return 'object';
    case 'javascript': return 'any';
    case 'condition': return 'boolean';
    case 'restapi': return 'object';
    case 'loop': return 'array';
    default: return 'any';
  }
};

// ─── VariableExplorer ─────────────────────────────────────────────────────────

export const VariableExplorer = ({
  workflow,
  context,
  onSelect,
  selectedPath = null,
  title = "Workflow Variables",
  showSearch = true,
  className = "",
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const schema = useMemo(() => extractWorkflowSchema(workflow), [workflow]);

  const allVariables = useMemo(() => ({
    inputs: [...schema.inputs],
    nodeOutputs: [...schema.nodeOutputs],
    workflowOutputs: [...schema.workflowOutputs],
  }), [schema]);

  const filteredVariables = useMemo(() => {
    if (!searchQuery) return allVariables;
    const q = searchQuery.toLowerCase();
    return {
      inputs: allVariables.inputs.filter(v => v.path.toLowerCase().includes(q) || v.name.toLowerCase().includes(q)),
      nodeOutputs: allVariables.nodeOutputs.filter(v => v.path.toLowerCase().includes(q) || v.name.toLowerCase().includes(q) || v.nodeTitle?.toLowerCase().includes(q)),
      workflowOutputs: allVariables.workflowOutputs.filter(v => v.path.toLowerCase().includes(q) || v.name.toLowerCase().includes(q)),
    };
  }, [allVariables, searchQuery]);

  const hasVariables =
    schema.inputs.length > 0 ||
    schema.nodeOutputs.length > 0 ||
    schema.workflowOutputs.length > 0;

  return (
    <div className={`flex flex-col rounded-md border border-border bg-brand-dark ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 rounded-t-lg border-b border-border bg-muted/50">
        <h3 className="text-xs font-medium text-muted-foreground">{title}</h3>
      </div>

      {/* Search */}
      {showSearch && hasVariables && (
        <div className="px-2 py-2 border-b border-border">
          <Input
            type="text"
            placeholder="Search variables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs"
          />
        </div>
      )}

      {/* Variables tree */}
      <div className="flex-1 overflow-auto max-h-64 py-2 px-1">
        {!hasVariables ? (
          <div className="text-center py-4 text-xs text-muted-foreground">
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