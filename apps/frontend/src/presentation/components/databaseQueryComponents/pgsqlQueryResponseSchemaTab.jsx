import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import { githubLight } from "@uiw/codemirror-theme-github";
import CodeMirror from "@uiw/react-codemirror";
import React from "react";
import "react-data-grid/lib/styles.css";
import jsonSchemaGenerator from "to-json-schema";
export const PGSQLQueryResponseSchemaTab = ({ data }) => {
  const dataSchema = jsonSchemaGenerator(
    data ? data : { arrays: { mode: "all" } }
  );
  return (
    <div className="w-100 flex-grow h-full overflow-y-auto ">
      <CodeMirror
        value={JSON.stringify(dataSchema, null, 2)}
        // height="400px"
        theme={githubLight}
        extensions={[loadLanguage("json")]}
        style={{
          width: "100%",
          borderWidth: 0,
          borderBottomWidth: 1,
          outline: "none",
        }}
        className="border-slate-300 focus:border-slate-300 focus:outline-slate-300 flex-grow non-focusable-code-editor !h-full"
      />
    </div>
  );
};
