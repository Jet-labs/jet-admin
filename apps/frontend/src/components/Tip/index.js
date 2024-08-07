import React from "react";
import Markdown from "react-markdown";
// import Markdown from "markdown-to-jsx";
import { Typography, useTheme } from "@mui/material";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  materialDark,
  materialLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useThemeValue } from "../../contexts/themeContext";
import { MdTipsAndUpdates } from "react-icons/md";
import "./styles.css";
export const Tip = ({ tip }) => {
  const theme = useTheme();
  const { themeType } = useThemeValue();
  return (
    <div
      style={{
        borderColor: theme.palette.info.border,
        borderWidth: 1,
        borderRadius: 4,
        background: theme.palette.background.info,
      }}
      className="!p-4"
    >
      <div className="!flex !flex-row !justify-start !items-center  !mb-2">
        <MdTipsAndUpdates
          className="!text-lg"
          style={{ color: theme.palette.warning.main }}
        />
        <span
          style={{ color: theme.palette.warning.main }}
          className="!font-semibold !text-sm ml-1"
        >
          Tip
        </span>
      </div>

      <Markdown
        remarkPlugins={[remarkGfm]}
        options={{}}
        className={`!text-sm !text-wrap  ${
          themeType === "dark"
            ? `dark:prose prose-pre:!bg-[#1b1b1b] prose-code:!text-[#91aeff] !text-slate-400 prose-strong:!text-slate-200  prose-th:!text-slate-50 prose-th:!text-start`
            : `!prose prose-pre:!bg-[#e6e6e6] prose-code:!text-[${theme.palette.primary.main}] prose-code:!text-[#0f2663] prose-th:text-start prose-th:!font-bold`
        } `}
        children={tip}
      ></Markdown>
    </div>
  );
};
