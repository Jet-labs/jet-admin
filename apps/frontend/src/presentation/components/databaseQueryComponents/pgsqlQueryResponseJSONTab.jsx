import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import { githubLight } from "@uiw/codemirror-theme-github";
import CodeMirror from "@uiw/react-codemirror";
import PropTypes from "prop-types";
import React from "react";

export const PGSQLQueryResponseJSONTab = ({ data }) => {
  PGSQLQueryResponseJSONTab.propTypes = {
    data: PropTypes.object,
  };
  return (
    <div className="w-100 flex-grow h-full overflow-y-auto ">
      <CodeMirror
        value={JSON.stringify(data, null, 2)}
        // height="400px"
        extensions={[loadLanguage("json")]}
        theme={githubLight}
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
