const {
  processWorkflowDataForWidget,
  resolveWidgetData,
  WIDGET_PROCESSORS_MAP
} = require('../dist/index.cjs');

describe('VegaWidgetBuilder (via processWorkflowDataForWidget)', () => {
  test('builds complete vega-lite spec from already-resolved vegaSpec', () => {
    const resolvedSpec = {
      mark: 'bar',
      data: { values: [{ x: 1, y: 2 }] },
      encoding: {
        x: { field: 'x', type: 'quantitative' },
        y: { field: 'y', type: 'quantitative' },
      },
    };

    const result = processWorkflowDataForWidget({
      widgetType: 'vega-lite',
      widgetConfig: { vegaSpec: resolvedSpec },
    });

    expect(result.$schema).toBe('https://vega.github.io/schema/vega-lite/v5.json');
    expect(result.width).toBe('container');
    expect(result.height).toBe('container');
    expect(result.mark).toBe('bar');
    expect(result.data.values).toEqual([{ x: 1, y: 2 }]);
  });

  test('builds vega spec with correct schema', () => {
    const result = processWorkflowDataForWidget({
      widgetType: 'vega',
      widgetConfig: { vegaSpec: { marks: [] } },
    });

    expect(result.$schema).toBe('https://vega.github.io/schema/vega/v5.json');
  });

  test('returns null when no vegaSpec provided', () => {
    expect(processWorkflowDataForWidget({
      widgetType: 'vega-lite',
      widgetConfig: { vegaSpec: null },
    })).toBeNull();
  });

  test('spec fields override defaults', () => {
    const result = processWorkflowDataForWidget({
      widgetType: 'vega-lite',
      widgetConfig: { vegaSpec: { mark: 'point', width: 500, height: 300 } },
    });

    expect(result.width).toBe(500);
    expect(result.height).toBe(300);
  });

  test('returns fallback/null when widgetConfig is undefined', () => {
    expect(processWorkflowDataForWidget({
      widgetType: 'vega-lite',
    })).toBeNull();
  });
});

describe('VegaWidgetBuilder.resolveData sanitization', () => {
  test('sanitizes unresolved template strings and undefined/null data values', () => {
    const spec = {
      data: {
        format: { type: 'topojson', feature: 'states' },
        values: '{{state.queries.query_4.data}}' // Unresolved template string
      },
      transform: [
        {
          from: {
            data: {
              values: undefined // Will be stripped by safeClone
            }
          }
        },
        {
          from: {
            data: {
              values: null // Evaluated to null
            }
          }
        }
      ]
    };

    const result = resolveWidgetData({
      widgetType: 'vega-lite',
      widgetConfig: { vegaSpec: spec },
      dataSourceResults: {}
    });

    // Check top level values
    expect(result.data.values).toEqual({
      type: 'Topology',
      objects: {
        states: {
          type: 'GeometryCollection',
          geometries: []
        }
      }
    });
    
    // Check nested values inside transform
    expect(result.transform[0].from.data.values).toEqual([]);
    expect(result.transform[1].from.data.values).toEqual([]);
  });

  test('preserves valid arrays and url-based data sources', () => {
    const spec = {
      data: {
        url: 'https://example.com/data.json',
        format: { type: 'json' }
      },
      transform: [
        {
          from: {
            data: {
              values: [{ id: 1, val: 10 }]
            }
          }
        }
      ]
    };

    const result = resolveWidgetData({
      widgetType: 'vega-lite',
      widgetConfig: { vegaSpec: spec },
      dataSourceResults: {}
    });

    // Top level url datasource should be untouched
    expect(result.data.url).toBe('https://example.com/data.json');
    expect(result.data.values).toBeUndefined();

    // Nested array should be preserved
    expect(result.transform[0].from.data.values).toEqual([{ id: 1, val: 10 }]);
  });

  test('preserves valid objects like TopoJSON topology objects', () => {
    const spec = {
      data: {
        format: {
          type: 'topojson',
          feature: 'states'
        },
        values: {
          type: 'Topology',
          objects: {
            states: {
              type: 'GeometryCollection',
              geometries: []
            }
          }
        }
      }
    };

    const result = resolveWidgetData({
      widgetType: 'vega-lite',
      widgetConfig: { vegaSpec: spec },
      dataSourceResults: {}
    });

    expect(result.data.values).toEqual({
      type: 'Topology',
      objects: {
        states: {
          type: 'GeometryCollection',
          geometries: []
        }
      }
    });
  });
});