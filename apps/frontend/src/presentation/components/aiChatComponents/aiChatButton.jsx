import { FaMagic, FaUser, FaRobot, FaSpinner } from "react-icons/fa";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Markdown from 'react-markdown'
import { LiveProvider, LiveEditor, LivePreview } from 'react-live';
import * as Recharts from 'recharts';
import {ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area, ComposedChart} from 'recharts'
import {
    AppBar,
    Dialog,
    DialogContent,
    IconButton,
    Slide,
    Toolbar,
    Button,
    Typography,
    Avatar,
    Box,
    Fade,
} from "@mui/material";
import logo from "../../../assets/logo.png";
import { IoClose, IoSend } from "react-icons/io5";
import { CONSTANTS } from "../../../constants";
import { sendAIChatMessage } from "../../../data/sockets/aichat";
import { useSocketState } from "../../../logic/contexts/socketContext";
import { useMutation } from "@tanstack/react-query";
import { getAIChatRoomIDAPI } from "../../../data/apis/ai";
import { useParams } from "react-router-dom";
import { displayError } from "../../../utils/notification";
import PropTypes from "prop-types";
import { StringUtils } from "../../../utils/string";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import remarkGfm from 'remark-gfm'
import { DataQueryTestingPanel } from "../dataQueryComponents/dataQueryTestingPanel";
import { DynamicJSXRenderer } from "./dynamicJSXRenderer";
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const MarkdownRenderer = React.memo(({text}) => {
    return (
        <Markdown 
            remarkPlugins={[remarkGfm]} 
            components={{
                code(props) {
                    const { children, className, ...rest } = props
                    const match = /language-(\w+)/.exec(className || '')
                    return match ? (
                        <SyntaxHighlighter
                            {...rest}
                            PreTag="div"
                            language={match[1]}
                        >
                            {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                    ) : (
                        <code {...rest} className={className}>
                            {children}
                        </code>
                    )
                }
            }}
        >
            {text}
        </Markdown>
    )
})

MarkdownRenderer.displayName = 'MarkdownRenderer'
MarkdownRenderer.propTypes = {
    text: PropTypes.string.isRequired,
}


const RenderMessage = React.memo(({ message, sendApproval }) => {

    // PropTypes should be defined outside the component
    RenderMessage.propTypes = {
        message: PropTypes.object.isRequired,
        sendApproval: PropTypes.func.isRequired,
    };
    const [selectedQueryForTesting, setSelectedQueryForTesting] = useState(null);
    
    let processedJSONMessage;

    if(message.type === 'user'){
        return <MarkdownRenderer text={message.text} />;
    }
    
    processedJSONMessage = StringUtils.removeJSONMarkdownFencesRegex(message.text);

    // Early return for non-JSON messages
    if (!processedJSONMessage || !processedJSONMessage.responseType) {
        return <MarkdownRenderer text={message.text} />;
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
                                    <summary className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
                                        <span className="font-semibold text-gray-800 capitalize">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                        <svg
                                            className="w-5 h-5 text-gray-500 transition-transform group-open:rotate-180"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </summary>
                                    <div className="mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
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
                                                    <MarkdownRenderer text={StringUtils.revertJSONToMarkdown(value)} />
                                        
                                        )}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                        <button onClick={_handleApprovePrompt} className="px-3 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded transition-colors">
                            Approve
                        </button>
                        <button className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors">
                            Reject
                        </button>
                        <button onClick={_handleSelectQueryForTesting} className="px-3 py-1 text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded transition-colors">
                            Test query
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
            return <MarkdownRenderer text={message.text} />;
    }
});

RenderMessage.displayName = 'RenderMessage'


// Message component for better rendering
const MessageBubble = React.memo(({ message, sendApproval, isTyping = false }) => {
    MessageBubble.propTypes = {
        message: PropTypes.object.isRequired,
        isTyping: PropTypes.bool,
        sendApproval: PropTypes.func.isRequired,
      };
    const isUser = message.type === 'user';

    return (
        <Fade in={true} timeout={300}>
            <div className={`flex gap-3 mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                    <Avatar
                        sx={{
                            width: 32,
                            height: 32,
                            bgcolor: '#646cff',
                            fontSize: '14px'
                        }}
                    >
                        <FaRobot />
                    </Avatar>
                )}

                <div className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}>
                    <div
                        className={`
                            px-4 py-3 rounded-2xl text-sm leading-relaxed
                            ${isUser
                                ? 'bg-[#646cff] text-white ml-auto'
                                : 'bg-gray-100 text-gray-800'
                            }
                            ${isUser ? 'rounded-br-md' : 'rounded-bl-md'}
                            shadow-sm
                        `}
                    >
                        {isTyping ? (
                            <div className="flex items-center gap-1">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                                <span className="ml-2 text-xs text-gray-500">AI is typing...</span>
                            </div>
                        ) : (
                                <RenderMessage message={message} key={message.timestamp} sendApproval={sendApproval} />
                        )}
                    </div>
                    <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>

                {isUser && (
                    <Avatar
                        sx={{
                            width: 32,
                            height: 32,
                            bgcolor: '#6366f1',
                            fontSize: '14px'
                        }}
                    >
                        <FaUser />
                    </Avatar>
                )}
            </div>
        </Fade>
    );
});

MessageBubble.displayName = 'MessageBubble';

export const AIChatButton = () => {
    const { tenantID } = useParams();
    const [isAIChatOpen, setIsAIChatOpen] = useState(false);
    const [roomId, setRoomId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const { socket } = useSocketState();

    console.log("messages", messages);

    const { isPending: isFetchingChatRoomID, mutate: fetchChatRoomID } = useMutation({
        mutationFn: () => {
            return getAIChatRoomIDAPI({
                tenantID,
            });
        },
        retry: false,
        onSuccess: (chatRoomID) => {
            console.log("chat room id", chatRoomID);
            setRoomId(chatRoomID);
            // Add welcome message when room is ready
            if (messages.length === 0) {
                setMessages([{
                    type: "bot",
                    text: "Hello! I'm your AI assistant. How can I help you today?",
                    timestamp: new Date()
                }]);
            }
        },
        onError: (error) => {
            displayError(error);
        },
    });

    useEffect(() => {
        if (!isAIChatOpen) return;
        fetchChatRoomID();
    }, [isAIChatOpen]);

    useEffect(() => {
        if (!socket) return;

        socket.on(CONSTANTS.SOCKET_RECEIVE_EVENTS.AI_CHAT_BOT_MESSAGE, (msg) => {
            console.log("received message", msg);
            setIsTyping(false);
            setMessages((prev) => [...prev, {
                type: "bot",
                text: msg.text,
                timestamp: new Date()
            }]);
        });

        return () => {
            socket.off(CONSTANTS.SOCKET_RECEIVE_EVENTS.AI_CHAT_BOT_MESSAGE);
        };
    }, [socket]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    useEffect(() => {
        if (isAIChatOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isAIChatOpen]);

    const _handleOpenAIChat = () => {
        setIsAIChatOpen(true);
    };

    const _handleCloseAIChat = () => {
        setIsAIChatOpen(false);
        setIsTyping(false);
    };

    const sendMessage = () => {
        if (!input.trim() || !roomId || isTyping) return;

        const userMessage = {
            type: "user",
            text: input.trim(),
            timestamp: new Date()
        };

        sendAIChatMessage(socket, [...messages, {
            type: "user",
            text: input.trim(),
            timestamp: new Date()
        }], roomId);
        setMessages((prev) => [...prev, userMessage]);
        setIsTyping(true);
        
        setInput("");
    };

    const sendApproval = useCallback((dataQueryData) => {
        if (!dataQueryData || !roomId || isTyping) return;

        const userMessage = {
            type: "user",
            text: 'approve',
            timestamp: new Date()
        };

        sendAIChatMessage(socket, {
            type: "user",
            text: 'approve',
            dataQueryData: dataQueryData,
            action: 'approve',
            timestamp: new Date()
        }, roomId);
        setMessages((prev) => [...prev, userMessage]);
        setIsTyping(true);
        setInput("");
    }, [messages, roomId, socket,sendMessage,isTyping,setIsTyping,setInput]);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const isInputDisabled = !roomId || isFetchingChatRoomID || isTyping;

    return (
        <>
            <Dialog
                fullScreen
                open={isAIChatOpen}
                onClose={_handleCloseAIChat}
                slots={{ transition: Transition }}
                PaperProps={{
                    sx: {
                        bgcolor: '#ffffff',
                    }
                }}
            >
                <AppBar
                    sx={{
                        position: 'relative',
                        bgcolor: '#ffffff',
                        color: '#1f2937',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        borderBottom: '1px solid #e5e7eb'
                    }}
                >
                    <Toolbar sx={{ justifyContent: 'space-between' }}>
                        <div className="flex items-center gap-3">
                            <IconButton
                                edge="start"
                                onClick={_handleCloseAIChat}
                                aria-label="close"
                                sx={{ color: '#6b7280' }}
                            >
                                <IoClose size={20} />
                            </IconButton>
                            <div className="flex items-center gap-2">
                                <Avatar
                                    sx={{
                                        width: 28,
                                        height: 28,
                                        // bgcolor: '#646cff',
                                        fontSize: '12px'
                                    }}
                                    src={logo}
                                >
                                    
                                </Avatar>
                                <Typography variant="h6" component="div" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                                    {`${CONSTANTS.APP_NAME} AI Assistant`}
                                </Typography>
                                {isTyping && (
                                    <div className="flex items-center gap-1 ml-2">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-xs text-green-600 font-medium">Active</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <Button
                            color="inherit"
                            onClick={_handleCloseAIChat}
                            sx={{
                                color: '#6b7280',
                                '&:hover': { bgcolor: '#f3f4f6' }
                            }}
                        >
                            Close
                        </Button>
                    </Toolbar>
                </AppBar>

                <DialogContent
                    className="!p-0 flex flex-col h-full"
                    sx={{
                        bgcolor: '#fafafa',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%'
                    }}
                >
                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto px-4 py-6">
                        <div className="max-w-4xl mx-auto">
                            {isFetchingChatRoomID ? (
                                <div className="flex items-center justify-center py-8">
                                    <FaSpinner className="animate-spin text-gray-400 mr-2" />
                                    <span className="text-gray-500">Setting up chat...</span>
                                </div>
                            ) : (
                                <>
                                    {messages.map((msg, index) => (
                                        <MessageBubble key={index} message={msg} sendApproval={sendApproval} />
                                    ))}

                                    {isTyping && (
                                        <MessageBubble
                                            message={{ type: 'bot', text: '' }}
                                            isTyping={true}
                                            key={messages.length}
                                            sendApproval={sendApproval}
         
                                        />
                                    )}
                                </>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Input Area */}
                    <Box sx={{
                    }}>
                        <div className="max-w-4xl mx-auto">
                            <div className="relative flex flex-row items-center justify-between gap-3 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-2">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder={isInputDisabled ? "Setting up chat..." : "Type your message..."}
                                    disabled={isInputDisabled}
                                    className="flex-1 resize-none border-none outline-none bg-transparent px-3 py-3 text-sm leading-relaxed max-h-32 min-h-[20px] placeholder-gray-400 disabled:opacity-50"
                                    rows={1}
                                    style={{
                                        height: 'auto',
                                        minHeight: '20px',
                                        maxHeight: '128px',
                                        overflowY: input.split('\n').length > 3 ? 'auto' : 'hidden'
                                    }}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!input.trim() || isInputDisabled}
                                    className={`
                                        p-2.5 rounded-xl transition-all duration-200
                                        ${(!input.trim() || isInputDisabled)
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-[#646cff] text-white hover:bg-[#4f56df] shadow-sm hover:shadow-md'
                                        }
                                    `}
                                >
                                    {isTyping ? (
                                        <FaSpinner className="animate-spin text-sm" />
                                    ) : (
                                        <IoSend className="text-sm" />
                                    )}
                                </button>
                            </div>

                            <div className="text-xs text-gray-500 text-center mt-2">
                                Press Enter to send, Shift + Enter for new line
                            </div>
                        </div>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Enhanced Trigger Button */}
            <button
                onClick={_handleOpenAIChat}
                type="button"
                className="absolute bottom-4 right-4 group  overflow-hidden w-auto flex flex-row items-center justify-center rounded-lg bg-gradient-to-r from-[#646cff] via-[#7c3aed] to-[#646cff] px-4 py-2.5 text-sm font-medium text-white hover:from-[#5a5cf8] hover:via-[#6d28d9] hover:to-[#5a5cf8] focus:ring-2 focus:ring-[#646cff]/50 outline-none focus:outline-none transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:via-transparent before:to-white/20 before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700 before:ease-out"
            >
                <FaMagic className="text-sm mr-2 group-hover:animate-pulse relative z-10" />
                <span className="relative z-10">Ask AI Assistant</span>
            </button>
        </>
    );
};
