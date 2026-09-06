/**
 * Seed a dedicated "Binance ETH Live" app page (native widgets + vega-lite).
 *
 * Event shape (append mode → newest LAST, max 300):
 *   { kind, symbol, price, qty, notional, at }
 *
 * Page (alias eth_live, channel listener:eth):
 *   hero text, 4 KPI stats, vega-lite price line (last 60 trades),
 *   live trades table, latest-trade key-value.
 *
 * No iframes, no polling — React patches rows/numbers in place on each event.
 * Idempotent: safe to re-run (skips existing rows by title).
 *
 * After seeding: activate the "Binance ETH Trades" listener (it is inactive;
 * activation reloads actions, picking up the retargeted push room below).
 *
 * Usage:
 *   cd apps/backend
 *   node scripts/seed-binance-eth-page.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { prisma } = require('../config/prisma.config');

const TENANT_ID = '97ca7876-7c73-4578-bccb-6d56b98a0113';
const LISTENER_ID = '19853bce-3f04-4f2d-95c4-ee712a056816';
const CHANNEL = 'listener:eth';
const ALIAS = 'eth_live';
const PAGE_TITLE = 'Binance ETH Live';
const OWNER_USER_ID = '1a3ece78-45ae-4a19-8475-3e443e2b01e8';

// append mode → newest is LAST
const DATA = '(state.listeners.eth_live.data || [])';
const LAST = '((state.listeners.eth_live.data || [])[(state.listeners.eth_live.data || []).length - 1] || {})';

const WIDGET_DEFS = [
  {
    key: 'hero',
    title: 'ETH Live Header',
    description: 'Hero banner with the latest ETH price',
    widgetType: 'text',
    widgetConfig: {
      content: '# ETH/USDT — live trades\nReal-time Binance fills, charted over the last 60 trades. Activate the Binance listener and watch this page tick.\n\n{{ (' + DATA + '.length ? \'**$\' + ' + LAST + '.price + \'** per ETH · last fill `\' + ' + LAST + '.qty + \'` ETH\' : \'Waiting for live trades — activate **Binance ETH Trades**.\') }}',
      format: 'markdown',
      textAlign: 'left',
      fontSize: 'md',
      isLoading: '',
      showHeader: false,
    },
  },
  {
    key: 'stat_price',
    title: 'ETH Stat — Price',
    description: 'KPI: latest trade price',
    widgetType: 'stat',
    widgetConfig: {
      label: 'Latest price', valueTemplate: '{{ ' + LAST + '.price }}',
      prefix: '$', suffix: '', trendTemplate: '', trendDirection: 'up-is-good',
      textAlign: 'center', isLoading: '', showHeader: false,
    },
  },
  {
    key: 'stat_qty',
    title: 'ETH Stat — Qty',
    description: 'KPI: latest fill size',
    widgetType: 'stat',
    widgetConfig: {
      label: 'Latest fill', valueTemplate: '{{ ' + LAST + '.qty }}',
      prefix: '', suffix: 'ETH', trendTemplate: '', trendDirection: 'up-is-good',
      textAlign: 'center', isLoading: '', showHeader: false,
    },
  },
  {
    key: 'stat_vol',
    title: 'ETH Stat — Volume',
    description: 'KPI: buffered volume',
    widgetType: 'stat',
    widgetConfig: {
      label: 'Buffer volume',
      valueTemplate: '{{ (' + DATA + ').reduce(function(s, e){ return s + (e.qty || 0) }, 0) }}',
      prefix: '', suffix: 'ETH', trendTemplate: '', trendDirection: 'up-is-good',
      textAlign: 'center', isLoading: '', showHeader: false,
    },
  },
  {
    key: 'stat_peak',
    title: 'ETH Stat — Peak Notional',
    description: 'KPI: largest trade in buffer',
    widgetType: 'stat',
    widgetConfig: {
      label: 'Peak notional',
      valueTemplate: '{{ (' + DATA + ').reduce(function(m, e){ return Math.max(m, e.notional || 0) }, 0) }}',
      prefix: '$', suffix: '', trendTemplate: '', trendDirection: 'up-is-good',
      textAlign: 'center', isLoading: '', showHeader: false,
    },
  },
  {
    key: 'chart',
    title: 'ETH Price Chart',
    description: 'Vega-lite line of the last 60 trades',
    widgetType: 'vega-lite',
    widgetConfig: {
      // NOTE: $schema + container sizing must live IN the stored spec:
      // resolveData() (AppPageWidgetSlot path) clones vegaSpec as-is and never
      // injects $schema — without it VegaWidget errors "No visualization spec
      // provided". Mirrors VegaWidgetBuilder.buildRender defaults.
      vegaSpec: {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        width: 'container',
        height: 'container',
        autosize: { type: 'fit', contains: 'padding' },
        mark: { type: 'line', tooltip: true, point: false },
        data: { values: '{{ (' + DATA + ').slice(-60) }}' },
        encoding: {
          x: { field: 'at', type: 'temporal', title: 'time' },
          y: { field: 'price', type: 'quantitative', title: 'price (USD)', scale: { zero: false } },
          color: { value: '#f5c518' },
        },
      },
      options: { showActions: false, renderer: 'svg' },
      isLoading: '',
      showHeader: true,
    },
  },
  {
    key: 'feed',
    title: 'ETH Live Trades',
    description: 'Newest-first table of live fills',
    widgetType: 'table',
    widgetConfig: {
      dataArrayTemplate: '{{ (' + DATA + ').slice(-15).reverse() }}',
      columns: [
        { key: 'at', label: 'Time', type: 'date', sortable: true },
        { key: 'price', label: 'Price $', type: 'number', sortable: true },
        { key: 'qty', label: 'Qty', type: 'number', sortable: true },
        { key: 'notional', label: 'Notional $', type: 'number', sortable: true },
      ],
      pagination: { enabled: true, pageSize: 8 },
      search: { enabled: false },
      export: { enabled: false },
      editing: { enabled: false },
      multiSelect: { enabled: false },
      bulkEdit: { enabled: false },
      emptyText: 'No trades yet.',
      emptyHint: 'Activate the Binance ETH Trades listener — fills arrive live.',
      striped: true,
      dense: false,
      stickyHeader: true,
      isLoading: '',
      showHeader: true,
    },
  },
  {
    key: 'latest',
    title: 'Latest Trade Detail',
    description: 'Key-value of the newest fill',
    widgetType: 'key-value',
    widgetConfig: {
      dataTemplate: '{{ ' + LAST + ' }}',
      columns: 2,
      emptyText: 'No trades yet.',
      isLoading: '',
      showHeader: true,
    },
  },
];

async function ensureGrants({ pageID, widgetIDs }) {
  const { addPolicy, getPoliciesForDomain } = require('../config/casbin.config');
  const targets = [['appPage', pageID]];
  for (const id of Object.values(widgetIDs || {})) targets.push(['widget', id]);
  const existing = new Set((await getPoliciesForDomain(TENANT_ID)).map((p) => p.join('|')));
  for (const [type, id] of targets) {
    if (!id) continue;
    const key = [OWNER_USER_ID, TENANT_ID, type + ':' + id, '*', 'allow'].join('|');
    if (existing.has(key)) continue;
    await addPolicy(OWNER_USER_ID, TENANT_ID, type + ':' + id, '*', 'allow');
    console.log('GRANTED * on', type + ':' + String(id).slice(0, 8));
  }
  await prisma.tblAppPages.updateMany({ where: { appPageID: pageID }, data: { creatorID: OWNER_USER_ID } });
  const wids = Object.values(widgetIDs || {});
  if (wids.length) await prisma.tblWidgets.updateMany({ where: { widgetID: { in: wids } }, data: { creatorID: OWNER_USER_ID } });
}

(async () => {
  try {
    // 1. Widgets (idempotent by title)
    const widgetIDs = {};
    for (const def of WIDGET_DEFS) {
      const existing = await prisma.tblWidgets.findFirst({
        where: { tenantID: TENANT_ID, widgetTitle: def.title },
        select: { widgetID: true },
      });
      if (existing) {
        widgetIDs[def.key] = existing.widgetID;
        console.log('SKIP widget exists:', def.title);
      } else {
        const created = await prisma.tblWidgets.create({
          data: {
            tenantID: TENANT_ID,
            widgetTitle: def.title,
            widgetDescription: def.description,
            widgetType: def.widgetType,
            widgetConfig: def.widgetConfig,
          },
          select: { widgetID: true },
        });
        widgetIDs[def.key] = created.widgetID;
        console.log('CREATED widget:', def.title, created.widgetID);
      }
    }

    // 2. Page (idempotent by title)
    const existingPage = await prisma.tblAppPages.findFirst({
      where: { tenantID: TENANT_ID, appPageTitle: PAGE_TITLE },
    });
    if (existingPage) {
      console.log('SKIP page exists:', PAGE_TITLE, existingPage.appPageID);
      await ensureGrants({ pageID: existingPage.appPageID, widgetIDs });
      console.log('DONE.');
      return;
    }

    const wk = (k) => 'widget_' + widgetIDs[k] + '_1';
    // NOTE: the vega slot carries minHeight — the chart is height:100% inside
    // an auto-sized row and would collapse when siblings are short/empty.
    const slot = (k, span, extra) => ({ id: 'slot_eth_' + k, type: 'widget', widgetKey: wk(k), span, sizing: 'fill', ...(extra || {}) });
    const appPageConfig = {
      layout: {
        id: 'root',
        type: 'column',
        children: [
          { id: 'eth_hero', type: 'row', sizing: 'auto', children: [slot('hero', 12)] },
          {
            id: 'eth_stats', type: 'row', sizing: 'auto',
            children: [slot('stat_price', 3), slot('stat_qty', 3), slot('stat_vol', 3), slot('stat_peak', 3)],
          },
          {
            id: 'eth_main', type: 'row', sizing: 'auto',
            children: [slot('chart', 7, { minHeight: 340 }), slot('feed', 5)],
          },
          { id: 'eth_latest', type: 'row', sizing: 'auto', children: [slot('latest', 12)] },
        ],
      },
      layouts: {},
      widgets: ['hero', 'stat_price', 'stat_qty', 'stat_vol', 'stat_peak', 'chart', 'feed', 'latest'].map(wk),
      variables: [],
      dataSources: [
        {
          alias: 'eth_live', type: 'listener', queryID: '', workflowID: '',
          listenerID: LISTENER_ID, channelName: CHANNEL,
          inputValues: {}, triggerMode: 'auto', refreshOn: [], refetchInterval: null,
        },
      ],
      layoutVersion: 2,
    };

    const page = await prisma.tblAppPages.create({
      data: {
        tenantID: TENANT_ID,
        appPageTitle: PAGE_TITLE,
        appPageDescription: 'Real-time Binance ETH/USDT fills with a live vega-lite price chart.',
        appPageConfig,
      },
      select: { appPageID: true },
    });
    console.log('CREATED page:', PAGE_TITLE, page.appPageID);

    // 3. Retarget the listener push room at the new page (engine picks this
    //    up on listener restart/activation — no backend restart needed).
    const push = await prisma.tblListenerActions.findFirst({
      where: { listenerID: LISTENER_ID, actionType: 'push_to_app_page' },
    });
    if (push) {
      await prisma.tblListenerActions.update({
        where: { actionID: push.actionID },
        data: { actionConfig: { ...push.actionConfig, appPageID: page.appPageID } },
      });
      console.log('RETARGETED push_to_app_page room at new page.');
    }

    await ensureGrants({ pageID: page.appPageID, widgetIDs });
    console.log('DONE — open App Pages →', PAGE_TITLE);
    console.log('NEXT: activate “Binance ETH Trades” (it is inactive) so live fills flow.');
  } catch (e) {
    console.error('SEED FAIL:', e.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
