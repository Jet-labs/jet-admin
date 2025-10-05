import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaMagic, FaSpinner, FaRobot, FaCode, FaImage } from "react-icons/fa";
import {
    AppBar,
    Avatar,
    Box,
    Dialog,
    DialogContent,
    FormControl,
    IconButton,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Select,
    Slide,
    Toolbar,
    Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { IoClose, IoSend, } from "react-icons/io5";
import { useParams } from "react-router-dom";
import logo from "../../../assets/logo.png";
import { CONSTANTS } from "../../../constants";
import { sendUserMessageToAIAPI } from "../../../data/apis/ai";
import { displayError } from "../../../utils/notification";
import { AIChatMessageBubble } from "./aiChatMessageBubble";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export const AIChatButton = () => {
    const { tenantID } = useParams();
    const [isAIChatOpen, setIsAIChatOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [selectedMode, setSelectedMode] = useState('chat');
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const modes = [
        { id: 'chat', label: 'General Chat', icon: FaRobot, color: 'text-blue-600', description: 'General conversation and questions' },
        { id: 'query_assist', label: 'Query Assist', icon: FaCode, color: 'text-purple-600', description: 'Get assistance for query creation' },
        { id: 'analysis', label: 'Data Analysis', icon: FaImage, color: 'text-orange-600', description: 'Data interpretation and insights' }
    ];

    const { isPending: isSendingUserMessage, mutate: sendUserMessage } = useMutation({
        mutationFn: (input) => {
            return sendUserMessageToAIAPI({
                input,
                tenantID,
            });
        },
        retry: false,
        onSuccess: (chatRoomID) => {
            console.log("chat room id", chatRoomID);
            setMessages((prev) => [
                ...prev,
                {
                    type: 'bot',
                    text: chatRoomID,
                    timestamp: new Date(),
                    mode: selectedMode
                }
            ]);
            setInput("");
        },
        onError: (error) => {
            displayError(error);
        },
    });

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



    const handleModeSelect = (mode) => {
        setSelectedMode(mode.id);

        // Add system message about mode change
        const modeChangeMessage = {
            type: "system",
            text: `Switched to ${mode.label} mode. ${mode.description}`,
            timestamp: new Date(),
            mode: mode.id
        };
        setMessages((prev) => [...prev, modeChangeMessage]);
    };


    const _handleSendUserMessage = useCallback(() => {
        setMessages((prev) => [...prev, { type: 'user', text: input.trim(), timestamp: new Date(), mode: selectedMode }]);
        sendUserMessage(input.trim());
    }, [input, sendUserMessage, selectedMode, setMessages]);

    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            _handleSendUserMessage();
        }
    }, [_handleSendUserMessage]);


    const isInputDisabled = isSendingUserMessage || isTyping;
    const selectedModeData = modes.find(mode => mode.id === selectedMode);

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
                            <div className="flex items-center gap-2">
                                <Avatar
                                    sx={{
                                        width: 28,
                                        height: 28,
                                        fontSize: '12px'
                                    }}
                                    src={logo}
                                />
                                <Typography variant="h6" component="div" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                                    {`${CONSTANTS.APP_NAME} AI Assistant`}
                                </Typography>
                                <div className="flex items-center gap-2 ml-3">
                                    <selectedModeData.icon className={`text-sm ${selectedModeData.color}`} />
                                    <span className="text-xs bg-gray-100 px-2 py-1  font-medium" style={{ borderRadius: '6px' }}>
                                        {selectedModeData.label}
                                    </span>
                                </div>
                                {isTyping && (
                                    <div className="flex items-center gap-1 ml-2">
                                        <div className="w-1.5 h-1.5 bg-green-500  animate-pulse" style={{ borderRadius: '6px' }}></div>
                                        <span className="text-xs text-green-600 font-medium">Active</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <IconButton
                            edge="start"
                            onClick={_handleCloseAIChat}
                            aria-label="close"
                            sx={{ color: '#6b7280' }}
                        >
                            <IoClose size={20} />
                        </IconButton>
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
                            <>
                                {messages.map((msg, index) => (
                                    <div key={index}>
                                        {msg.type === 'system' ? (
                                            <div className="flex justify-center my-4">
                                                <div className="bg-blue-50 text-blue-700 px-3 py-1 text-xs font-medium" style={{ borderRadius: '6px' }}>
                                                    {msg.text}
                                                </div>
                                            </div>
                                        ) : (
                                            <AIChatMessageBubble message={msg} />
                                        )}
                                    </div>
                                ))}

                                {isSendingUserMessage && (
                                    <AIChatMessageBubble
                                        message={{ type: 'bot', text: '', mode: selectedMode }}
                                        isTyping={true}
                                        key={messages.length}

                                    />
                                )}
                            </>
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Enhanced Input Area */}
                    <Box sx={{ p: 2, bgcolor: '#ffffff', borderTop: '1px solid #e5e7eb' }}>
                        <div className="max-w-4xl mx-auto">
                            {/* Mode Selection and Settings Bar */}

                            <div className="mb-3 flex items-center justify-end gap-3">
                                <FormControl size="small" disabled={isInputDisabled}>
                                    <Select
                                        value={selectedMode}
                                        onChange={(e) => handleModeSelect(modes.find(m => m.id === e.target.value))}
                                        displayEmpty
                                        sx={{
                                            minWidth: 180,
                                            '& .MuiSelect-select': {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                py: 1
                                            },
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#e5e7eb',
                                                borderRadius: '6px'
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#9ca3af'
                                            },
                                            '&:focus .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#9ca3af'
                                            }
                                        }}
                                        renderValue={(value) => {
                                            const mode = modes.find(m => m.id === value);
                                            if (!mode) return null;

                                            return (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <mode.icon style={{ color: mode.color, fontSize: '14px' }} />
                                                    <Typography variant="body2" sx={{ color: '#374151' }}>
                                                        {mode.label}
                                                    </Typography>
                                                </Box>
                                            );
                                        }}
                                    >
                                        {modes.map((mode) => (
                                            <MenuItem key={mode.id} value={mode.id}>
                                                <ListItemIcon sx={{ minWidth: '28px !important' }}>
                                                    <mode.icon style={{ color: mode.color, fontSize: '14px' }} />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={mode.label}
                                                    sx={{
                                                        '& .MuiTypography-root': {
                                                            fontSize: '0.875rem',
                                                            color: '#374151'
                                                        }
                                                    }}
                                                />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                {/* Settings Button */}
                                {/* <button
                                    onClick={handleSettings}
                                    className="p-2.5 bg-white border !border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                                    title="Settings"
                                    disabled={isInputDisabled}
                                    style={{ borderRadius: '6px', borderColor: "#e5e7eb", borderWidth: 1 }}
                                >
                                    <IoSettings className="text-base text-gray-600" />
                                </button> */}
                            </div>

                            {/* Main Input Container */}
                            <div style={{ borderRadius: '6px' }} className="relative flex flex-row items-center justify-between gap-2 bg-white  border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-2">
                                {/* Left Utility Buttons */}


                                {/* Text Input */}
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder={
                                        isInputDisabled
                                            ? "Setting up chat..."
                                            : `Ask about ${selectedModeData.label.toLowerCase()}...`
                                    }
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

                                {/* Send Button */}
                                <button
                                    onClick={_handleSendUserMessage}
                                    disabled={!input.trim() || isInputDisabled}
                                    className={`
                                        p-2.5  transition-all duration-200 shrink-0
                                        ${(!input.trim() || isInputDisabled)
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-[#646cff] text-white hover:bg-[#4f56df] shadow-sm hover:shadow-md'
                                        }
                                    `}
                                    style={{ borderRadius: '6px' }}
                                >
                                    {isTyping ? (
                                        <FaSpinner className="animate-spin text-sm" />
                                    ) : (
                                        <IoSend className="text-sm" />
                                    )}
                                </button>
                            </div>

                            {/* Help Text and Mode Indicator */}
                            <div className="text-xs text-gray-500 text-center mt-2 space-y-1">
                                <div className="flex items-center justify-center gap-4">
                                    <span>Press Enter to send, Shift + Enter for new line</span>
                                    {selectedMode !== 'chat' && (
                                        <span className={`font-medium ${selectedModeData.color}`}>
                                            {selectedModeData.label} mode active
                                        </span>
                                    )}
                                </div>

                            </div>

                            {/* Mode-specific hints */}
                            {selectedMode !== 'chat' && (
                                <div className="text-xs text-gray-400 text-center mt-1">
                                    {selectedMode === 'creative' && "Perfect for stories, poems, and creative content"}
                                    {selectedMode === 'code' && "Optimized for programming help and code review"}
                                    {selectedMode === 'analysis' && "Upload data files for analysis and insights"}
                                </div>
                            )}
                        </div>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Enhanced Trigger Button */}
            <button
                onClick={_handleOpenAIChat}
                type="button"
                style={{ zIndex: 1000 }}
                className="absolute bottom-4 right-4 group overflow-hidden w-auto flex flex-row items-center justify-center rounded-lg bg-gradient-to-r from-[#646cff] via-[#7c3aed] to-[#646cff] px-4 py-2.5 text-sm font-medium text-white hover:from-[#5a5cf8] hover:via-[#6d28d9] hover:to-[#5a5cf8] focus:ring-2 focus:ring-[#646cff]/50 outline-none focus:outline-none transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:via-transparent before:to-white/20 before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700 before:ease-out"
            >
                <FaMagic className="text-sm mr-2 group-hover:animate-pulse relative z-10" />
                <span className="relative z-10">Ask AI Assistant</span>
            </button>
        </>
    );
};