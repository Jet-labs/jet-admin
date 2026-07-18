import React, { useMemo } from 'react';
import { Check, Copy, X } from 'lucide-react';
import PropTypes from 'prop-types';
import Editor from '@monaco-editor/react';
import { useState } from 'react';

import { Button } from "@jet-admin/ui";

/**
 * WorkflowSchemaPanel - Panel to display the JSON schema of the current workflow.
 * Standardized for semantic design tokens and dark mode support.
 */
export const WorkflowSchemaPanel = ({ values, onClose }) => {
    const [copied, setCopied] = useState(false);

    // Format JSON with proper indentation
    const formattedJson = useMemo(() => {
        return JSON.stringify(values, null, 2);
    }, [values]);

    // Copy to clipboard handler
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(formattedJson);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Monaco editor options
    const editorOptions = {
        readOnly: true,
        minimap: { enabled: false },
        fontSize: 12,
        wordWrap: 'on',
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        folding: true,
        foldingStrategy: 'indentation',
        formatOnPaste: true,
        formatOnType: true,
        tabSize: 2,
        renderLineHighlight: 'none',
        scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
        },
    };

    return (
        <div className="fixed left-0 top-0 h-full w-[500px] bg-background shadow-2xl border-r border-border z-[100] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-2 border-b border-border bg-muted/30">
                <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-foreground tracking-tight">Workflow Schema</h3>
                    <span className="text-xs text-muted-foreground bg-muted font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-border/50">
                        JSON
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleCopy}
                        type='button'
                        variant="ghost"
                        size="sm"
                        square
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        title={copied ? 'Copied!' : 'Copy to clipboard'}
                    >
                        {copied ? (
                            <Check className="size-4 text-emerald-500" />
                        ) : (
                                <Copy className="size-4" />
                        )}
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
                        <X className="size-4" />
                    </Button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="flex items-center gap-6 px-4 py-2 bg-muted/20 border-b border-border text-xs text-muted-foreground font-medium uppercase tracking-wide">
                <span>
                    <strong className="text-foreground font-extrabold">{values.nodes?.length || 0}</strong> Nodes
                </span>
                <span>
                    <strong className="text-foreground font-extrabold">{values.edges?.length || 0}</strong> Edges
                </span>
                <span>
                    <strong className="text-foreground font-extrabold">{formattedJson.length}</strong> Characters
                </span>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 overflow-hidden">
                <Editor
                    height="100%"
                    defaultLanguage="json"
                    value={formattedJson}
                    options={editorOptions}
                    theme="vs-dark"
                />
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-muted/20 border-t border-border text-xs text-muted-foreground/60 font-medium italic">
                Read-only view • Use copy button to export schema
            </div>
        </div>
    );
};

WorkflowSchemaPanel.propTypes = {
    values: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
};
