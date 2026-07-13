import React, { useState, useRef, useEffect } from "react";
import { Check, Code, Copy, Maximize, Minimize } from 'lucide-react';

import hljs from "highlight.js";
import "highlight.js/styles/atom-one-light.css";
import PropTypes from "prop-types";

import { Button } from "@jet-admin/ui";
export const CodeBlock = ({
  code,
  language = "plaintext",
  showLineNumbers = false,
  wrapText = true,
  maxHeight = "500px",
  theme = "light",
}) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState("");
  const [displayedCode, setDisplayedCode] = useState(code || "");
  const codeRef = useRef(null);

  useEffect(() => {
    if (typeof code !== "string") {
      setDisplayedCode("");
      setHighlightedCode("");
      return;
    }

    let processedCode = code;

    // Format JSON if the language is JSON
    if (language === "json") {
      try {
        const parsed = JSON.parse(code);
        processedCode = JSON.stringify(parsed, null, 2);
      } catch (error) {
        console.warn("Invalid JSON provided. Will display as-is.", error);
      }
    }

    setDisplayedCode(processedCode);

    // Syntax highlight the processed code
    try {
      if (language === "plaintext") {
        const escaped = processedCode
          .replace(/&/g, "&amp;")
          .replace(/</g, "<")
          .replace(/>/g, ">");
        setHighlightedCode(escaped);
      } else {
        const highlighted = hljs.highlight(processedCode, { language }).value;
        setHighlightedCode(highlighted);
      }
    } catch (error) {
      console.warn(
        "Failed to highlight code. Falling back to auto-detect.",
        error
      );
      const highlighted = hljs.highlightAuto(processedCode).value;
      setHighlightedCode(highlighted);
    }
  }, [code, language]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(displayedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  useEffect(() => {
    console.log("CodeBlock: code changed", code);
  }, [code]);

  const renderCodeWithLineNumbers = () => {
    const lines = (displayedCode || "").split("\n");

    return lines.map((line, index) => (
      <div key={index} className="flex">
        {showLineNumbers && (
          <div
            className={`text-xs w-8 text-right pr-2 select-none ${
              theme === "dark" ? "text-muted-foreground/70" : "text-muted-foreground/70"
            }`}
          >
            {index + 1}
          </div>
        )}
        <div className="flex-1">
          {highlightedCode ? (
            language === "plaintext" ? (
              <pre
                className={`${
                  theme === "dark" ? "text-muted-foreground/70" : "text-muted-foreground/70"
                }`}
              >
                {line || " "}
              </pre>
            ) : (
              <div
                dangerouslySetInnerHTML={{
                  __html: highlightedCode.split("\n")[index] || line || " ",
                }}
              />
            )
          ) : (
            <pre
              className={`${
                theme === "dark" ? "text-muted-foreground/70" : "text-muted-foreground/70"
              }`}
            >
              {line || " "}
            </pre>
          )}
        </div>
      </div>
    ));
  };

  const getLanguageDisplay = () => {
    const languageMap = {
      js: "JavaScript",
      jsx: "React JSX",
      ts: "TypeScript",
      tsx: "React TSX",
      py: "Python",
      java: "Java",
      c: "C",
      cpp: "C++",
      cs: "C#",
      go: "Go",
      html: "HTML",
      css: "CSS",
      json: "JSON",
      md: "Markdown",
      php: "PHP",
      rb: "Ruby",
      rust: "Rust",
      sql: "SQL",
      sh: "Shell",
      xml: "XML",
      yaml: "YAML",
      plaintext: "Plain Text",
    };

    return (
      languageMap[language] ||
      language.charAt(0).toUpperCase() + language.slice(1)
    );
  };

  return (
    <div
      className={`rounded overflow-y-auto border ${
        theme === "dark"
          ? "border-border bg-background"
          : "border-border bg-background"
      }`}
      style={{
        maxHeight: expanded ? "none" : maxHeight,
      }}
    >
      <div
        className={`flex items-center justify-between px-4 py-2 border-b ${
          theme === "dark"
            ? "bg-background border-border"
            : "bg-background border-border"
        }`}
      >
        <div className="flex items-center space-x-2">
          <Code
            className={theme === "dark" ? "text-muted-foreground/70" : "text-muted-foreground/70"}
          />
          <span
            className={`text-xs font-medium ml-2 ${
              theme === "dark" ? "text-muted-foreground/70" : "text-muted-foreground/70"
            }`}
          >
            {getLanguageDisplay()}
          </span>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={toggleExpand}
            className={`text-xs py-1 px-2 rounded flex items-center space-x-1 ${
              theme === "dark"
                ? "bg-background hover:bg-background0 text-muted-foreground/70"
                : "bg-muted hover:bg-foreground/10 text-muted-foreground/70"
            } transition-colors`}
          >
            {expanded ? <Minimize size={14} /> : <Maximize size={14} />}
            <span>{expanded ? "Collapse" : "Expand"}</span>
          </Button>
          <Button
            onClick={copyToClipboard}
            className={`text-xs py-1 px-2 rounded flex items-center space-x-1 ${
              theme === "dark"
                ? "bg-background hover:bg-background0 text-muted-foreground/70"
                : "bg-muted hover:bg-foreground/10 text-muted-foreground/70"
            } transition-colors`}
          >
            {copied ? (
              <Check size={14} className="text-green-500" />
            ) : (
              <Copy size={14} />
            )}
            <span>{copied ? "Copied!" : "Copy"}</span>
          </Button>
        </div>
      </div>
      <div
        ref={codeRef}
        className={`p-4 font-mono text-sm overflow-y-auto h-full ${
          wrapText
            ? "whitespace-pre-wrap break-words"
            : "whitespace-pre overflow-x-auto"
        } ${theme === "dark" ? "bg-background" : "bg-background"}`}
      >
        {renderCodeWithLineNumbers()}
      </div>
    </div>
  );
};

CodeBlock.propTypes = {
  code: PropTypes.string.isRequired,
  language: PropTypes.string,
  showLineNumbers: PropTypes.bool,
  wrapText: PropTypes.bool,
  maxHeight: PropTypes.string,
  theme: PropTypes.string,
};
