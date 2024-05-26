import React, { useRef } from "react";
import CodeMirror, { useCodeMirror } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { sql } from "@codemirror/lang-sql";
import { dracula } from "@uiw/codemirror-theme-dracula";
import "./style.css";
const langMap = {
  javascript: javascript(),
  json: json(),
  sql: sql(),
};
export const CodeEditor = ({
  readOnly,
  disabled,
  code,
  setCode,
  language = "json",
}) => {
  // const {} = useCodeMirror();
  const ref = useRef();
  // ref?.current?.indentLine(1);
  return (
    <CodeMirror
      readOnly={readOnly || disabled}
      ref={ref}
      value={code}
      height="200px"
      width="100%"
      maxWidth="1000px"
      extensions={[langMap[language]]}
      onChange={setCode}
      theme={dracula}
      basicSetup={{
        closeBrackets: true,
        indentOnInput: true,
      }}
      indentWithTab={true}
    />
  );
};
