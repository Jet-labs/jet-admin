const {
  WIDGETS_MAP,
  getDemoData,
} = require('../dist/index.cjs');

const EXPECTED_MAP_KEYS = [
  'vega-lite', 'vega', 'button', 'table', 'text', 'stat', 'alert', 'form',
  'image', 'iframe', 'date-picker', 'date-range-picker', 'html',
  'text-input', 'select', 'multi-select', 'checkbox', 'radio-group', 'switch',
  'slider', 'search-input', 'file-upload', 'divider', 'tabs',
  'key-value', 'json-viewer', 'list', 'badge', 'progress', 'timeline',
  'video', 'code-block',
];

describe('WIDGETS_MAP registry', () => {
  test('contains every widget incl. P0 + P1', () => {
    EXPECTED_MAP_KEYS.forEach((k) => expect(WIDGETS_MAP[k]).toBeDefined());
  });

  test('every entry has label, value, description, component, configEditor, icon, sampleConfig', () => {
    Object.entries(WIDGETS_MAP).forEach(([key, entry]) => {
      expect(typeof entry.label).toBe('string');
      expect(typeof entry.value).toBe('string');
      expect(entry.value).toBe(key);
      expect(typeof entry.description).toBe('string');
      expect(typeof entry.component).toBe('function');
      expect(typeof entry.configEditor).toBe('function');
      expect(typeof entry.icon).toBe('function');
      expect(entry.sampleConfig).toBeDefined();
      expect(typeof entry.sampleConfig).toBe('object');
    });
  });

  test('input widgets default to no auto-run; display widgets auto-run', () => {
    ['text-input', 'select', 'checkbox', 'switch', 'slider', 'search-input', 'tabs'].forEach((k) => {
      expect(WIDGETS_MAP[k].defaultAutoRun).toBe(false);
    });
    ['key-value', 'json-viewer', 'list', 'progress', 'timeline'].forEach((k) => {
      expect(WIDGETS_MAP[k].defaultAutoRun).toBe(true);
    });
  });

  test('table sampleConfig carries new display defaults', () => {
    expect(WIDGETS_MAP.table.sampleConfig.pageSize).toBeUndefined(); // pageSize lives under pagination
    expect(WIDGETS_MAP.table.sampleConfig.pagination.pageSize).toBe(10);
    expect(WIDGETS_MAP.table.sampleConfig.emptyText).toBeDefined();
    expect(WIDGETS_MAP.table.sampleConfig.striped).toBe(true);
  });

  test('getDemoData still serves vega presets', () => {
    expect(getDemoData('vega-lite').mark).toBe('bar');
    expect(getDemoData('vega').marks).toBeDefined();
  });
});

describe('table pure utils (via bundle)', () => {
  const {
    getNestedValue,
    normalizeColumns,
    formatCellValue,
    buildCSVContent,
    buildJSONContent,
    coerceTotalRows,
    resolvePageSize,
    diffRowChanges,
  } = require('../dist/index.cjs');

  test('getNestedValue supports dotted + bracket paths', () => {
    const row = { user: { name: 'Ada' }, orders: [{ total: 42 }] };
    expect(getNestedValue(row, 'user.name')).toBe('Ada');
    expect(getNestedValue(row, 'orders[0].total')).toBe(42);
    expect(getNestedValue(row, 'missing.deep')).toBeUndefined();
    expect(getNestedValue({ 'a.b': 1 }, 'a.b')).toBe(1); // literal key wins
  });

  test('normalizeColumns merges legacy keys, drops hidden, infers from rows', () => {
    const cols = normalizeColumns(
      [{ field: 'user.name', title: 'User' }],
      [{ key: 'user.name', label: 'Customer', type: 'text', sortable: false }],
      []
    );
    expect(cols).toHaveLength(1);
    expect(cols[0]).toMatchObject({ key: 'user.name', label: 'Customer', sortable: false });

    const hidden = normalizeColumns([{ key: 'a' }, { key: 'b', hidden: true }], null, []);
    expect(hidden.map((c) => c.key)).toEqual(['a']);

    const inferred = normalizeColumns([], [], [{ x: 1, y: 2 }]);
    expect(inferred.map((c) => c.key).sort()).toEqual(['x', 'y']);
  });

  test('formatCellValue handles number/boolean/date/object', () => {
    expect(formatCellValue(1234.5, { type: 'number' })).toContain('1');
    expect(formatCellValue(true, { type: 'boolean' })).toBe('Yes');
    expect(formatCellValue(false, { type: 'boolean' })).toBe('No');
    expect(formatCellValue(null, {})).toBe('—');
    expect(formatCellValue({ a: 1 }, {})).toBe('{"a":1}');
    expect(formatCellValue('2024-01-15', { type: 'date' })).not.toBe('2024-01-15');
  });

  test('buildCSVContent escapes quotes + uses nested values', () => {
    const csv = buildCSVContent(
      [{ key: 'name', label: 'Name' }, { key: 'note', label: 'Note' }],
      [{ name: 'a"b', note: 'x,y' }, { name: 'c' }]
    );
    const lines = csv.split('\n');
    expect(lines[0]).toBe('"Name","Note"');
    expect(lines[1]).toBe('"a""b","x,y"');
    expect(lines[2]).toBe('"c",""');
  });

  test('buildJSONContent maps nested keys with null fallback', () => {
    const json = buildJSONContent([{ key: 'user.name' }], [{ user: { name: 'Ada' } }, {}]);
    expect(JSON.parse(json)).toEqual([{ 'user.name': 'Ada' }, { 'user.name': null }]);
  });

  test('coerceTotalRows / resolvePageSize guardrails', () => {
    expect(coerceTotalRows('30', 5)).toBe(30);
    expect(coerceTotalRows('abc', 5)).toBe(5);
    expect(coerceTotalRows(-3, 5)).toBe(5);
    expect(resolvePageSize(0, -1, 25)).toBe(25);
    expect(resolvePageSize(undefined)).toBe(10);
    expect(resolvePageSize(1000)).toBe(10); // capped at 500
  });

  test('diffRowChanges only reports editable cols with real changes', () => {
    const changes = diffRowChanges(
      { name: 'a', age: 1, ro: 'x' },
      { name: 'b', age: 1, ro: 'y' },
      [{ key: 'name', editable: true }, { key: 'age', editable: true }, { key: 'ro', editable: false }]
    );
    expect(changes).toEqual({ name: 'b' });
  });
});
