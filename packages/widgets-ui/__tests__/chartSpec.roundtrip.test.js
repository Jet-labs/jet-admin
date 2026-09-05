/**
 * chartSpec generator/parser — round-trip tests for the Vega visual builder.
 *
 * Locks the contracts added for Tableau parity:
 *  - plain charts stay single-view (no params/layers unless enabled)
 *  - interaction flags opt in to selection params
 *  - mark props merge into the mark def
 *  - chrome overlays (reference/trend/labels) layer correctly and parse back
 *  - the parser returns shelfSpec shape (mark/dataSource/encoding/config)
 */
import {
  generateVegaLiteSpec,
  getDefaultShelfSpec,
  inferMarkType,
} from '../src/vega/chartSpecGenerator.js';
import { parseVegaLiteSpec } from '../src/vega/chartSpecParser.js';

const baseEncoding = () => ({
  x: { field: 'c', type: 'nominal' },
  y: { field: 'v', type: 'quantitative' },
});

describe('chartSpecGenerator', () => {
  test('defaults carry interaction + chrome config keys', () => {
    const d = getDefaultShelfSpec();
    expect(d.interaction).toEqual({ pointSelection: false, intervalBrush: false });
    expect(d.config).toMatchObject({
      subtitle: '',
      showGrid: true,
      showLegend: true,
      showDataLabels: false,
      trendLine: false,
      referenceLine: null,
    });
    expect(Array.isArray(d.encoding.tooltip)).toBe(true);
  });

  test('plain charts stay single-view with no params', () => {
    const spec = generateVegaLiteSpec({
      ...getDefaultShelfSpec(),
      mark: 'bar',
      encoding: { ...getDefaultShelfSpec().encoding, ...baseEncoding() },
    });
    expect(spec.mark?.type).toBe('bar');
    expect(spec.encoding.x.field).toBe('c');
    expect(spec.params).toBeUndefined();
    expect(spec.layer).toBeUndefined();
  });

  test('interaction flags emit selection params only when enabled', () => {
    const both = generateVegaLiteSpec({
      ...getDefaultShelfSpec(),
      mark: 'bar',
      encoding: { ...getDefaultShelfSpec().encoding, ...baseEncoding() },
      interaction: { pointSelection: true, intervalBrush: true },
    });
    expect(both.params).toEqual([
      { name: 'pts_click', select: { type: 'point', on: 'click' } },
      { name: 'brush', select: { type: 'interval' } },
    ]);
  });

  test('mark props merge (point/interpolate/opacity/cornerRadius)', () => {
    const spec = generateVegaLiteSpec({
      ...getDefaultShelfSpec(),
      mark: 'line',
      encoding: { ...getDefaultShelfSpec().encoding, ...baseEncoding() },
      markProps: { point: true, interpolate: 'monotone', opacity: 0.5 },
    });
    expect(spec.mark).toMatchObject({ type: 'line', point: true, interpolate: 'monotone', opacity: 0.5 });
  });

  test('channel bin/timeUnit/format pass through', () => {
    const spec = generateVegaLiteSpec({
      ...getDefaultShelfSpec(),
      mark: 'bar',
      encoding: {
        ...getDefaultShelfSpec().encoding,
        x: { field: 'd', type: 'temporal', timeUnit: 'yearmonth' },
        y: { field: 'v', type: 'quantitative', aggregate: 'sum', format: '$.2f' },
      },
    });
    expect(spec.encoding.x.timeUnit).toBe('yearmonth');
    expect(spec.encoding.y).toMatchObject({ aggregate: 'sum', format: '$.2f' });
  });

  test('chrome overlays layer; legend/grid/title honour config', () => {
    const spec = generateVegaLiteSpec({
      ...getDefaultShelfSpec(),
      mark: 'bar',
      encoding: { ...getDefaultShelfSpec().encoding, ...baseEncoding() },
      config: {
        title: 'T', subtitle: 'Sub', showGrid: false, showLegend: false,
        showDataLabels: true, trendLine: true,
        referenceLine: { value: '100', label: 'Target', color: '#ef4444', axis: 'y' },
      },
    });
    expect(Array.isArray(spec.layer)).toBe(true);
    expect(spec.layer).toHaveLength(4); // base + ref + trend + labels
    expect(spec.title).toMatchObject({ text: 'T', subtitle: 'Sub' });
    expect(spec.config.axis.grid).toBe(false);
    expect(spec.config.legend.disable).toBe(true);
  });

  test('inferMarkType heuristics', () => {
    expect(inferMarkType({ x: { field: 'd', type: 'temporal' }, y: { field: 'v', type: 'quantitative' } })).toBe('line');
    expect(inferMarkType({ x: { field: 'c', type: 'nominal' }, y: { field: 'v', type: 'quantitative' } })).toBe('bar');
    expect(inferMarkType({ x: { field: 'a', type: 'quantitative' }, y: { field: 'b', type: 'quantitative' } })).toBe('point');
  });
});

describe('chartSpecParser', () => {
  const schema = { $schema: 'https://vega.github.io/schema/vega-lite/v5.json' };

  test('rejects non Vega-Lite specs', () => {
    expect(parseVegaLiteSpec(null).success).toBe(false);
    expect(
      parseVegaLiteSpec({ $schema: 'https://vega.github.io/schema/vega/v5.json' }).success
    ).toBe(false);
  });

  test('returns shelfSpec shape with interaction defaults', () => {
    const r = parseVegaLiteSpec({
      ...schema, mark: 'bar', data: { values: [] }, encoding: { x: { field: 'c', type: 'nominal' } },
    });
    expect(r.success).toBe(true);
    expect(r.config.mark).toBe('bar');
    expect(r.config.encoding.x).toMatchObject({ field: 'c' });
    expect(r.config.interaction).toEqual({ pointSelection: false, intervalBrush: false });
  });

  test('chrome layers round-trip without warnings', () => {
    const shelf = {
      ...getDefaultShelfSpec(),
      mark: 'bar',
      encoding: { ...getDefaultShelfSpec().encoding, ...baseEncoding() },
      interaction: { pointSelection: true, intervalBrush: false },
      config: {
        ...getDefaultShelfSpec().config, title: 'T', subtitle: 'Sub',
        showGrid: false, showLegend: false, showDataLabels: true, trendLine: true,
        referenceLine: { value: '100', label: 'Target', color: '#ef4444', axis: 'y' },
      },
    };
    const spec = generateVegaLiteSpec(shelf);
    const back = parseVegaLiteSpec(spec);
    expect(back.success).toBe(true);
    expect(back.warnings).toEqual([]);
    expect(back.config.mark).toBe('bar');
    expect(back.config.config).toMatchObject({
      subtitle: 'Sub', showGrid: false, showLegend: false,
      showDataLabels: true, trendLine: true,
    });
    expect(back.config.config.referenceLine).toMatchObject({ value: '100', axis: 'y' });
    expect(back.config.interaction).toEqual({ pointSelection: true, intervalBrush: false });
    expect(back.config.encoding.x).toMatchObject({ field: 'c' });
  });

  test('foreign layers warn but still parse the base', () => {
    const r = parseVegaLiteSpec({
      ...schema,
      data: { values: [] },
      layer: [
        { mark: 'bar', encoding: { x: { field: 'c', type: 'nominal' } } },
        { mark: 'line', encoding: { x: { field: 'c' }, y: { field: 'v' } } },
      ],
    });
    expect(r.success).toBe(true);
    expect(r.warnings.length).toBeGreaterThan(0);
    expect(r.config.encoding.x).toMatchObject({ field: 'c' });
  });
});
