import { useTheme } from "@mui/material";
import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import { githubLight } from "@uiw/codemirror-theme-github";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import CodeMirror from "@uiw/react-codemirror";
import { default as React } from "react";
import "react-data-grid/lib/styles.css";
import { useThemeValue } from "../../../../contexts/themeContext";

export const PGSQLQueryResponseJSONTab = ({ data }) => {
  const theme = useTheme();
  const { themeType } = useThemeValue();
  return (
    <CodeMirror
      value={JSON.stringify(data, null, 2)}
      height="400px"
      extensions={[loadLanguage("json")]}
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
