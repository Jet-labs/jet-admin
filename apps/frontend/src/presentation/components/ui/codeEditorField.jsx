import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { sql } from "@codemirror/lang-sql";
import CodeMirror from "@uiw/react-codemirror";
import React, { useRef } from "react";

import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import { githubLight } from "@uiw/codemirror-theme-github";
import PropTypes from "prop-types";

const langMap = {
  javascript: javascript(),
  json: json(),
  sql: sql(),
  pgsql: loadLanguage("pgsql"),
};
export const CodeEditorField = ({
  readOnly,
  disabled,
  code,
  setCode,
  language = "json",
  height = "200px",
  outlined = true,
  rounded = true,
}) => {
  CodeEditorField.propTypes = {
    readOnly: PropTypes.bool,
    disabled: PropTypes.bool,
    code: PropTypes.string,
    setCode: PropTypes.func,
    language: PropTypes.string,
    height: PropTypes.string,
    outlined: PropTypes.bool,
    rounded: PropTypes.bool,
  };
  const ref = useRef();
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
