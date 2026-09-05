/**
 * BundleService Unit Tests — import ordering + structural validation.
 *
 * Regression coverage for two real bugs found via live listener testing:
 *  1. orderItemsTopologically used `deps.size` on an Array (always undefined),
 *     so it silently fell back to file order and imported dependents (listeners)
 *     before their dependencies (workflows), leaving stale reference IDs behind.
 *  2. Structural validation must keep rejecting dangling edges / missing titles.
 */
const fs = require('fs');
const path = require('path');

jest.mock('../../../config/prisma.config', () => ({
  prisma: {},
}));
jest.mock('../../../config/casbin.config', () => ({
  grantCreatorAccess: jest.fn().mockResolvedValue(true),
  removePoliciesForResource: jest.fn().mockResolvedValue(true),
}));

const {
  orderItemsTopologically,
  assertImportableBundle,
  remapAppPageWidgetKeys,
} = require('../../../modules/bundle/bundle.service');

const BUNDLES_DIR = path.join(__dirname, '..', '..', '..', '..', '..', 'bundles');
const loadBundle = (file) =>
  JSON.parse(fs.readFileSync(path.join(BUNDLES_DIR, file), 'utf8'));

const itemKey = (it) => `${it.type}:${it.id}`;

describe('orderItemsTopologically', () => {
  test('places dependencies before dependents regardless of file order', () => {
    // NOTE: reference values must be real UUIDs — collectRefs only tracks
    // UUID-valued reference keys (queryID/dataQueryID/workflowID/...).
    const DS = 'a5922cfe-1e4f-43fd-aef2-d5d794f1c248';
    const DQ = 'af1e44a9-cc86-4015-a613-6e0c69bdae89';
    const WF = 'b5d40945-565b-46ec-86ef-97bdfbf1e403';
    const ds = { type: 'datasource', id: DS, payload: {}, dependencies: [] };
    const dq = {
      type: 'dataQuery', id: DQ, payload: {},
      dependencies: [{ type: 'datasource', id: DS, bundled: true }],
    };
    const wf = {
      type: 'workflow', id: WF,
      payload: { nodes: [{ nodeID: 'n1', nodeConfig: { dataQueryID: DQ } }], edges: [] },
      dependencies: [{ type: 'dataQuery', id: DQ, bundled: true }],
    };
    const lst = {
      type: 'listener', id: '4db8927d-9476-47c6-bff2-37f03b4cd15a',
      payload: { actions: [{ actionConfig: { workflowID: WF } }] },
      dependencies: [{ type: 'datasource', id: DS, bundled: true }],
    };
    // Deliberately scrambled: listener first, datasource last.
    const ordered = orderItemsTopologically([lst, wf, dq, ds]);
    const pos = new Map(ordered.map((it, i) => [itemKey(it), i]));
    expect(pos.get(`datasource:${DS}`)).toBeLessThan(pos.get(`dataQuery:${DQ}`));
    expect(pos.get(`dataQuery:${DQ}`)).toBeLessThan(pos.get(`workflow:${WF}`));
    // Deep-scanned workflowID ref inside listener actions must also order first.
    expect(pos.get(`workflow:${WF}`)).toBeLessThan(
      pos.get('listener:4db8927d-9476-47c6-bff2-37f03b4cd15a')
    );
  });

  test('falls back to input order when a dependency cycle exists', () => {
    const a = {
      type: 'dataQuery', id: 'a', payload: { dataQueryID: 'b' },
      dependencies: [{ type: 'dataQuery', id: 'b', bundled: true }],
    };
    const b = {
      type: 'dataQuery', id: 'b', payload: { dataQueryID: 'a' },
      dependencies: [{ type: 'dataQuery', id: 'a', bundled: true }],
    };
    expect(orderItemsTopologically([a, b])).toEqual([a, b]);
  });
});

describe('shipped open-data bundles', () => {
  const files = [
    'crypto-intelligence-bundle.json',
    'global-knowledge-atlas-bundle.json',
    'realtime-events-bundle.json',
  ];

  test.each(files)('%s passes structural validation', (file) => {
    expect(() => assertImportableBundle(loadBundle(file))).not.toThrow();
  });

  test.each(files)('%s orders every bundled dependency before its dependent', (file) => {
    const bundle = loadBundle(file);
    const ordered = orderItemsTopologically(bundle.items);
    const pos = new Map(ordered.map((it, i) => [itemKey(it), i]));
    for (const item of ordered) {
      for (const dep of item.dependencies || []) {
        if (!dep.bundled) continue;
        expect(pos.get(`${dep.type}:${dep.id}`)).toBeLessThan(pos.get(itemKey(item)));
      }
    }
  });

  test('realtime bundle orders the workflow before workflow-referencing listeners', () => {
    const bundle = loadBundle('realtime-events-bundle.json');
    const ordered = orderItemsTopologically(bundle.items);
    const wf = ordered.find((i) => i.type === 'workflow');
    const wfPos = ordered.indexOf(wf);
    for (const item of ordered) {
      if (item.type !== 'listener') continue;
      if (JSON.stringify(item.payload).includes(wf.id)) {
        expect(ordered.indexOf(item)).toBeGreaterThan(wfPos);
      }
    }
  });
});

describe('assertImportableBundle', () => {
  const valid = () => ({
    bundleVersion: 1,
    items: [
      {
        type: 'datasource', id: 'ds-1',
        payload: { datasourceTitle: 'DS' }, dependencies: [],
      },
    ],
  });

  test('rejects wrong bundle version', () => {
    expect(() => assertImportableBundle({ bundleVersion: 999, items: [] })).toThrow(
      /bundleVersion/
    );
  });

  test('rejects items missing their title field', () => {
    const bundle = valid();
    bundle.items[0].payload = {};
    expect(() => assertImportableBundle(bundle)).toThrow(/datasourceTitle/);
  });

  test('rejects workflow edges referencing unknown nodes', () => {
    const bundle = valid();
    bundle.items.push({
      type: 'workflow', id: 'wf-1',
      payload: {
        title: 'W',
        nodes: [{ nodeID: 'n1' }],
        edges: [{ upstreamNodeID: 'n1', downstreamNodeID: 'nope' }],
      },
      dependencies: [],
    });
    expect(() => assertImportableBundle(bundle)).toThrow(/unknown node/);
  });

  test('rejects listeners without a datasource dependency entry', () => {
    const bundle = valid();
    bundle.items.push({
      type: 'listener', id: 'lst-1',
      payload: { listenerTitle: 'L' },
      dependencies: [],
    });
    expect(() => assertImportableBundle(bundle)).toThrow(/datasource dependency/);
  });
});

describe('remapAppPageWidgetKeys', () => {
  // Regression: v1 react-grid-layout items store the widget instance key
  // under `i`. The importer used to remap only `widgets[]` + `widgetKey`,
  // leaving layouts.lg[].i pointing at stale bundle UUIDs — every page slot
  // then fetched a nonexistent widget (getWidgetByID -> null -> frontend
  // "Cannot destructure property 'createdAt' of null" crash).
  const OLD_W = 'b1111111-1111-4111-8111-111111111111';
  const NEW_W = '140ec419-5359-45d1-a4d4-6f51af298110';
  const resolve = (oldID) => (oldID === OLD_W ? NEW_W : null);

  test('remaps v1 grid item `i` keys alongside widgets[] and widgetKey', () => {
    const config = {
      widgets: [`widget_${OLD_W}_1`],
      layouts: { lg: [{ i: `widget_${OLD_W}_1`, x: 0, y: 0, w: 24, h: 4 }] },
      nested: { widgetKey: `widget_${OLD_W}_2` },
    };
    const out = remapAppPageWidgetKeys(config, resolve);
    expect(out.widgets).toEqual([`widget_${NEW_W}_1`]);
    expect(out.layouts.lg[0].i).toBe(`widget_${NEW_W}_1`);
    expect(out.nested.widgetKey).toBe(`widget_${NEW_W}_2`);
  });

  test('leaves non-widget `i` values untouched', () => {
    const config = { layouts: { lg: [{ i: 'plain-string', x: 0, y: 0, w: 4, h: 4 }] } };
    expect(remapAppPageWidgetKeys(config, resolve).layouts.lg[0].i).toBe('plain-string');
  });

  test('leaves unmapped widget keys untouched', () => {
    const config = { layouts: { lg: [{ i: 'widget_unknown-id_1', x: 0, y: 0, w: 4, h: 4 }] } };
    expect(remapAppPageWidgetKeys(config, resolve).layouts.lg[0].i).toBe('widget_unknown-id_1');
  });
});
