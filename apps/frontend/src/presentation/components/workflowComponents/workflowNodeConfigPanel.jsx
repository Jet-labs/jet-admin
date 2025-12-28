import React, { useMemo, useState } from 'react';
import { JsonForms } from '@jsonforms/react';
import { materialRenderers, materialCells } from '@jsonforms/material-renderers';
import { WORKFLOW_NODES_MAP } from '@jet-admin/workflow-nodes';
import { customJSONFormRenderers } from '../ui/jsonFormCustomRenderer';
import { useWorkflowNodes } from '@jet-admin/workflow-nodes';
import { useNodes } from 'reactflow';
import { FaTimes, FaTrash } from 'react-icons/fa';

export const WorkflowNodeConfigPanel = ({ node, onChange, onClose, onDelete }) => {
    const { dataQueries } = useWorkflowNodes();
    const nodes = useNodes();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const NodeConfigurator = useMemo(() => {
        if (!node || !WORKFLOW_NODES_MAP[node.type]) return null;
        return WORKFLOW_NODES_MAP[node.type].configurator;
    }, [node]);

    const handleDelete = () => {
        if (onDelete) {
            onDelete(node.id);
        }
    };

    if (!node) return null;

    return (
        <div className="fixed right-0 top-0 h-full w-[400px] bg-white shadow-xl border-l border-slate-200 z-[100] flex flex-col">
            <div className="flex justify-between items-center p-3 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-700">
                    {WORKFLOW_NODES_MAP[node.type]?.label || 'Node Configuration'}
                </h3>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className=" bg-white text-slate-400 hover:text-red-500 font-bold p-1.5 hover:bg-red-50 rounded transition-colors"
                        title="Delete node"
                        type='button'
                    >
                        <FaTrash className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={onClose}
                        type='button'
                        className=" bg-white text-slate-400 hover:text-slate-600 font-bold p-1.5 hover:bg-slate-100 rounded transition-colors"
                        title="Close"
                    >
                        <FaTimes className="h-4 w-4" />
                    </button>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 ">
                <NodeConfigurator data={node.data} onChange={(newData) => onChange(node.id, newData)} nodeId={node.id} />
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-4 m-4 max-w-[300px]">
                        <h4 className="font-semibold text-slate-700 mb-2">Delete Node?</h4>
                        <p className="text-sm text-slate-500 mb-4">
                            This will remove the node and all its connections. This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-3 py-1.5 text-sm text-slate-600 bg-slate-100 rounded hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-3 py-1.5 text-sm text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

