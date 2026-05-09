import React, { useState, useRef, useEffect } from "react";
import { IoCodeOutline } from "react-icons/io5";
import { FiCopy, FiCheck, FiMaximize, FiMinimize } from "react-icons/fi";
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
              theme === "dark" ? "text-brand-light-gray" : "text-brand-light-gray"
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
                  theme === "dark" ? "text-brand-light-gray" : "text-brand-light-gray"
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
                theme === "dark" ? "text-brand-light-gray" : "text-brand-light-gray"
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
      className={`rounded-md overflow-y-auto border ${
        theme === "dark"
          ? "border-brand-border bg-brand-black"
          : "border-brand-border bg-brand-black"
      }`}
      style={{
        maxHeight: expanded ? "none" : maxHeight,
      }}
    >
      <div
        className={`flex items-center justify-between px-4 py-2 border-b ${
          theme === "dark"
            ? "bg-brand-black border-brand-border"
            : "bg-brand-dark border-brand-border"
        }`}
      >
        <div className="flex items-center space-x-2">
          <IoCodeOutline
            className={theme === "dark" ? "text-brand-light-gray" : "text-brand-light-gray"}
          />
          <span
            className={`text-xs font-medium ml-2 ${
              theme === "dark" ? "text-brand-light-gray" : "text-brand-light-gray"
            }`}
          >
            {getLanguageDisplay()}
          </span>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={toggleExpand}
            className={`text-xs py-1 px-2 rounded-sm flex items-center space-x-1 ${
              theme === "dark"
                ? "bg-brand-black hover:bg-brand-dark0 text-brand-light-gray"
                : "bg-brand-border-dark hover:bg-brand-black text-brand-light-gray"
            } transition-colors`}
          >
            {expanded ? <FiMinimize size={14} /> : <FiMaximize size={14} />}
            <span>{expanded ? "Collapse" : "Expand"}</span>
          </Button>
          <Button
            onClick={copyToClipboard}
            className={`text-xs py-1 px-2 rounded-sm flex items-center space-x-1 ${
              theme === "dark"
                ? "bg-brand-black hover:bg-brand-dark0 text-brand-light-gray"
                : "bg-brand-border-dark hover:bg-brand-black text-brand-light-gray"
            } transition-colors`}
          >
            {copied ? (
              <FiCheck size={14} className="text-green-500" />
            ) : (
              <FiCopy size={14} />
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
        } ${theme === "dark" ? "bg-brand-black" : "bg-brand-black"}`}
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
