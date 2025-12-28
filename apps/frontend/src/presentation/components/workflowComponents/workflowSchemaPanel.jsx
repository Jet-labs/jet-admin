import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import Editor from '@monaco-editor/react';
import { FaTimes, FaCopy, FaCheck } from 'react-icons/fa';
import { useState } from 'react';

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
        <div className="fixed left-0 top-0 h-full w-[500px] bg-white shadow-xl border-r border-slate-200 z-[100] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-3 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-700">Workflow Schema</h3>
                    <span className="text-[10px] text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded">
                        JSON
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleCopy}
                        type='button'
                        className="bg-white text-slate-400 hover:text-slate-600 font-bold p-1.5 hover:bg-slate-100 rounded transition-colors"
                        title={copied ? 'Copied!' : 'Copy to clipboard'}
                    >
                        {copied ? (
                            <FaCheck className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                            <FaCopy className="h-3.5 w-3.5" />
                        )}
                    </button>
                    <button
                        onClick={onClose}
                        type='button'
                        className="bg-white text-slate-400 hover:text-slate-600 font-bold p-1.5 hover:bg-slate-100 rounded transition-colors"
                        title="Close"
                    >
                        <FaTimes className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="flex items-center gap-4 px-3 py-2 bg-slate-50 border-b border-slate-100 text-[10px] text-slate-500">
                <span>
                    <strong className="text-slate-600">{values.nodes?.length || 0}</strong> nodes
                </span>
                <span>
                    <strong className="text-slate-600">{values.edges?.length || 0}</strong> edges
                </span>
                <span>
                    <strong className="text-slate-600">{formattedJson.length}</strong> chars
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
            <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400">
                Read-only view • Use copy button to export schema
            </div>
        </div>
    );
};

WorkflowSchemaPanel.propTypes = {
    values: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
};
