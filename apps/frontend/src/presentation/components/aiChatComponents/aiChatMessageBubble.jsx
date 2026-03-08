import React from "react";
import { FaRobot, FaUser } from "react-icons/fa";

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
        <div className={`flex gap-3 mb-6 animate-in fade-in duration-300 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm shrink-0">
                    <FaRobot />
                </div>
            )}

            <div className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}>
                <div
                    className={`
                        px-4 py-3 text-sm leading-relaxed rounded-md
                        ${isUser
                            ? 'bg-primary text-white ml-auto'
                            : 'bg-gray-100 text-gray-800'
                        }
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
                <div className="w-8 h-8 rounded-full bg-[#6366f1] flex items-center justify-center text-white text-sm shrink-0">
                    <FaUser />
                </div>
            )}
        </div>
    );
});

AIChatMessageBubble.displayName = 'AIChatMessageBubble';

