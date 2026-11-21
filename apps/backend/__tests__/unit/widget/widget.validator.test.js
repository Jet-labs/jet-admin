/**
 * Widget validator contract tests (F04/B08/F15).
 *
 * Pure zod-schema checks — no database, no network. Verifies that create /
 * update payloads enforce real widget types and canonical configs with
 * structured field errors, and that legacy alias configs are normalized
 * (not rejected) on the way through.
 */
const {
  createWidgetSchema,
  updateWidgetSchema,
} = require('../../../modules/widget/widget.validator');

const expectIssues = (result, codes) => {
  expect(result.success).toBe(false);
  const messages = result.error.issues.map((i) => i.message).join(' | ');
  for (const code of codes) {
    expect(messages).toContain(code);
  }
};

describe('createWidgetSchema contract enforcement', () => {
  test('accepts a canonical table config', () => {
    const result = createWidgetSchema.safeParse({
      widgetTitle: 'Orders',
      widgetType: 'table',
      widgetConfig: {
        columns: [{ key: 'id', label: 'ID' }],
        dataArrayTemplate: '{{ state.queries.orders.data }}',
      },
    });
    expect(result.success).toBe(true);
    expect(result.data.widgetConfig.dataArrayTemplate).toBe('{{ state.queries.orders.data }}');
  });

  test('rejects unknown widget types with a structured issue', () => {
    const result = createWidgetSchema.safeParse({
      widgetTitle: 'X',
      widgetType: 'chart',
      widgetConfig: {},
    });
    expectIssues(result, ['Unknown widgetType']);
  });

  test('rejects structurally invalid configs with field paths', () => {
    const missingFields = createWidgetSchema.safeParse({
      widgetTitle: 'F',
      widgetType: 'form',
      widgetConfig: { submitLabel: 'Go' },
    });
    expectIssues(missingFields, ['fields']);

    const badEnum = createWidgetSchema.safeParse({
      widgetTitle: 'D',
      widgetType: 'divider',
      widgetConfig: { orientation: 'diagonal' },
    });
    expectIssues(badEnum, ['orientation']);
  });

  test('migrates legacy aliases instead of rejecting them', () => {
    const result = createWidgetSchema.safeParse({
      widgetTitle: 'Revenue',
      widgetType: 'stat',
      widgetConfig: { value: '{{ q }}', label: 'R' },
    });
    expect(result.success).toBe(true);
    expect(result.data.widgetConfig.valueTemplate).toBe('{{ q }}');
  });

  test('templates pass authoring validation on template-capable props', () => {
    const result = createWidgetSchema.safeParse({
      widgetTitle: 'T',
      widgetType: 'text-input',
      widgetConfig: { defaultValue: '{{ state.variables.name }}' },
    });
    expect(result.success).toBe(true);
  });
});

describe('updateWidgetSchema contract enforcement', () => {
  test('accepts partial title-only updates', () => {
    expect(updateWidgetSchema.safeParse({ widgetTitle: 'New' }).success).toBe(true);
  });

  test('validates config when widgetType is present', () => {
    const result = updateWidgetSchema.safeParse({
      widgetType: 'slider',
      widgetConfig: { min: 'zero' },
    });
    expectIssues(result, ['min']);
  });

  test('normalizes legacy date-range placeholders on update', () => {
    const result = updateWidgetSchema.safeParse({
      widgetType: 'date-range-picker',
      widgetConfig: { startPlaceholder: 'S', endPlaceholder: 'E' },
    });
    expect(result.success).toBe(true);
    expect(result.data.widgetConfig.placeholderStart).toBe('S');
    expect(result.data.widgetConfig.placeholderEnd).toBe('E');
    expect(result.data.widgetConfig.startPlaceholder).toBeUndefined();
  });
});
