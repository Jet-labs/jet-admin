import { useTheme } from "@mui/material";
import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import { githubLight } from "@uiw/codemirror-theme-github";
import CodeMirror from "@uiw/react-codemirror";
import { default as React } from "react";
import "react-data-grid/lib/styles.css";

export const RESTAPIQueryResponseJSONTab = ({ json }) => {
  const theme = useTheme();
  return (
    <CodeMirror
      value={JSON.stringify(json, null, 2)}
      height="400px"
      extensions={[loadLanguage("json")]}
      theme={githubLight}
      style={{
        width: "100%",
        borderWidth: 1,
        borderColor: theme.palette.divider,
      }}
    />
  );
};
