import ReactFlow, { ReactFlowProvider } from "reactflow";
import { Controls, MiniMap, Background } from "reactflow";
import { v4 as uuidv4 } from "uuid";
import { DataQueryNode } from "../widgetComponents/nodeComponents/dataQueryNode";
import { JavascriptNode } from "../widgetComponents/nodeComponents/javascriptNode";
import { ConditionNode } from "../widgetComponents/nodeComponents/conditionNode";
import { CONSTANTS } from "../../../constants";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import PropTypes from "prop-types";
import { useCallback } from "react";

const nodeTypes = {
  dataQuery: DataQueryNode,
  javascript: JavascriptNode,
  condition: ConditionNode,
};

export const WorkflowEditor = ({ workflowEditorForm }) => {
    WorkflowEditor.propTypes = {
        workflowEditorForm: PropTypes.object.isRequired,
    };
    console.log('workflowEditorForm', workflowEditorForm);

      const onConnect = useCallback(
        (params) => workflowEditorForm.setFieldValue("edges", params),
        [workflowEditorForm],
      );
    
      const onAddNode = (type) => {
        const id = uuidv4();
        const position = {
          x: Math.random() * 400,
          y: Math.random() * 400,
        };
        
        let data = { label: 'New Node' };
        if (type === 'dataQuery') {
            data = { label: 'Data Query', queryId: '' };
        } else if (type === 'javascript') {
            data = { label: 'Values Script', code: 'return true;' };
        } else if (type === 'condition') {
            data = { label: 'Condition', condition: 'true' };
        }
    
        const newNode = {
          id,
          type,
          position,
          data,
        };
        
        workflowEditorForm.setFieldValue("nodes", [
          ...workflowEditorForm.values.nodes,
          newNode,
        ]);
      };
    

    const _handleOnNodesChange = (changes) => {
        workflowEditorForm.setFieldValue("nodes", changes);
    };

    const _handleOnEdgesChange = (changes) => {
        workflowEditorForm.setFieldValue("edges", changes);
    };

    return  <ReactFlowProvider>
        
        <ResizablePanelGroup
            direction="horizontal"
            autoSaveId={
                CONSTANTS.RESIZABLE_PANEL_KEYS
                    .WORKFLOW_ADDITION_FORM_QUERY_EDITOR_SEPARATION
            }
            className={"!w-full !h-full"}
        >
            <ResizablePanel
                defaultSize={20}
                className="space-y-3 md:space-y-4  p-3"
            >
                <div>
                    <label
                        htmlFor="dataQueryTitle"
                        className="block mb-1 text-xs font-medium text-slate-500"
                    >
                        {CONSTANTS.STRINGS.ADD_WORKFLOW_FORM_NAME_FIELD_LABEL}
                    </label>
                    {workflowEditorForm.errors.dataQueryTitle && (
                        <span className="text-red-500 text-xs">
                            {workflowEditorForm.errors.dataQueryTitle}
                        </span>
                    )}
                    <input
                        type="dataQueryTitle"
                        name="dataQueryTitle"
                        id="dataQueryTitle"
                        className=" placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:border-slate-700 block w-full px-2.5 py-1.5 "
                        placeholder={
                            CONSTANTS.STRINGS.ADD_WORKFLOW_FORM_NAME_FIELD_PLACEHOLDER
                        }
                        required={true}
                        onChange={workflowEditorForm.handleChange}
                        onBlur={workflowEditorForm.handleBlur}
                        value={workflowEditorForm.values.dataQueryTitle}
                    />
                </div>

            </ResizablePanel>
            <ResizableHandle withHandle={true} />
            <ResizablePanel
                defaultSize={80}
                className="h-full w-full"
            >
                <ReactFlow
                    nodes={workflowEditorForm.values.nodes}
                    edges={workflowEditorForm.values.edges}
                    onNodesChange={_handleOnNodesChange}
                    onEdgesChange={_handleOnEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    fitView
                >
                    <Controls />
                    <MiniMap />
                    <Background variant="dots" gap={12} size={1} />
                </ReactFlow>
            </ResizablePanel>
        </ResizablePanelGroup>
        
    </ReactFlowProvider>;
};
