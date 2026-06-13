import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { CodeEditor, Label } from '@jet-admin/ui';

export const CustomCodeEditorControl = ({
  data,
  path,
  label,
  description,
  errors,
  handleChange,
  enabled,
  uischema,
  schema,
}) => {
  const {
    height = "140px",
    placeholder,
    hint,
    showHeader = false,
    stateTree = null,
    templateMode,
  } = uischema.options || {};
  
  const format = schema?.format || "";

  const language = useMemo(() => {
    if (['code-pgsql', 'code-sql', 'code-mysql'].includes(format)) return 'sql';
    if (format === 'code-javascript') return 'javascript';
    if (format === 'code-json') return 'json';
    if (format === 'code-html') return 'html';
    if (format === 'code-css') return 'css';
    if (format.startsWith('code-')) return format.replace('code-', '');
    return 'javascript';
  }, [format]);

  let displayErrors = typeof errors === 'string' ? errors : (errors ? errors.join(', ') : "");
  const hasErrors = displayErrors.length > 0;

  return (
    <div className="">
      <Label
        htmlFor={path}
        className={`block mb-1 ${hasErrors ? 'text-red-500' : ''}`}
      >
        {label || description}
      </Label>
      
      {hint && (
        <p className="text-[10px] text-muted-foreground mb-1">{hint}</p>
      )}
      
      <CodeEditor
        value={typeof data === 'object' ? JSON.stringify(data, null, 2) : data || placeholder || ''}
        onChange={(val) => handleChange(path, val || '')}
        language={language}
        height={height}
        disabled={enabled === false}
        showHeader={showHeader}
        stateTree={stateTree}
        templateMode={templateMode}
        status={hasErrors ? "error" : null}
        statusMessage={hasErrors ? displayErrors : null}
      />
    </div>
  );
};

CustomCodeEditorControl.propTypes = {
  data: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  path: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  enabled: PropTypes.bool,
  uischema: PropTypes.object,
  schema: PropTypes.object,
  label: PropTypes.string,
  description: PropTypes.string,
  errors: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
};
