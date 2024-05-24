import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { dracula } from "@uiw/codemirror-theme-dracula";
import "./style.css";
export const CodeEditor = ({ code, setCode }) => {
  return (
    <CodeMirror
      value={code}
      height="200px"
      width="100%"
      maxWidth="1000px"
      extensions={[javascript({ jsx: true })]}
      onChange={setCode}
      theme={dracula}
    />
  );
};
