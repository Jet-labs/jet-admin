import { useTheme } from "@mui/material";
import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import { githubLight } from "@uiw/codemirror-theme-github";
import CodeMirror from "@uiw/react-codemirror";
import React from "react";
import "react-data-grid/lib/styles.css";

export const PGSQLQueryResponseSchemaTab = ({ dataSchema }) => {
  const theme = useTheme();
  return (
    <CodeMirror
      value={JSON.stringify(dataSchema, null, 2)}
      height="400px"
      theme={githubLight}
      extensions={[loadLanguage("json")]}
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
