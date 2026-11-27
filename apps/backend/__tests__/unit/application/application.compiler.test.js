const { createApplicationDefinition } = require('@jet-admin/application-contracts');
const { compileApplicationRelease } = require('../../../modules/application/application.compiler');

const widgetID = '11111111-1111-4111-8111-111111111111';
const queryID = '22222222-2222-4222-8222-222222222222';
const writeQueryID = '44444444-4444-4444-8444-444444444444';
const workflowID = '55555555-5555-4555-8555-555555555555';
const datasourceID = '33333333-3333-4333-8333-333333333333';

const application = { applicationID: 'app-a', tenantID: 'tenant-a', title: 'Orders', slug: 'orders' };
const definition = () => ({
  ...createApplicationDefinition(),
  routes: [{ id: 'orders', path: '/orders', pageAssetKey: 'orders-page' }],
  shell: { kind: 'sidebar', homeRouteID: 'orders', navigation: [{ routeID: 'orders', label: 'Orders' }] },
});
const readSource = { alias: 'orders', type: 'query', queryID, triggerMode: 'auto', inputValues: { limit: 10 } };
const writeSource = { alias: 'saveOrder', type: 'query', queryID: writeQueryID, triggerMode: 'manual' };
const page = (sources = [readSource], pageWidgets = [`widget_${widgetID}_1`]) => ({
  appPageID: 'page-a',
  appPageTitle: 'Orders',
  appPageConfig: {
    widgets: pageWidgets,
    variables: [],
    dataSources: sources,
    layout: { id: 'root', type: 'column', children: [] },
  },
});
const widget = (events = {}) => ({
  widgetID,
  widgetTitle: 'Orders grid',
  widgetType: 'table',
  widgetConfig: {
    dataArrayTemplate: '{{ state.queries.orders.data }}',
    events,
  },
});
const query = { dataQueryID: queryID, tenantID: 'tenant-a', datasourceID, datasourceType: 'postgresql', dataQueryOptions: { sql: 'select * from orders', inputDefinitions: [] } };
const writeQuery = { dataQueryID: writeQueryID, tenantID: 'tenant-a', datasourceID, datasourceType: 'postgresql', dataQueryOptions: { sql: 'update orders set status = $1', inputDefinitions: [] } };
const queries = { [queryID]: query, [writeQueryID]: writeQuery };
const workflow = {
  workflowID,
  tenantID: 'tenant-a',
  workflowOptions: { inputDefinitions: [{ key: 'orderID', type: 'string', required: true }] },
  assetVersionID: 'workflow-version-a',
};
const workflows = { [workflowID]: workflow };
const compile = (overrides = {}) => compileApplicationRelease({
  application,
  definition: definition(),
  pagesByAsset: { 'orders-page': page() },
  widgetsByID: { [widgetID]: widget() },
  queriesByID: queries,
  ...overrides,
});

describe('Application release compiler', () => {
  it('pins configured queries without a classification and keeps only approved widget actions', () => {
    const compiled = compile({
      widgetsByID: {
        [widgetID]: widget({
          onRowSelect: [{ actionType: 'SET_VARIABLE', config: { key: 'state.variables.orderID', value: '{{ event.row.id }}' } }],
          onClick: [
            { actionType: 'EXECUTE_QUERY', config: { alias: 'orders', inputValues: { limit: 5 }, queryID: 'leak-me' } },
            { actionType: 'TRIGGER_QUERY', config: { queryID: 'leak-me' } },
          ],
        }),
      },
    });
    expect(compiled.clientManifest.mode).toBe('runtime');
    expect(compiled.clientManifest.executionEnabled).toBe(true);
    expect(compiled.clientManifest.actionsEnabled).toBe(true);
    expect(compiled.clientManifest).not.toHaveProperty('mutationsEnabled');
    expect(compiled.clientManifest).not.toHaveProperty('readOnly');
    expect(compiled.clientManifest).not.toHaveProperty('actions');
    expect(compiled.clientManifest.pages['orders-page'].appPageConfig.dataSources[0]).toEqual(
      expect.objectContaining({ alias: 'orders', type: 'query', triggerMode: 'auto' })
    );
    expect(compiled.clientManifest.pages['orders-page'].appPageConfig.dataSources[0].queryID).toBeUndefined();
    expect(compiled.clientManifest.widgets[widgetID].widgetConfig.events.onRowSelect).toHaveLength(1);
    expect(compiled.clientManifest.widgets[widgetID].widgetConfig.events.onClick).toEqual([
      { actionType: 'EXECUTE_QUERY', config: { alias: 'orders', inputValues: { limit: 5 } } },
    ]);
    expect(compiled.clientManifest.widgets[widgetID].widgetConfig.events.onClick[0].config.queryID).toBeUndefined();
    expect(compiled.clientManifest.diagnostics).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: 'ACTION_TARGET_NOT_ALIASED' })])
    );
    expect(compiled.clientManifest.diagnostics.map((item) => JSON.stringify(item)).join(' ')).not.toContain('leak-me');
    expect(compiled.serverManifest.pages['orders-page'].orders).toMatchObject({
      dataQueryID: queryID,
      datasourceID,
      dataQueryOptions: query.dataQueryOptions,
    });
    expect(compiled.contentHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('pins mutation query definitions through the same source and widget action contract', () => {
    const compiled = compile({
      pagesByAsset: { 'orders-page': page([readSource, writeSource]) },
      widgetsByID: {
        [widgetID]: widget({
          onClick: [{ actionType: 'EXECUTE_QUERY', config: { alias: 'saveOrder', inputValues: { status: 'paid' } } }],
        }),
      },
    });
    const write = compiled.clientManifest.pages['orders-page'].appPageConfig.dataSources.find((source) => source.alias === 'saveOrder');
    expect(write).toEqual(expect.objectContaining({
      alias: 'saveOrder',
      triggerMode: 'manual',
      refreshOn: [],
      refetchInterval: 0,
    }));
    expect(write.queryID).toBeUndefined();
    expect(write).not.toHaveProperty('effect');
    expect(write).not.toHaveProperty('readOnly');
    expect(compiled.clientManifest.widgets[widgetID].widgetConfig.events.onClick).toEqual([
      { actionType: 'EXECUTE_QUERY', config: { alias: 'saveOrder', inputValues: { status: 'paid' } } },
    ]);
    expect(compiled.serverManifest.pages['orders-page'].saveOrder).toMatchObject({
      dataQueryID: writeQueryID,
      dataQueryOptions: writeQuery.dataQueryOptions,
    });
    expect(compiled.serverManifest.pages['orders-page'].saveOrder).not.toHaveProperty('effect');
    expect(compiled.serverManifest.pages['orders-page'].saveOrder).not.toHaveProperty('idempotency');
    expect(compiled.clientManifest.diagnostics).toEqual([]);
  });

  it.each(['auto', 'reactive', 'manual'])('preserves configured %s triggers and ignores legacy effect labels', triggerMode => {
    const source = { ...writeSource, triggerMode, effect: 'write', readOnly: true, refreshOn: ['variables.status'], refetchInterval: 5000 };
    const compiled = compile({ pagesByAsset: { 'orders-page': page([source]) } });
    const pinned = compiled.clientManifest.pages['orders-page'].appPageConfig.dataSources[0];
    expect(pinned).toMatchObject({ triggerMode, refreshOn: ['variables.status'], refetchInterval: 5000 });
    expect(pinned).not.toHaveProperty('effect');
    expect(pinned).not.toHaveProperty('readOnly');
    expect(source).toMatchObject({ effect: 'write', readOnly: true, triggerMode });
    expect(compiled.clientManifest.diagnostics).toEqual([]);
  });

  it('is deterministic for identical sources', () => {
    const args = { application, definition: definition(), pagesByAsset: { 'orders-page': page() }, widgetsByID: { [widgetID]: widget() }, queriesByID: queries };
    expect(compileApplicationRelease(args).contentHash).toBe(compileApplicationRelease(args).contentHash);
  });

  it.each([
    ['missing workflow source', { alias: 'orders', type: 'workflow', workflowID: queryID }, 'APPLICATION_ASSET_NOT_FOUND'],
    ['missing listener source', { alias: 'orders', type: 'listener', listenerID: queryID }, 'APPLICATION_ASSET_NOT_FOUND'],
    ['unknown source type', { alias: 'orders', type: 'unknown' }, 'UNSUPPORTED_DATA_SOURCE'],
    ['duplicate alias', { alias: 'orders', type: 'query', queryID }, 'DUPLICATE_DATA_SOURCE_ALIAS'],
    ['missing query', { alias: 'orders', type: 'query', queryID: 'missing' }, 'APPLICATION_ASSET_NOT_FOUND'],
  ])('rejects %s', (_name, source, code) => {
    const sources = code === 'DUPLICATE_DATA_SOURCE_ALIAS'
      ? [source, { ...source }]
      : [source];
    expect(() => compile({
      pagesByAsset: { 'orders-page': page(sources) },
    })).toThrow(expect.objectContaining({ code }));
  });

  it('does not resolve direct query or workflow triggers without a page binding', () => {
    const workflowSource = { alias: 'fulfill', type: 'workflow', workflowID, triggerMode: 'manual', inputValues: { orderID: 'default-order' } };
    const compiled = compile({
      pagesByAsset: { 'orders-page': page([readSource, workflowSource]) },
      widgetsByID: {
        [widgetID]: widget({
          onClick: [{ actionType: 'TRIGGER_QUERY', config: { queryID, inputValues: { limit: 3 } } }],
          onLoad: [{
            actionType: 'TRIGGER_WORKFLOW',
            config: { workflowID, inputValues: { orderID: '{{ state.variables.orderID }}' }, successToast: 'Sent' },
          }],
        }),
      },
      workflowsByID: workflows,
    });
    expect(compiled.clientManifest.widgets[widgetID].widgetConfig.events).toEqual({});
    expect(compiled.clientManifest.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'ACTION_TARGET_NOT_ALIASED', path: `widgets.${widgetID}.events.onClick.0` }),
      expect.objectContaining({ code: 'ACTION_TARGET_NOT_ALIASED', path: `widgets.${widgetID}.events.onLoad.0` }),
    ]));
    const serialized = JSON.stringify(compiled.clientManifest);
    expect(serialized).not.toContain(queryID);
    expect(serialized).not.toContain(workflowID);
  });

  it('keeps declared application-variable and navigation actions and drops undeclared targets', () => {
    const appDefinition = {
      ...definition(),
      state: { application: { allowIntegrations: { type: 'boolean', default: true } } },
    };
    const compiled = compile({
      definition: appDefinition,
      widgetsByID: {
        [widgetID]: widget({
          onClick: [
            { actionType: 'SET_APPLICATION_VARIABLE', config: { key: 'state.application.variables.allowIntegrations', value: false } },
            { actionType: 'SET_APPLICATION_VARIABLE', config: { key: 'state.application.variables.missingKey', value: true } },
            { actionType: 'NAVIGATE', config: { routeID: 'orders', params: { orderID: '42' }, replace: true } },
            { actionType: 'NAVIGATE', config: { routeID: 'somewhere-else' } },
          ],
        }),
      },
    });
    expect(compiled.clientManifest.widgets[widgetID].widgetConfig.events.onClick).toEqual([
      { actionType: 'SET_APPLICATION_VARIABLE', config: { key: 'allowIntegrations', value: false } },
      { actionType: 'NAVIGATE', config: { routeID: 'orders', params: { orderID: '42' }, replace: true } },
    ]);
    expect(compiled.clientManifest.diagnostics).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'ACTION_APPLICATION_VARIABLE_INVALID' }),
      expect.objectContaining({ code: 'ACTION_ROUTE_NOT_FOUND' }),
    ]));
  });

  it('preserves configured shell presets and navigation metadata', () => {
    const appDefinition = {
      ...definition(),
      shell: {
        ...definition().shell,
        kind: 'bottom-bar',
        appearance: {
          variant: 'minimal',
          width: 280,
          collapsedWidth: 72,
          sticky: false,
        },
        branding: { title: 'Ops', subtitle: 'Control room' },
        navigation: [
          {
            routeID: 'orders',
            label: 'Orders',
            icon: 'table',
            group: 'Workspace',
            badge: 'New',
            hidden: false,
          },
        ],
      },
    };
    const compiled = compile({ definition: appDefinition });
    expect(compiled.clientManifest.definition.shell).toMatchObject({
      kind: 'bottom-bar',
      branding: { title: 'Ops', subtitle: 'Control room' },
      appearance: {
        variant: 'minimal',
        width: 280,
        collapsedWidth: 72,
        sticky: false,
      },
    });
    expect(compiled.clientManifest.definition.shell.navigation[0]).toMatchObject({
      routeID: 'orders',
      icon: 'table',
      group: 'Workspace',
      badge: 'New',
    });
  });

  it('removes widget-level standalone data sources from the runtime manifest', () => {
    const compiled = compile({
      widgetsByID: {
        [widgetID]: {
          ...widget(),
          widgetConfig: {
            ...widget().widgetConfig,
            dataSources: [{ type: 'query', queryID, alias: 'orders' }],
          },
        },
      },
    });
    expect(compiled.clientManifest.widgets[widgetID].widgetConfig).not.toHaveProperty('dataSources');
    expect(JSON.stringify(compiled.clientManifest)).not.toContain(queryID);
  });

  it('rejects unsupported executable widget types', () => {
    expect(() => compile({
      pagesByAsset: { 'orders-page': page([]) },
      widgetsByID: { [widgetID]: { ...widget(), widgetType: 'iframe' } },
      queriesByID: {},
    })).toThrow(expect.objectContaining({ code: 'UNSUPPORTED_WIDGET_TYPE' }));
  });

  it('removes a widget action when its page data source is missing', () => {
    const compiled = compile({
      widgetsByID: {
        [widgetID]: widget({
          onClick: [{ actionType: 'EXECUTE_QUERY', config: { alias: 'missing', inputValues: {} } }],
        }),
      },
    });
    expect(compiled.clientManifest.widgets[widgetID].widgetConfig.events).toEqual({});
    expect(compiled.clientManifest.diagnostics).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: 'ACTION_TARGET_NOT_FOUND' })])
    );
  });

  it('removes unsafe variable targets from released widget actions', () => {
    const compiled = compile({
      widgetsByID: {
        [widgetID]: widget({
          onClick: [
            { actionType: 'SET_VARIABLE', config: { key: '__proto__', value: 'polluted' } },
            { actionType: 'SET_VARIABLE', config: { key: 'state.variables.orderID', value: '{{ event.row.id }}' } },
          ],
        }),
      },
    });
    expect(compiled.clientManifest.widgets[widgetID].widgetConfig.events.onClick).toEqual([
      { actionType: 'SET_VARIABLE', config: { key: 'state.variables.orderID', value: '{{ event.row.id }}' } },
    ]);
    expect(compiled.clientManifest.diagnostics).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: 'ACTION_VARIABLE_INVALID' })])
    );
  });

  it('keeps application reset and valid event actions, dropping unsafe events', () => {
    const compiled = compile({
      widgetsByID: {
        [widgetID]: widget({
          onClick: [
            { actionType: 'RESET_APPLICATION_STATE', config: { ignored: true } },
            { actionType: 'EMIT_APPLICATION_EVENT', config: { name: 'orders:refresh', payload: { limit: 5 } } },
            { actionType: 'EMIT_APPLICATION_EVENT', config: { name: 'bad name', payload: {} } },
            { actionType: 'EMIT_APPLICATION_EVENT', config: { name: 'orders:big', payload: 'x'.repeat(65 * 1024) } },
          ],
        }),
      },
    });
    expect(compiled.clientManifest.widgets[widgetID].widgetConfig.events.onClick).toEqual([
      { actionType: 'RESET_APPLICATION_STATE', config: {} },
      { actionType: 'EMIT_APPLICATION_EVENT', config: { name: 'orders:refresh', payload: { limit: 5 } } },
    ]);
    expect(
      compiled.clientManifest.diagnostics.filter((item) => item.code === 'ACTION_EVENT_INVALID')
    ).toHaveLength(2);
  });

  it('keeps supported composite children and sanitizes their inline events', () => {
    const compiled = compile({
      widgetsByID: {
        [widgetID]: {
          widgetID,
          widgetTitle: 'Composite',
          widgetType: 'composite',
          widgetConfig: {
            composite: {
              schemaVersion: 1,
              layout: {
                id: 'composite-root',
                type: 'row',
                children: [
                  {
                    id: 'composite-button',
                    type: 'inline-widget',
                    span: 6,
                    inlineWidget: {
                      widgetType: 'button',
                      widgetTitle: 'Refresh',
                      widgetConfig: {
                        label: 'Refresh',
                        events: {
                          onClick: [
                            { actionType: 'EXECUTE_QUERY', config: { alias: 'orders', inputValues: { limit: 1 } } },
                            { actionType: 'NAVIGATE', config: { routeID: 'missing-route' } },
                          ],
                        },
                      },
                    },
                  },
                  {
                    id: 'composite-iframe',
                    type: 'inline-widget',
                    span: 6,
                    inlineWidget: { widgetType: 'iframe', widgetConfig: {} },
                  },
                ],
              },
              inputs: [{ key: 'customer', type: 'string', default: '' }],
              outputs: [],
              values: {},
            },
          },
        },
      },
    });
    const layout = compiled.clientManifest.widgets[widgetID].widgetConfig.composite.layout;
    expect(layout.children).toHaveLength(1);
    expect(layout.children[0].inlineWidget.widgetType).toBe('button');
    expect(layout.children[0].inlineWidget.widgetConfig.events.onClick).toEqual([
      { actionType: 'EXECUTE_QUERY', config: { alias: 'orders', inputValues: { limit: 1 } } },
    ]);
    expect(compiled.clientManifest.diagnostics).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: 'COMPOSITE_WIDGET_UNAVAILABLE' })])
    );
  });
});
