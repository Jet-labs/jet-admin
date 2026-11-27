const { createApplicationDefinition, validateApplicationDefinition, collectPageWidgetIDs, validateApplicationRouteParams } = require('@jet-admin/application-contracts');
const { createApplicationSchema, saveDraftSchema, linkPageSchema } = require('../../../modules/application/application.validator');
const widgetID = '11111111-1111-4111-8111-111111111111';
const assets = [{ assetType: 'appPage', assetKey: 'orders-page' }];
const definition = () => ({ ...createApplicationDefinition(), routes: [{ id: 'orders', path: '/orders', pageAssetKey: 'orders-page' }], shell: { kind: 'sidebar', homeRouteID: 'orders', navigation: [{ routeID: 'orders', label: 'Orders' }] } });

describe('Application composition contracts', () => {
  it('creates isolated empty definitions', () => {
    const first = createApplicationDefinition();
    first.routes.push({});
    expect(createApplicationDefinition().routes).toEqual([]);
    expect(validateApplicationDefinition(createApplicationDefinition()).valid).toBe(true);
  });
  it('defaults application state persistence to none and rejects unknown modes', () => {
    const empty = createApplicationDefinition();
    expect(empty.state.persistence).toEqual({ mode: 'none', resetOnRelease: true });
    const value = definition();
    value.state.persistence = { mode: 'cookies', resetOnRelease: true };
    expect(validateApplicationDefinition(value, assets).valid).toBe(false);
  });
  it('normalizes legacy header shells and defaults navigation appearance', () => {
    const value = definition();
    value.shell.kind = 'header';
    value.shell.navigation = [{ routeID: 'orders', label: 'Orders' }];
    delete value.shell.appearance;
    delete value.shell.branding;
    const result = validateApplicationDefinition(value, assets);
    expect(result.valid).toBe(true);
    expect(result.definition.shell.kind).toBe('topbar');
    expect(result.definition.shell.appearance).toMatchObject({
      variant: 'pills',
      size: 'md',
      width: 220,
      collapsible: true,
      sticky: true,
    });
    expect(result.definition.shell.navigation[0]).toMatchObject({
      routeID: 'orders',
      label: 'Orders',
      icon: 'dot',
      group: '',
      badge: '',
      hidden: false,
    });
  });
  it('rejects out-of-range navigation width', () => {
    const value = definition();
    value.shell.appearance = {
      ...createApplicationDefinition().shell.appearance,
      width: 90,
    };
    expect(
      validateApplicationDefinition(value, assets).diagnostics.map((item) => item.code)
    ).toContain('INVALID_DEFINITION');
  });
  it('accepts a linked page route and applies canonical defaults', () => {
    const result = validateApplicationDefinition(definition(), assets);
    expect(result.valid).toBe(true);
    expect(result.definition.routes[0].params).toEqual({});
  });
  it.each([
    ['missing asset', value => value.routes[0].pageAssetKey = 'missing', 'MISSING_PAGE_ASSET'],
    ['duplicate ID', value => value.routes.push({ ...value.routes[0], path: '/other' }), 'DUPLICATE_ROUTE_ID'],
    ['case collision', value => value.routes.push({ ...value.routes[0], id: 'other', path: '/ORDERS' }), 'DUPLICATE_ROUTE_PATH'],
    ['missing home', value => value.shell.homeRouteID = 'missing', 'INVALID_HOME_ROUTE'],
    ['missing navigation', value => value.shell.navigation[0].routeID = 'missing', 'UNKNOWN_NAVIGATION_ROUTE'],
    ['bad default', value => value.state.application.amount = { type: 'number', default: 'abc' }, 'INVALID_VARIABLE_DEFAULT'],
    ['bad locale', value => value.localization.defaultLocale = 'fr', 'INVALID_DEFAULT_LOCALE'],
  ])('rejects %s', (_name, mutate, code) => {
    const value = definition(); mutate(value);
    expect(validateApplicationDefinition(value, assets).diagnostics.map(item => item.code)).toContain(code);
  });
  it('rejects equivalent parameter patterns and repeated parameter names', () => {
    const value = definition();
    value.routes.push({ id: 'detail', path: '/orders/:id', pageAssetKey: 'orders-page' }, { id: 'other', path: '/orders/:orderID', pageAssetKey: 'orders-page' });
    expect(validateApplicationDefinition(value, assets).diagnostics).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'DUPLICATE_ROUTE_PATH' })]));
    value.routes[1].path = '/orders/:id/:id';
    expect(validateApplicationDefinition(value, assets).diagnostics).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'INVALID_ROUTE_PARAMS' })]));
  });
  it('does not accept execution definitions before the runtime gates exist', () => {
    const value = definition(); value.actions.save = { queryID: widgetID };
    expect(validateApplicationDefinition(value, assets).valid).toBe(false);
  });
  it('rejects prototype keys, non-JSON values and oversized inputs', () => {
    expect(validateApplicationDefinition(JSON.parse('{"__proto__":{}}')).valid).toBe(false);
    expect(validateApplicationDefinition({ bad: () => {} }).valid).toBe(false);
    const value = definition(); value.localization.defaultLocale = 'a'.repeat(300000);
    expect(validateApplicationDefinition(value).diagnostics[0].code).toBe('INVALID_DEFINITION_JSON');
  });
  it('collects widget references from the list and nested layout, preserving placement/resource distinction', () => {
    expect(collectPageWidgetIDs({ widgets: [`widget_${widgetID}_1`], layout: { children: [{ widgetKey: `widget_${widgetID}_2` }] } })).toEqual([widgetID]);
    expect(() => collectPageWidgetIDs({ widgets: ['not-a-widget'] })).toThrow('Invalid widget');
  });
  it('validates declared route params and accepts undeclared params as strings', () => {
    const route = { path: '/records/:recordID/:tab', params: { recordID: 'integer' } };
    expect(validateApplicationRouteParams(route, { recordID: '42', tab: 'details' })).toBe(true);
    expect(validateApplicationRouteParams(route, { recordID: 'not-an-integer', tab: 'details' })).toBe(false);
    expect(validateApplicationRouteParams({ path: '/records/:id', params: { id: 'uuid' } }, { id: 'not-a-uuid' })).toBe(false);
    expect(validateApplicationRouteParams({ path: '/records/:id', params: { id: 'uuid' } }, { id: widgetID })).toBe(true);
  });
  it('requires expected revision and explicit page ownership mode', () => {
    expect(saveDraftSchema.safeParse({ definition: definition() }).success).toBe(false);
    expect(linkPageSchema.safeParse({ expectedRevision: 1, assetKey: 'orders-page', appPageID: widgetID, managementMode: 'managed' }).success).toBe(true);
    expect(linkPageSchema.safeParse({ expectedRevision: 1, assetKey: 'orders-page', appPageID: widgetID, managementMode: 'clone' }).success).toBe(false);
    expect(createApplicationSchema.safeParse({ title: 'Orders', slug: 'orders', tenantID: widgetID }).success).toBe(false);
  });
});
