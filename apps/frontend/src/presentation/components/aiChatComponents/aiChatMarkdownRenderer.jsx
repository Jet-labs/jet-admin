import React from "react";
import Markdown from 'react-markdown';
import PropTypes from "prop-types";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
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
                        <div className="my-3 rounded-lg overflow-hidden border border-gray-200">
                            <SyntaxHighlighter
                                {...rest}
                                PreTag="div"
                                language={match[1]}
                                style={atomDark}
                                customStyle={{ margin: 0, borderRadius: 0, fontSize: '13px' }}
                            >
                                {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                        </div>
                    ) : (
                            <code {...rest} className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-sm font-mono">
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
