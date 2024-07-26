import { useTheme } from "@mui/material";
import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import { githubLight } from "@uiw/codemirror-theme-github";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import CodeMirror from "@uiw/react-codemirror";
import React from "react";
import "react-data-grid/lib/styles.css";
import { useThemeValue } from "../../../../contexts/themeContext";

export const VariableQueryEditor = ({ value, handleChange }) => {
  const theme = useTheme();
  const { themeType } = useThemeValue();

  const _handleOnVariableQueryChange = (value) => {
    handleChange({ variable_value: value });
  };

  return (
    <CodeMirror
      value={value ? value.variable_value : ""}
      height="200px"
      extensions={[loadLanguage("javascript")]}
      onChange={_handleOnVariableQueryChange}
      theme={themeType == "dark" ? vscodeDark : githubLight}
      style={{
        marginTop: 20,
        width: "100%",
        borderWidth: 1,
        borderColor: theme.palette.divider,
        borderRadius: 4,
      }}
      className="codemirror-editor-rounded"
    />
  );
};
