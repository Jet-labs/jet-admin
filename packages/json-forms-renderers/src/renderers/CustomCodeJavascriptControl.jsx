// Custom Code JavaScript Control Renderer with Monaco Editor
import React from 'react';
import PropTypes from 'prop-types';
import Editor from '@monaco-editor/react';
import GithubTheme from 'monaco-themes/themes/GitHub Light.json';

export const CustomCodeJavascriptControl = ({
  data,
  path,
  label,
  description,
  errors,
  handleChange,
  enabled,
  uischema,
}) => {
  const { placeholder, hint } = uischema.options || {};
  const rows = uischema.options?.rows || 10;
  const height = rows * 20 + 'px'; // Approximate line height

  const handleEditorWillMount = (monaco) => {
    // Define GitHub Light theme
    monaco.editor.defineTheme('github-light', GithubTheme);
    
    // Add custom completions for workflow context
    monaco.languages.registerCompletionItemProvider('javascript', {
      triggerCharacters: ['.'],
      provideCompletionItems: (model, position) => {
        const wordInfo = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: wordInfo.startColumn,
          endColumn: wordInfo.endColumn,
        };
        
        const suggestions = [];
        
        // Check if we're typing after 'ctx.'
        const textBefore = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });
        
        if (textBefore.endsWith('ctx.')) {
          // Context variable suggestions would come from workflow nodes
          // For now provide basic hints
          suggestions.push({
            label: '/* Available context variables */',
            kind: monaco.languages.CompletionItemKind.Text,
            insertText: '',
            detail: 'Access results from previous nodes using ctx.variableName',
            range,
          });
        }
        
        // Common JavaScript suggestions
        const jsKeywords = [
          { label: 'return', detail: 'Return statement' },
          { label: 'const', detail: 'Constant declaration' },
          { label: 'let', detail: 'Variable declaration' },
          { label: 'ctx', detail: 'Workflow context object' },
          { label: 'console.log', detail: 'Log to console' },
          { label: 'JSON.stringify', detail: 'Convert to JSON string' },
          { label: 'JSON.parse', detail: 'Parse JSON string' },
          { label: 'Array.isArray', detail: 'Check if array' },
          { label: 'Object.keys', detail: 'Get object keys' },
          { label: 'Object.values', detail: 'Get object values' },
        ];
        
        jsKeywords.forEach((kw) => {
          suggestions.push({
            label: kw.label,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: kw.label,
            detail: kw.detail,
            range,
          });
        });
        
        return { suggestions };
      },
    });
  };

  return (
    <div className="mb-3">
      <label
        htmlFor={path}
        className={`block mb-1 text-xs font-medium ${
          errors && errors.length > 0 ? 'text-red-500' : 'text-slate-500'
        }`}
      >
        {label || description} {errors && errors.length > 0 && errors}
      </label>
      
      {hint && (
        <p className="text-[10px] text-slate-400 mb-1">{hint}</p>
      )}
      
      <div className="border border-slate-200 rounded p-1">
        <Editor
          height={height}
          defaultLanguage="javascript"
          value={data || placeholder || ''}
          onChange={(val) => handleChange(path, val || '')}
          beforeMount={handleEditorWillMount}
          options={{
            readOnly: !enabled,
            minimap: { enabled: false },
            fontSize: 12,
            wordWrap: 'on',
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            tabSize: 2,
            automaticLayout: true,
          }}
          theme="github-light"
        />
      </div>
    </div>
  );
};

CustomCodeJavascriptControl.propTypes = {
  data: PropTypes.string,
  path: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  enabled: PropTypes.bool.isRequired,
  uischema: PropTypes.object,
  label: PropTypes.string,
  description: PropTypes.string,
  errors: PropTypes.arrayOf(PropTypes.string),
};
