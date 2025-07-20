import React from "react";
import { FaRobot, FaUser } from "react-icons/fa";

// eslint-disable-next-line no-unused-vars
import {
    Avatar,
    Fade,
} from "@mui/material";
import PropTypes from "prop-types";
import { AIChatRenderMessage } from "./aiChatRenderMessage";


// Message component for better rendering
export const AIChatMessageBubble = React.memo(({ message, sendApproval, isTyping = false }) => {
    AIChatMessageBubble.propTypes = {
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
                                <AIChatRenderMessage message={message} key={message.timestamp} sendApproval={sendApproval} />
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

AIChatMessageBubble.displayName = 'AIChatMessageBubble';

