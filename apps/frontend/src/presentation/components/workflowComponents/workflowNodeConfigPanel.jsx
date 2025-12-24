import React, { useMemo } from 'react';
import { JsonForms } from '@jsonforms/react';
import { materialRenderers, materialCells } from '@jsonforms/material-renderers';
import { WORKFLOW_NODES_MAP } from '@jet-admin/workflow-nodes';
import { customJSONFormRenderers } from '../ui/jsonFormCustomRenderer';
import { useWorkflowNodes } from '@jet-admin/workflow-nodes';
import { useNodes } from 'reactflow';
import { FaTimes } from 'react-icons/fa';

export const WorkflowNodeConfigPanel = ({ node, onChange, onClose }) => {
    const { dataQueries } = useWorkflowNodes();
    const nodes = useNodes();

    const NodeConfigurator = useMemo(() => {
        if (!node || !WORKFLOW_NODES_MAP[node.type]) return null;
        return WORKFLOW_NODES_MAP[node.type].configurator;
    }, [node]);
    if (!node) return null;

    return (
        <div className="fixed right-0 top-0 h-full w-[400px] bg-white shadow-xl border-l border-slate-200 z-[100] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-700">
                    {WORKFLOW_NODES_MAP[node.type]?.label || 'Node Configuration'}
                </h3>
                <button 
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-600 font-bold p-1 bg-white rounded"
                >
                    <FaTimes className="h-4 w-4" />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 ">
                <NodeConfigurator data={node.data} onChange={(newData) => onChange(node.id, newData)} />
            </div>
        </div>
    );
};
