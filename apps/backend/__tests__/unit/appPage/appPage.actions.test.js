const {
  capturePageTriggerBindings,
  normalizePageWidgetActions,
} = require('../../../modules/appPage/appPage.actions');

const queryID = '11111111-1111-4111-8111-111111111111';
const workflowID = '22222222-2222-4222-8222-222222222222';
const missingQueryID = '33333333-3333-4333-8333-333333333333';
const widgetID = '44444444-4444-4444-8444-444444444444';

const pageConfig = {
  dataSources: [
    { alias: 'orders', type: 'query', queryID },
    { alias: 'fulfill', type: 'workflow', workflowID },
  ],
};

const widget = (events) => ({
  widgetID,
  widgetConfig: { events },
});

describe('page-owned trigger bindings', () => {
  it('captures aliases for the page data sources and reports unresolved triggers', () => {
    const captured = capturePageTriggerBindings({
      pageConfig,
      widgetsByID: {
        [widgetID]: widget({
          onClick: [
            { actionType: 'TRIGGER_QUERY', config: { queryID } },
            { actionType: 'TRIGGER_WORKFLOW', config: { workflowID } },
            { actionType: 'TRIGGER_QUERY', config: { queryID: missingQueryID } },
            { actionType: 'EXECUTE_QUERY', config: { alias: 'orders' } },
          ],
        }),
      },
    });
    expect(captured.bindings).toEqual({
      query: { [queryID]: 'orders' },
      workflow: { [workflowID]: 'fulfill' },
    });
    expect(captured.unresolved).toEqual([
      expect.objectContaining({ widgetID, eventName: 'onClick', index: 2, actionType: 'TRIGGER_QUERY', targetID: missingQueryID }),
    ]);
  });

  it('rewrites direct triggers to page aliases and drops unresolved targets with a page diagnostic', () => {
    const diagnostics = [];
    const normalized = normalizePageWidgetActions({
      pageAssetKey: 'orders-page',
      pageConfig,
      widgetsByID: {
        [widgetID]: widget({
          onClick: [
            { actionType: 'TRIGGER_QUERY', config: { queryID, inputValues: { limit: 3 } } },
            { actionType: 'TRIGGER_QUERY', config: { queryID: missingQueryID } },
          ],
          onLoad: [{
            actionType: 'TRIGGER_WORKFLOW',
            config: { workflowID, inputValues: { orderID: '{{ state.variables.orderID }}' }, successToast: 'Sent' },
          }],
        }),
      },
      diagnostics,
    });
    expect(normalized[widgetID].widgetConfig.events).toEqual({
      onClick: [{ actionType: 'EXECUTE_QUERY', config: { alias: 'orders', inputValues: { limit: 3 } } }],
      onLoad: [{
        actionType: 'EXECUTE_QUERY',
        config: { alias: 'fulfill', inputValues: { orderID: '{{ state.variables.orderID }}' }, successToast: 'Sent' },
      }],
    });
    expect(diagnostics).toEqual([
      expect.objectContaining({
        severity: 'warning',
        code: 'ACTION_TARGET_NOT_ALIASED',
        path: `pages.orders-page.widgets.${widgetID}.events.onClick.1`,
      }),
    ]);
  });

  it('uses a page version binding map when the live page has since changed', () => {
    const diagnostics = [];
    const normalized = normalizePageWidgetActions({
      pageAssetKey: 'orders-page',
      pageConfig: { dataSources: [] },
      widgetsByID: { [widgetID]: widget({ onClick: [{ actionType: 'TRIGGER_QUERY', config: { queryID } }] }) },
      triggerBindings: { query: { [queryID]: 'archived_alias' }, workflow: {} },
      diagnostics,
    });
    expect(normalized[widgetID].widgetConfig.events.onClick).toEqual([
      { actionType: 'EXECUTE_QUERY', config: { alias: 'archived_alias' } },
    ]);
    expect(diagnostics).toEqual([]);
  });

  it('flags a target reachable through multiple aliases rather than guessing', () => {
    const captured = capturePageTriggerBindings({
      pageConfig: {
        dataSources: [
          { alias: 'orders', type: 'query', queryID },
          { alias: 'orders_copy', type: 'query', queryID },
        ],
      },
      widgetsByID: { [widgetID]: widget({ onClick: [{ actionType: 'TRIGGER_QUERY', config: { queryID } }] }) },
    });
    expect(captured.ambiguous).toEqual([
      expect.objectContaining({ type: 'query', assetID: queryID }),
    ]);
    expect(captured.bindings.query[queryID]).toBeUndefined();
    expect(captured.unresolved).toEqual([
      expect.objectContaining({ targetID: queryID, actionType: 'TRIGGER_QUERY' }),
    ]);
  });
});
