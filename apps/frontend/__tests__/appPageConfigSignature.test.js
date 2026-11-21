/**
 * D-010 regression: reopening a saved app page must not look like an unsaved
 * edit just because the editor migrated the layout or regenerated node IDs.
 */
import { appPageConfigSignature } from '../src/presentation/components/appPageComponents/layout/engine/configSignature';

const v1Config = () => ({
  widgets: [{ widgetKey: 'w1' }],
  layouts: { lg: [{ i: 'w1', x: 0, y: 0, w: 6, h: 2 }] },
  dataSources: [{ alias: 'orders', type: 'query', queryID: 'q1' }],
  variables: [{ key: 'customerID', defaultValue: null }],
});

describe('appPageConfigSignature', () => {
  test('treats a V1 page and the editor-migrated V2 echo as equal', () => {
    const loaded = v1Config();
    const editorNormalized = {
      ...loaded,
      layoutVersion: 2,
      layouts: {},
      _legacyLayouts: loaded.layouts,
      layout: {
        id: 'col_abc123',
        type: 'column',
        children: [
          {
            id: 'row_def456',
            type: 'row',
            sizing: 'auto',
            children: [
              { id: 'slot_ghi789', type: 'widget', widgetKey: 'w1', span: 3, sizing: 'fill' },
            ],
          },
        ],
      },
    };

    expect(appPageConfigSignature(editorNormalized)).toBe(appPageConfigSignature(loaded));
  });

  test('keeps a non-default sizing change as a real edit', () => {
    const loaded = {
      layoutVersion: 2,
      widgets: [{ widgetKey: 'w1' }],
      layout: {
        id: 'col_a', type: 'column', children: [
          { id: 'row_a', type: 'row', sizing: 'auto', children: [
            { id: 'slot_a', type: 'widget', widgetKey: 'w1', span: 6, sizing: 'fill' },
          ] },
        ],
      },
    };
    const resized = JSON.parse(JSON.stringify(loaded));
    resized.layout.children[0].children[0].sizing = 'hug';
    expect(appPageConfigSignature(resized)).not.toBe(appPageConfigSignature(loaded));
  });

  test('ignores key order', () => {
    const a = { widgets: [], dataSources: [], variables: [] };
    const b = { variables: [], dataSources: [], widgets: [] };
    expect(appPageConfigSignature(a)).toBe(appPageConfigSignature(b));
  });

  test('detects real edits', () => {
    const base = v1Config();

    const addedWidget = { ...base, widgets: [...base.widgets, { widgetKey: 'w2' }] };
    expect(appPageConfigSignature(addedWidget)).not.toBe(appPageConfigSignature(base));

    const removedDataSource = { ...base, dataSources: [] };
    expect(appPageConfigSignature(removedDataSource)).not.toBe(appPageConfigSignature(base));

    const changedVariable = {
      ...base,
      variables: [{ key: 'customerID', defaultValue: 'ada' }],
    };
    expect(appPageConfigSignature(changedVariable)).not.toBe(appPageConfigSignature(base));
  });
});
