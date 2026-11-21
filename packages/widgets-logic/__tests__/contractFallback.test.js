/**
 * Builder dual-read fallbacks (F04): rows saved before canonical migration
 * still render through legacy shapes.
 */
const {
  processWorkflowDataForWidget,
} = require('../dist/index.cjs');

describe('TableWidgetBuilder legacy flags', () => {
  test('boolean searchable/exportable/selectable behave like enabled objects', () => {
    const result = processWorkflowDataForWidget({
      widgetType: 'table',
      widgetConfig: { searchable: true, exportable: false, selectable: true },
    });
    expect(result.search).toMatchObject({ enabled: true });
    expect(result.export).toMatchObject({ enabled: false });
    expect(result.multiSelect).toMatchObject({ enabled: true });
  });

  test('explicit objects win over legacy booleans', () => {
    const result = processWorkflowDataForWidget({
      widgetType: 'table',
      widgetConfig: { searchable: false, search: { enabled: true } },
    });
    expect(result.search).toMatchObject({ enabled: true });
  });

  test('bulkActions legacy list maps into multiSelect.actions', () => {
    const result = processWorkflowDataForWidget({
      widgetType: 'table',
      widgetConfig: { bulkActions: [{ key: 'k', label: 'L' }] },
    });
    expect(result.multiSelect.actions).toEqual([{ key: 'k', label: 'L' }]);
  });
});

describe('VegaWidgetBuilder legacy spec', () => {
  test('spec-only configs still build (vegaSpec preferred when present)', () => {
    const legacy = processWorkflowDataForWidget({
      widgetType: 'vega-lite',
      widgetConfig: { spec: { mark: 'bar' } },
    });
    expect(legacy).toMatchObject({ mark: 'bar' });
    const canonical = processWorkflowDataForWidget({
      widgetType: 'vega-lite',
      widgetConfig: { spec: { mark: 'line' }, vegaSpec: { mark: 'bar' } },
    });
    expect(canonical).toMatchObject({ mark: 'bar' });
  });
});
