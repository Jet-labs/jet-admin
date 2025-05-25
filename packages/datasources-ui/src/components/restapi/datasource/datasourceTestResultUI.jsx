import React from "react";
import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import { githubLight } from "@uiw/codemirror-theme-github";
import CodeMirror from "@uiw/react-codemirror";
export const RESTAPIDatasourceTestResultUI = ({ connectionResult }) => {
  const statusClasses = connectionResult
    ? "bg-green-100 !border-green-400 text-green-700" // Green for success
    : "bg-red-100 !border-red-400 text-red-700"; // Red for failure

  return (
    <div className="p-3 flex flex-col justify-start items-start h-full w-full">
      <div
        className={`w-full flex flex-col justify-start items-start p-3 rounded-md border ${statusClasses}`}
      >
        <div className="!flex !flex-row justify-start items-center">
          <span className="!text-sm !font-normal">
            {connectionResult ? "Connection successful" : "Connection failed"}
          </span>
        </div>
      </div>
      <div className="w-full flex-grow h-full overflow-y-auto border border-slate-200 rounded mt-3">
        <CodeMirror
          value={JSON.stringify(connectionResult, null, 2)}
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
    </div>
  );
};
