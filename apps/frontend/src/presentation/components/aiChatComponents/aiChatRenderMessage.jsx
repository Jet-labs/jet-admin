import React, { useState } from "react";
import { LiveEditor, LivePreview, LiveProvider } from 'react-live';
import * as Recharts from 'recharts';

// eslint-disable-next-line no-unused-vars
import PropTypes from "prop-types";
import { StringUtils } from "../../../utils/string";
import { DataQueryTestingPanel } from "../dataQueryComponents/dataQueryTestingPanel";
import { AIChatMarkdownRenderer } from "./aiChatMarkdownRenderer";
// eslint-disable-next-line no-unused-vars
import {ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area, ComposedChart} from 'recharts'

export const AIChatRenderMessage = React.memo(({ message, sendApproval }) => {
    // PropTypes should be defined outside the component
    AIChatRenderMessage.propTypes = {
        message: PropTypes.object.isRequired,
        sendApproval: PropTypes.func.isRequired,
    };
    const [selectedQueryForTesting, setSelectedQueryForTesting] = useState(null);
    
    let processedJSONMessage;

    if(message.type === 'user'){
        return <AIChatMarkdownRenderer text={message.text} />;
    }
    
    processedJSONMessage = StringUtils.removeJSONMarkdownFencesRegex(message.text);

    // Early return for non-JSON messages
    if (!processedJSONMessage || !processedJSONMessage.responseType) {
        return <AIChatMarkdownRenderer text={message.text} />;
    }

    const _handleSelectQueryForTesting = () => {
        setSelectedQueryForTesting(processedJSONMessage.suggestedQuery);
    };

    const _handleDeselectQueryForTesting = () => {
        setSelectedQueryForTesting(null);
    };

    const _handleApprovePrompt = () => {
        sendApproval(processedJSONMessage.suggestedQuery);
    }

    console.log('processedJSONMessage', processedJSONMessage.data ? JSON.parse(processedJSONMessage.data) : processedJSONMessage.data);

    switch (processedJSONMessage.responseType) {
        case 'roadmap':
        case 'approval':
            return (
                <div className="space-y-4">
                    {/* Reasoning section */}
                    <p className="whitespace-pre-wrap">
                        {processedJSONMessage.reasoning}
                    </p>

                    {/* Suggested query section */}
                    <div>
                        <p className="font-semibold mb-3 text-lg">Suggested Query:</p>
                        <div className="space-y-2">
                            {Object.entries(processedJSONMessage.suggestedQuery).map(([key, value], index) => (
                                <details key={index} className="group" open>
                                    <summary className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200" style={{ borderRadius: '8px' }}>
                                        <span className="font-semibold text-gray-700 capitalize">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                        <svg
                                            className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </summary>
                                    <div className="mt-2 p-4 bg-white border border-gray-200" style={{ borderRadius: '8px' }}>
                                        {typeof value === 'string' ? (
                                            <p className="text-gray-700 leading-relaxed break-words">
                                                {value}
                                            </p>
                                        ) : Array.isArray(value) ? (
                                            <ul className="space-y-2">
                                                {value.map((item, idx) => (
                                                    <li key={idx} className="flex items-start">
                                                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                                        <span className="text-gray-700">
                                                            {typeof item === 'string' ? item : JSON.stringify(item, null, 2)}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                                    <AIChatMarkdownRenderer text={StringUtils.revertJSONToMarkdown(value)} />
                                        
                                        )}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 flex-wrap">
                        <button onClick={_handleApprovePrompt} className="px-4 py-2 text-xs font-medium bg-emerald-500 hover:bg-emerald-600 text-white transition-colors" style={{ borderRadius: '8px' }}>
                            Approve
                        </button>
                        <button className="px-4 py-2 text-xs font-medium bg-rose-500 hover:bg-rose-600 text-white transition-colors" style={{ borderRadius: '8px' }}>
                            Reject
                        </button>
                        <button onClick={_handleSelectQueryForTesting} className="px-4 py-2 text-xs font-medium bg-amber-500 hover:bg-amber-600 text-white transition-colors" style={{ borderRadius: '8px' }}>
                            Test Query
                        </button>
                        {selectedQueryForTesting && <DataQueryTestingPanel selectedQueryForTesting={selectedQueryForTesting} setSelectedQueryForTesting={_handleDeselectQueryForTesting} />}
                        
                    </div>
                </div>
            );
        case 'chart':
            return <LiveProvider code={processedJSONMessage.chartJSX} scope={{ React, ...Recharts, data: JSON.parse(processedJSONMessage.data) }}>
                <LivePreview />
                <LiveEditor />
            </LiveProvider>
            // return <DynamicJSXRenderer jsxCode={processedJSONMessage.chartJSX} data={processedJSONMessage.data} />
        

        default:
            return <AIChatMarkdownRenderer text={message.text} />;
    }
});

AIChatRenderMessage.displayName = 'AIChatRenderMessage'

