/**
 * Descriptors + normalization + validation (F04/F09/F15, B07/B08).
 *
 * Consumes the BUILT bundle (like the existing suite) so dist freshness is
 * enforced: rebuild before relying on results.
 */
const {
  WIDGET_TYPES,
  WIDGET_CONFIG_SCHEMAS,
  WIDGET_DESCRIPTORS,
  WIDGET_SCHEMA_VERSION,
  getWidgetDescriptor,
  getSupportedEvents,
  getSupportedMethods,
  normalizeWidgetConfig,
  isNormalizedConfig,
  validateWidgetConfig,
} = require('../dist/index.cjs');

const EXPECTED_TYPES = [
  'vega-lite', 'vega', 'button', 'table', 'text', 'stat', 'alert', 'form',
  'image', 'iframe', 'date-picker', 'date-range-picker', 'html',
  'text-input', 'select', 'multi-select', 'checkbox', 'radio-group', 'switch',
  'slider', 'search-input', 'file-upload', 'divider', 'tabs',
  'key-value', 'json-viewer', 'list', 'badge', 'progress', 'timeline',
  'video', 'code-block',
];

describe('canonical descriptors cover all 32 types', () => {
  test('every registered type has a versioned descriptor with metadata', () => {
    expect(Object.keys(WIDGET_DESCRIPTORS).sort()).toEqual([...EXPECTED_TYPES].sort());
    for (const type of EXPECTED_TYPES) {
      const d = getWidgetDescriptor(type);
      expect(d.type).toBe(type);
      expect(d.schemaVersion).toBe(WIDGET_SCHEMA_VERSION);
      expect(typeof d.category).toBe('string');
      expect(Array.isArray(d.tags)).toBe(true);
      expect(d.tags.length).toBeGreaterThan(0);
      expect(Array.isArray(d.searchAliases)).toBe(true);
      expect(d.defaults && typeof d.defaults === 'object').toBe(true);
      expect(d.example && typeof d.example === 'object').toBe(true);
    }
  });

  test('descriptor types match WIDGET_TYPES values and schema registry keys', () => {
    const values = Object.values(WIDGET_TYPES).map((t) => t.value);
    for (const type of EXPECTED_TYPES) {
      expect(values).toContain(type);
      expect(WIDGET_CONFIG_SCHEMAS[type]).toBeDefined();
    }
  });

  test('every descriptor default config validates (authoring mode)', () => {
    for (const type of EXPECTED_TYPES) {
      const d = getWidgetDescriptor(type);
      const result = validateWidgetConfig(type, d.defaults, { mode: 'authoring' });
      expect([type, result.errors]).toEqual([type, []]);
    }
  });

  test('every descriptor example validates and normalizes stably', () => {
    for (const type of EXPECTED_TYPES) {
      const d = getWidgetDescriptor(type);
      const result = validateWidgetConfig(type, d.example, { mode: 'authoring' });
      expect([type, result.errors]).toEqual([type, []]);
      expect(isNormalizedConfig(type, d.example)).toBe(true);
    }
  });

  test('aliases always point at real canonical behavior (renderer-verified set)', () => {
    expect(getWidgetDescriptor('stat').aliases).toMatchObject({ value: 'valueTemplate' });
    expect(getWidgetDescriptor('iframe').aliases).toMatchObject({ src: 'url' });
    expect(getWidgetDescriptor('text').aliases).toMatchObject({ align: 'textAlign' });
    expect(getWidgetDescriptor('button').aliases).toMatchObject({ label: 'text' });
    expect(getWidgetDescriptor('date-range-picker').aliases).toMatchObject({
      startPlaceholder: 'placeholderStart',
      endPlaceholder: 'placeholderEnd',
    });
  });

  test('capability declarations hide only genuinely unimplemented entries', () => {
    // Select wires onOpen/onClose plus a clearable control (E15/B17).
    expect(getSupportedEvents('select').map((e) => e.value)).toEqual(
      expect.arrayContaining(['onChange', 'onClear', 'onOpen', 'onClose'])
    );
    // Button advertises no phantom submit; click IS implemented (E03/B17).
    expect(getSupportedEvents('button').map((e) => e.value)).not.toContain('onSubmit');
    expect(getSupportedMethods('button').map((m) => m.name)).toContain('click');
    // List advertises onSearch without firing it (B14/E27).
    expect(getSupportedEvents('list').map((e) => e.value)).not.toContain('onSearch');
    // Unknown types fall back to empty (methods) and COMMON (events).
    expect(getSupportedMethods('nope')).toEqual([]);
  });

  test('unknown descriptor lookup returns null', () => {
    expect(getWidgetDescriptor('chart')).toBeNull();
    expect(getWidgetDescriptor('')).toBeNull();
  });
});

describe('normalizeWidgetConfig legacy matrix (section 4 priority rows)', () => {
  const cases = [
    ['iframe src->url', 'iframe', { src: 'https://x.test' }, { url: 'https://x.test' }],
    ['text align->textAlign', 'text', { align: 'center', content: 'hi' }, { textAlign: 'center' }],
    ['button label->text', 'button', { label: 'Go' }, { text: 'Go' }],
    ['button loading->isLoading', 'button', { loading: true }, { isLoading: true }],
    ['stat value->valueTemplate (dual-write)', 'stat', { value: '{{a}}' }, { valueTemplate: '{{a}}' }],
    ['date-range placeholders', 'date-range-picker',
      { startPlaceholder: 'S', endPlaceholder: 'E' },
      { placeholderStart: 'S', placeholderEnd: 'E' }],
    ['table searchable->search', 'table', { searchable: true }, { search: { enabled: true } }],
    ['table bulkActions->multiSelect', 'table', { bulkActions: [{ key: 'k' }] }, { multiSelect: { actions: [{ key: 'k' }] } }],
    ['form resetLabel->showReset', 'form', { fields: [], resetLabel: 'Clear' }, { showReset: true }],
    ['vega spec->vegaSpec', 'vega', { spec: { marks: [] } }, { vegaSpec: { marks: [] } }],
    ['chart options nesting', 'vega-lite',
      { vegaSpec: { mark: 'bar' }, options: { showActions: true } },
      { showActions: true }],
    ['root showHeader->properties', 'text', { content: 'x', showHeader: false }, {}],
  ];

  test.each(cases)('%s', (name, type, input, expectedSubset) => {
    const { config, migrations } = normalizeWidgetConfig(type, input);
    expect(migrations.length).toBeGreaterThan(0);
    for (const [k, v] of Object.entries(expectedSubset)) {
      expect(config[k]).toEqual(v);
    }
    // Canonical keys present; legacy keys gone (except intentional dual-write).
    expect(isNormalizedConfig(type, config)).toBe(true);
  });

  test('canonical input wins conflicts and warns instead of corrupting', () => {
    const { config, warnings } = normalizeWidgetConfig('text', { align: 'left', textAlign: 'right' });
    expect(config.textAlign).toBe('right');
    expect(config.align).toBeUndefined();
    expect(warnings.some((w) => w.code === 'alias-conflict')).toBe(true);
  });

  test('unknown keys, events and properties survive normalization', () => {
    const input = {
      content: 'hi',
      futureFlag: true,
      events: { onClick: [], onCustom: [] },
      properties: { showHeader: true, customCSS: '.x{}' },
    };
    const { config } = normalizeWidgetConfig('text', input);
    expect(config.futureFlag).toBe(true);
    expect(config.events).toEqual(input.events);
    expect(config.properties).toEqual(input.properties);
  });

  test('normalization is idempotent across every descriptor example', () => {
    for (const type of EXPECTED_TYPES) {
      const once = normalizeWidgetConfig(type, getWidgetDescriptor(type).example);
      const twice = normalizeWidgetConfig(type, once.config);
      expect([type, twice.migrations]).toEqual([type, []]);
      expect(twice.config).toEqual(once.config);
    }
  });

  test('unknown widget type passes input through untouched', () => {
    const input = { whatever: 1 };
    const { config, migrations } = normalizeWidgetConfig('chart', input);
    expect(config).toEqual(input);
    expect(migrations).toEqual([]);
  });
});

describe('validateWidgetConfig authoring vs resolved (F15)', () => {
  test('unknown type and non-object configs are invalid with codes', () => {
    expect(validateWidgetConfig('chart', {}).valid).toBe(false);
    expect(validateWidgetConfig('chart', {}).errors[0].code).toBe('unknown-type');
    expect(validateWidgetConfig('table', null).valid).toBe(false);
    expect(validateWidgetConfig('table', []).errors[0].code).toBe('config-object');
  });

  test('required keys enforced (form fields, alert message)', () => {
    expect(validateWidgetConfig('form', { submitLabel: 'Go' }).errors).toEqual([
      expect.objectContaining({ code: 'required', field: 'fields' }),
    ]);
    expect(validateWidgetConfig('form', { fields: [{ label: 'x' }] }).errors).toEqual([
      expect.objectContaining({ field: 'fields' }),
    ]);
    expect(validateWidgetConfig('alert', {}).errors).toEqual([
      expect.objectContaining({ code: 'required', field: 'message' }),
    ]);
  });

  test('templates accepted at authoring on template-capable props only', () => {
    const ok = validateWidgetConfig('stat', { valueTemplate: '{{ state.q.data }}' });
    expect(ok.valid).toBe(true);
    const bad = validateWidgetConfig('divider', { orientation: '{{ x }}' });
    expect(bad.valid).toBe(true); // strings pass type-wise…
    expect(bad.warnings.some((w) => w.code === 'template-not-supported')).toBe(true);
  });

  test('resolved mode rejects leftover templates and wrong types', () => {
    const leftover = validateWidgetConfig('stat', { valueTemplate: '{{ x }}' }, { mode: 'resolved' });
    expect(leftover.errors).toEqual([expect.objectContaining({ code: 'unresolved-template' })]);
    const wrongType = validateWidgetConfig('slider', { min: 'zero' });
    expect(wrongType.errors).toEqual([expect.objectContaining({ code: 'type', field: 'min' })]);
    const badEnum = validateWidgetConfig('divider', { orientation: 'diagonal' });
    expect(badEnum.errors).toEqual([expect.objectContaining({ code: 'enum' })]);
  });

  test('unknown event names warn but stay valid (never dropped)', () => {
    const result = validateWidgetConfig('button', { text: 'Go', events: { onClick: [], onWarp: [] } });
    expect(result.valid).toBe(true);
    expect(result.warnings).toEqual([
      expect.objectContaining({ code: 'unsupported-event', field: 'events.onWarp' }),
    ]);
  });

  test('unknown config keys are allowed as extension metadata', () => {
    expect(validateWidgetConfig('text', { content: 'x', futureFlag: 1 }).valid).toBe(true);
  });
});
