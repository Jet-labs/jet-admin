const {
  buildRenderableSpec,
  processWorkflowDataForWidget,
} = require('../dist/index.cjs');

describe('buildRenderableSpec', () => {
  test('builds complete vega-lite spec from already-resolved vegaSpec', () => {
    const resolvedSpec = {
      mark: 'bar',
      data: { values: [{ x: 1, y: 2 }] },
      encoding: {
        x: { field: 'x', type: 'quantitative' },
        y: { field: 'y', type: 'quantitative' },
      },
    };

    const result = buildRenderableSpec({
      vegaSpec: resolvedSpec,
      widgetType: 'vega-lite',
    });

    expect(result.$schema).toBe('https://vega.github.io/schema/vega-lite/v5.json');
    expect(result.width).toBe('container');
    expect(result.height).toBe('container');
    expect(result.mark).toBe('bar');
    expect(result.data.values).toEqual([{ x: 1, y: 2 }]);
  });

  test('builds vega spec with correct schema', () => {
    const result = buildRenderableSpec({
      vegaSpec: { marks: [] },
      widgetType: 'vega',
    });

    expect(result.$schema).toBe('https://vega.github.io/schema/vega/v5.json');
  });

  test('returns null when no vegaSpec provided', () => {
    expect(buildRenderableSpec({ vegaSpec: null })).toBeNull();
  });

  test('spec fields override defaults', () => {
    const result = buildRenderableSpec({
      vegaSpec: { mark: 'point', width: 500, height: 300 },
      widgetType: 'vega-lite',
    });

    expect(result.width).toBe(500);
    expect(result.height).toBe(300);
  });
});

describe('processWorkflowDataForWidget', () => {
  test('uses vegaSpec from widgetConfig when provided', () => {
    const result = processWorkflowDataForWidget({
      widgetType: 'vega-lite',
      widgetConfig: {
        vegaSpec: {
          mark: 'bar',
          data: { values: [{ x: 1 }] },
        },
      },
    });

    expect(result.$schema).toBe('https://vega.github.io/schema/vega-lite/v5.json');
    expect(result.mark).toBe('bar');
    expect(result.data.values).toEqual([{ x: 1 }]);
  });

  test('returns null when no vegaSpec in widgetConfig', () => {
    expect(processWorkflowDataForWidget({
      widgetType: 'vega-lite',
      widgetConfig: {},
    })).toBeNull();
  });

  test('returns null when widgetConfig is undefined', () => {
    expect(processWorkflowDataForWidget({
      widgetType: 'vega-lite',
    })).toBeNull();
  });
});