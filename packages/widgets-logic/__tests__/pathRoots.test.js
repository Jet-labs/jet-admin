const {
  processWorkflowDataForWidget,
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