import { githubLight } from "@uiw/codemirror-theme-github";
import CodeMirror from "@uiw/react-codemirror";
import React from "react";
import PropTypes from "prop-types";

export const QueryResponseRAWTab = ({ data }) => {
  QueryResponseRAWTab.propTypes = {
    data: PropTypes.object,
  };
  return (
    <div className="w-100 flex-grow h-full overflow-y-auto ">
      <CodeMirror
        value={JSON.stringify(data, null, 2)}
        // height="400px"
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
