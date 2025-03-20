import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { sql } from "@codemirror/lang-sql";
import CodeMirror from "@uiw/react-codemirror";
import React, { useRef } from "react";

import { useTheme } from "@mui/material";
import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import { githubLight } from "@uiw/codemirror-theme-github";
const langMap = {
  javascript: javascript(),
  json: json(),
  sql: sql(),
  pgsql: loadLanguage("pgsql"),
};
export const PGSQLQueryEditor = ({
  readOnly,
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
  // const {} = useCodeMirror();
  const ref = useRef();
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
