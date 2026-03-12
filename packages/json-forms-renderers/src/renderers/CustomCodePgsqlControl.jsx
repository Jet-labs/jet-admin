// Custom Code PGSQL Control Renderer with Monaco Editor
import React, { useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import Editor from '@monaco-editor/react';
import GithubTheme from 'monaco-themes/themes/GitHub Light.json';
import {
  buildTemplateSuggestions,
  getTemplateCompletionContext,
} from './templateCompletion.js';

export const CustomCodePgsqlControl = ({
  data,
  path,
  label,
  description,
  errors,
  handleChange,
  enabled,
  uischema,
}) => {
  const { databaseMetadata, queryArgs = [] } = uischema.options || {};
  
  // Build schema for autocompletion
  const tablesMap = useMemo(() => {
    if (!databaseMetadata?.schemas) return {};
    const map = {};
    databaseMetadata.schemas.forEach((schemaItem) => {
      schemaItem.tables?.forEach((t) => {
        map[t.databaseTableName] =
          t.databaseTableColumns?.map((c) => c.databaseTableColumnName) || [];
      });
    });
    return map;
  }, [databaseMetadata]);

  const schemaRef = useRef(tablesMap);
  const queryArgsRef = useRef(queryArgs);
  useEffect(() => {
    schemaRef.current = tablesMap;
  }, [tablesMap]);
  useEffect(() => {
    queryArgsRef.current = queryArgs;
  }, [queryArgs]);

  const handleEditorWillMount = (monaco) => {
    monaco.languages.registerCompletionItemProvider("sql", {
      triggerCharacters: [".", " ", "{", "[", '"', "'"],
      provideCompletionItems: (model, pos) => {
        const text = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: pos.lineNumber,
          endColumn: pos.column,
        });
        const wordInfo = model.getWordUntilPosition(pos);
        const range = {
          startLineNumber: pos.lineNumber,
          endLineNumber: pos.lineNumber,
          startColumn: wordInfo.startColumn,
          endColumn: wordInfo.endColumn,
        };
        const templateContext = getTemplateCompletionContext(model, pos);

        if (templateContext) {
          return {
            suggestions: buildTemplateSuggestions({
              monaco,
              context: templateContext,
              queryArgs: queryArgsRef.current,
            }),
          };
        }

        const suggestions = [];
        const tableMatch = text.match(/(\b\w+)\.$/);
        if (tableMatch) {
          const cols = schemaRef.current[tableMatch[1]] || [];
          cols.forEach((col) =>
            suggestions.push({
              label: col,
              kind: monaco.languages.CompletionItemKind.Field,
              insertText: col,
              detail: `Column of ${tableMatch[1]}`,
              range,
            })
          );
        } else {
          Object.keys(schemaRef.current).forEach((tbl) =>
            suggestions.push({
              label: tbl,
              kind: monaco.languages.CompletionItemKind.Class,
              insertText: tbl,
              detail: "Table",
              range,
            })
          );
          const sqlKeywords = [
            "SELECT", "FROM", "WHERE", "JOIN", "LEFT JOIN", "RIGHT JOIN",
            "INNER JOIN", "ON", "GROUP BY", "ORDER BY", "ASC", "DESC",
            "AS", "DISTINCT", "LIMIT", "OFFSET", "INSERT INTO", "VALUES",
            "UPDATE", "SET", "DELETE", "CREATE TABLE", "ALTER TABLE",
            "DROP TABLE", "INDEX", "COUNT", "SUM", "AVG", "MAX", "MIN",
            "AND", "OR", "NOT", "NULL", "IS",
          ];
          sqlKeywords.forEach((kw) =>
            suggestions.push({
              label: kw,
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: kw,
              range,
            })
          );
        }
        return { suggestions };
      },
    });
    monaco.editor.defineTheme("github-light", GithubTheme);
  };

  return (
    <div className="mb-3">
      <label
        htmlFor={path}
        className={`block mb-1 text-xs font-medium ${
          errors && errors.length > 0 ? "text-red-500" : "text-slate-500"
        }`}
      >
        {label || description} {errors && errors.length > 0 && errors}
      </label>
      <div className="border border-slate-200 rounded p-1">
        <Editor
          height={uischema.options?.height || "140px"}
          defaultLanguage="sql"
          value={data || ""}
          onChange={(val) => handleChange(path, val || "")}
          beforeMount={handleEditorWillMount}
          options={{
            readOnly: !enabled,
            minimap: { enabled: false },
            fontSize: 12,
            wordWrap: "on",
          }}
          theme="github-light"
        />
      </div>
    </div>
  );
};

CustomCodePgsqlControl.propTypes = {
  data: PropTypes.string,
  path: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  enabled: PropTypes.bool.isRequired,
  uischema: PropTypes.object,
  label: PropTypes.string,
  description: PropTypes.string,
  errors: PropTypes.arrayOf(PropTypes.string),
};
