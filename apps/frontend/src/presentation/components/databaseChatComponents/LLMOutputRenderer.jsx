import React from "react";
import PropTypes from "prop-types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLLMOutput } from "@llm-ui/react";
import {
    codeBlockLookBack,
    findCompleteCodeBlock,
    findPartialCodeBlock,
} from "@llm-ui/code";
import { markdownLookBack } from "@llm-ui/markdown";

// FIX: Use PrismLight to avoid Module Namespace / Default Export issues in Vite
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Register languages manually for safety
SyntaxHighlighter.registerLanguage('sql', sql);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('js', javascript);

import { LiveProvider, LivePreview, LiveError } from "react-live";
import * as Recharts from "recharts";
import { IoDownloadOutline, IoCodeSlash, IoStatsChart } from "react-icons/io5";

/**
 * Helper: Safely extract text from React children
 */
const extractTextFromNode = (node) => {
    if (node === null || node === undefined) return "";
    if (typeof node === "string" || typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(extractTextFromNode).join("");
    if (node.props && node.props.children) return extractTextFromNode(node.props.children);
    return "";
};

/**
 * Modern Markdown Component
 */
const MarkdownComponent = ({ blockMatch }) => {
    return (
        <div className="prose prose-slate prose-sm max-w-none leading-relaxed text-slate-700">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    table: ({ children }) => (
                        <div className="overflow-hidden border border-slate-200 rounded-lg my-4">
                            <table className="min-w-full divide-y divide-slate-200">{children}</table>
                        </div>
                    ),
                    thead: ({ children }) => <thead className="bg-slate-50">{children}</thead>,
                    th: ({ children }) => (
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="px-4 py-2.5 text-sm text-slate-600 border-t border-slate-100">
                            {children}
                        </td>
                    ),
                    code: ({ inline, className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || "");
                        const codeContent = extractTextFromNode(children).replace(/\n$/, "");

                        if (!inline && match) {
                            return (
                                <div className="rounded-lg overflow-hidden my-4 border border-slate-200 bg-[#1d1f21]">
                                    <div className="px-4 py-2 bg-[#2d2f31] border-b border-gray-700 flex items-center gap-2">
                                        <span className="text-xs text-gray-400 font-mono ml-2">{match[1]}</span>
                                    </div>
                                    <SyntaxHighlighter
                                        style={atomDark}
                                        language={match[1]}
                                        PreTag="div"
                                        customStyle={{ margin: 0, borderRadius: 0, padding: '1rem' }}
                                        {...props}
                                    >
                                        {codeContent}
                                    </SyntaxHighlighter>
                                </div>
                            );
                        }
                        return (
                            <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-sm font-medium" {...props}>
                                {children}
                            </code>
                        );
                    },
                }}
            >
                {blockMatch.output}
            </ReactMarkdown>
        </div>
    );
};

MarkdownComponent.propTypes = {
    blockMatch: PropTypes.shape({
        output: PropTypes.string.isRequired,
    }).isRequired,
};

/**
 * Code Block Component
 */
const CodeBlockComponent = ({ blockMatch }) => {
    const code = blockMatch.output || "";

    // Extract language from markdown code block
    const lines = code.split("\n");
    const firstLine = lines[0] || "";
    const languageMatch = firstLine.match(/^```(\w+)?/);
    const language = languageMatch ? languageMatch[1] || "text" : "text";

    // Remove the ``` markers safely
    const codeContent = lines.length > 2
        ? lines.slice(1, lines.length - 1).join("\n")
        : code.replace(/^```\w*\n?|```$/g, "");

    return (
        <div className="rounded-lg overflow-hidden my-4 border border-slate-200 bg-[#1d1f21]">
            <div className="px-4 py-2 bg-[#2d2f31] border-b border-gray-700 flex items-center gap-2">
                <span className="text-xs text-gray-400 font-mono">{language}</span>
            </div>
            <SyntaxHighlighter
                style={atomDark}
                language={language}
                PreTag="div"
                customStyle={{
                    margin: 0,
                    borderRadius: 0,
                    padding: "1rem",
                    fontSize: "13px",
                }}
            >
                {codeContent}
            </SyntaxHighlighter>
        </div>
    );
};

CodeBlockComponent.propTypes = {
    blockMatch: PropTypes.shape({
        output: PropTypes.string.isRequired,
    }).isRequired,
};

/**
 * Card Container Helper
 */
const ResultCard = ({ title, icon: Icon, children, action }) => (
    <div className="my-5 bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                {Icon && <Icon className="text-slate-500" />}
                {title}
            </div>
            {action}
        </div>
        <div className="p-4 overflow-x-auto">
            {children}
        </div>
    </div>
);

ResultCard.propTypes = {
    title: PropTypes.string,
    icon: PropTypes.func,
    children: PropTypes.node,
    action: PropTypes.node,
};

/**
 * Chart Renderer
 */
const ChartRenderer = ({ jsx, data, chartType }) => {
    if (!jsx || !data || data.length === 0) return null;

    // Ensure numbers are numbers
    const processedData = data.map((row) => {
        const processed = { ...row };
        Object.keys(processed).forEach((key) => {
            const value = processed[key];
            if (typeof value === "string" && !isNaN(Number(value)) && value.trim() !== "") {
                processed[key] = Number(value);
            }
        });
        return processed;
    });

    // Safe scope for Recharts
    const rechartsScope = { ...Recharts };

    return (
        <ResultCard
            title={`${chartType ? chartType.charAt(0).toUpperCase() + chartType.slice(1) : 'Data'} Visualization`}
            icon={IoStatsChart}
        >
            <div className="h-[350px] w-full font-sans text-xs">
                <LiveProvider
                    code={jsx}
                    scope={{ React, ...rechartsScope, data: processedData }}
                    noInline={false}
                >
                    <LiveError className="text-red-500 text-xs p-2 bg-red-50 rounded mb-2" />
                    <LivePreview />
                </LiveProvider>
            </div>
        </ResultCard>
    );
};

ChartRenderer.propTypes = {
    jsx: PropTypes.string,
    data: PropTypes.array,
    chartType: PropTypes.string,
};

/**
 * Data Table Renderer
 */
const DataTableRenderer = ({ columns, rows, rowCount }) => {
    if (!columns || !rows) return null;
    const displayRows = rows.slice(0, 100);

    return (
        <ResultCard
            title={`Result Data (${rowCount} rows)`}
            action={
                <button className="rounded-lg text-xs px-3 py-1.5 bg-[#646cff] text-white hover:bg-[#5558e3] flex items-center gap-1.5 font-medium transition-colors">
                    <IoDownloadOutline className="text-sm" /> Export CSV
                </button>
            }
        >
            <table className="min-w-full text-sm text-left">
                <thead>
                    <tr className="border-b-2 border-slate-100">
                        {columns.map((col) => (
                            <th key={col} className="px-3 py-2 font-semibold text-slate-600 bg-white sticky top-0">
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {displayRows.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors group">
                            {columns.map((col) => (
                                <td key={col} className="px-3 py-2 text-slate-600 whitespace-nowrap group-hover:text-slate-900">
                                    {row[col] === null ? <span className="text-slate-300 italic">null</span> : String(row[col])}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {rows.length > 100 && (
                <div className="mt-3 text-center text-xs text-slate-400 italic">
                    Showing first 100 rows only
                </div>
            )}
        </ResultCard>
    );
};

DataTableRenderer.propTypes = {
    columns: PropTypes.arrayOf(PropTypes.string),
    rows: PropTypes.arrayOf(PropTypes.object),
    rowCount: PropTypes.number,
};

/**
 * SQL Preview
 */
const SQLPreviewRenderer = ({ query, collapsible = true }) => {
    if (!query) return null;

    const CodeView = () => (
        <SyntaxHighlighter
            language="sql"
            style={atomDark}
            customStyle={{
                borderRadius: "8px",
                fontSize: "13px",
                margin: 0,
                padding: "1rem",
                background: "#1e293b"
            }}
        >
            {query}
        </SyntaxHighlighter>
    );

    if (collapsible) {
        return (
            <div className="mt-2">
                <details className="group">
                    <summary className="list-none cursor-pointer">
                        <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-[#646cff] transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-100">
                            <IoCodeSlash />
                            <span>View Generated SQL</span>
                            <svg className="w-3 h-3 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                    </summary>
                    <div className="mt-2 pl-1 border-l-2 border-slate-200">
                        <CodeView />
                    </div>
                </details>
            </div>
        );
    }

    return <div className="my-4"><CodeView /></div>;
};

SQLPreviewRenderer.propTypes = {
    query: PropTypes.string,
    collapsible: PropTypes.bool,
};

/**
 * Main Orchestrator
 */
export const DatabaseChatRenderer = ({ response }) => {
    if (!response) return null;

    // Handle standard string response
    if (typeof response === "string") {
        return <LLMOutputRenderer content={response} />;
    }

    // Handle Structured Response
    if (response.content && Array.isArray(response.content)) {
        return (
            <div className="space-y-2">
                {response.content.map((block, index) => {
                    switch (block.type) {
                        case "markdown":
                            return <LLMOutputRenderer key={index} content={block.content} />;
                        case "sql":
                            return <SQLPreviewRenderer key={index} query={block.content} collapsible={block.collapsible} />;
                        case "table":
                            return <DataTableRenderer key={index} {...block} />;
                        case "chart":
                            return <ChartRenderer key={index} {...block} />;
                        case "error":
                            return (
                                <div key={index} className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex gap-3 items-start">
                                    
                                    <div className="w-full break-words">
                                        
                                        <span className="text-red-700">{block.content}
                                            </span>
                                        </div>
                                </div>
                            );
                        default:
                            return null;
                    }
                })}
            </div>
        );
    }

    return null;
};

DatabaseChatRenderer.propTypes = {
    response: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
    ]),
};

export const LLMOutputRenderer = ({ content }) => {
    const { blockMatches } = useLLMOutput({
        llmOutput: content || "",
        fallbackBlock: {
            component: MarkdownComponent,
            lookBack: markdownLookBack(),
        },
        blocks: [
            {
                component: CodeBlockComponent,
                findCompleteMatch: findCompleteCodeBlock(),
                findPartialMatch: findPartialCodeBlock(),
                lookBack: codeBlockLookBack(),
            },
        ],
        isStreamFinished: true,
    });

    return (
        <div className="llm-output poppins text-sm">
            {blockMatches.map((blockMatch, index) => {
                const Component = blockMatch.block.component;
                return <Component key={index} blockMatch={blockMatch} />;
            })}
        </div>
    );
};

LLMOutputRenderer.propTypes = {
    content: PropTypes.string,
};

export default DatabaseChatRenderer;