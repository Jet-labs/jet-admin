import React, { memo, useState, useEffect, useMemo, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { JsonForms } from '@jsonforms/react';
import { useWorkflowNodes } from '../context';
import { workflowNodeRenderers } from '../jsonFormsRenderers';
import { SiQuantconnect } from 'react-icons/si';
import { MdOutlineDeleteOutline } from 'react-icons/md';
import { IoMdTime } from 'react-icons/io';
import { TbRefresh } from 'react-icons/tb';
import { BiErrorCircle } from 'react-icons/bi';
import { VscDebugDisconnect } from 'react-icons/vsc';
import { FaPlay } from 'react-icons/fa';

// ============================================================================
// Error handling options
// ============================================================================
const ERROR_HANDLING_OPTIONS = {
  FAIL_WORKFLOW: 'fail_workflow',
  CONTINUE: 'continue',
  RETRY_THEN_CONTINUE: 'retry_then_continue',
  RETRY_THEN_FAIL: 'retry_then_fail',
};

// ============================================================================
// DataQueryNodeConfigurator - JSON Forms based configuration
// ============================================================================
export const DataQueryNodeConfigurator = ({ data, onChange, nodeId }) => {
  const { dataQueries, strings, onRefreshDataQueries, workflowNodes, workflowEdges, workflowInputArgs, onQueryTest } = useWorkflowNodes();
  const [formData, setFormData] = useState({
    title: data?.title || '',
    description: data?.description || '',
    dataQueryID: data?.dataQueryID || '',
    args: data?.args || {},
    outputVariable: data?.outputVariable || 'queryResult',
    timeoutSeconds: data?.timeoutSeconds ?? 300,
    retryLimit: data?.retryLimit ?? 0,
    retryDelaySeconds: data?.retryDelaySeconds ?? 5,
    errorHandling: data?.errorHandling || ERROR_HANDLING_OPTIONS.FAIL_WORKFLOW,
    isDisabled: data?.isDisabled ?? false,
  });

  // Sync form data when data prop changes
  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || '',
        description: data.description || '',
        dataQueryID: data.dataQueryID || '',
        args: data.args || {},
        outputVariable: data.outputVariable || 'queryResult',
        timeoutSeconds: data.timeoutSeconds ?? 300,
        retryLimit: data.retryLimit ?? 0,
        retryDelaySeconds: data.retryDelaySeconds ?? 5,
        errorHandling: data.errorHandling || ERROR_HANDLING_OPTIONS.FAIL_WORKFLOW,
        isDisabled: data.isDisabled ?? false,
      });
    }
  }, [data]);

  // Find selected query for dynamic args
  const selectedQuery = useMemo(() => {
    return dataQueries?.find(q => q.dataQueryID == formData.dataQueryID) || null;
  }, [dataQueries, formData.dataQueryID]);

  // Build dynamic schema with populated enums
  const schema = useMemo(() => {
    const queryEnums = dataQueries?.map(q => String(q.dataQueryID)) || [''];

    return {
      type: 'object',
      properties: {
        // General Tab
        title: {
          type: 'string',
          title: strings.WORKFLOW_EDITOR_DATA_QUERY_TITLE_LABEL || 'Node Title',
        },
        description: {
          type: 'string',
          title: strings.WORKFLOW_EDITOR_NODE_DESCRIPTION_LABEL || 'Description',
        },
        dataQueryID: {
          type: 'string',
          title: strings.WORKFLOW_EDITOR_DATA_QUERY_NODE_LABEL || 'Data Query',
          enum: queryEnums.length > 0 ? queryEnums : [''],
        },
        args: {
          type: 'object',
          title: strings.WORKFLOW_EDITOR_DATA_QUERY_NODE_ARGUMENTS_LABEL || 'Arguments',
        },

        // Output Tab
        outputVariable: {
          type: 'string',
          title: strings.WORKFLOW_EDITOR_OUTPUT_VARIABLE_LABEL || 'Output Variable Name',
          description: 'Variable name to store result (accessible as {{ctx.{name}}})',
          pattern: '^[a-zA-Z_][a-zA-Z0-9_]*$',
        },

        // Execution Settings Tab
        timeoutSeconds: {
          type: 'integer',
          title: strings.WORKFLOW_EDITOR_TIMEOUT_LABEL || 'Timeout (seconds)',
          minimum: 1,
          maximum: 3600,
          default: 300,
        },
        retryLimit: {
          type: 'integer',
          title: strings.WORKFLOW_EDITOR_RETRY_LIMIT_LABEL || 'Retry Attempts',
          minimum: 0,
          maximum: 10,
          default: 0,
        },
        retryDelaySeconds: {
          type: 'integer',
          title: strings.WORKFLOW_EDITOR_RETRY_DELAY_LABEL || 'Retry Delay (seconds)',
          minimum: 1,
          maximum: 300,
          default: 5,
        },
        errorHandling: {
          type: 'string',
          title: strings.WORKFLOW_EDITOR_ERROR_HANDLING_LABEL || 'Error Behavior',
          enum: Object.values(ERROR_HANDLING_OPTIONS),
        },
        isDisabled: {
          type: 'boolean',
          title: strings.WORKFLOW_EDITOR_IS_DISABLED_LABEL || 'Skip this node',
          default: false,
        },
      },
      required: ['dataQueryID'],
    };
  }, [dataQueries, strings]);

  // Build UI schema with tabs
  const uischema = useMemo(() => {
    const generalElements = [
      {
        type: 'Control',
        scope: '#/properties/title',
        options: {
          placeholder: strings.WORKFLOW_EDITOR_DATA_QUERY_TITLE_PLACEHOLDER || 'Enter node title',
        },
      },
      {
        type: 'Control',
        scope: '#/properties/description',
        options: {
          placeholder: strings.WORKFLOW_EDITOR_NODE_DESCRIPTION_PLACEHOLDER || 'Describe what this node does...',
          multi: true,
          rows: 2,
        },
      },
      {
        type: 'Control',
        scope: '#/properties/dataQueryID',
        options: {
          placeholder: strings.WORKFLOW_EDITOR_DATA_QUERY_NODE_SELECT_LABEL || 'Select a query',
          enumLabels: dataQueries?.reduce((acc, q) => {
            acc[String(q.dataQueryID)] = q.dataQueryTitle;
            return acc;
          }, {}) || {},
          showRefreshButton: !!onRefreshDataQueries,
          onRefresh: onRefreshDataQueries,
        },
      },
    ];

    // Add dynamic args control if query has args
    if (selectedQuery?.dataQueryOptions?.args?.length > 0) {
      generalElements.push({
        type: 'Control',
        scope: '#/properties/args',
        options: {
          isDynamicArgs: true,
          args: selectedQuery.dataQueryOptions.args,
          workflowNodes: workflowNodes,
          workflowEdges: workflowEdges,
          workflowInputArgs: workflowInputArgs,
          currentNodeId: nodeId,
        },
      });
    }

    return {
      type: 'Categorization',
      elements: [
        {
          type: 'Category',
          label: strings.WORKFLOW_EDITOR_TAB_GENERAL || 'General',
          elements: generalElements,
        },
        {
          type: 'Category',
          label: strings.WORKFLOW_EDITOR_TAB_OUTPUT || 'Output',
          elements: [
            {
              type: 'Control',
              scope: '#/properties/outputVariable',
              options: {
                placeholder: 'e.g., queryResult, userData, orderList',
              },
            },
          ],
        },
        {
          type: 'Category',
          label: strings.WORKFLOW_EDITOR_TAB_ADVANCED || 'Advanced',
          elements: [
            {
              type: 'Control',
              scope: '#/properties/timeoutSeconds',
            },
            {
              type: 'Control',
              scope: '#/properties/retryLimit',
            },
            {
              type: 'Control',
              scope: '#/properties/retryDelaySeconds',
            },
            {
              type: 'Control',
              scope: '#/properties/errorHandling',
              options: {
                enumLabels: {
                  [ERROR_HANDLING_OPTIONS.FAIL_WORKFLOW]: 'Fail Workflow',
                  [ERROR_HANDLING_OPTIONS.CONTINUE]: 'Continue (ignore error)',
                  [ERROR_HANDLING_OPTIONS.RETRY_THEN_CONTINUE]: 'Retry, then Continue',
                  [ERROR_HANDLING_OPTIONS.RETRY_THEN_FAIL]: 'Retry, then Fail',
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
  }, [dataQueries, strings, selectedQuery]);

  // Handle form changes
  const handleFormChange = useCallback(({ data: newData }) => {
    setFormData(newData);
  }, []);

  // Handle save
  const handleSave = useCallback(() => {
    onChange(formData);
  }, [onChange, formData]);

  // Handle opening test panel
  const handleOpenTest = useCallback(() => {
    if (onQueryTest && formData.dataQueryID) {
      onQueryTest(formData.dataQueryID);
    }
  }, [onQueryTest, formData.dataQueryID]);

  return (
    <div className="w-full h-full">
      <div className="space-y-3">
        <JsonForms
          schema={schema}
          uischema={uischema}
          data={formData}
          renderers={workflowNodeRenderers}
          onChange={handleFormChange}
        />

        {/* Comprehensive instructions */}
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-600 space-y-2">
          <div className="font-semibold text-slate-700 text-xs">📘 Query Arguments</div>

          <div>
            <span className="font-medium text-slate-700">Argument Format:</span>
            <div className="ml-3 mt-0.5 text-slate-500 font-mono text-[9px] space-y-0.5">
              <div><code className="bg-white px-1 rounded">{"{{ctx.input.userId}}"}</code> → pass input value</div>
              <div><code className="bg-white px-1 rounded">{"{{ctx.queryResult.id}}"}</code> → from previous query</div>
              <div><code className="bg-white px-1 rounded">{"id_{{ctx.input.id}}"}</code> → string interpolation</div>
            </div>
          </div>

          <div>
            <span className="font-medium text-slate-700">Access Result:</span>
            <div className="ml-3 mt-0.5 text-slate-500">
              Result stored in <code className="bg-white px-1 py-0.5 rounded font-mono">{"ctx.{outputVariable}"}</code> for use in next nodes.
            </div>
          </div>

          <div>
            <span className="font-medium text-slate-700">Handles:</span>
            <div className="ml-3 mt-0.5 text-slate-500">
              <strong>Green:</strong> Query succeeded → <strong>Red:</strong> Query failed (use for error handling)
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleSave}
            className="px-3 py-1.5 text-sm text-white bg-[#646cff] rounded hover:bg-[#5558dd] focus:ring-4 focus:outline-none focus:ring-[#646cff]/30"
          >
            {strings.WORKFLOW_EDITOR_DATA_QUERY_NODE_SAVE_BUTTON || 'Save'}
          </button>

          {onQueryTest && formData.dataQueryID && (
            <button
              type="button"
              onClick={handleOpenTest}
              className="px-3 py-1.5 text-sm text-slate-600 bg-slate-100 rounded hover:bg-slate-200 border border-slate-200 flex items-center gap-1.5"
              title="Test this query"
            >
              <FaPlay className="w-3 h-3 text-slate-500" />
              Test Query
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


// ============================================================================
// DataQueryNode - Minimalist flat landscape design with execution status
// ============================================================================
export const DataQueryNode = memo(({ id, data, isConnectable }) => {
  const { dataQueries, strings, nodeExecutionStatus } = useWorkflowNodes();
  const [selectedQueryTitle, setSelectedQueryTitle] = useState('Select Query');

  // Get execution status for this node
  const executionStatus = nodeExecutionStatus?.[id] || 'idle';

  useEffect(() => {
    if (data.dataQueryID && dataQueries) {
      const query = dataQueries.find(q => q.dataQueryID === data.dataQueryID);
      setSelectedQueryTitle(query?.dataQueryTitle || 'Unknown Query');
    } else {
      setSelectedQueryTitle('Select Query');
    }
  }, [data.dataQueryID, dataQueries]);

  const isDisabled = data?.isDisabled ?? false;
  const hasRetry = (data?.retryLimit ?? 0) > 0;
  const hasCustomTimeout = (data?.timeoutSeconds ?? 300) !== 300;
  const argCount = data.args ? Object.keys(data.args).length : 0;
  const outputVar = data.outputVariable || 'queryResult';

  // Status-based styling
  const getStatusStyles = () => {
    switch (executionStatus) {
      case 'running':
        return 'border-blue-400 ring-2 ring-blue-300 ring-opacity-50 animate-pulse';
      case 'completed':
        return 'border-green-400 ring-2 ring-green-300 ring-opacity-50';
      case 'failed':
        return 'border-red-400 ring-2 ring-red-300 ring-opacity-50';
      case 'skipped':
        return 'border-orange-300 opacity-60';
      default:
        return 'border-slate-200 hover:border-blue-400 hover:shadow-md';
    }
  };

  // Status indicator icon
  const StatusIndicator = () => {
    if (executionStatus === 'running') {
      return (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center animate-spin">
          <TbRefresh className="w-3 h-3 text-white" />
        </div>
      );
    }
    if (executionStatus === 'completed') {
      return (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    }
    if (executionStatus === 'failed') {
      return (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`
      relative bg-white border rounded
      min-w-[340px] max-w-[400px]
      transition-all duration-150
      ${isDisabled
        ? 'border-slate-200 opacity-50'
        : getStatusStyles()
      }
      ${!data.dataQueryID ? '!border-red-400 !bg-red-50' : ''}
    `}>
      <StatusIndicator />

      {/* Main content - horizontal layout */}
      <div className="flex items-stretch">

        {/* Left: Icon & Type */}
        <div
          style={{
            borderTopLeftRadius: "0.25rem",
            borderBottomLeftRadius: "0.25rem",
          }}
          className={`
          flex flex-col items-center justify-center px-3 py-3 border-r
          ${isDisabled ? 'bg-slate-50 border-slate-100' :
              executionStatus === 'running' ? 'bg-blue-100 border-blue-200' :
                executionStatus === 'completed' ? 'bg-green-50 border-green-100' :
                  executionStatus === 'failed' ? 'bg-red-50 border-red-100' :
                    'bg-blue-50 border-blue-100'}}
        `}>
          <SiQuantconnect className={`w-5 h-5 ${isDisabled ? 'text-slate-400' :
              executionStatus === 'running' ? 'text-blue-600' :
                executionStatus === 'completed' ? 'text-green-600' :
                  executionStatus === 'failed' ? 'text-red-600' :
                    'text-blue-500'
            }`} />
        </div>

        {/* Center: Main info */}
        <div className="flex-1 px-3 py-2 min-w-0">
          {/* Title row */}
          <div className="flex items-center justify-between gap-2">
            <span className={`text-xs font-semibold truncate ${isDisabled ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
              {data?.title || 'Untitled'}
            </span>
            {isDisabled && (
              <span className="inline-flex items-center gap-1 text-[9px] font-medium text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200">
                <VscDebugDisconnect className="w-2.5 h-2.5" />
                Skip
              </span>
            )}
          </div>


          {/* Query name */}
          <div className={`text-sm truncate mt-0.5 ${isDisabled ? 'text-slate-300' : 'text-slate-500'}`}>
            {selectedQueryTitle.length > 20 ? `${String(selectedQueryTitle).substring(0, 20)}...` : selectedQueryTitle}
          </div>


        </div>

        {/* Right: Outputs indicator */}
        <div className="flex flex-col items-center justify-center px-2 border-l border-slate-100">
          <div className={`w-2 h-2 rounded-full mb-1 ${isDisabled ? 'bg-slate-300' : 'bg-green-400'}`} title="Success" />
          <div className={`w-2 h-2 rounded-full ${isDisabled ? 'bg-slate-300' : 'bg-red-400'}`} title="Error" />
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{
          width: '10px',
          height: '10px',
          backgroundColor: isDisabled ? '#cbd5e1' : '#3b82f6',
          border: 'none',
          top: '-5px',
        }}
      />

      <Handle
        type="source"
        position={Position.Bottom}
        id="success"
        isConnectable={isConnectable}
        style={{
          left: '35%',
          width: '10px',
          height: '10px',
          backgroundColor: isDisabled ? '#cbd5e1' : '#22c55e',
          border: 'none',
          bottom: '-5px',
        }}
      />

      <Handle
        type="source"
        position={Position.Bottom}
        id="error"
        isConnectable={isConnectable}
        style={{
          left: '65%',
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
