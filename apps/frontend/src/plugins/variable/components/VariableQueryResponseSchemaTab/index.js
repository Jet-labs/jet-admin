import { useTheme } from "@mui/material";
import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import { githubLight } from "@uiw/codemirror-theme-github";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import CodeMirror from "@uiw/react-codemirror";
import React from "react";
import "react-data-grid/lib/styles.css";
import jsonSchemaGenerator from "to-json-schema";
import { useThemeValue } from "../../../../contexts/themeContext";
export const VariableQueryResponseSchemaTab = ({ data }) => {
  const theme = useTheme();
  const { themeType } = useThemeValue();
  const dataSchema = jsonSchemaGenerator(data);
  return (
    <CodeMirror
      value={JSON.stringify(dataSchema, null, 2)}
      height="400px"
      theme={themeType == "dark" ? vscodeDark : githubLight}
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
