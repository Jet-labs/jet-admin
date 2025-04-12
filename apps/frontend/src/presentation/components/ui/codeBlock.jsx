import React, { useState, useRef, useEffect } from "react";
import { IoCodeOutline } from "react-icons/io5";
import { FiCopy, FiCheck, FiMaximize, FiMinimize } from "react-icons/fi";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-light.css";

// Enhanced CodeBlock component
export const CodeBlock = ({
  code,
  language = "plaintext",
  showLineNumbers = false,
  wrapText = true,
  maxHeight = "500px",
  theme = "light", // Can be 'light' or 'dark'
}) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState("");
  const codeRef = useRef(null);

  // Handle syntax highlighting
  // Inside the useEffect for highlighting
  useEffect(() => {
    if (code) {
      try {
        if (language === "plaintext") {
          // For plaintext, don't use highlight.js but create properly escaped HTML
          const escaped = code
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
          setHighlightedCode(escaped);
        } else {
          // For other languages, use highlight.js
          const highlighted = hljs.highlight(code, { language }).value;
          setHighlightedCode(highlighted);
        }
      } catch (error) {
        // If language not supported, fallback to auto detection
        const highlighted = hljs.highlightAuto(code).value;
        setHighlightedCode(highlighted);
      }
    }
  }, [code, language]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  // Add line numbers and syntax highlighting
  // Modify the renderCodeWithLineNumbers function
  const renderCodeWithLineNumbers = () => {
    const lines = code.split("\n");

    return lines.map((line, index) => (
      <div key={index} className="flex">
        {showLineNumbers && (
          <div
            className={`text-xs w-8 text-right pr-2 select-none ${
              theme === "dark" ? "text-gray-500" : "text-gray-400"
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
                  theme === "dark" ? "text-gray-200" : "text-gray-800"
                }`}
              >
                {line || " "}
              </pre>
            ) : (
              <div
                dangerouslySetInnerHTML={{
                  __html: line
                    ? highlightedCode.split("\n")[index] || line
                    : " ",
                }}
              />
            )
          ) : (
            <pre
              className={`${
                theme === "dark" ? "text-gray-200" : "text-gray-800"
              }`}
            >
              {line || " "}
            </pre>
          )}
        </div>
      </div>
    ));
  };

  // For raw HTML display when using highlight.js
  const renderHighlightedCode = () => {
    return (
      <pre
        className={`${showLineNumbers ? "pl-10" : ""}`}
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
      />
    );
  };

  // Detect language name for display
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
      className={`rounded-md overflow-hidden border ${
        theme === "dark"
          ? "border-gray-700 bg-gray-800"
          : "border-gray-200 bg-white"
      }`}
      style={{
        maxHeight: expanded ? "none" : maxHeight,
      }}
    >
      <div
        className={`flex items-center justify-between px-4 py-2 border-b ${
          theme === "dark"
            ? "bg-gray-700 border-gray-600"
            : "bg-gray-50 border-gray-200"
        }`}
      >
        <div className="flex items-center space-x-2">
          <IoCodeOutline
            className={theme === "dark" ? "text-gray-300" : "text-gray-500"}
          />
          <span
            className={`text-xs font-medium ml-2 ${
              theme === "dark" ? "text-gray-300" : "text-gray-500"
            }`}
          >
            {getLanguageDisplay()}
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={toggleExpand}
            className={`text-xs py-1 px-2 rounded flex items-center space-x-1 ${
              theme === "dark"
                ? "bg-gray-600 hover:bg-gray-500 text-gray-200"
                : "bg-gray-100 hover:bg-gray-200 text-gray-600"
            } transition-colors`}
          >
            {expanded ? <FiMinimize size={14} /> : <FiMaximize size={14} />}
            <span>{expanded ? "Collapse" : "Expand"}</span>
          </button>
          <button
            onClick={copyToClipboard}
            className={`text-xs py-1 px-2 rounded flex items-center space-x-1 ${
              theme === "dark"
                ? "bg-gray-600 hover:bg-gray-500 text-gray-200"
                : "bg-gray-100 hover:bg-gray-200 text-gray-600"
            } transition-colors`}
          >
            {copied ? (
              <FiCheck size={14} className="text-green-500" />
            ) : (
              <FiCopy size={14} />
            )}
            <span>{copied ? "Copied!" : "Copy"}</span>
          </button>
        </div>
      </div>
      <div
        ref={codeRef}
        className={`p-4 font-mono text-sm overflow-y-auto ${
          wrapText
            ? "whitespace-pre-wrap break-words"
            : "whitespace-pre overflow-x-auto"
        } ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
      >
        {renderCodeWithLineNumbers()}
      </div>
    </div>
  );
};

// Usage example:
// <CodeBlock
//   code="const hello = 'world';\nconsole.log(hello);"
//   language="javascript"
//   showLineNumbers={true}
//   wrapText={true}
//   maxHeight="300px"
//   theme="light"
// />
