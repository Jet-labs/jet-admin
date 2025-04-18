import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { sql } from "@codemirror/lang-sql";
import CodeMirror from "@uiw/react-codemirror";
import React, { useRef } from "react";
import { useTheme } from "@mui/material";
import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import { githubLight } from "@uiw/codemirror-theme-github";
import { EditorView } from "@codemirror/view"; // Add this import

const langMap = {
  javascript: javascript(),
  json: json(),
  sql: sql(),
  pgsql: loadLanguage("pgsql"),
};

export const PGSQLQueryEditor = ({
  readOnly,
  codeWrapping = true,
  disabled,
  code,
  setCode,
  language = "json",
  height = "200px",
  outlined = true,
  transparent = false,
  rounded = true,
}) => {
  const theme = useTheme();
  const ref = useRef();

  // Create an extension for line wrapping if enabled
  const lineWrappingExtension = codeWrapping ? [EditorView.lineWrapping] : [];

  return (
    <CodeMirror
      readOnly={readOnly || disabled}
      ref={ref}
      value={code}
      height={height}
      width="100%"
      maxWidth="1000px"
      extensions={[
        langMap[language],
        ...lineWrappingExtension, // Add the line wrapping extension here
      ]}
      onChange={setCode}
      theme={githubLight}
      basicSetup={{
        closeBrackets: true,
        indentOnInput: true,
      }}
      style={{
        borderWidth: outlined ? 1 : 0,
        borderRadius: outlined ? 4 : 0,
      }}
      className={
        rounded
          ? "codemirror-editor-rounded border-slate-300 focus:border-slate-700 !border !border-solid !focus:!border-solid"
          : "border-slate-300 focus:border-slate-700"
      }
      indentWithTab={true}
    />
  );
};
