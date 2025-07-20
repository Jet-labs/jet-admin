import React from "react";
import Markdown from 'react-markdown';
import PropTypes from "prop-types";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import remarkGfm from 'remark-gfm';

export const AIChatMarkdownRenderer = React.memo(({text}) => {
    return (
        <Markdown 
            remarkPlugins={[remarkGfm]} 
            components={{
                code(props) {

                    // eslint-disable-next-line react/prop-types
                    const { children, className, ...rest } = props
                    const match = /language-(\w+)/.exec(className || '')
                    return match ? (
                        <SyntaxHighlighter
                            {...rest}
                            PreTag="div"
                            language={match[1]}
                        >
                            {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                    ) : (
                        <code {...rest} className={className}>
                            {children}
                        </code>
                    )
                }
            }}
        >
            {text}
        </Markdown>
    )
})

AIChatMarkdownRenderer.displayName = 'AIChatMarkdownRenderer'
AIChatMarkdownRenderer.propTypes = {
    text: PropTypes.string.isRequired,
}
