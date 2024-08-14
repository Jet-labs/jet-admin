import { useTheme } from "@mui/material";
import { githubLight } from "@uiw/codemirror-theme-github";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import CodeMirror from "@uiw/react-codemirror";
import React from "react";
import "react-data-grid/lib/styles.css";
import { useThemeValue } from "../../../../contexts/themeContext";

export const PGSQLQueryResponseRAWTab = ({ data }) => {
  const theme = useTheme();
  const { themeType } = useThemeValue();
  return (
    <CodeMirror
      value={JSON.stringify(data, null, 2)}
      height="400px"
      theme={themeType == "dark" ? vscodeDark : githubLight}
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
