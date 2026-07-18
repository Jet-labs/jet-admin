"use client";

import { useEffect, useRef, useCallback } from "react";
import { useState } from "react";
import { cn } from "../../lib/utils";
import {
    ImageIcon,
    Figma,
    MonitorIcon,
    XIcon,
    LoaderIcon,
    Sparkles,
    Command,
    Paperclip,
    SendIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react"

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            textarea.style.height = `${minHeight}px`;
            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

interface CommandSuggestion {
    icon: React.ReactNode;
    label: string;
    description: string;
    prefix: string;
}

interface AnimatedAIChatProps {
    docked?: boolean;
    value: string;
    onChange: (val: string) => void;
    onSend: (val: string) => void;
    busy: boolean;
}

export function AnimatedAIChat({
    docked = false,
    value = "",
    onChange,
    onSend,
    busy,
}: AnimatedAIChatProps) {
    const [attachments, setAttachments] = useState<string[]>([]);
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const [activeSuggestion, setActiveSuggestion] = useState<number>(-1);
    const [recentCommand, setRecentCommand] = useState<string | null>(null);
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 52,
        maxHeight: 180,
    });
    const [isFocused, setIsFocused] = useState(false);
    const commandPaletteRef = useRef<HTMLDivElement>(null);

    const commandSuggestions: CommandSuggestion[] = [
        { 
            icon: <ImageIcon className="w-3.5 h-3.5" />, 
            label: "Clone UI", 
            description: "Generate a UI from a screenshot", 
            prefix: "/clone" 
        },
        { 
            icon: <Figma className="w-3.5 h-3.5" />, 
            label: "Import Figma", 
            description: "Import a design from Figma", 
            prefix: "/figma" 
        },
        { 
            icon: <MonitorIcon className="w-3.5 h-3.5" />, 
            label: "Create Page", 
            description: "Generate a new web page", 
            prefix: "/page" 
        },
        { 
            icon: <Sparkles className="w-3.5 h-3.5" />, 
            label: "Improve", 
            description: "Improve existing UI design", 
            prefix: "/improve" 
        },
    ];

    useEffect(() => {
        if (value.startsWith('/') && !value.includes(' ')) {
            setShowCommandPalette(true);
            
            const matchingSuggestionIndex = commandSuggestions.findIndex(
                (cmd) => cmd.prefix.startsWith(value)
            );
            
            if (matchingSuggestionIndex >= 0) {
                setActiveSuggestion(matchingSuggestionIndex);
            } else {
                setActiveSuggestion(-1);
            }
        } else {
            setShowCommandPalette(false);
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const commandButton = document.querySelector('[data-command-button]');
            
            if (commandPaletteRef.current && 
                !commandPaletteRef.current.contains(target) && 
                !commandButton?.contains(target)) {
                setShowCommandPalette(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        setTimeout(() => textareaRef.current?.focus(), 150);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (showCommandPalette) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveSuggestion(prev => 
                    prev < commandSuggestions.length - 1 ? prev + 1 : 0
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveSuggestion(prev => 
                    prev > 0 ? prev - 1 : commandSuggestions.length - 1
                );
            } else if (e.key === 'Tab' || e.key === 'Enter') {
                e.preventDefault();
                if (activeSuggestion >= 0) {
                    const selectedCommand = commandSuggestions[activeSuggestion];
                    onChange(selectedCommand.prefix + ' ');
                    setShowCommandPalette(false);
                    
                    setRecentCommand(selectedCommand.label);
                    setTimeout(() => setRecentCommand(null), 3500);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setShowCommandPalette(false);
            }
        } else if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim()) {
                onSend(value);
                setTimeout(() => adjustHeight(true), 50);
            }
        }
    };

    const handleAttachFile = () => {
        const mockFileName = `file-${Math.floor(Math.random() * 1000)}.pdf`;
        setAttachments(prev => [...prev, mockFileName]);
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };
    
    const selectCommandSuggestion = (index: number) => {
        const selectedCommand = commandSuggestions[index];
        onChange(selectedCommand.prefix + ' ');
        setShowCommandPalette(false);
        
        setRecentCommand(selectedCommand.label);
        setTimeout(() => {
            setRecentCommand(null);
            adjustHeight();
        }, 100);
    };

    const inputCard = (
        <motion.div 
            className={cn(
                "relative bg-card border rounded-lg shadow-sm transition-all duration-200 w-full",
                isFocused 
                    ? "border-primary/80 shadow-[0_0_0_1px_rgba(117,130,255,0.25)]" 
                    : "border-border"
            )}
            initial={{ scale: 0.99 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.05 }}
        >
            <AnimatePresence>
                {showCommandPalette && (
                    <motion.div 
                        ref={commandPaletteRef}
                        className="absolute left-2 right-2 bottom-full mb-1 bg-popover rounded-lg z-50 shadow-md border border-border overflow-hidden"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.12 }}
                    >
                        <div className="p-1 bg-popover">
                            {commandSuggestions.map((suggestion, index) => (
                                <motion.div
                                    key={suggestion.prefix}
                                    className={cn(
                                        "flex items-center gap-2 px-2.5 py-2 text-xs transition-colors cursor-pointer rounded",
                                        activeSuggestion === index 
                                            ? "bg-primary/10 text-primary font-medium" 
                                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                    )}
                                    onClick={() => selectCommandSuggestion(index)}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.02 }}
                                >
                                    <div className="w-4 h-4 flex items-center justify-center opacity-85 shrink-0">
                                        {suggestion.icon}
                                    </div>
                                    <div className="flex-1 truncate">{suggestion.label}</div>
                                    <div className="text-xs font-mono opacity-50 px-1 border border-border rounded shrink-0">
                                        {suggestion.prefix}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="p-1">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        adjustHeight();
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Ask anything about your tenant…"
                    disabled={busy}
                    style={{ boxShadow: 'none' }}
                    className="w-full px-2 py-2 resize-none bg-transparent border-none text-foreground text-sm focus:outline-none placeholder:text-muted-foreground/40 leading-6 min-h-[52px]"
                />
            </div>

            <AnimatePresence>
                {attachments.length > 0 && (
                    <motion.div 
                        className="px-2 flex gap-2 flex-wrap"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        {attachments.map((file, index) => (
                            <motion.div
                                key={index}
                                className="flex items-center gap-2 text-xs bg-muted/40 py-1 px-2.5 rounded-full text-muted-foreground border border-border/50"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <span className="truncate max-w-[120px]">{file}</span>
                                <button 
                                    onClick={() => removeAttachment(index)}
                                    className="text-muted-foreground/60 hover:text-foreground transition-colors"
                                >
                                    <XIcon className="w-3 h-3" />
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="p-2 border-t border-border flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <motion.button
                        type="button"
                        onClick={handleAttachFile}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 text-muted-foreground hover:text-foreground rounded hover:bg-muted/50 transition-colors"
                    >
                        <Paperclip className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                        type="button"
                        data-command-button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowCommandPalette(prev => !prev);
                        }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                            "p-2 text-muted-foreground hover:text-foreground rounded hover:bg-muted/50 transition-colors",
                            showCommandPalette && "bg-muted text-foreground"
                        )}
                    >
                        <Command className="w-4 h-4" />
                    </motion.button>
                </div>
                
                <button
                    type="button"
                    onClick={() => {
                        console.log("ON CLICK TRIGGERED", value);
                        onSend(value);
                        setTimeout(() => adjustHeight(true), 50);
                    }}
                    disabled={busy || !value.trim()}
                    className={cn(
                        "h-8 px-3 rounded text-xs font-medium transition-all flex items-center gap-2",
                        value.trim()
                            ? "bg-primary text-foreground hover:bg-primary/90 shadow-sm hover:scale-[1.01] active:scale-[0.98]"
                            : "bg-muted text-muted-foreground/40 cursor-not-allowed"
                    )}
                >
                    {busy ? (
                        <LoaderIcon className="w-3.5 h-3.5 animate-[spin_2s_linear_infinite]" />
                    ) : (
                        <SendIcon className="w-3.5 h-3.5" />
                    )}
                    <span>Send</span>
                </button>
            </div>
        </motion.div>
    );

    if (docked) {
        return inputCard;
    }

    return (
        <div className="w-full flex flex-col items-center justify-center bg-background text-foreground p-2 relative overflow-hidden">
            <div className="w-full max-w-2xl mx-auto relative">
                <motion.div 
                    className="relative z-10 space-y-4 w-full"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                >
                    <div className="text-center space-y-1">
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.4 }}
                            className="inline-block"
                        >
                            <h1 className="text-2xl font-medium tracking-tight text-foreground pb-1">
                                How can I help today?
                            </h1>
                            <motion.div 
                                className="h-px bg-border/50"
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: "100%", opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                            />
                        </motion.div>
                        <motion.p 
                            className="text-xs text-muted-foreground/70"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            Type a command or ask a question
                        </motion.p>
                    </div>

                    {inputCard}

                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {commandSuggestions.map((suggestion, index) => (
                            <motion.button
                                key={suggestion.prefix}
                                onClick={() => selectCommandSuggestion(index)}
                                className="flex items-center gap-2 px-2 py-1 bg-muted/40 hover:bg-muted border border-border/80 rounded text-xs text-muted-foreground hover:text-foreground transition-all relative group"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <span className="opacity-70 group-hover:text-primary transition-colors">
                                    {suggestion.icon}
                                </span>
                                <span>{suggestion.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
