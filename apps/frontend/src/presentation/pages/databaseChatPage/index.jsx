import React, { useState, useCallback, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { IoSend, IoStatsChart, IoSparklesSharp, IoStop, IoTimeOutline, IoCheckmarkCircleOutline, IoCopyOutline, IoRefreshOutline, IoClose, IoShieldCheckmark, IoShieldOutline } from "react-icons/io5";
import { HiLightningBolt } from "react-icons/hi";
import { sendDatabaseChatMessage, streamDatabaseChatMessage } from "../../../data/apis/databaseChat";
import { DatabaseChatRenderer } from "../../components/databaseChatComponents/LLMOutputRenderer";
import { displayError } from "../../../utils/notification";
import { toast } from "react-toastify";
import { MdSend } from "react-icons/md";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../components/ui/resizable";
import { PGSQLQueryExecutor } from "../../components/dataQueryComponents/pgsqlQueryExecutor";
import { CONSTANTS } from "../../../constants";
import { Tooltip } from "@mui/material";

// --- Components ---

const ConfidenceBadge = ({ score }) => {
  if (!score) return null;
  const percentage = Math.round(score * 100);
  let color = "text-green-600 bg-green-50 border-green-200";
  if (percentage < 70) color = "text-amber-600 bg-amber-50 border-amber-200";
  if (percentage < 40) color = "text-red-600 bg-red-50 border-red-200";

  return (
    <div className={`flex flex-row items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium border ${color}`}>
      <HiLightningBolt className="text-sm" /> <span>{percentage}% Confidence</span>
    </div>
  );
};

const ThinkingSteps = ({ status }) => {
  const [fallbackStep, setFallbackStep] = useState(0);
  const fallbackSteps = ["Connecting...", "Analyzing...", "Processing..."];

  useEffect(() => {
    if (!status) {
      const interval = setInterval(() => {
        setFallbackStep((s) => (s < fallbackSteps.length - 1 ? s + 1 : s));
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [status]);

  const displayStatus = status || fallbackSteps[fallbackStep];

  return (
    <div className="flex items-center gap-3 py-2 px-1">
      <div className="relative flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-600 rounded-full animate-spin" />
      </div>
      <span className="text-xs font-medium text-slate-500 animate-pulse">
        {displayStatus}
      </span>
    </div>
  );
};

const MessageBubble = ({ message, isUser, onRetry }) => {
  const isAI = !isUser;

  const handleCopy = () => {
    const content = isUser ? message.text : (
      typeof message.response === 'string' ? message.response :
        message.response?.content?.map(c => c.content).join('\n') || "Structured Response"
    );
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className={`py-6 px-4 md:px-8 group transition-colors ${isAI ? "bg-white" : "bg-slate-50"}`}>
      <div className="max-w-4xl mx-auto flex gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0 pt-0.5">
          {isUser ? (
            <div className="w-9 h-9 rounded-lg bg-slate-700 flex items-center justify-center text-white text-xs font-semibold">
              YOU
            </div>
          ) : (
            <div className="w-9 h-9 rounded-lg bg-[#646cff] flex items-center justify-center text-white">
              <IoSparklesSharp className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-sm text-slate-800">
                {isUser ? "You" : "Data Assistant"}
              </span>
              {isAI && message.response?.timestamp && (
                <span className="text-xs text-slate-400">
                  {new Date(message.response.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={handleCopy}
                className="p-1.5 text-slate-500 hover:text-[#646cff] bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
                title="Copy"
              >
                <IoCopyOutline size={14} />
              </button>
              <button
                onClick={() => onRetry && onRetry(message)}
                className="p-1.5 text-slate-500 hover:text-[#646cff] bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
                title="Retry"
              >
                <IoRefreshOutline size={14} />
              </button>
            </div>
          </div>

          <div className="text-slate-700 leading-relaxed">
            {isUser ? (
              <p className="whitespace-pre-wrap text-sm">{message.text}</p>
            ) : message.isLoading ? (
              <ThinkingSteps status={message.streamingStatus} />
            ) : (
              <>
                <DatabaseChatRenderer response={message.response} />

                {/* AI Footer: Metadata */}
                {message.response?.metadata && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-4">
                    <ConfidenceBadge score={message.response.metadata.confidence} />
                    {message.response.metadata.processingTime && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <IoTimeOutline className="text-sm" /> {(message.response.metadata.processingTime / 1000).toFixed(2)}s
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SuggestedQueryCard = ({ icon, title, desc, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-start p-4 bg-white border border-slate-200 rounded-lg hover:border-[#646cff] hover:bg-slate-50 transition-all duration-200 group text-left"
  >
    <span className="text-2xl mb-2 grayscale group-hover:grayscale-0 transition-all duration-200">{icon}</span>
    <span className="font-medium text-slate-800 text-sm">{title}</span>
    <span className="text-xs text-slate-500 mt-1">{desc}</span>
  </button>
);

const DatabaseChatPage = () => {
  const { tenantID } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [conversationHistory, setConversationHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const [currentQuery, setCurrentQuery] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  // Read-only mode state (default: true for safety)
  const [readOnlyMode, setReadOnlyMode] = useState(true);
  
  // Streaming state
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingStatus, setStreamingStatus] = useState("");
  const abortControllerRef = useRef(null);
  const currentMessageIdRef = useRef(null);

  // Send message with streaming
  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isStreaming) return;

    const userMsgId = Date.now();
    const aiMsgId = userMsgId + 1;
    currentMessageIdRef.current = aiMsgId;

    // Add user message and loading AI message
    const userMsg = { id: userMsgId, type: "user", text, timestamp: new Date() };
    const aiMsg = { id: aiMsgId, type: "assistant", isLoading: true, streamingStatus: "Connecting..." };
    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput("");
    setIsStreaming(true);
    setStreamingStatus("Connecting...");

    try {
      abortControllerRef.current = await streamDatabaseChatMessage({
        tenantID,
        message: text,
        conversationHistory,
        readOnlyMode,
        onEvent: (event) => {
          // Update streaming status based on event type
          switch (event.type) {
            case 'thinking':
              setStreamingStatus(event.data.status || "Thinking...");
              setMessages((prev) => 
                prev.map((msg) => 
                  msg.id === aiMsgId 
                    ? { ...msg, streamingStatus: event.data.status }
                    : msg
                )
              );
              break;
            case 'executing':
              setStreamingStatus(event.data.status || "Running query...");
              setMessages((prev) => 
                prev.map((msg) => 
                  msg.id === aiMsgId 
                    ? { ...msg, streamingStatus: event.data.status }
                    : msg
                )
              );
              break;
            case 'results':
              setStreamingStatus("Analyzing results...");
              break;
            default:
              break;
          }
        },
        onComplete: (data) => {
          setMessages((prev) => 
            prev.map((msg) => 
              msg.id === aiMsgId 
                ? { 
                    id: aiMsgId, 
                    type: "assistant", 
                    response: data, 
                    timestamp: new Date(),
                    isLoading: false,
                    streamingStatus: undefined
                  }
                : msg
            )
          );
          
          setConversationHistory(prev => [...prev, { 
            user: text, 
            assistant: data?.content?.[0]?.content || "..." 
          }]);
          
          // Extract SQL query from response and open the side panel
          if (data?.content && Array.isArray(data.content)) {
            const sqlBlock = data.content.find(block => block.type === "sql");
            if (sqlBlock?.content) {
              setCurrentQuery(sqlBlock.content);
              setIsPanelOpen(true);
            }
          }
          
          setIsStreaming(false);
          setStreamingStatus("");
        },
        onError: (err) => {
          setMessages((prev) => 
            prev.map((msg) => 
              msg.id === aiMsgId 
                ? { 
                    id: aiMsgId, 
                    type: "assistant", 
                    response: { content: [{ type: "error", content: err.message }] },
                    isLoading: false,
                    streamingStatus: undefined
                  }
                : msg
            )
          );
          setIsStreaming(false);
          setStreamingStatus("");
        }
      });
    } catch (err) {
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === aiMsgId 
            ? { 
                id: aiMsgId, 
                type: "assistant", 
                response: { content: [{ type: "error", content: err.message }] },
                isLoading: false
              }
            : msg
        )
      );
      setIsStreaming(false);
      setStreamingStatus("");
    }
  }, [tenantID, conversationHistory, isStreaming, readOnlyMode]);

  // Cancel streaming
  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setStreamingStatus("");
      
      // Update the current AI message to show cancellation
      if (currentMessageIdRef.current) {
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === currentMessageIdRef.current && msg.isLoading
              ? { 
                  ...msg, 
                  isLoading: false, 
                  response: { content: [{ type: "markdown", content: "*(Response cancelled)*" }] },
                  streamingStatus: undefined
                }
              : msg
          )
        );
      }
    }
  }, []);

  const handleRetry = (message) => {
    if (message.type === "user") {
      setInput(message.text);
    } else {
      // Find the last user message to resend
      const lastUserMsg = [...messages].reverse().find(m => m.type === "user");
      if (lastUserMsg) {
        sendMessage(lastUserMsg.text);
      }
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans poppins">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#646cff] rounded-lg flex items-center justify-center text-white">
            <IoStatsChart className="text-lg" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800">Data Explorer</h1>
            <p className="text-[11px] text-slate-500 font-medium">AI-POWERED ANALYTICS</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Read-Only Mode Toggle */}
          <Tooltip title={readOnlyMode ? "Read-Only Mode: Write queries will be analyzed but not executed" : "Full Mode: All queries will be executed"} arrow>
            <button
              onClick={() => setReadOnlyMode(!readOnlyMode)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-colors border ${
                readOnlyMode
                  ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                  : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
              }`}
            >
              {readOnlyMode ? (
                <>
                  <IoShieldCheckmark size={14} />
                  Read-Only
                </>
              ) : (
                <>
                  <IoShieldOutline size={14} />
                  Full Access
                </>
              )}
            </button>
          </Tooltip>
          
          {isPanelOpen ? (
            <button
              onClick={() => setIsPanelOpen(false)}
              className="text-xs font-medium text-slate-600 hover:text-slate-800 px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors bg-white border border-slate-200"
            >
              Hide Query Panel
            </button>
          ):<button onClick={() => setIsPanelOpen(true)} className="text-xs font-medium text-slate-600 hover:text-slate-800 px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors bg-white border border-slate-200">
              Show Query Panel
            </button>
          }
          <button
            onClick={() => { setMessages([]); setConversationHistory([]); setCurrentQuery(null); setIsPanelOpen(false); }}
            className="text-xs font-medium text-slate-600 hover:text-red-600 px-3 py-2 hover:bg-red-50 rounded-lg transition-colors bg-white border border-slate-200"
          >
            Reset Session
          </button>
        </div>
      </header>

      {/* Main Content Area with Resizable Panels */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId={CONSTANTS.RESIZABLE_PANEL_KEYS?.CHAT_QUERY_EXECUTOR_SEPARATION || "chat-query-panel"}
          className="h-full"
        >
          {/* Chat Panel */}
          <ResizablePanel defaultSize={isPanelOpen ? 60 : 100} minSize={40}>
            <div className="flex flex-col h-full">
              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto scroll-smooth">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-6">
                    <div className="w-14 h-14 bg-[#646cff] rounded-lg flex items-center justify-center mb-6">
                      <IoSparklesSharp className="text-2xl text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">How can I help you today?</h2>
                    <p className="text-slate-500 text-sm mb-8 text-center max-w-md">
                      I can analyze your data, generate visualizations, and SQL queries.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
                      <SuggestedQueryCard icon="📊" title="Booking Overview" desc="Show bookings by status for this month" onClick={() => sendMessage("Show bookings by status for this month")} />
                      <SuggestedQueryCard icon="💰" title="Revenue Analysis" desc="Calculate total revenue trends" onClick={() => sendMessage("Calculate total revenue trends")} />
                      <SuggestedQueryCard icon="👥" title="Top Drivers" desc="List top 5 drivers by completed rides" onClick={() => sendMessage("List top 5 drivers by completed rides")} />
                      <SuggestedQueryCard icon="⚠️" title="Error Logs" desc="Show recent system errors" onClick={() => sendMessage("Show recent system errors")} />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col pb-4">
                    {messages.map((msg) => (
                      <MessageBubble key={msg.id} message={msg} isUser={msg.type === "user"} onRetry={handleRetry} />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-slate-200">
                <div className="max-w-3xl mx-auto">
                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden focus-within:border-[#646cff] transition-colors">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (input.trim() && !isStreaming) sendMessage(input); } }}
                      placeholder="Ask a question about your data..."
                      className="w-full text-sm max-h-40 p-4 bg-transparent border-none outline-none resize-none text-slate-700 placeholder-slate-400 leading-relaxed"
                      rows={1}
                      disabled={isStreaming}
                    />
                    <div className="flex justify-between items-center px-3 pb-3">
                      {/* Streaming status indicator */}
                      <div className="text-xs text-slate-400">
                        {isStreaming && streamingStatus && (
                          <span className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            {streamingStatus}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Cancel button - only show when streaming */}
                        {isStreaming && (
                          <button
                            onClick={cancelStream}
                            className="p-2.5 rounded-lg transition-all duration-200 flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                            title="Stop generating"
                          >
                            <IoStop size={18} />
                          </button>
                        )}
                        
                        {/* Send button */}
                        <button
                          onClick={() => sendMessage(input)}
                          disabled={!input.trim() || isStreaming}
                          className={`p-2.5 rounded-lg transition-all duration-200 flex items-center justify-center
                            ${input.trim() && !isStreaming
                              ? 'bg-[#646cff] text-white hover:bg-[#5558e3]'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                          {isStreaming ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <MdSend size={20} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-center text-[10px] text-slate-400 mt-2">
                  AI generated • Verify critical data
                </p>
              </div>
            </div>
          </ResizablePanel>

          {/* Query Executor Side Panel */}
          {isPanelOpen && (
            <>
              <ResizableHandle withHandle={true} />
              <ResizablePanel defaultSize={40} minSize={30}>
                <div className="h-full flex flex-col bg-white border-l border-slate-200">
                  {/* Panel Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
                    <h3 className="text-sm font-semibold text-slate-700">Query Executor</h3>
                    <button
                      onClick={() => setIsPanelOpen(false)}
                      className="bg-[#646cff]/10 p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <IoClose size={18} />
                    </button>
                  </div>
                  {/* Query Executor */}
                  <div className="flex-1 overflow-hidden">
                    <PGSQLQueryExecutor
                      tenantID={tenantID}
                      initialQuery={currentQuery}
                    />
                  </div>
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default DatabaseChatPage;
