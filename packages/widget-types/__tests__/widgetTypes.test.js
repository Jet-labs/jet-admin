const {
  WIDGET_TYPES,
  WIDGET_CONFIG_SCHEMAS,
  WIDGET_EVENT_TYPES,
  WIDGET_METHODS,
  getWidgetEventTypes,
  getEventInputDefinitions,
  getWidgetMethods,
} = require('../dist/index.cjs');

const EXPECTED_TYPES = [
  'vega-lite', 'vega', 'button', 'table', 'text', 'stat', 'alert', 'form',
  'image', 'iframe', 'date-picker', 'date-range-picker', 'html',
  'text-input', 'select', 'multi-select', 'checkbox', 'radio-group', 'switch',
  'slider', 'search-input', 'file-upload', 'divider', 'tabs',
  'key-value', 'json-viewer', 'list', 'badge', 'progress', 'timeline',
  'video', 'code-block',
];

describe('WIDGET_TYPES registry', () => {
  test('exposes all P0 + P1 widget type values', () => {
    const values = Object.values(WIDGET_TYPES).map((t) => t.value);
    EXPECTED_TYPES.forEach((v) => expect(values).toContain(v));
  });

  test('every type has a name and value', () => {
    Object.entries(WIDGET_TYPES).forEach(([key, t]) => {
      expect(typeof t.name).toBe('string');
      expect(typeof t.value).toBe('string');
      expect(t.value.length).toBeGreaterThan(0);
    });
  });

  test('type values are unique', () => {
    const values = Object.values(WIDGET_TYPES).map((t) => t.value);
    expect(new Set(values).size).toBe(values.length);
  });
});

describe('WIDGET_CONFIG_SCHEMAS', () => {
  test('has a schema entry for every expected type', () => {
    EXPECTED_TYPES.forEach((v) => {
      expect(WIDGET_CONFIG_SCHEMAS[v]).toBeDefined();
    });
  });

  test('each schema has widgetType, description, schema object and events array', () => {
    Object.entries(WIDGET_CONFIG_SCHEMAS).forEach(([key, entry]) => {
      expect(entry.widgetType).toBe(key);
      expect(typeof entry.description).toBe('string');
      expect(entry.schema).toBeDefined();
      expect(entry.schema.type).toBe('object');
      expect(Array.isArray(entry.events)).toBe(true);
    });
  });

  test('new input schemas declare expected props', () => {
    expect(WIDGET_CONFIG_SCHEMAS['text-input'].schema.properties.inputType.enum).toContain('textarea');
    expect(WIDGET_CONFIG_SCHEMAS['select'].schema.properties.options.type).toBe('array');
    expect(WIDGET_CONFIG_SCHEMAS['slider'].schema.properties.min).toBeDefined();
    expect(WIDGET_CONFIG_SCHEMAS['tabs'].schema.properties.tabs.type).toBe('array');
    expect(WIDGET_CONFIG_SCHEMAS['progress'].schema.properties.variant.enum).toEqual(['bar', 'ring']);
  });

  test('table schema supports new display + column options', () => {
    const props = WIDGET_CONFIG_SCHEMAS['table'].schema.properties;
    expect(props.columns.items.properties.type.enum).toContain('badge');
    expect(props.columns.items.properties.sortable).toBeDefined();
    expect(props.columns.items.properties.hidden).toBeDefined();
    expect(props.pagination.properties.pageSize).toBeDefined();
    expect(props.emptyText).toBeDefined();
    expect(props.striped).toBeDefined();
    expect(props.dense).toBeDefined();
  });
});

describe('widget events', () => {
  test('COMMON events always present', () => {
    expect(WIDGET_EVENT_TYPES.COMMON.map((e) => e.value)).toEqual(
      expect.arrayContaining(['onClick', 'onRefresh', 'onLoad'])
    );
  });

  test('input widgets expose onChange', () => {
    ['text-input', 'select', 'multi-select', 'checkbox', 'radio-group', 'switch', 'slider', 'search-input', 'tabs'].forEach((t) => {
      expect(getWidgetEventTypes(t).map((e) => e.value)).toContain('onChange');
    });
  });

  test('search-input exposes debounced onSearch with searchTerm arg', () => {
    const defs = getEventInputDefinitions('search-input', 'onSearch');
    expect(defs.map((d) => d.key)).toContain('event.searchTerm');
  });

  test('file-upload onChange exposes files payload', () => {
    const defs = getEventInputDefinitions('file-upload', 'onChange');
    expect(defs.map((d) => d.key)).toContain('event.files');
  });

  test('list + timeline expose onItemClick with item + index', () => {
    expect(getEventInputDefinitions('list', 'onItemClick').map((d) => d.key)).toEqual(
      expect.arrayContaining(['event.item', 'event.index'])
    );
    expect(getEventInputDefinitions('timeline', 'onItemClick').map((d) => d.key)).toEqual(
      expect.arrayContaining(['event.item', 'event.index'])
    );
  });

  test('unknown widget falls back to COMMON only', () => {
    expect(getWidgetEventTypes('nope')).toEqual(WIDGET_EVENT_TYPES.COMMON);
  });
});

describe('widget methods', () => {
  test('table exposes refresh + setSelectedRow + clearSelection', () => {
    expect(getWidgetMethods('table').map((m) => m.name)).toEqual(
      expect.arrayContaining(['refresh', 'setSelectedRow', 'clearSelection'])
    );
  });

  test('input widgets expose setValue/clear', () => {
    expect(getWidgetMethods('text-input').map((m) => m.name)).toContain('setValue');
    expect(getWidgetMethods('select').map((m) => m.name)).toContain('clear');
    expect(getWidgetMethods('checkbox').map((m) => m.name)).toContain('toggle');
    expect(getWidgetMethods('tabs').map((m) => m.name)).toContain('setTab');
  });

  test('unknown widget returns empty methods', () => {
    expect(getWidgetMethods('divider')).toEqual([]);
  });
});
