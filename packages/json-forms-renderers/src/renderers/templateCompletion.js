const ROOT_COMPLETIONS = [
  {
    label: 'args',
    detail: 'Configured query arguments',
  },
  {
    label: 'runtimeArgs',
    detail: 'Runtime query arguments',
  },
];

const IDENTIFIER_REGEX = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

const getUniqueQueryArgs = (queryArgs = []) => {
  const seen = new Set();

  return queryArgs
    .filter((queryArg) => typeof queryArg?.key === 'string' && queryArg.key.trim())
    .map((queryArg) => ({
      key: queryArg.key.trim(),
      type: queryArg.type,
    }))
    .filter((queryArg) => {
      if (seen.has(queryArg.key)) {
        return false;
      }

      seen.add(queryArg.key);
      return true;
    });
};

const buildAccessExpression = (rootLabel, key) => {
  if (IDENTIFIER_REGEX.test(key)) {
    return `${rootLabel}.${key}`;
  }

  return `${rootLabel}["${key.replaceAll('"', '\\"')}"]`;
};

export const getTemplateCompletionContext = (model, position) => {
  const textBeforeCursor = model.getValueInRange({
    startLineNumber: position.lineNumber,
    startColumn: 1,
    endLineNumber: position.lineNumber,
    endColumn: position.column,
  });

  const lastOpenIndex = textBeforeCursor.lastIndexOf('{{');
  const lastCloseIndex = textBeforeCursor.lastIndexOf('}}');

  if (lastOpenIndex === -1 || lastCloseIndex > lastOpenIndex) {
    return null;
  }

  return {
    expression: textBeforeCursor.slice(lastOpenIndex + 2),
    range: {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: lastOpenIndex + 3,
      endColumn: position.column,
    },
  };
};

export const buildTemplateSuggestions = ({ monaco, context, queryArgs = [] }) => {
  if (!context) {
    return [];
  }

  const normalizedExpression = context.expression.replace(/^\s*/, '');
  const normalizedQueryArgs = getUniqueQueryArgs(queryArgs);
  const templateSuggestions = [];

  const pushRootSuggestions = (partial = '') => {
    ROOT_COMPLETIONS
      .filter((rootCompletion) =>
        rootCompletion.label.toLowerCase().startsWith(partial.toLowerCase())
      )
      .forEach((rootCompletion) => {
        templateSuggestions.push({
          label: rootCompletion.label,
          kind: monaco.languages.CompletionItemKind.Variable,
          insertText: `${rootCompletion.label}.`,
          detail: rootCompletion.detail,
          command: {
            id: 'editor.action.triggerSuggest',
            title: 'Trigger suggest',
          },
          range: context.range,
          sortText: `0-${rootCompletion.label}`,
        });
      });
  };

  const pushQueryArgSuggestions = (rootLabel, partial = '') => {
    normalizedQueryArgs
      .filter((queryArg) => queryArg.key.toLowerCase().startsWith(partial.toLowerCase()))
      .forEach((queryArg) => {
        templateSuggestions.push({
          label: queryArg.key,
          kind: monaco.languages.CompletionItemKind.Field,
          insertText: buildAccessExpression(rootLabel, queryArg.key),
          detail: queryArg.type
            ? `Query arg (${queryArg.type})`
            : 'Configured query arg',
          documentation: `Insert ${buildAccessExpression(rootLabel, queryArg.key)}`,
          range: context.range,
          sortText: `0-${rootLabel}-${queryArg.key}`,
        });
      });
  };

  if (!normalizedExpression) {
    pushRootSuggestions();
    return templateSuggestions;
  }

  const dotAccessMatch = normalizedExpression.match(/^(args|runtimeArgs)(?:\.([A-Za-z0-9_$-]*))?$/);
  if (dotAccessMatch) {
    if (dotAccessMatch[2] === undefined) {
      pushRootSuggestions(dotAccessMatch[1]);
      return templateSuggestions;
    }

    pushQueryArgSuggestions(dotAccessMatch[1], dotAccessMatch[2]);
    return templateSuggestions;
  }

  const bracketAccessMatch = normalizedExpression.match(/^(args|runtimeArgs)\[(?:["']?([^"'\]]*))?$/);
  if (bracketAccessMatch) {
    pushQueryArgSuggestions(bracketAccessMatch[1], bracketAccessMatch[2] || '');
    return templateSuggestions;
  }

  pushRootSuggestions(normalizedExpression);
  return templateSuggestions;
};