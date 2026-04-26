/**
 * Base Widget Builder
 * 
 * Abstract class interface that all widget logic builders should extend.
 * It defines the contract for processing widget configurations into renderable data.
 */
export class BaseWidgetBuilder {
  /**
   * Process the widget configuration and return a renderable object/spec.
   * This method must extract any widget-specific configurations from the generic config blob.
   *
   * @param {object} params
   * @param {string} params.widgetType - The type of the widget
   * @param {object} params.widgetConfig - The configuration object for the widget
   * @returns {any} The finalized, renderable spec/data for the widget
   * @throws {Error} If not implemented by the subclass
   */
  buildRender({ widgetType, widgetConfig }) {
    throw new Error('buildRender method must be implemented by subclasses.');
  }

  /**
   * Declares what data inputs this widget type expects.
   * Subclasses should override this static getter.
   * @returns {object} Data manifest with supportsMultipleQueries, inputs, etc.
   */
  static get dataManifest() {
    return {
      supportsMultipleQueries: false,
      inputs: [],
    };
  }

  /**
   * Transform bound query results using the mapping config into widget-ready data.
   * Subclasses should override this method.
   *
   * @param {object} queryResults - Normalized results: { alias: resultData }
   * @param {object} mappingConfig - Widget-type-specific mapping config
   * @returns {object} Widget-ready data
   */
  mapQueryResults(queryResults, mappingConfig) {
    return queryResults;
  }
}
