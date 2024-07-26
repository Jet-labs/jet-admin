import React, { useRef } from "react";
import CodeMirror, { useCodeMirror } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { sql } from "@codemirror/lang-sql";
import { githubLight } from "@uiw/codemirror-theme-github";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { useTheme } from "@mui/material";
import { useThemeValue } from "../../contexts/themeContext";
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
  height = "200px",
  outlined = true,
  transparent = false,
}) => {
  const theme = useTheme();
  // const {} = useCodeMirror();
  const ref = useRef();
  const { themeType } = useThemeValue();
  // ref?.current?.indentLine(1);
  return (
    <CodeMirror
      readOnly={readOnly || disabled}
      ref={ref}
      value={code}
      height={height}
      width="100%"
      maxWidth="1000px"
      extensions={[langMap[language]]}
      onChange={setCode}
      theme={themeType == "dark" ? vscodeDark : githubLight}
      basicSetup={{
        closeBrackets: true,
        indentOnInput: true,
      }}
      style={{
        borderWidth: outlined ? 1 : 0,
        borderColor: theme.palette.divider,
        borderRadius: outlined ? 4 : 0,
      }}
      className="codemirror-editor-rounded"
      indentWithTab={true}
    />
  );
};
