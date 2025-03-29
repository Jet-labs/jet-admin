import React, { useState, useRef } from "react";

const CodeBlock = ({ code }) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef(null);

  const handleCopy = () => {
    if (codeRef.current) {
      navigator.clipboard.writeText(codeRef.current.textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative bg-gray-200 rounded-md p-4 overflow-x-auto">
      <pre
        className="text-sm text-slate-700 whitespace-pre-wrap break-words mt-5"
        ref={codeRef}
      >
        {code}
      </pre>
      <button
        className="absolute top-1 right-1 bg-gray-700/10 hover:bg-gray-600/10 text-slate-500 px-2 py-1 rounded-md text-xs focus:outline-none"
        onClick={handleCopy}
        type="button"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
};

export default CodeBlock;
