const {
  processWorkflowDataForWidget,
  resolveWidgetData,
  WIDGET_PROCESSORS_MAP,
} = require('../dist/index.cjs');

describe('TableWidgetBuilder — data shaping', () => {
  test('builds render object with defaults for empty config', () => {
    const result = processWorkflowDataForWidget({ widgetType: 'table', widgetConfig: {} });
    expect(result.data).toEqual([]);
    expect(result.columns).toEqual([]);
    expect(result.pagination).toMatchObject({ enabled: false });
    expect(result.search).toMatchObject({ enabled: false });
  });

  test('prefers numeric totalRows over totalTemplate string', () => {
    const result = processWorkflowDataForWidget({
      widgetType: 'table',
      widgetConfig: {
        dataArrayTemplate: [{ a: 1 }],
        pagination: { enabled: true, pageSize: 25, totalRows: 120, totalTemplate: '30' },
      },
    });
    expect(result.pagination.totalRows).toBe(120);
    expect(result.pagination.pageSize).toBe(25);
  });

  test('coerces numeric-string totalTemplate (SQL COUNT) and floors floats', () => {
    const str = processWorkflowDataForWidget({
      widgetType: 'table',
      widgetConfig: { dataArrayTemplate: [{ a: 1 }, { a: 2 }], pagination: { enabled: true, totalTemplate: '30' } },
    });
    expect(str.pagination.totalRows).toBe(30);

    const float = processWorkflowDataForWidget({
      widgetType: 'table',
      widgetConfig: { dataArrayTemplate: [{ a: 1 }], pagination: { enabled: true, totalTemplate: 7.9 } },
    });
    expect(float.pagination.totalRows).toBe(7);
  });

  test('falls back to data length for missing/invalid totals', () => {
    const missing = processWorkflowDataForWidget({
      widgetType: 'table',
      widgetConfig: { dataArrayTemplate: [{ a: 1 }, { a: 2 }, { a: 3 }] },
    });
    expect(missing.pagination.totalRows).toBe(3);

    const invalid = processWorkflowDataForWidget({
      widgetType: 'table',
      widgetConfig: { dataArrayTemplate: [{ a: 1 }], pagination: { enabled: true, totalTemplate: 'abc' } },
    });
    expect(invalid.pagination.totalRows).toBe(1);
  });

  test('passes through display options and feature configs', () => {
    const result = processWorkflowDataForWidget({
      widgetType: 'table',
      widgetConfig: {
        dataArrayTemplate: [],
        columns: [{ key: 'name', label: 'Name', type: 'text', sortable: true }],
        emptyText: 'Nothing here',
        striped: false,
        dense: true,
        stickyHeader: false,
        search: { enabled: true },
        export: { enabled: true, format: 'json' },
        multiSelect: { enabled: true },
      },
    });
    expect(result.columns).toHaveLength(1);
    expect(result.emptyText).toBe('Nothing here');
    expect(result.striped).toBe(false);
    expect(result.dense).toBe(true);
    expect(result.export).toMatchObject({ enabled: true, format: 'json' });
  });

  test('resolveWidgetData delegates to buildRender', () => {
    const result = resolveWidgetData({
      widgetType: 'table',
      widgetConfig: { dataArrayTemplate: [{ x: 1 }], columns: [] },
      dataSourceResults: {},
    });
    expect(result.data).toEqual([{ x: 1 }]);
  });

  test('returns null for missing config', () => {
    expect(processWorkflowDataForWidget({ widgetType: 'table' })).toBeNull();
  });
});

describe('Widget processor registry — new types fall through safely', () => {
  test('only table + vega builders registered; inputs use passthrough', () => {
    expect(Object.keys(WIDGET_PROCESSORS_MAP).sort()).toEqual(['table', 'vega', 'vega-lite']);
  });

  test.each([
    'text-input', 'select', 'multi-select', 'checkbox', 'radio-group', 'switch',
    'slider', 'search-input', 'file-upload', 'divider', 'tabs', 'key-value',
    'json-viewer', 'list', 'badge', 'progress', 'timeline', 'video', 'code-block',
  ])('passthrough returns raw config for %s', (type) => {
    const cfg = { label: 'x' };
    expect(processWorkflowDataForWidget({ widgetType: type, widgetConfig: cfg })).toBe(cfg);
  });
});
