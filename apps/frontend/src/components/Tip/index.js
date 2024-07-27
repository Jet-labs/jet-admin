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
export const Tip = ({ tip }) => {
  const theme = useTheme();
  const { themeType } = useThemeValue();
  return (
    <div
      style={{
        borderColor: theme.palette.divider,
        borderWidth: 0,
        borderRadius: 4,
        background: theme.palette.info.light + `20`,
      }}
      className="!p-2"
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
        class="prose lg:prose-xl !text-sm !text-wrap"
        children={tip}
        components={{
          code(props) {
            const { children, className, node, ...rest } = props;
            const match = /language-(\w+)/.exec(className || "");
            return match ? (
              <SyntaxHighlighter
                {...rest}
                PreTag="div"
                children={String(children).replace(/\n$/, "")}
                language={match[1]}
                style={themeType === "dark" ? materialDark : materialLight}
              />
            ) : (
              <code {...rest} className={className}>
                {children}
              </code>
            );
          },
        }}
      ></Markdown>
    </div>
  );
};
