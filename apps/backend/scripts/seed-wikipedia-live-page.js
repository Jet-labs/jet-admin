/**
 * Seed a dedicated "Wikipedia Live Studio" app page (native widgets only).
 *
 * Why native widgets: HTML widgets render inside a sandboxed <iframe> whose
 * srcDoc is rebuilt on EVERY data change — each listener event tore the whole
 * frame down and reloaded it (visible flicker + refetch storms + inner
 * scrollbars when content overflowed the fixed slot height).
 * Native widgets (text / stat / table / timeline / image) are plain React:
 * the runtime memoises resolved configs and React patches only the changed
 * DOM nodes, so live events update smoothly with no flicker and no iframes.
 *
 * What this creates (idempotent, safe to re-run):
 *  - restapi datasource "Wikipedia REST"  (baseUrl "https://", no auth)
 *  - data query "Wikipedia Article Summary"
 *      GET {{inputs.domain}}/api/rest_v1/page/summary/{{inputs.title}}
 *  - app page "Wikipedia Live Studio" with:
 *      data source wiki_live    (listener 4f868f14…, channel listener:wiki)
 *      data source wiki_article (reactive on selected_wiki_title/_domain)
 *      9 native widgets: hero text, 4 KPI stats, live table, timeline,
 *      article image + article spotlight text
 *
 * Usage:
 *   cd apps/backend
 *   node scripts/seed-wikipedia-live-page.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { prisma } = require('../config/prisma.config');

const TENANT_ID = '97ca7876-7c73-4578-bccb-6d56b98a0113';
const LISTENER_ID = '4f868f14-9e66-4fc1-a72c-10c75816926c';
const CHANNEL = 'listener:wiki';
const PAGE_TITLE = 'Wikipedia Live Studio';
const DS_TITLE = 'Wikipedia REST';
const QUERY_TITLE = 'Wikipedia Article Summary';
// Owner/creator receiving wildcard grants on all created resources.
const OWNER_USER_ID = '1a3ece78-45ae-4a19-8475-3e443e2b01e8';

/**
 * Mirror bundle import's grantCreatorAccess for script-created resources.
 * Must run even when rows already exist (partial states), hence the
 * skip-if-present check instead of only granting on create.
 */
async function ensureWikiLiveGrants({ dsID, queryID, pageID, widgetIDs }) {
  const { addPolicy, getPoliciesForDomain } = require('../config/casbin.config');
  const targets = [
    ['datasource', dsID],
    ['dataquery', queryID],
    ['appPage', pageID],
  ];
  for (const id of Object.values(widgetIDs || {})) targets.push(['widget', id]);
  const existing = new Set((await getPoliciesForDomain(TENANT_ID)).map((p) => p.join('|')));
  for (const [type, id] of targets) {
    if (!id) continue;
    const key = [OWNER_USER_ID, TENANT_ID, type + ':' + id, '*', 'allow'].join('|');
    if (existing.has(key)) continue;
    await addPolicy(OWNER_USER_ID, TENANT_ID, type + ':' + id, '*', 'allow');
    console.log('GRANTED * on', type + ':' + String(id).slice(0, 8));
  }
  await prisma.tblDatasources.updateMany({ where: { datasourceID: dsID }, data: { creatorID: OWNER_USER_ID } });
  await prisma.tblDataQueries.updateMany({ where: { dataQueryID: queryID }, data: { creatorID: OWNER_USER_ID } });
  await prisma.tblAppPages.updateMany({ where: { appPageID: pageID }, data: { creatorID: OWNER_USER_ID } });
  const wids = Object.values(widgetIDs || {});
  if (wids.length) await prisma.tblWidgets.updateMany({ where: { widgetID: { in: wids } }, data: { creatorID: OWNER_USER_ID } });
}

const LIVE = 'state.listeners.wiki_live.data || []';
const FIRST = '((state.listeners.wiki_live.data || [])[0] || {})';
const ARTICLE = '(state.queries.wiki_article.data || {})';

const WIDGET_DEFS = [
  {
    key: 'hero',
    title: 'Live Studio Header',
    description: 'Hero banner bound to the newest Wikipedia edit',
    widgetType: 'text',
    widgetConfig: {
      content: '# Wikipedia Live Studio\nLive Wikipedia edits as they happen — newest first. Activate the Wikimedia listener and watch this page update in real time, with zero reloads.\n\n**Latest:** {{ ' + FIRST + '.title || \'waiting for the first edit…\' }} · `{{ ' + FIRST + '.wiki || \'\' }}` · by **{{ ' + FIRST + '.user || \'\' }}**',
      format: 'markdown',
      textAlign: 'left',
      fontSize: 'md',
      isLoading: '',
      showHeader: false,
    },
  },
  {
    key: 'stat_edits',
    title: 'Wiki Stat — Edits Tracked',
    description: 'KPI: buffered live edits',
    widgetType: 'stat',
    widgetConfig: {
      label: 'Edits tracked',
      valueTemplate: '{{ (' + LIVE + ').length }}',
      prefix: '',
      suffix: 'edits',
      trendTemplate: '',
      trendDirection: 'up-is-good',
      textAlign: 'center',
      isLoading: '',
      showHeader: false,
    },
  },
  {
    key: 'stat_wikis',
    title: 'Wiki Stat — Active Wikis',
    description: 'KPI: distinct language editions',
    widgetType: 'stat',
    widgetConfig: {
      label: 'Active wikis',
      valueTemplate: '{{ new Set((' + LIVE + ').map(function(e){ return e.wiki || \'?\' })).size }}',
      prefix: '',
      suffix: 'wikis',
      trendTemplate: '',
      trendDirection: 'up-is-good',
      textAlign: 'center',
      isLoading: '',
      showHeader: false,
    },
  },
  {
    key: 'stat_editors',
    title: 'Wiki Stat — Editors',
    description: 'KPI: distinct contributors',
    widgetType: 'stat',
    widgetConfig: {
      label: 'Editors',
      valueTemplate: '{{ new Set((' + LIVE + ').map(function(e){ return e.user || \'?\' })).size }}',
      prefix: '',
      suffix: 'editors',
      trendTemplate: '',
      trendDirection: 'up-is-good',
      textAlign: 'center',
      isLoading: '',
      showHeader: false,
    },
  },
  {
    key: 'stat_latest',
    title: 'Wiki Stat — Latest Wiki',
    description: 'KPI: wiki of the newest edit',
    widgetType: 'stat',
    widgetConfig: {
      label: 'Latest wiki',
      valueTemplate: '{{ ' + FIRST + '.wiki || \'—\' }}',
      prefix: '',
      suffix: '',
      trendTemplate: '',
      trendDirection: 'up-is-good',
      textAlign: 'center',
      isLoading: '',
      showHeader: false,
    },
  },
  {
    key: 'feed',
    title: 'Wikipedia Live Feed',
    description: 'Paginated table of live Wikipedia edits',
    widgetType: 'table',
    widgetConfig: {
      dataArrayTemplate: '{{ ' + LIVE + ' }}',
      columns: [
        { key: 'title', label: 'Article', type: 'text', sortable: true },
        { key: 'wiki', label: 'Wiki', type: 'badge', sortable: true },
        { key: 'user', label: 'Editor', type: 'text', sortable: true },
        { key: 'type', label: 'Change', type: 'badge', sortable: true },
        { key: 'at', label: 'When', type: 'date', sortable: true },
      ],
      pagination: { enabled: true, pageSize: 8 },
      search: { enabled: false },
      export: { enabled: false },
      editing: { enabled: false },
      multiSelect: { enabled: false },
      bulkEdit: { enabled: false },
      emptyText: 'No edits yet.',
      emptyHint: 'Activate the Wikimedia listener — events arrive live.',
      striped: true,
      dense: false,
      stickyHeader: true,
      isLoading: '',
      showHeader: true,
      events: {
        onRowSelect: [
          { actionType: 'SET_VARIABLE', config: { key: 'state.variables.selected_wiki_title', value: '{{ event.row.title }}' } },
          { actionType: 'SET_VARIABLE', config: { key: 'state.variables.selected_wiki_domain', value: '{{ event.row.wiki }}' } },
          { actionType: 'EXECUTE_QUERY', config: { alias: 'wiki_article' } },
        ],
      },
    },
  },
  {
    key: 'timeline',
    title: 'Wikipedia Recent Changes',
    description: 'Timeline of the newest edits (capped, no scrollbar)',
    widgetType: 'timeline',
    widgetConfig: {
      dataTemplate: '{{ (' + LIVE + ').slice(0, 8) }}',
      titleKey: 'title',
      timeKey: 'at',
      descriptionKey: 'wiki',
      emptyText: 'No edits yet.',
      isLoading: '',
      showHeader: true,
      events: {
        onItemClick: [
          { actionType: 'SET_VARIABLE', config: { key: 'state.variables.selected_wiki_title', value: '{{ event.item.title }}' } },
          { actionType: 'SET_VARIABLE', config: { key: 'state.variables.selected_wiki_domain', value: '{{ event.item.wiki }}' } },
          { actionType: 'EXECUTE_QUERY', config: { alias: 'wiki_article' } },
        ],
      },
    },
  },
  {
    key: 'spot_text',
    title: 'Article Spotlight',
    description: 'Wikipedia summary + thumbnail of the selected article',
    widgetType: 'text',
    widgetConfig: {
      // NOTE: thumbnail rides inside this markdown (intrinsic height) instead
      // of a separate image widget — a standalone image widget is h-full with
      // no intrinsic height and can collapse to zero inside auto-sized rows.
      content: '## {{ ' + ARTICLE + '.title || state.variables.selected_wiki_title }}\n'
        + "{{ (((" + ARTICLE + ".thumbnail || {}).source || '') === '' ? '_No image for this article._' : '![article image](' + " + ARTICLE + ".thumbnail.source + ')') }}\n"
        + "{{ (" + ARTICLE + ".description || '') === '' ? '' : '*' + " + ARTICLE + ".description + '*' }}\n\n"
        + '{{ ' + ARTICLE + ".extract || 'Loading the Wikipedia summary…' }}\n\n"
        + '[Read the full article](' + "{{ (((" + ARTICLE + ".content_urls || {}).desktop || {}).page || 'https://www.wikipedia.org') }}" + ')',
      format: 'markdown',
      textAlign: 'left',
      fontSize: 'sm',
      isLoading: '',
      showHeader: false,
    },
  },
];

(async () => {
  try {
    // 1. restapi datasource for Wikipedia (idempotent by title)
    let ds = await prisma.tblDatasources.findFirst({
      where: { tenantID: TENANT_ID, datasourceTitle: DS_TITLE },
      select: { datasourceID: true },
    });
    if (!ds) {
      ds = await prisma.tblDatasources.create({
        data: {
          tenantID: TENANT_ID,
          datasourceTitle: DS_TITLE,
          datasourceType: 'restapi',
          datasourceDescription: 'Wikimedia REST API for article summaries',
          datasourceTags: ['wikipedia', 'public'],
          datasourceOptions: {
            baseUrl: 'https://',
            timeout: 15,
            authType: 'none',
            headers: [],
            queryParams: [],
            contentType: 'application/json',
            followRedirects: true,
            sslVerify: true,
          },
        },
        select: { datasourceID: true },
      });
      console.log('CREATED datasource:', DS_TITLE, ds.datasourceID);
    } else {
      console.log('SKIP datasource exists:', DS_TITLE, ds.datasourceID);
    }

    // 2. "Wikipedia Article Summary" data query (idempotent by title)
    const queryOptions = {
      // NOTE: single {{ }} block only — the backend safe-path resolver drops
      // object keys whose string holds 2+ template blocks. The full path is
      // composed on the page (js-template supports concatenation) into `path`.
      apiEndpoint: '{{inputs.path}}',
      method: 'GET',
      // Wikimedia rejects generic clients — a descriptive UA is required.
      headers: [
        { key: 'User-Agent', value: 'JetAdmin-WikipediaLiveStudio/1.0' },
        { key: 'Accept', value: 'application/json' },
      ],
      queryParams: [],
      contentType: 'application/json',
      inputDefinitions: [
        { key: 'title', type: 'string', required: false, default: 'Casablanca (film)' },
        { key: 'domain', type: 'string', required: false, default: 'en.wikipedia.org' },
        { key: 'path', type: 'string', required: false, default: 'en.wikipedia.org/api/rest_v1/page/summary/Casablanca%20(film)' },
      ],
    };
    let query = await prisma.tblDataQueries.findFirst({
      where: { tenantID: TENANT_ID, dataQueryTitle: QUERY_TITLE },
      select: { dataQueryID: true },
    });
    if (!query) {
      query = await prisma.tblDataQueries.create({
        data: {
          tenantID: TENANT_ID,
          datasourceID: ds.datasourceID,
          datasourceType: 'restapi',
          dataQueryTitle: QUERY_TITLE,
          dataQueryDescription: 'Fetch a Wikipedia article summary + thumbnail by domain and title',
          dataQueryOptions: queryOptions,
          runOnLoad: false,
        },
        select: { dataQueryID: true },
      });
      console.log('CREATED data query:', QUERY_TITLE, query.dataQueryID);
    } else {
      console.log('SKIP data query exists:', QUERY_TITLE, query.dataQueryID);
    }

    // 3. Widgets (idempotent by title)
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

    // 4. Page (idempotent by title — merge sources/vars if it already exists)
    const pageDataSources = [
      {
        alias: 'wiki_live',
        type: 'listener',
        queryID: '',
        workflowID: '',
        listenerID: LISTENER_ID,
        channelName: CHANNEL,
        inputValues: {},
        triggerMode: 'auto',
        refreshOn: [],
        refetchInterval: null,
      },
      {
        alias: 'wiki_article',
        type: 'query',
        queryID: query.dataQueryID,
        workflowID: '',
        inputValues: {
          title: '{{ state.variables.selected_wiki_title }}',
          domain: '{{ state.variables.selected_wiki_domain }}',
          // Null-safe composition: unknown variables fall back inline so the
          // string can never contain literal "undefined" (backend defaults
          // only apply to nullish values, not to "undefined/..." strings).
          path: "{{ (state.variables.selected_wiki_domain || 'en.wikipedia.org') + '/api/rest_v1/page/summary/' + encodeURIComponent(state.variables.selected_wiki_title || 'Casablanca (film)') }}",
        },
        triggerMode: 'reactive',
        refreshOn: ['variables.selected_wiki_title', 'variables.selected_wiki_domain'],
        refetchInterval: null,
      },
    ];
    const pageVariables = [
      { key: 'selected_wiki_title', type: 'string', description: 'Clicked Wikipedia article', defaultValue: 'Casablanca (film)' },
      { key: 'selected_wiki_domain', type: 'string', description: 'Clicked article wiki domain', defaultValue: 'en.wikipedia.org' },
    ];

    const existingPage = await prisma.tblAppPages.findFirst({
      where: { tenantID: TENANT_ID, appPageTitle: PAGE_TITLE },
    });
    if (existingPage) {
      console.log('SKIP page exists:', PAGE_TITLE, existingPage.appPageID);
      await ensureWikiLiveGrants({ dsID: ds.datasourceID, queryID: query.dataQueryID, pageID: existingPage.appPageID, widgetIDs });
      console.log('DONE.');
      return;
    }

    const wk = (k) => 'widget_' + widgetIDs[k] + '_1';
    const slot = (k, span) => ({
      id: 'slot_wlive_' + k,
      type: 'widget',
      widgetKey: wk(k),
      span,
      sizing: 'fill',
    });
    const appPageConfig = {
      layout: {
        id: 'root',
        type: 'column',
        children: [
          { id: 'wlive_hero', type: 'row', sizing: 'auto', children: [slot('hero', 12)] },
          {
            id: 'wlive_stats', type: 'row', sizing: 'auto',
            children: [slot('stat_edits', 3), slot('stat_wikis', 3), slot('stat_editors', 3), slot('stat_latest', 3)],
          },
          {
            id: 'wlive_feed', type: 'row', sizing: 'auto',
            children: [slot('feed', 7), slot('timeline', 5)],
          },
          {
            id: 'wlive_spot', type: 'row', sizing: 'auto',
            children: [slot('spot_text', 12)],
          },
        ],
      },
      layouts: {},
      widgets: ['hero', 'stat_edits', 'stat_wikis', 'stat_editors', 'stat_latest', 'feed', 'timeline', 'spot_text'].map(wk),
      variables: pageVariables,
      dataSources: pageDataSources,
      // v2 tree layout — WITHOUT this flag migrateV1ToV2() discards `layout`
      // when `layouts` is empty and the page renders blank.
      layoutVersion: 2,
    };

    const page = await prisma.tblAppPages.create({
      data: {
        tenantID: TENANT_ID,
        appPageTitle: PAGE_TITLE,
        appPageDescription: 'Live Wikipedia edit stream with article spotlight. No iframes — native widgets update smoothly.',
        appPageConfig,
      },
      select: { appPageID: true },
    });
    console.log('CREATED page:', PAGE_TITLE, page.appPageID);

    // 5. Casbin grants — mirror bundleService.executeImport's grantCreatorAccess.
    //    Direct prisma inserts create NO policies; without an explicit
    //    `dataquery:<id> execute` grant, POST .../queries/:id/run answers 400
    //    "Authorization denied". Idempotent (skips existing policies).
    await ensureWikiLiveGrants({ dsID: ds.datasourceID, queryID: query.dataQueryID, pageID: page.appPageID, widgetIDs });

    console.log('DONE — open App Pages →', PAGE_TITLE);
    console.log('NEXT: activate “Wikimedia Change Stream” so live edits flow (channel listener:wiki).');
  } catch (e) {
    console.error('SEED FAIL:', e.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
