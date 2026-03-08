const Logger = require('../../../utils/logger');

function navigatePathEnhanced(ctx, path) {
  if (!path) return undefined;

  let cleanPath = path;
  if (cleanPath.startsWith('ctx.')) {
    cleanPath = cleanPath.slice(4);
  } else if (cleanPath.startsWith('ctx?.')) {
    cleanPath = cleanPath.slice(5);
  }

  if (cleanPath.includes('[*]')) {
    return resolveWildcardPath(ctx, cleanPath);
  }

  const isNullSafe = cleanPath.includes('?.');
  const parts = cleanPath.split(/\??\./).filter((part) => part);

  let current = ctx;
  for (const part of parts) {
    if (current === undefined || current === null) {
      return isNullSafe ? undefined : null;
    }

    const indexMatch = part.match(/^(.+?)\[(\d+)\]$/);
    if (indexMatch) {
      const [, prop, index] = indexMatch;
      current = current[prop];
      current = Array.isArray(current) ? current[parseInt(index, 10)] : undefined;
    } else {
      current = current[part];
    }
  }

  return current;
}

function resolveWildcardPath(ctx, path) {
  const wildcardIndex = path.indexOf('[*]');
  const beforeWildcard = path.slice(0, wildcardIndex);
  const afterWildcard = path.slice(wildcardIndex + 3);
  const array = navigatePathEnhanced(ctx, beforeWildcard);

  if (!Array.isArray(array)) {
    return [];
  }

  if (!afterWildcard) {
    return array;
  }

  const subPath = afterWildcard.startsWith('.') ? afterWildcard.slice(1) : afterWildcard;
  return array
    .map((item) => (subPath.includes('[*]') ? resolveWildcardPath(item, subPath) : navigatePathEnhanced(item, subPath)))
    .flat();
}

function applyTransform(value, transform) {
  if (!transform || !transform.type) {
    return value;
  }

  switch (transform.type) {
    case 'map':
      return Array.isArray(value) && transform.mapPath
        ? value.map((item) => navigatePathEnhanced(item, transform.mapPath))
        : value;
    case 'filter': {
      if (!Array.isArray(value) || !transform.filterCondition) return value;
      try {
        const filterFn = new Function('item', 'index', `return ${transform.filterCondition}`);
        return value.filter((item, index) => filterFn(item, index));
      } catch (e) {
        Logger.log('error', { message: 'applyTransform:filter:error', params: { error: e.message } });
        return value;
      }
    }
    case 'format':
      return formatValue(value, transform.formatType);
    case 'slice': {
      if (!Array.isArray(value)) return value;
      const start = transform.start || 0;
      const end = transform.end !== undefined ? transform.end : value.length;
      return value.slice(start, end);
    }
    case 'sort': {
      if (!Array.isArray(value)) return value;
      const sorted = [...value];
      if (transform.sortPath) {
        sorted.sort((a, b) => {
          const aVal = navigatePathEnhanced(a, transform.sortPath);
          const bVal = navigatePathEnhanced(b, transform.sortPath);
          if (aVal < bVal) return transform.ascending ? -1 : 1;
          if (aVal > bVal) return transform.ascending ? 1 : -1;
          return 0;
        });
      }
      return sorted;
    }
    case 'aggregate': {
      if (!Array.isArray(value)) return value;
      switch (transform.aggregation) {
        case 'sum':
          return value.reduce((acc, item) => acc + (Number(transform.path ? navigatePathEnhanced(item, transform.path) : item) || 0), 0);
        case 'avg': {
          const sum = value.reduce((acc, item) => acc + (Number(transform.path ? navigatePathEnhanced(item, transform.path) : item) || 0), 0);
          return value.length > 0 ? sum / value.length : 0;
        }
        case 'count':
          return value.length;
        case 'min':
          return Math.min(...value.map((item) => Number(transform.path ? navigatePathEnhanced(item, transform.path) : item) || 0));
        case 'max':
          return Math.max(...value.map((item) => Number(transform.path ? navigatePathEnhanced(item, transform.path) : item) || 0));
        default:
          return value;
      }
    }
    default:
      return value;
  }
}

function formatValue(value, formatType) {
  if (value === null || value === undefined) return '';
  if (!formatType) return String(value);

  const [type, subtype] = formatType.split(':');
  switch (type) {
    case 'date': {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return String(value);
      switch (subtype) {
        case 'short': return date.toLocaleDateString();
        case 'long': return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        case 'time': return date.toLocaleTimeString();
        case 'datetime': return date.toLocaleString();
        case 'iso': return date.toISOString();
        default: return date.toLocaleDateString();
      }
    }
    case 'number': {
      const num = Number(value);
      if (Number.isNaN(num)) return String(value);
      switch (subtype) {
        case 'currency': return num.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
        case 'percent': return `${(num * 100).toFixed(2)}%`;
        case 'decimal': return num.toFixed(2);
        case 'integer': return Math.round(num).toString();
        case 'compact': return Intl.NumberFormat(undefined, { notation: 'compact' }).format(num);
        default: return num.toLocaleString();
      }
    }
    case 'string': {
      const str = String(value);
      switch (subtype) {
        case 'uppercase': return str.toUpperCase();
        case 'lowercase': return str.toLowerCase();
        case 'capitalize': return str.charAt(0).toUpperCase() + str.slice(1);
        case 'truncate': return str.length > 50 ? `${str.slice(0, 50)}...` : str;
        default: return str;
      }
    }
    default:
      return String(value);
  }
}

function resolveWidgetVariable(context, bindingConfig) {
  if (!bindingConfig) return undefined;

  const { variablePath, transform, fallback } =
    typeof bindingConfig === 'string' ? { variablePath: bindingConfig } : bindingConfig;

  let value = navigatePathEnhanced(context, variablePath);
  if ((value === undefined || value === null) && fallback !== undefined) {
    return fallback;
  }
  if (transform && value !== undefined && value !== null) {
    value = applyTransform(value, transform);
  }
  return value;
}

function resolveWidgetDatasetFields(context, datasetFields) {
  if (!datasetFields || typeof datasetFields !== 'object') {
    return {};
  }

  const resolved = {};
  for (const [field, binding] of Object.entries(datasetFields)) {
    resolved[field] = resolveWidgetVariable(context, binding);
  }
  return resolved;
}

module.exports = {
  navigatePathEnhanced,
  resolveWildcardPath,
  applyTransform,
  formatValue,
  resolveWidgetVariable,
  resolveWidgetDatasetFields,
};