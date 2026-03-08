const Logger = require('../../../utils/logger');
const { getValueByPath, tokenizeObjectPath } = require('../../../utils/objectPath.util');

function resolveFromContext(ctx, path) {
  if (!path) return undefined;

  Logger.log('info', { message: 'resolveFromContext', params: { path } });

  const parts = tokenizeObjectPath(path, { allowedRoots: ['ctx'] }) || [];

  Logger.log('info', { message: 'resolveFromContext:parts', params: { parts } });

  const current = getValueByPath(ctx, path, { allowedRoots: ['ctx'] });

  Logger.log('info', { message: 'resolveFromContext:resolved', params: { path } });

  return current;
}

function resolveStringWithContext(ctx, str) {
  if (typeof str !== 'string') return str;

  if (/^\{\{([^}]+)\}\}$/.test(str)) {
    const path = str.replace(/^\{\{|\}\}$/g, '').trim();
    return resolveFromContext(ctx, path);
  }

  return str.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const val = resolveFromContext(ctx, path.trim());
    return val !== undefined && val !== null ? val : '';
  });
}

module.exports = {
  resolveFromContext,
  resolveStringWithContext,
};