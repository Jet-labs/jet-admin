import React from "react"; // useEffect, useMemo, useRef are not strictly needed for this basic version
import Editor from "@monaco-editor/react";
import GithubLight from 'monaco-themes/themes/GitHub Light.json';
import PropTypes from "prop-types"; // Keep PropTypes

// Define the name we'll use for the GitHub Light theme in Monaco
const GITHUB_LIGHT_THEME_NAME = 'github-light';

export const CodeEditorField = ({
  readOnly,
  disabled, // disabled prop will also make it readOnly in Monaco
  code,
  setCode,
  language = "json", // Monaco supports 'json', 'javascript', 'sql', 'pgsql' directly
  height = "200px",
  outlined = true,
  rounded = true,
}) => {
  // PropTypes should be defined outside the component function body
  CodeEditorField.propTypes = {
    readOnly: PropTypes.bool,
    disabled: PropTypes.bool,
    code: PropTypes.string,
    setCode: PropTypes.func.isRequired, // setCode is essential
    language: PropTypes.string,
    height: PropTypes.string,
    outlined: PropTypes.bool,
    rounded: PropTypes.bool,
  };

  const handleEditorWillMount = (monaco) => {
    // Register the GitHub Light theme using the imported JSON data
    monaco.editor.defineTheme(GITHUB_LIGHT_THEME_NAME, GithubLight);
  };

  // Monaco options corresponding to CodeMirror's basicSetup and indentWithTab
  const editorOptions = {
    readOnly: readOnly || disabled, // Map CodeMirror's readOnly/disabled to Monaco's readOnly option
    autoClosingBrackets: 'always', // Corresponds to closeBrackets: true
    autoClosingQuotes: 'always', // Often desired with autoClosingBrackets
    insertSpaces: false, // Use tabs instead of spaces for indentation
    tabSize: 4, // Set tab size (Monaco default is 4)
    minimap: { enabled: false }, // Disable minimap (often desired for smaller editors)
    // You can add other options here based on your needs
    fontSize: 12, // Example font size
    lineNumbers: 'on', // Show line numbers
    scrollBeyondLastLine: false, // Don't allow scrolling past the last line
    lineNumbersMinChars: 2,
    folding: false,
  };

  return (
    <div className={`${rounded ? "rounded-sm" : ""} ${outlined ? "border border-slate-200 focus:border-[#646cff]/10" : ""} overflow-hidden min-w-[300px]`}>
      <Editor
        height={height}
        defaultLanguage={language} // Set the language
        value={code}
        onChange={(value) => setCode(value || "")} // Use the Monaco onChange signature
        beforeMount={handleEditorWillMount} // Register theme here
        options={editorOptions} // Apply the configured options
        theme={GITHUB_LIGHT_THEME_NAME} // Apply the registered theme by name
      />
    </div>
  );
};