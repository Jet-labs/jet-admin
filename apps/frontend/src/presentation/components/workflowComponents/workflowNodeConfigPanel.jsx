import React, { useMemo, useState } from 'react';
import { WORKFLOW_NODES_MAP } from '@jet-admin/workflow-nodes';
import { useWorkflowNodes } from '@jet-admin/workflow-nodes';
import { useNodes } from 'reactflow';
import { FaTimes, FaTrash } from 'react-icons/fa';

import {
    Button,
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    Label
} from "@jet-admin/ui";

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
        <div className="fixed right-0 top-0 h-full w-[400px] bg-brand-dark shadow-2xl border-l border-border z-[1000] flex flex-col pb-4">
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-border bg-brand-dark">
                <h3 className="font-semibold text-foreground tracking-tight">
                    {WORKFLOW_NODES_MAP[node.type]?.label || 'Node Configuration'}
                </h3>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => setShowDeleteConfirm(true)}
                        variant="destructive-ghost"
                        size="sm"
                        square
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
                        size="sm"
                        square
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        title="Close"
                    >
                        <FaTimes className="size-4" />
                    </Button>
                </div>
            </div>
            
            {/* Configurator Content */}
            <div className="flex-1 overflow-y-auto p-4 bg-brand-dark">
                <NodeConfigurator data={node.data} onChange={(newData) => onChange(node.id, newData)} nodeId={node.id} />

                {/* Advanced Settings — Join Mode */}
                {node.type !== 'start' && node.type !== 'end' && (
                    <Accordion type="single" collapsible className="mt-3 border border-border rounded-sm bg-brand-dark">
                        <AccordionItem value="advanced" className="border-none">
                            <AccordionTrigger className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:no-underline data-[state=open]:border-b data-[state=open]:border-border">
                                Advanced Settings
                            </AccordionTrigger>
                            <AccordionContent className="px-4 py-3 space-y-2">
                                <Label className="block text-xs font-medium text-muted-foreground">
                                    Join Mode
                                    <span className="block text-[10px] text-muted-foreground/70 mt-0.5 font-normal">
                                        When this node has multiple upstream parents
                                    </span>
                                </Label>
                                <Select
                                    value={node.data?.joinMode || 'all'}
                                    onValueChange={(value) => onChange(node.id, { ...node.data, joinMode: value })}
                                >
                                    <SelectTrigger className="w-full rounded-sm border border-border bg-brand-dark px-3 py-1.5 h-auto text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                                        <SelectValue placeholder="Select join mode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Wait for All (default)</SelectItem>
                                        <SelectItem value="any">Trigger on Any</SelectItem>
                                    </SelectContent>
                                </Select>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                )}
            </div>

            {/* Delete Confirmation Modal Overlay */}
            {showDeleteConfirm && (
                <div className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
                    <div className="bg-brand-dark rounded-sm shadow-2xl border border-border p-6 w-full max-w-sm animate-in fade-in zoom-in duration-200">
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
