import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaMagic, FaSpinner, FaRobot, FaUser, FaDatabase, FaCheck, FaTimes, FaChartBar, FaCode } from "react-icons/fa";
import { IoClose, IoSend } from "react-icons/io5";
import { useParams } from "react-router-dom";
import logo from "../../../assets/logo.png";
import { CONSTANTS } from "../../../constants";
import { useSocketState } from "../../../logic/contexts/socketContext";
import { sendAgentUserMessage, sendAgentDatasourceApproval, sendAgentQueryApproval, sendAgentPromoteToWidget, sendAgentCancel } from "../../../data/sockets/aichat";
import { displayError, displaySuccess } from "../../../utils/notification";
import { Button, Textarea } from "@jet-admin/ui";
import { AIChatMarkdownRenderer } from "./aiChatMarkdownRenderer";

// Fallback UUID generator if crypto.randomUUID isn't available
const generateChatRoomID = () => {
    return typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const AIChatButton = () => {
    const { tenantID } = useParams();
    const { socket } = useSocketState();

    const [isAIChatOpen, setIsAIChatOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isAgentProcessing, setIsAgentProcessing] = useState(false);
    const [chatRoomID, setChatRoomID] = useState(null);
    const [currentThinking, setCurrentThinking] = useState("");
    const [pendingApproval, setPendingApproval] = useState(null); // { type: 'datasource' | 'query', data: any }

    // User info placeholder (would come from auth context normally)
    const userID = "current_user"; 

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Initialize chat session id
    useEffect(() => {
        if (!chatRoomID) {
            setChatRoomID(generateChatRoomID());
        }
    }, [chatRoomID]);

    // Socket Event Listeners
    useEffect(() => {
        if (!socket || !chatRoomID) return;

        const onThinking = (data) => {
            if (data.chatRoomID !== chatRoomID) return;
            setIsAgentProcessing(true);
            setCurrentThinking(data.message || "Interacting with workspace...");
        };

        const onApprovalRequired = (data) => {
            if (data.chatRoomID !== chatRoomID) return;
            setIsAgentProcessing(false);
            setCurrentThinking("");
            setPendingApproval({
                type: data.type,
                planSummary: data.planSummary,
                items: data.selectedDatasources || data.queries || []
            });

            // Add a system message indicating approval is needed
            setMessages((prev) => [...prev, {
                type: 'system',
                text: data.type === 'datasource'
                    ? "Agent needs approval to access datasources."
                    : "Agent needs approval to execute queries.",
                timestamp: new Date()
            }]);
        };

        const onResponse = (data) => {
            if (data.chatRoomID !== chatRoomID) return;
            setIsAgentProcessing(false);
            setCurrentThinking("");
            setPendingApproval(null);

            setMessages((prev) => [...prev, {
                type: 'bot',
                text: data.narrative,
                vizType: data.vizType,
                vizConfig: data.vizConfig,
                queryResults: data.queryResults,
                timestamp: new Date()
            }]);
        };

        const onError = (data) => {
            if (data.chatRoomID !== chatRoomID) return;
            setIsAgentProcessing(false);
            setCurrentThinking("");
            setPendingApproval(null);
            displayError(data.error || "An error occurred with the AI agent");
        };

        const onWidgetPromoted = (data) => {
            if (data.chatRoomID !== chatRoomID) return;
            displaySuccess("Added to dashboard successfully!");
        };

        socket.on(CONSTANTS.SOCKET_RECEIVE_EVENTS.AGENT_THINKING, onThinking);
        socket.on(CONSTANTS.SOCKET_RECEIVE_EVENTS.AGENT_APPROVAL_REQUIRED, onApprovalRequired);
        socket.on(CONSTANTS.SOCKET_RECEIVE_EVENTS.AGENT_RESPONSE, onResponse);
        socket.on(CONSTANTS.SOCKET_RECEIVE_EVENTS.AGENT_ERROR, onError);
        socket.on(CONSTANTS.SOCKET_RECEIVE_EVENTS.AGENT_WIDGET_PROMOTED, onWidgetPromoted);

        return () => {
            socket.off(CONSTANTS.SOCKET_RECEIVE_EVENTS.AGENT_THINKING, onThinking);
            socket.off(CONSTANTS.SOCKET_RECEIVE_EVENTS.AGENT_APPROVAL_REQUIRED, onApprovalRequired);
            socket.off(CONSTANTS.SOCKET_RECEIVE_EVENTS.AGENT_RESPONSE, onResponse);
            socket.off(CONSTANTS.SOCKET_RECEIVE_EVENTS.AGENT_ERROR, onError);
            socket.off(CONSTANTS.SOCKET_RECEIVE_EVENTS.AGENT_WIDGET_PROMOTED, onWidgetPromoted);
        };
    }, [socket, chatRoomID]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isAgentProcessing, pendingApproval]);

    useEffect(() => {
        if (isAIChatOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isAIChatOpen]);

    const _handleOpenAIChat = () => setIsAIChatOpen(true);

    const _handleCloseAIChat = () => {
        setIsAIChatOpen(false);
        // Optionally cancel ongoing work if hiding
        if (isAgentProcessing && socket) {
            sendAgentCancel(socket, { chatRoomID });
            setIsAgentProcessing(false);
            setCurrentThinking("");
        }
    };

    const _handleSendUserMessage = useCallback(() => {
        if (!input.trim() || !socket || !chatRoomID) return;

        const messageText = input.trim();
        setMessages((prev) => [...prev, { type: 'user', text: messageText, timestamp: new Date() }]);
        setInput("");
        setIsAgentProcessing(true);
        setCurrentThinking("Analyzing your request...");
        setPendingApproval(null);

        sendAgentUserMessage(socket, {
            chatRoomID,
            tenantID,
            userID,
            message: messageText
        });
    }, [input, socket, chatRoomID, tenantID]);

    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            _handleSendUserMessage();
        }
    }, [_handleSendUserMessage]);

    const _handleApproveDatasources = () => {
        if (!socket || !pendingApproval?.items) return;
        const approvedIDs = pendingApproval.items.map(m => m.id);

        setIsAgentProcessing(true);
        setCurrentThinking("Datasources approved, drafting queries...");
        setPendingApproval(null);

        sendAgentDatasourceApproval(socket, {
            chatRoomID,
            tenantID,
            userID,
            approvedIDs
        });
    };

    const _handleApproveQueries = () => {
        if (!socket) return;

        setIsAgentProcessing(true);
        setCurrentThinking("Queries approved, executing...");
        setPendingApproval(null);

        sendAgentQueryApproval(socket, {
            chatRoomID,
            tenantID,
            userID
        });
    };

    const _handleRejectApproval = () => {
        if (!socket) return;
        setPendingApproval(null);
        setCurrentThinking("");
        setMessages((prev) => [...prev, {
            type: 'system',
            text: "Approval denied. Action cancelled.",
            timestamp: new Date()
        }]);
        sendAgentCancel(socket, { chatRoomID });
    };

    const _handlePromoteToWidget = () => {
        if (!socket) return;
        sendAgentPromoteToWidget(socket, {
            chatRoomID,
            tenantID,
            userID,
            widgetTitle: "AI Generated Widget"
        });
    };

    const isInputDisabled = isAgentProcessing || pendingApproval !== null || !socket;

    return (
        <>
            {isAIChatOpen && (
                <div className="fixed inset-y-0 right-0 w-[450px] z-50 flex flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300 border-l border-gray-200" style={{ zIndex: 9999 }}>
                    {/* AppBar */}
                    <div className="relative bg-white text-gray-800 shadow-sm border-b border-gray-200">
                        <div className="flex items-center justify-between px-4 py-1.5 border-b-2 border-primary">
                            <div className="flex items-center gap-3">
                                <img src={logo} alt="logo" className="w-7 h-7 rounded-full" />
                                <div>
                                    <h3 className="font-semibold text-sm">{`${CONSTANTS.APP_NAME} AI Agent`}</h3>
                                    <p className="text-xs text-gray-500">Analytics & Automation</p>
                                </div>
                            </div>
                            <Button onClick={_handleCloseAIChat} variant="ghost" size="sm"
                                square className="rounded-full">
                                <IoClose size={20} />
                            </Button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
                            <div className="space-y-6">
                                {messages.length === 0 && (
                                    <div className="text-center py-10 opacity-70">
                                        <FaRobot className="text-4xl mx-auto mb-3 text-primary/50" />
                                        <p className="text-sm">Hi! I can analyze data, build dashboards, and answer questions. How can I help?</p>
                                    </div>
                                )}

                                {messages.map((msg, index) => (
                                    <div key={index}>
                                        {msg.type === 'system' ? (
                                            <div className="flex justify-center my-4">
                                                <div className="bg-gray-200 text-gray-700 px-3 py-1 text-xs font-medium rounded-md">
                                                    {msg.text}
                                                </div>
                                            </div>
                                        ) : msg.type === 'user' ? (
                                            <div className="flex justify-end gap-3 mb-6">
                                                <div className="max-w-[85%] bg-primary text-white px-4 py-3 text-sm leading-relaxed rounded-l-xl rounded-tr-xl shadow-sm">
                                                    {msg.text}
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs shrink-0 mt-auto">
                                                    <FaUser />
                                                </div>
                                            </div>
                                        ) : (
                                                    <div className="flex justify-start gap-3 mb-6">
                                                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs shrink-0 mt-auto">
                                                            <FaRobot />
                                                        </div>
                                                        <div className="max-w-[85%] space-y-3">
                                                            <div className="bg-white border border-gray-100 px-4 py-3 text-sm text-gray-800 leading-relaxed rounded-r-xl rounded-tl-xl shadow-sm">
                                                                <AIChatMarkdownRenderer text={msg.text || ""} />
                                                            </div>

                                                            {msg.vizType && msg.vizType !== 'none' && (
                                                                <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 flex items-center justify-between shadow-sm">
                                                                    <div className="flex flex-col gap-1">
                                                                        <div className="flex items-center gap-2 text-indigo-700">
                                                                            <FaChartBar />
                                                                            <span className="text-xs font-medium">Visualization Ready ({msg.vizType})</span>
                                                                        </div>
                                                                    </div>
                                                                    <Button onClick={_handlePromoteToWidget} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] px-2 py-1 h-auto rounded-md">
                                                                        Promote
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                        )}
                                    </div>
                                ))}

                                {/* Approval Required UI */}
                                {pendingApproval && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                                        <h4 className="font-semibold text-yellow-800 flex items-center gap-2 mb-2 text-sm">
                                            {pendingApproval.type === 'datasource' ? <FaDatabase /> : <FaCode />}
                                            Approval Required
                                        </h4>
                                        <p className="text-xs text-yellow-700 mb-3">{pendingApproval.planSummary}</p>

                                        <div className="bg-white rounded border border-yellow-100 p-2 mb-4 max-h-40 overflow-y-auto">
                                            <ul className="text-xs space-y-2">
                                                {pendingApproval.items.map((item, i) => (
                                                    <li key={i} className="flex flex-col gap-1 pb-2 border-b border-gray-50 last:border-0 last:pb-0">
                                                        {pendingApproval.type === 'datasource' ? (
                                                            <>
                                                                <span className="font-medium text-gray-800">{item.metadata?.title || item.id}</span>
                                                                <span className="text-gray-500">{item.metadata?.description || item.type}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="font-mono text-indigo-600 bg-indigo-50 p-1 rounded break-all">{item.queryText}</span>
                                                                <span className="text-gray-500">Target: {item.datasourceID}</span>
                                                            </>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                onClick={pendingApproval.type === 'datasource' ? _handleApproveDatasources : _handleApproveQueries}
                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-md py-1.5 h-auto text-xs"
                                            >
                                                <FaCheck className="mr-2" /> Approve
                                            </Button>
                                            <Button
                                                onClick={_handleRejectApproval}
                                                variant="outline"
                                                className="flex-1 border-red-200 text-red-600 hover:bg-red-50 rounded-md py-1.5 h-auto text-xs"
                                            >
                                                <FaTimes className="mr-2" /> Deny
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Typing/Thinking Indicator */}
                                {isAgentProcessing && (
                                    <div className="flex justify-start gap-3 mb-6 animate-in fade-in duration-300">
                                        <div className="w-8 h-8 rounded-full bg-purple-600 opacity-50 flex items-center justify-center text-white text-xs shrink-0 mt-auto">
                                            <FaRobot />
                                        </div>
                                        <div className="bg-purple-50 border border-purple-100 text-purple-800 px-4 py-3 text-sm leading-relaxed rounded-r-xl rounded-tl-xl shadow-sm flex items-center gap-3 w-fit max-w-[85%]">
                                            <FaSpinner className="animate-spin text-purple-500" />
                                            <span className="text-xs font-medium animate-pulse">{currentThinking || "Thinking..."}</span>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-white border-t border-gray-200 flex-none z-10">
                            <div className="relative flex flex-row items-end gap-2 bg-gray-50 border border-gray-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all duration-200 p-1.5 rounded-lg">
                                <Textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder={!socket ? "Connecting..." : pendingApproval ? "Awaiting your approval above..." : "Message AI Agent..."}
                                    disabled={isInputDisabled}
                                    className="flex-1 resize-none border-none outline-none bg-transparent px-3 py-2.5 text-sm leading-relaxed max-h-32 min-h-[40px] placeholder-gray-400 disabled:opacity-50"
                                    rows={1}
                                    style={{
                                        overflowY: input.split('\n').length > 2 ? 'auto' : 'hidden'
                                    }}
                                />

                                <Button
                                    onClick={_handleSendUserMessage}
                                    disabled={!input.trim() || isInputDisabled}
                                    className={`
                                        mb-1 mr-1 p-2 transition-all duration-200 shrink-0 rounded-md h-9 w-9
                                        ${(!input.trim() || isInputDisabled)
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-primary text-white hover:bg-primary/90 shadow-sm'
                                        }
                                    `}
                                >
                                    <IoSend className="text-sm shadow-sm ml-0.5" />
                                </Button>
                            </div>
                            <div className="text-[10px] text-center mt-2 text-gray-400">
                                Model: Gemini 2.0 Flash • Shift+Enter for new line
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Trigger Button */}
            {!isAIChatOpen && (
                <Button
                    onClick={_handleOpenAIChat}
                    type="button"
                    style={{ zIndex: 1000 }}
                    className="fixed bottom-6 right-6 group overflow-hidden w-auto flex flex-row items-center justify-center rounded-2xl bg-gray-900 px-5 py-3.5 text-sm font-medium text-white hover:bg-gray-800 focus:ring-4 focus:ring-gray-900/30 outline-none transition-all duration-300 shadow-xl hover:-translate-y-1 hover:shadow-2xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-20 group-hover:opacity-40 transition-opacity blur-lg" />
                    <FaMagic className="text-[16px] mr-2.5 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="relative z-10 tracking-wide">AI Agent</span>
                </Button>
            )}
        </>
    );
};