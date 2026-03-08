import React, { useMemo, useState } from 'react';
import { WORKFLOW_NODES_MAP } from '@jet-admin/workflow-nodes';
import { useWorkflowNodes } from '@jet-admin/workflow-nodes';
import { useNodes } from 'reactflow';
import { FaTimes, FaTrash } from 'react-icons/fa';

import { Button } from "@jet-admin/ui";

/**
 * WorkflowNodeConfigPanel - Side panel for configuring selected workflow nodes.
 * Standardized for semantic design tokens and dark mode support.
 */
export const WorkflowNodeConfigPanel = ({ node, onChange, onClose, onDelete }) => {
    const { dataQueries } = useWorkflowNodes();
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
        <div className="fixed right-0 top-0 h-full w-[400px] bg-background shadow-2xl border-l border-border z-[100] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-border bg-muted/30">
                <h3 className="font-semibold text-foreground tracking-tight">
                    {WORKFLOW_NODES_MAP[node.type]?.label || 'Node Configuration'}
                </h3>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => setShowDeleteConfirm(true)}
                        variant="destructive-ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        title="Delete node"
                        type='button'
                    >
                        <FaTrash className="size-4" />
                    </Button>
                    <Button
                        onClick={onClose}
                        type='button'
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        title="Close"
                    >
                        <FaTimes className="size-4" />
                    </Button>
                </div>
            </div>
            
            {/* Configurator Content */}
            <div className="flex-1 overflow-y-auto p-5 bg-background">
                <NodeConfigurator data={node.data} onChange={(newData) => onChange(node.id, newData)} nodeId={node.id} />
            </div>

            {/* Delete Confirmation Modal Overlay */}
            {showDeleteConfirm && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
                    <div className="bg-background rounded-lg shadow-2xl border border-border p-6 w-full max-w-sm animate-in fade-in zoom-in duration-200">
                        <h4 className="font-bold text-foreground text-lg mb-2">Delete Node?</h4>
                        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                            This will remove the node and all its connections. This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button
                                onClick={() => setShowDeleteConfirm(false)}
                                variant="outline"
                                size="sm"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDelete}
                                variant="destructive"
                                size="sm"
                                className="shadow-sm"
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
