/**
 * Vega-Lite Processor
 * Transforms workflow context data into a complete Vega-Lite specification
 */
import { resolveVariablePath } from '../utils/pathResolvers';

/**
 * Apply data transforms (filter, calculate, sort)
 */
const applyTransforms = (data, transforms) => {
  if (!transforms || !Array.isArray(transforms) || !Array.isArray(data)) {
    return data;
  }

  let result = [...data];

  for (const transform of transforms) {
    try {
      switch (transform.type) {
        case 'filter':
          if (transform.field && transform.value !== undefined) {
            result = result.filter(row => row[transform.field] === transform.value);
          } else if (transform.field && transform.gte !== undefined) {
            result = result.filter(row => row[transform.field] >= transform.gte);
          } else if (transform.field && transform.lte !== undefined) {
            result = result.filter(row => row[transform.field] <= transform.lte);
          }
          break;

        case 'calculate':
          if (transform.field && transform.as) {
            result = result.map(row => ({
              ...row,
              [transform.as]: row[transform.field]
            }));
          }
          break;

        case 'sort':
          if (transform.field) {
            result.sort((a, b) => {
              const valA = a[transform.field];
              const valB = b[transform.field];
              const comparison = valA > valB ? 1 : valA < valB ? -1 : 0;
              return transform.order === 'descending' ? -comparison : comparison;
            });
          }
          break;
      }
    } catch (err) {
      console.error('Transform error:', err);
    }
  }

  return result;
};

/**
 * Process workflow context data for Vega-Lite widget
 * 
 * @param {object} params
 * @param {object} params.context - Workflow context data
 * @param {object} params.workflowConfig - Widget workflow configuration
 * @returns {object} Complete Vega-Lite specification
 */
export const processVegaLiteWorkflowData = ({ context, workflowConfig }) => {
  const { 
    vegaSpec, 
    dataSource, 
    dataSources, 
    transforms,
    width,
    height 
  } = workflowConfig || {};

  if (!vegaSpec) {
    return { 
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      description: "No specification provided",
      data: { values: [] },
      mark: "point"
    };
  }

  // Build complete spec
  const spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width: width || "container",
    height: height || "container",
    autosize: { type: "fit", contains: "padding" },
    ...vegaSpec
  };

  // Single data source mode
  if (dataSource) {
    const rawData = resolveVariablePath(context, dataSource, []);
    const data = applyTransforms(rawData, transforms);
    spec.data = { values: Array.isArray(data) ? data : [] };
  }

  // Multiple data sources mode
  if (dataSources && typeof dataSources === 'object') {
    spec.datasets = {};
    for (const [name, path] of Object.entries(dataSources)) {
      const resolved = resolveVariablePath(context, path, []);
      spec.datasets[name] = Array.isArray(resolved) ? resolved : [];
    }
  }

  return spec;
};

/**
 * Process workflow context data for Vega widget
 * 
 * @param {object} params
 * @param {object} params.context - Workflow context data
 * @param {object} params.workflowConfig - Widget workflow configuration
 * @returns {object} Complete Vega specification
 */
export const processVegaWorkflowData = ({ context, workflowConfig }) => {
  const {
    vegaSpec,
    dataSource,
    dataSources,
    transforms,
    width,
    height
  } = workflowConfig || {};

  if (!vegaSpec) {
    return {
      $schema: "https://vega.github.io/schema/vega/v5.json",
      description: "No specification provided",
      data: [],
      marks: []
    };
  }

  // Build complete spec
  const spec = {
    $schema: "https://vega.github.io/schema/vega/v5.json",
    width: width || "container",
    height: height || "container",
    autosize: { type: "fit", contains: "padding" },
    ...vegaSpec
  };

  // Single data source mode (Vega uses 'data' array, usually objects with 'name' and 'values')
  if (dataSource) {
    const rawData = resolveVariablePath(context, dataSource, []);
    const data = applyTransforms(rawData, transforms);

    // In Vega, data is an array of data objects. We need to find the main data or append a new one.
    // If spec.data is not defined, create it.
    if (!spec.data) spec.data = [];

    // Check if a data entry with name 'table' or 'source' exists, otherwise add one
    // Convention: use 'source' or 'table' as default data name if not specified in spec
    const dataName = 'source';
    const existingDataIndex = spec.data.findIndex(d => d.name === dataName);

    if (existingDataIndex >= 0) {
      spec.data[existingDataIndex].values = Array.isArray(data) ? data : [];
    } else {
      spec.data.push({
        name: dataName,
        values: Array.isArray(data) ? data : []
      });
    }
  }

  // Multiple data sources mode
  if (dataSources && typeof dataSources === 'object') {
    if (!spec.data) spec.data = [];

    for (const [name, path] of Object.entries(dataSources)) {
      const resolved = resolveVariablePath(context, path, []);
      const values = Array.isArray(resolved) ? resolved : [];

      const existingDataIndex = spec.data.findIndex(d => d.name === name);
      if (existingDataIndex >= 0) {
        spec.data[existingDataIndex].values = values;
      } else {
        spec.data.push({
          name,
          values
        });
      }
    }
  }

  return spec;
};
