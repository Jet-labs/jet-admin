import React, { memo, useState, useEffect, useMemo, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { JsonForms } from '@jsonforms/react';
import { useWorkflowNodes } from '../context';
import { workflowNodeRenderers } from '../jsonFormsRenderers';
import { TbLogicAnd } from 'react-icons/tb';
import { VscDebugDisconnect } from 'react-icons/vsc';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { IoMdArrowDropdown, IoMdArrowDropright, IoMdArrowDropup } from 'react-icons/io';
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from '@jet-admin/ui';

// ============================================================================
// Error handling options
// ============================================================================
const ERROR_HANDLING_OPTIONS = {
  FAIL_WORKFLOW: 'fail_workflow',
  CONTINUE_DEFAULT: 'continue_default',
};

// ============================================================================
// Condition types
// ============================================================================
const CONDITION_TYPES = {
  EXPRESSION: 'expression',
  EQUALS: 'equals',
  NOT_EQUALS: 'not_equals',
  CONTAINS: 'contains',
  GREATER_THAN: 'greater_than',
  LESS_THAN: 'less_than',
  IS_EMPTY: 'is_empty',
  IS_NOT_EMPTY: 'is_not_empty',
  REGEX: 'regex',
};

// ============================================================================
// ConditionBranchEditor - Inline editor for condition branches
// ============================================================================
const ConditionBranchEditor = ({ branches, onChange, workflowNodes, currentNodeId }) => {
  const addBranch = () => {
    const newBranch = {
      id: `branch_${Date.now()}`,
      name: `Branch ${branches.length + 1}`,
      conditionType: CONDITION_TYPES.EXPRESSION,
      expression: 'true',
      leftOperand: '',
      rightOperand: '',
    };
    onChange([...branches, newBranch]);
  };

  const updateBranch = (index, field, value) => {
    const updated = [...branches];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeBranch = (index) => {
    if (branches.length <= 1) return; // Keep at least one branch
    const updated = branches.filter((_, i) => i !== index);
    onChange(updated);
  };

  const moveBranch = (index, direction) => {
    if (
      (direction === -1 && index === 0) ||
      (direction === 1 && index === branches.length - 1)
    ) return;

    const updated = [...branches];
    const temp = updated[index];
    updated[index] = updated[index + direction];
    updated[index + direction] = temp;
    onChange(updated);
  };

  // Build available context variables from other nodes
  const availableVariables = useMemo(() => {
    if (!workflowNodes) return [];
    return workflowNodes
      .filter(n => n.id !== currentNodeId && n.data?.outputVariable)
      .map(n => ({
        nodeId: n.id,
        nodeTitle: n.data?.title || n.type,
        variable: n.data.outputVariable,
      }));
  }, [workflowNodes, currentNodeId]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-500">Condition Branches</label>
        <Button
          type="button"
          onClick={addBranch}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-white text-[#646cff] hover:bg-[#646cff]/10 rounded transition-colors border border-slate-200"
        >
          <FaPlus className="w-2.5 h-2.5" />
          Add Branch
        </Button>
      </div>

      {availableVariables.length > 0 && (
        <p className="text-[10px] text-slate-400">
          Available: {availableVariables.map(v => `ctx.${v.variable}`).join(', ')}
        </p>
      )}

      <div className="space-y-2">
        {branches.map((branch, index) => (
          <div
            key={branch.id}
            className="border border-slate-200 rounded p-2 bg-slate-50"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 flex items-center justify-center bg-purple-100 text-purple-600 text-[10px] font-bold rounded">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={branch.name}
                  onChange={(e) => updateBranch(index, 'name', e.target.value)}
                  className="text-xs font-medium text-slate-700 bg-transparent border-none outline-none w-24"
                  placeholder="Branch name"
                />
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  onClick={() => moveBranch(index, -1)}
                  disabled={index === 0}
                  className="p-1 bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30 transition-colors"
                  title="Move up"
                >
                  <IoMdArrowDropup className="w-3 h-3" />
                </Button>
                <Button
                  type="button"
                  onClick={() => moveBranch(index, 1)}
                  disabled={index === branches.length - 1}
                  className="p-1 bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30 transition-colors"
                  title="Move down"
                >
                  <IoMdArrowDropdown className="w-3 h-3" />
                </Button>
                <Button
                  type="button"
                  onClick={() => removeBranch(index)}
                  disabled={branches.length <= 1}
                  className="p-1 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 rounded disabled:opacity-30 transition-colors"
                  title="Remove branch"
                >
                  <FaTrash className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Condition Type */}
            <div className="mb-2">
              <Select value={branch.conditionType} onValueChange={(val) => updateBranch(index, 'conditionType', val)}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Select condition type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CONDITION_TYPES.EXPRESSION}>JavaScript Expression</SelectItem>
                  <SelectItem value={CONDITION_TYPES.EQUALS}>Equals (==)</SelectItem>
                  <SelectItem value={CONDITION_TYPES.NOT_EQUALS}>Not Equals (!=)</SelectItem>
                  <SelectItem value={CONDITION_TYPES.CONTAINS}>Contains</SelectItem>
                  <SelectItem value={CONDITION_TYPES.GREATER_THAN}>Greater Than (&gt;)</SelectItem>
                  <SelectItem value={CONDITION_TYPES.LESS_THAN}>Less Than (&lt;)</SelectItem>
                  <SelectItem value={CONDITION_TYPES.IS_EMPTY}>Is Empty</SelectItem>
                  <SelectItem value={CONDITION_TYPES.IS_NOT_EMPTY}>Is Not Empty</SelectItem>
                  <SelectItem value={CONDITION_TYPES.REGEX}>Regex Match</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Condition inputs based on type */}
            {branch.conditionType === CONDITION_TYPES.EXPRESSION ? (
              <Textarea
                value={branch.expression || ''}
                onChange={(e) => updateBranch(index, 'expression', e.target.value)}
                placeholder="ctx.value === true"
                className="w-full text-xs text-slate-700 p-2 border border-slate-200 rounded font-mono bg-white focus:outline-none focus:border-[#646cff] resize-none"
                rows={2}
              />
            ) : branch.conditionType === CONDITION_TYPES.IS_EMPTY ||
              branch.conditionType === CONDITION_TYPES.IS_NOT_EMPTY ? (
                  <Input
                type="text"
                value={branch.leftOperand || ''}
                onChange={(e) => updateBranch(index, 'leftOperand', e.target.value)}
                placeholder="ctx.variableName"
                    className="w-full text-xs text-slate-700 p-2 border border-slate-200 rounded font-mono bg-white focus:outline-none focus:border-[#646cff]"
              />
            ) : (
              <div className="flex gap-2">
                    <Input
                  type="text"
                  value={branch.leftOperand || ''}
                  onChange={(e) => updateBranch(index, 'leftOperand', e.target.value)}
                  placeholder="ctx.variableName"
                      className="flex-1 text-xs text-slate-700 p-2 border border-slate-200 rounded font-mono bg-white focus:outline-none focus:border-[#646cff]"
                />
                    <Input
                  type="text"
                  value={branch.rightOperand || ''}
                  onChange={(e) => updateBranch(index, 'rightOperand', e.target.value)}
                  placeholder="value"
                  className="flex-1 text-xs p-2 border border-slate-200 rounded font-mono bg-white focus:outline-none focus:border-[#646cff]"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Default branch indicator */}
      <div className="border border-dashed border-slate-300 rounded p-2 bg-slate-50/50">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-5 h-5 flex items-center justify-center bg-slate-200 text-slate-600 text-[10px] font-bold rounded">
            ∅
          </span>
          <span className="font-medium">Default (else)</span>
          <span className="text-slate-400">- Used when no conditions match</span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ConditionNodeConfigurator - JSON Forms based configuration
// ============================================================================
export const ConditionNodeConfigurator = ({ data, onChange, nodeId }) => {
  const { strings, workflowNodes } = useWorkflowNodes();
  const [formData, setFormData] = useState({
    title: data?.title || 'Condition',
    description: data?.description || '',
    branches: data?.branches || [
      {
        id: 'branch_default',
        name: 'Branch 1',
        conditionType: CONDITION_TYPES.EXPRESSION,
        expression: 'true',
        leftOperand: '',
        rightOperand: '',
      },
    ],
    evaluationMode: data?.evaluationMode || 'first_match',
    errorHandling: data?.errorHandling || ERROR_HANDLING_OPTIONS.FAIL_WORKFLOW,
    isDisabled: data?.isDisabled ?? false,
  });

  // Sync form data when data prop changes
  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || 'Condition',
        description: data.description || '',
        branches: data.branches || [
          {
            id: 'branch_default',
            name: 'Branch 1',
            conditionType: CONDITION_TYPES.EXPRESSION,
            expression: 'true',
            leftOperand: '',
            rightOperand: '',
          },
        ],
        evaluationMode: data.evaluationMode || 'first_match',
        errorHandling: data.errorHandling || ERROR_HANDLING_OPTIONS.FAIL_WORKFLOW,
        isDisabled: data.isDisabled ?? false,
      });
    }
  }, [data]);

  // Build schema for basic fields
  const schema = useMemo(() => {
    return {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          title: strings?.WORKFLOW_EDITOR_CONDITION_TITLE_LABEL || 'Node Title',
        },
        description: {
          type: 'string',
          title: strings?.WORKFLOW_EDITOR_NODE_DESCRIPTION_LABEL || 'Description',
        },
        evaluationMode: {
          type: 'string',
          title: 'Evaluation Mode',
          enum: ['first_match', 'all_matches'],
        },
        errorHandling: {
          type: 'string',
          title: strings?.WORKFLOW_EDITOR_ERROR_HANDLING_LABEL || 'Error Behavior',
          enum: Object.values(ERROR_HANDLING_OPTIONS),
        },
        isDisabled: {
          type: 'boolean',
          title: strings?.WORKFLOW_EDITOR_IS_DISABLED_LABEL || 'Skip this node',
          default: false,
        },
      },
    };
  }, [strings]);

  // Build UI schema with tabs
  const uischema = useMemo(() => {
    return {
      type: 'Categorization',
      elements: [
        {
          type: 'Category',
          label: strings?.WORKFLOW_EDITOR_TAB_GENERAL || 'General',
          elements: [
            {
              type: 'Control',
              scope: '#/properties/title',
              options: {
                placeholder: strings?.WORKFLOW_EDITOR_CONDITION_TITLE_PLACEHOLDER || 'Enter node title',
              },
            },
            {
              type: 'Control',
              scope: '#/properties/description',
              options: {
                placeholder: strings?.WORKFLOW_EDITOR_NODE_DESCRIPTION_PLACEHOLDER || 'Describe this condition...',
                multi: true,
                rows: 2,
              },
            },
          ],
        },
        {
          type: 'Category',
          label: strings?.WORKFLOW_EDITOR_TAB_ADVANCED || 'Advanced',
          elements: [
            {
              type: 'Control',
              scope: '#/properties/evaluationMode',
              options: {
                enumLabels: {
                  'first_match': 'First Match (stop at first true)',
                  'all_matches': 'All Matches (execute all true branches)',
                },
              },
            },
            {
              type: 'Control',
              scope: '#/properties/errorHandling',
              options: {
                enumLabels: {
                  [ERROR_HANDLING_OPTIONS.FAIL_WORKFLOW]: 'Fail Workflow on Error',
                  [ERROR_HANDLING_OPTIONS.CONTINUE_DEFAULT]: 'Continue to Default Branch on Error',
                },
              },
            },
            {
              type: 'Control',
              scope: '#/properties/isDisabled',
            },
          ],
        },
      ],
    };
  }, [strings]);

  // Handle form changes
  const handleFormChange = useCallback(({ data: newData }) => {
    setFormData(prev => ({ ...prev, ...newData }));
  }, []);

  // Handle branches change
  const handleBranchesChange = useCallback((newBranches) => {
    setFormData(prev => ({ ...prev, branches: newBranches }));
  }, []);

  // Handle save
  const handleSave = useCallback(() => {
    onChange(formData);
  }, [onChange, formData]);

  return (
    <div className="w-full h-full">
      <div className="space-y-4">
        {/* Basic settings via JSON Forms */}
        <JsonForms
          schema={schema}
          uischema={uischema}
          data={formData}
          renderers={workflowNodeRenderers}
          onChange={handleFormChange}
        />

        {/* Condition branches editor */}
        <div className="border-t border-slate-100 pt-4">
          <ConditionBranchEditor
            branches={formData.branches}
            onChange={handleBranchesChange}
            workflowNodes={workflowNodes}
            currentNodeId={nodeId}
          />
        </div>

        {/* Comprehensive instructions */}
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-600 space-y-2">
          <div className="font-semibold text-slate-700 text-xs">📘 Condition Expressions</div>

          <div>
            <span className="font-medium text-slate-700">Expression Examples:</span>
            <div className="ml-3 mt-0.5 text-slate-500 font-mono text-[9px] space-y-0.5">
              <div><code className="bg-white px-1 rounded">ctx.queryResult.length &gt; 0</code></div>
              <div><code className="bg-white px-1 rounded">ctx.input.status === "active"</code></div>
              <div><code className="bg-white px-1 rounded">ctx.userData?.role === "admin"</code></div>
            </div>
          </div>

          <div>
            <span className="font-medium text-slate-700">Evaluation:</span>
            <div className="ml-3 mt-0.5 text-slate-500">
              Branches are evaluated top-to-bottom. First matching branch is taken. If none match, <strong>Default (else)</strong> is used.
            </div>
          </div>

          <div>
            <span className="font-medium text-slate-700">Handles:</span>
            <div className="ml-3 mt-0.5 text-slate-500">
              Each branch creates a <strong>purple</strong> output handle. <strong>Gray</strong> = Default, <strong>Red</strong> = Error.
            </div>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleSave}
          className="px-3 py-1.5 text-sm text-white bg-[#646cff] rounded hover:bg-[#5558dd] focus:ring-4 focus:outline-none focus:ring-[#646cff]/30"
        >
          {strings?.WORKFLOW_EDITOR_CONDITION_NODE_SAVE_BUTTON || 'Save'}
        </Button>
      </div>
    </div>
  );
};

// ============================================================================
// ConditionNode - Minimalist flat design with dynamic output edges
// ============================================================================
export const ConditionNode = memo(({ data, isConnectable }) => {
  const { strings } = useWorkflowNodes();

  const isDisabled = data?.isDisabled ?? false;
  const branches = data?.branches || [];
  const branchCount = branches.length;

  // Calculate handle positions (for horizontal distribution at bottom)
  const getHandlePosition = (index, total) => {
    // Distribute handles evenly at the bottom
    const totalHandles = total + 1; // +1 for default
    const spacing = 100 / (totalHandles + 1);
    return spacing * (index + 1);
  };

  // Get condition preview text
  const getConditionPreview = (branch) => {
    if (branch.conditionType === CONDITION_TYPES.EXPRESSION) {
      const expr = branch.expression || 'true';
      return expr.length > 20 ? expr.substring(0, 20) + '...' : expr;
    }
    const left = branch.leftOperand || '?';
    const right = branch.rightOperand || '?';
    switch (branch.conditionType) {
      case CONDITION_TYPES.EQUALS: return `${left} == ${right}`;
      case CONDITION_TYPES.NOT_EQUALS: return `${left} != ${right}`;
      case CONDITION_TYPES.CONTAINS: return `${left} contains ${right}`;
      case CONDITION_TYPES.GREATER_THAN: return `${left} > ${right}`;
      case CONDITION_TYPES.LESS_THAN: return `${left} < ${right}`;
      case CONDITION_TYPES.IS_EMPTY: return `${left} is empty`;
      case CONDITION_TYPES.IS_NOT_EMPTY: return `${left} is not empty`;
      case CONDITION_TYPES.REGEX: return `${left} matches ${right}`;
      default: return 'condition';
    }
  };

  return (
    <div className={`
      bg-white border rounded
      min-w-[280px] max-w-[350px]
      transition-all duration-150
      ${isDisabled
        ? 'border-slate-200 opacity-50'
        : 'border-slate-200 hover:border-purple-400 hover:shadow-md'
      }
    `}>
      {/* Main content - horizontal layout */}
      <div className="flex items-stretch">

        {/* Left: Icon */}
        <div
          style={{
            borderTopLeftRadius: "0.25rem",
            borderBottomLeftRadius: "0.25rem",
          }}
          className={`
          flex flex-col items-center justify-center px-3 py-3 border-r
          ${isDisabled ? 'bg-slate-50 border-slate-100' : 'bg-purple-50 border-purple-100'}
        `}>
          <TbLogicAnd className={`w-5 h-5 ${isDisabled ? 'text-slate-400' : 'text-purple-500'}`} />
        </div>

        {/* Center: Main info */}
        <div className="flex-1 px-3 py-2 min-w-0">
          {/* Title row */}
          <div className="flex items-center justify-between gap-2">
            <span className={`text-xs font-semibold truncate ${isDisabled ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
              {data?.title || 'Condition'}
            </span>
            {isDisabled && (
              <span className="inline-flex items-center gap-1 text-[9px] font-medium text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200">
                <VscDebugDisconnect className="w-2.5 h-2.5" />
                Skip
              </span>
            )}
          </div>

          {/* Branch count */}
          <div className={`text-[10px] mt-0.5 ${isDisabled ? 'text-slate-300' : 'text-slate-400'}`}>
            {branchCount} branch{branchCount !== 1 ? 'es' : ''} + default
          </div>

          {/* Branch previews */}
          <div className="mt-1 space-y-0.5">
            {branches.slice(0, 3).map((branch, index) => (
              <div
                key={branch.id}
                className={`flex items-center gap-1 text-[9px] ${isDisabled ? 'text-slate-300' : 'text-slate-500'}`}
              >
                <IoMdArrowDropright className="w-3 h-3 text-purple-400 flex-shrink-0" />
                <span className="truncate font-medium">{branch.name}:</span>
                <span className="truncate font-mono opacity-75">{getConditionPreview(branch)}</span>
              </div>
            ))}
            {branches.length > 3 && (
              <div className={`text-[9px] ${isDisabled ? 'text-slate-300' : 'text-slate-400'}`}>
                +{branches.length - 3} more...
              </div>
            )}
          </div>
        </div>

        {/* Right: Output indicators */}
        <div className="flex flex-col items-center justify-center px-2 border-l border-slate-100 min-w-[50px]">
          {branches.slice(0, 4).map((branch, index) => (
            <div
              key={branch.id}
              className={`w-2 h-2 rounded-full mb-0.5 ${isDisabled ? 'bg-slate-300' : 'bg-purple-400'}`}
              title={branch.name}
            />
          ))}
          {branches.length > 4 && (
            <span className="text-[8px] text-slate-400">+{branches.length - 4}</span>
          )}
          <div className={`w-2 h-2 rounded-full mt-1 ${isDisabled ? 'bg-slate-300' : 'bg-slate-400'}`} title="Default" />
        </div>
      </div>

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{
          width: '10px',
          height: '10px',
          backgroundColor: isDisabled ? '#cbd5e1' : '#a855f7',
          border: 'none',
          top: '-5px',
        }}
      />

      {/* Dynamic output handles for each branch */}
      {branches.map((branch, index) => (
        <Handle
          key={branch.id}
          type="source"
          position={Position.Bottom}
          id={branch.id}
          isConnectable={isConnectable}
          style={{
            left: `${getHandlePosition(index, branchCount)}%`,
            width: '10px',
            height: '10px',
            backgroundColor: isDisabled ? '#cbd5e1' : '#a855f7',
            border: 'none',
            bottom: '-5px',
          }}
        />
      ))}

      {/* Default/else handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="default"
        isConnectable={isConnectable}
        style={{
          left: `${getHandlePosition(branchCount, branchCount)}%`,
          width: '10px',
          height: '10px',
          backgroundColor: isDisabled ? '#cbd5e1' : '#94a3b8',
          border: 'none',
          bottom: '-5px',
        }}
      />

      {/* Error handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="error"
        isConnectable={isConnectable}
        style={{
          right: '10px',
          left: 'auto',
          width: '10px',
          height: '10px',
          backgroundColor: isDisabled ? '#cbd5e1' : '#ef4444',
          border: 'none',
          bottom: '-5px',
        }}
      />
    </div>
  );
});
