import React, { useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { CodeEditor, Label } from '@jet-admin/ui';
import {
  buildTemplateSuggestions,
  getTemplateCompletionContext,
} from './templateCompletion.js';

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
    databaseMetadata, 
    queryArgs = [], 
    height = "140px",
    placeholder,
    hint,
    intellisenseFeed = [],
    showHeader = false,
  } = uischema.options || {};
  
  const format = schema?.format || "";

  // Map JSON Forms schema format to Monaco language
  const language = useMemo(() => {
    if (['code-pgsql', 'code-sql', 'code-mysql'].includes(format)) return 'sql';
    if (format === 'code-javascript') return 'javascript';
    if (format === 'code-json') return 'json';
    if (format === 'code-html') return 'html';
    if (format === 'code-css') return 'css';
    if (format.startsWith('code-')) return format.replace('code-', '');
    return 'javascript'; // Base fallback
  }, [format]);

  // Build schema for SQL autocompletion
  const tablesMap = useMemo(() => {
    if (language !== 'sql' || !databaseMetadata?.schemas) return {};
    const map = {};
    databaseMetadata.schemas.forEach((schemaItem) => {
      schemaItem.tables?.forEach((t) => {
        map[t.databaseTableName] =
          t.databaseTableColumns?.map((c) => c.databaseTableColumnName) || [];
      });
    });
    return map;
  }, [databaseMetadata, language]);

  const schemaRef = useRef(tablesMap);
  const queryArgsRef = useRef(queryArgs);
  const intellisenseFeedRef = useRef(intellisenseFeed);

  useEffect(() => {
    schemaRef.current = tablesMap;
  }, [tablesMap]);

  useEffect(() => {
    queryArgsRef.current = queryArgs;
  }, [queryArgs]);

  useEffect(() => {
    intellisenseFeedRef.current = intellisenseFeed;
  }, [intellisenseFeed]);

  const handleBeforeMount = (monaco) => {
    // Register completion providers based on language
    
    if (language === 'sql') {
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
          const tableMatch = text.match(/(\\b\\w+)\\.$/);;
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
    }

    if (language === 'javascript') {
      monaco.languages.registerCompletionItemProvider('javascript', {
        triggerCharacters: ['.', '{', '[', '"', "'", ' '],
        provideCompletionItems: (model, position) => {
          const templateContext = getTemplateCompletionContext(model, position);
          if (templateContext) {
            return {
              suggestions: buildTemplateSuggestions({
                monaco,
                context: templateContext,
                queryArgs: queryArgsRef.current,
              }),
            };
          }

          const wordInfo = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: wordInfo.startColumn,
            endColumn: wordInfo.endColumn,
          };
          
          const suggestions = [];
          
          // Extract the text immediately before the current word being typed
          const textBeforeWord = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: wordInfo.startColumn,
          });
          
          // Match paths like "ctx.", "ctx.input.", "data."
          const pathMatch = textBeforeWord.match(/([a-zA-Z0-9_$]+(?:\.[a-zA-Z0-9_$]+)*)\.$/);
          const feed = intellisenseFeedRef.current || [];
          
          if (pathMatch) {
            const parentPath = pathMatch[1];
            const matchingItems = feed.filter(item => item.parentPath === parentPath);
            
            if (matchingItems.length > 0) {
              matchingItems.forEach((item) => {
                let priority = "03";
                if (item.kind === 'Property') priority = "01";
                if (item.kind === 'Field') priority = "02";
                
                suggestions.push({
                  label: item.label,
                  kind: monaco.languages.CompletionItemKind[item.kind] || monaco.languages.CompletionItemKind.Property,
                  insertText: item.insertText || item.label,
                  detail: item.detail,
                  sortText: `${priority}_${item.label}`,
                  range,
                });
              });
            }
          } else {
            // Root level generic items
            const rootItems = feed.filter(item => !item.parentPath);
            rootItems.forEach((item) => {
              let priority = "03";
              if (item.kind === 'Property') priority = "01";
              if (item.kind === 'Field') priority = "02";
              
              suggestions.push({
                label: item.label,
                kind: monaco.languages.CompletionItemKind[item.kind] || monaco.languages.CompletionItemKind.Variable,
                insertText: item.insertText || item.label,
                detail: item.detail,
                sortText: `${priority}_${item.label}`,
                range,
              });
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
              sortText: `09_${kw.label}`,
              range,
            });
          });
          
          return { suggestions };
        },
      });
    }
  };

  const hasErrors = errors && errors.length > 0;

  return (
    <div className="">
      <Label
        htmlFor={path}
        className={`block mb-1 text-xs font-medium ${
          hasErrors ? 'text-red-500' : 'text-muted-foreground'
        }`}
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
        disabled={!enabled}
        showHeader={showHeader}
        beforeMount={handleBeforeMount}
        status={hasErrors ? "error" : null}
      />
      {hasErrors && (
        <p className="text-xs text-red-500 mt-1">{errors}</p>
      )}
    </div>
  );
};

CustomCodeEditorControl.propTypes = {
  data: PropTypes.string,
  path: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  enabled: PropTypes.bool.isRequired,
  uischema: PropTypes.object,
  schema: PropTypes.object,
  label: PropTypes.string,
  description: PropTypes.string,
  errors: PropTypes.arrayOf(PropTypes.string),
};
