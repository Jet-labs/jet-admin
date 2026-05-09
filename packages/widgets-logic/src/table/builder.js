import { BaseWidgetBuilder } from '../core/baseWidgetBuilder';
import { getByPath } from '../core/utils';

/**
 * Table Widget Builder
 * 
 * Takes an already-resolved complete widget config, which contains:
 * - dataArray: The actual resolved array of data
 * - columns: Column definitions
 * - pagination: Pagination config and resolved total count
 */
export class TableWidgetBuilder extends BaseWidgetBuilder {
  /**
   * Build a renderable props object from widgetConfig.
   * 
   * @param {object} params
   * @param {string} params.widgetType - Widget type ('table')
   * @param {object} params.widgetConfig - The resolved widget config
   * @returns {object} Processed props for the TableWidget
   */
  buildRender({ widgetType = 'table', widgetConfig }) {
    if (!widgetConfig) return null;

    // Extract the data array from the resolved config
    const data = Array.isArray(widgetConfig.dataArrayTemplate)
      ? widgetConfig.dataArrayTemplate
      : [];

    // Extract total rows from pagination config
    const totalRows = typeof widgetConfig.pagination?.totalTemplate === 'number'
      ? widgetConfig.pagination.totalTemplate
      : data.length;

    return {
      data,
      columns: widgetConfig.columns || [],
      pagination: {
        enabled: widgetConfig.pagination?.enabled || false,
        pageParam: widgetConfig.pagination?.pageParam || "page",
        pageSizeParam: widgetConfig.pagination?.pageSizeParam || "limit",
        totalRows,
      }
    };
  }

  /**
   * Resolve the data prop for TableWidget from widgetConfig + dataSourceResults.
   * Expects all template expressions to be resolved by the evaluationEngine.
   *
   * @param {object} widgetConfig - The full widget configuration (already resolved)
   * @param {object|null} dataSourceResults - Executed data source results
   * @returns {Array|null} Array of row objects for the table, or null
   */
  resolveData(widgetConfig, dataSourceResults) {
    // Use the natively evaluated template if available
    if (Array.isArray(widgetConfig?.dataArrayTemplate)) {
      return widgetConfig.dataArrayTemplate;
    }
    
    // Fallback for legacy configurations using dataMapping
    if (dataSourceResults && widgetConfig?.dataMapping?.dataArrayPath) {
      const resolved = getByPath(dataSourceResults, widgetConfig.dataMapping.dataArrayPath);
      if (Array.isArray(resolved)) return resolved;
      if (resolved && typeof resolved === 'object' && Array.isArray(resolved.data)) {
        return resolved.data;
      }
    }
    return null;
  }

  static get dataManifest() {
    return {
      supportsMultipleQueries: false,
      inputs: [
        { name: 'dataArray', type: 'array', required: true, description: 'Array of row objects' },
        { name: 'totalCount', type: 'scalar', required: false, description: 'Total rows for pagination' },
      ],
    };
  }

  /**
   * Map normalized data source results to table-ready data.
   * @param {object} dataSourceResults - { alias: resultData }
   * @param {object} mappingConfig - { dataArrayPath, totalCountPath }
   * @returns {object} { dataArray, totalCount }
   */
  mapQueryResults(dataSourceResults, mappingConfig) {
    if (!mappingConfig) return { dataArray: [], totalCount: 0 };
    return {
      dataArray: getByPath(dataSourceResults, mappingConfig.dataArrayPath) || [],
      totalCount: getByPath(dataSourceResults, mappingConfig.totalCountPath) || 0,
    };
  }
}

