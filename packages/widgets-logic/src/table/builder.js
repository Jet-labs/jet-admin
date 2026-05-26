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
    // totalTemplate may be a number or a numeric string (e.g. "30" from SQL COUNT)
    const rawTotal = widgetConfig.pagination?.totalTemplate;
    const parsedTotal = rawTotal != null ? Number(rawTotal) : NaN;
    const totalRows = !isNaN(parsedTotal) && parsedTotal >= 0
      ? parsedTotal
      : data.length;

    return {
      data,
      columns: widgetConfig.columns || [],
      pagination: {
        enabled: widgetConfig.pagination?.enabled || false,
        totalRows,
      },
      search: widgetConfig.search || { enabled: false },
      export: widgetConfig.export || { enabled: false },
      editing: widgetConfig.editing || { enabled: false },
      multiSelect: widgetConfig.multiSelect || { enabled: false },
      bulkEdit: widgetConfig.bulkEdit || { enabled: false },
    };
  }

  /**
   * Resolve the data prop for TableWidget from widgetConfig + dataSourceResults.
   * Delegates to buildRender() to return the full structured output including
   * pagination config, columns, and total row count.
   *
   * @param {object} widgetConfig - The full widget configuration (already resolved)
   * @param {object|null} dataSourceResults - Executed data source results
   * @returns {object|null} { data, columns, pagination } for the table, or null
   */
  resolveData(widgetConfig, dataSourceResults) {
    // Delegate to buildRender which produces the full structured output
    // including pagination.enabled, pagination.totalRows, columns, and data.
    return this.buildRender({ widgetType: 'table', widgetConfig });
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

