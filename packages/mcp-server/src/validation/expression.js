/**
 * Expression / binding validator — pure, no network.
 *
 * Three modes:
 *  - safe-path   : backend template syntax in queries/workflow nodes/listener inputValues;
 *                  ONLY paths such as {{ctx.input.route}}, {{inputs.id}}, {{ctx.rows[0].name}}
 *  - js-template : frontend app-page/widget expressions using state/event; JS is allowed
 *  - condition-js: condition/switch branch expressions are RAW JavaScript with ctx in scope,
 *                  NOT mustache templates.
 */
const TEMPLATE_BLOCK = /\{\{([\s\S]+?)\}\}/g;
const SAFE_ROOTS = ['ctx', 'inputs', 'args', 'event', 'state'];
const JS_ROOTS = ['state', 'event', 'ctx', 'inputs'];
const BLOCKED_GLOBALS = ['window', 'document', 'fetch', 'eval', 'Function', 'require', 'process', 'Buffer', 'localStorage', 'sessionStorage', 'globalThis', 'XMLHttpRequest'];

function err(path, code, message, fix, suggestion) { return { path, code, message, fix, suggestion }; }
function warn(path, code, message, fix) { return { path, code, message, fix }; }

export function validateExpression({ template, mode = 'safe-path', allowedRoots } = {}) {
  const errors = [];
  const warnings = [];
  if (typeof template !== 'string') {
    return { valid: false, errors: [err('template', 'TEMPLATE_REQUIRED', 'template must be a string.', 'Use "{{ctx.input.name}}".', 'get_workflow_schema')], warnings, summary: null };
  }
  if (!['safe-path', 'js-template', 'condition-js'].includes(mode)) {
    return { valid: false, errors: [err('mode', 'MODE_INVALID', 'mode must be safe-path, js-template, or condition-js.', 'Use safe-path.', 'validate_expression')], warnings, summary: null };
  }

  if (mode === 'condition-js') {
    if (template.includes('{{')) {
      errors.push(err('template', 'CONDITION_USES_MUSTACHE', 'Condition/switch expressions are raw JavaScript, not {{...}} templates.', 'Use ctx.input.route === "a" (no braces).', 'describe_node_type'));
    }
    if (!/\bctx\b|\binput(s)?\b/.test(template)) warnings.push(warn('template', 'NO_CTX_REFERENCE', 'Expression does not reference ctx/input; it may evaluate the same for every run.', 'Reference ctx.input.<name>.'));
    const blocked = BLOCKED_GLOBALS.find((g) => new RegExp(`\\b${g}\\b`).test(template));
    if (blocked) errors.push(err('template', 'BLOCKED_GLOBAL', `Condition expression references blocked global "${blocked}".`, 'Use ctx values only.', 'describe_node_type'));
    return { valid: errors.length === 0, errors, warnings, summary: { mode, blocks: 0, roots: ['ctx'], normalized: template } };
  }

  // Brace balance
  let open = 0, close = 0;
  for (const ch of template) { if (ch === '{') open++; if (ch === '}') close++; }
  if (open !== close) errors.push(err('template', 'UNBALANCED_BRACES', `Template has ${open} "{" and ${close} "}" characters.`, 'Close every {{ }} block.', 'validate_expression'));

  const blocks = [...template.matchAll(TEMPLATE_BLOCK)].map((m) => m[1].trim());
  const roots = new Set();
  const rootAllow = allowedRoots || (mode === 'safe-path' ? SAFE_ROOTS : JS_ROOTS);

  if (mode === 'safe-path') {
    if (blocks.length === 0 && template.includes('{{')) errors.push(err('template', 'MALFORMED_BLOCK', 'Malformed {{...}} block.', 'Use {{ctx.path}}.', 'validate_expression'));
    for (const [i, expr] of blocks.entries()) {
      const p = `blocks[${i}]`;
      const rootMatch = /^([A-Za-z_$][\w$]*)/.exec(expr);
      if (!rootMatch) { errors.push(err(p, 'ROOT_MISSING', `Expression ${JSON.stringify(expr)} has no root.`, 'Start with ctx or inputs.', 'validate_expression')); continue; }
      const root = rootMatch[1];
      roots.add(root);
      if (!rootAllow.includes(root)) errors.push(err(p, 'ROOT_NOT_ALLOWED', `Root "${root}" is not allowed in ${mode} mode.`, `Use one of: ${rootAllow.join(', ')}.`, 'validate_expression'));
      let rest = expr.slice(root.length);
      rest = rest.replace(/\?\./g, '.');
      if (!/^([.[\]\w$'"]*)$/.test(rest)) {
        errors.push(err(p, 'SAFE_PATH_ONLY', `Expression ${JSON.stringify(expr)} contains JavaScript, not a path.`, 'Safe-path mode only allows dot/index access. Use a javascript node or js-template for logic.', 'describe_node_type'));
      } else if (!/^(\.[A-Za-z_$][\w$]*|\[\d+\]|\[['"][^'"]+['"]\])*$/.test(rest)) {
        errors.push(err(p, 'PATH_SYNTAX', `Expression ${JSON.stringify(expr)} has invalid path syntax.`, 'Use ctx.foo.bar, ctx.rows[0].name, or ctx["a-b"].', 'validate_expression'));
      }
      if (/__proto__|prototype|constructor/.test(expr)) errors.push(err(p, 'BLOCKED_SEGMENT', 'Expression uses a blocked object segment.', 'Remove __proto__/prototype/constructor.', 'validate_expression'));
    }
  } else {
    for (const [i, expr] of blocks.entries()) {
      const p = `blocks[${i}]`;
      const rootMatch = /^\s*([A-Za-z_$][\w$]*)/.exec(expr);
      if (rootMatch) {
        roots.add(rootMatch[1]);
        if (!rootAllow.includes(rootMatch[1]) && !['Math', 'JSON', 'String', 'Number', 'Boolean', 'Array', 'Object', 'Date'].includes(rootMatch[1])) {
          warnings.push(warn(p, 'UNUSUAL_ROOT', `Root "${rootMatch[1]}" is unusual in js-template mode.`, `Typical roots: ${rootAllow.join(', ')}.`));
        }
      }
      const blocked = BLOCKED_GLOBALS.find((g) => new RegExp(`\\b${g}\\b`).test(expr));
      if (blocked) errors.push(err(p, 'BLOCKED_GLOBAL', `Blocked global "${blocked}" in js-template.`, 'Use state/data only; network and DOM access are unavailable.', 'get_widget_schemas'));
      if (/&&|\|\||!=|==[^=]|=>|;/.test(expr)) warnings.push(warn(p, 'RISKY_OPERATOR', 'Risky operator in app-page template; the widget may render blank.', 'Prefer ternary, ||, optional chaining; avoid &&, != null, statements.', 'get_widget_schemas'));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary: { mode, blocks: blocks.length, roots: [...roots], normalized: template },
  };
}
