import { useTheme } from "@mui/material";
import { githubLight } from "@uiw/codemirror-theme-github";
import CodeMirror from "@uiw/react-codemirror";
import React from "react";
import "react-data-grid/lib/styles.css";

export const RESTAPIQueryResponseRAWTab = ({ json }) => {
  const theme = useTheme();
  return (
    <CodeMirror
      value={JSON.stringify(json, null, 2)}
      height="400px"
      theme={githubLight}
      style={{
        width: "100%",
        borderWidth: 1,
        borderColor: theme.palette.divider,
        borderRadius: 4,
      }}
      className="codemirror-editor-rounded"
    />
  );
};
