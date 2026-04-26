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

    // The backend template resolver has already resolved `{{ctx.data}}`
    // into the `dataArrayTemplate` field, so we just map it over.
    const data = Array.isArray(widgetConfig.dataArrayTemplate)
      ? widgetConfig.dataArrayTemplate
      : [];

    // The backend template resolver has already resolved `{{ctx.total}}`
    // into the `totalTemplate` field
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
   * Map normalized query results to table-ready data.
   * @param {object} queryResults - { alias: resultData }
   * @param {object} mappingConfig - { dataArrayPath, totalCountPath }
   * @returns {object} { dataArray, totalCount }
   */
  mapQueryResults(queryResults, mappingConfig) {
    if (!mappingConfig) return { dataArray: [], totalCount: 0 };
    return {
      dataArray: getByPath(queryResults, mappingConfig.dataArrayPath) || [],
      totalCount: getByPath(queryResults, mappingConfig.totalCountPath) || 0,
    };
  }
}
