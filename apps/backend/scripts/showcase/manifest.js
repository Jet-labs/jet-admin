/** Deterministic, portable synthetic scenarios. No environment access or secrets. */
const crypto = require('crypto');

const VERSION = 'platform-showcase-v1';
const OWNER_ID = '1a3ece78-45ae-4a19-8475-3e443e2b01e8';
function id(key) {
  const bytes = crypto.createHash('sha256').update(`${VERSION}:${key}`).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const h = bytes.toString('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
const T = id('tenant');
const expr = (body) => `{{ ${body} }}`;
const qdata = (alias) => `((state.queries.${alias} || {}).data || [])`;
const def = (key, type, value) => ({ key, type, required: false, defaultValue: value });
const ref = (kind, key) => id(`${kind}:${key}`);

// Realistic relationships, anomalies and null/Unicode edge cases; all synthetic.
const ORDERS = Array.from({ length: 240 }, (_, i) => ({
  order_id: i + 1, customer_id: (i % 40) + 1,
  customer: ['Aster Studio', 'Café São Bento', 'Northstar Labs', '東京 Supply', 'Müller Works'][i % 5],
  region: ['APAC', 'EMEA', 'AMER'][i % 3], channel: ['web', 'mobile', 'partner'][i % 3],
  status: ['pending', 'allocated', 'shipped', 'delayed', 'review', 'returned'][i % 6],
  amount: Math.round((49 + ((i * 379) % 9500)) * 100) / 100,
  units: (i % 12) + 1, sku: `SKU-${String((i % 24) + 1).padStart(3, '0')}`,
  risk: (i * 17) % 100, age_hours: (i * 7) % 96,
  paid: i % 9 !== 0, settlement: i % 11 === 0 ? null : `SET-${(i % 18) + 1}`,
  ordered_at: new Date(Date.UTC(2026, 9, 20 + (i % 17), i % 24)).toISOString(),
}));
const INVENTORY = Array.from({ length: 24 }, (_, i) => ({
  sku: `SKU-${String(i + 1).padStart(3, '0')}`, supplier: ['Harbor Parts', 'Atlas Materials', 'Kinetic Co'][i % 3],
  warehouse: ['Singapore', 'Frankfurt', 'Austin'][i % 3], on_hand: (i * 13) % 80,
  reorder_point: 24, lead_days: 2 + (i % 9), unit_cost: 15 + i * 7,
}));
const INCIDENTS = Array.from({ length: 48 }, (_, i) => ({
  incident_id: i + 1, service: ['checkout', 'inventory', 'payments', 'event-ingress'][i % 4],
  region: ['APAC', 'EMEA', 'AMER'][i % 3], severity: ['P1', 'P2', 'P3'][i % 3],
  status: ['open', 'investigating', 'mitigated', 'resolved'][i % 4],
  latency_ms: 90 + ((i * 83) % 1400), error_rate: Math.round(((i * 7) % 32) / 10 * 100) / 100,
  burn_rate: 1 + ((i * 3) % 18), customer_impact: (i * 19) % 800,
  owner: ['Platform', 'Payments', 'Supply'][i % 3],
  opened_at: new Date(Date.UTC(2026, 10, 1 + (i % 6), i % 24)).toISOString(),
}));
const EVENTS = ORDERS.slice(0, 24).map((o, i) => ({
  event_id: `EVT-${String(i + 1).padStart(4, '0')}`, order_id: o.order_id,
  title: ['Order received', 'Risk checked', 'Stock allocated', 'Carrier delayed'][i % 4],
  description: `Synthetic order ${o.order_id} · ${o.region} · ${o.status}`,
  time: o.ordered_at, severity: i % 4 === 3 ? 'warning' : 'info',
}));
// DuckDB JSON literals avoid filesystem/external extensions and persist in query configs.
function relation(rows) {
  const keys = Object.keys(rows[0]);
  const literal = (v) => v === null ? 'NULL' : typeof v === 'number' ? `CAST(${v} AS DOUBLE)` : typeof v === 'boolean' ? String(v) : `'${String(v).replace(/'/g, "''")}'`;
  return `(VALUES ${rows.map((r) => `(${keys.map((k) => literal(r[k])).join(',')})`).join(',')}) AS t(${keys.map((k) => `"${k}"`).join(',')})`;
}
const orderSql = `SELECT * FROM ${relation(ORDERS)}`;
const inventorySql = `SELECT * FROM ${relation(INVENTORY)}`;
const incidentSql = `SELECT * FROM ${relation(INCIDENTS)}`;
const eventSql = `SELECT * FROM ${relation(EVENTS)}`;

function buildManifest() {
  const m = { version: VERSION, tenantID: T, ownerID: OWNER_ID, tenantTitle: 'Platform Showcase', folders: [], datasources: [], queries: [], workflows: [], widgets: [], pages: [], listeners: [], cronJobs: [] };
  const groups = ['Commerce', 'Risk', 'Treasury', 'Reliability', 'Supply', 'Event Lab', 'Integrations'];
  for (const title of groups) m.folders.push({ folderID: ref('folder', title), tenantID: T, name: title, parentID: null });
  const folder = (name) => ref('folder', name);
  const ds = (key, title, type, options, group) => {
    m.datasources.push({ datasourceID: ref('datasource', key), tenantID: T, creatorID: OWNER_ID,
      datasourceTitle: title, datasourceType: type, datasourceOptions: options,
      datasourceTags: ['synthetic', VERSION], datasourceDescription: `${VERSION} · Synthetic showcase only. No production business records.`,
      folderID: folder(group), connectionStatus: 'inactive' });
  };
  ds('commerce', 'Commerce warehouse · embedded synthetic data', 'duckdb', { databasePath: ':memory:', readonly: false, memoryLimit: '128MB' }, 'Commerce');
  ds('reliability', 'Service telemetry · embedded synthetic data', 'duckdb', { databasePath: ':memory:', readonly: false, memoryLimit: '128MB' }, 'Reliability');
  ds('risk', 'Risk ledger · portable SQLite', 'sqlite', { databasePath: ':memory:', readonly: false }, 'Risk');
  ds('github', 'GitHub · public repository intelligence', 'github', { apiUrl: 'https://api.github.com', timeout: 15 }, 'Integrations');
  ds('rest', 'World Bank · public economic context', 'restapi', { baseUrl: 'https://api.worldbank.org', headers: [], authType: 'none', timeout: 15 }, 'Integrations');
  ds('graphql', 'Countries · public GraphQL directory', 'graphql', { connectionName: 'Showcase country directory', endpoint: 'https://countries.trevorblades.com/', authType: 'none', headers: [], timeout: 15 }, 'Integrations');
  for (const name of ['orders', 'alerts', 'settlements', 'inventory']) ds(name, `Synthetic ${name} · webhook ingress`, 'webhook', { allowedMethods: ['POST'], authType: 'header', authHeaderName: 'x-showcase-secret', authSecret: '__GENERATE_ON_INSERT__' }, 'Event Lab');

  function query(key, title, source, options, group, sampleInputs = {}) {
    const d = m.datasources.find((d) => d.datasourceID === ref('datasource', source));
    m.queries.push({ dataQueryID: ref('query', key), tenantID: T, creatorID: OWNER_ID,
      datasourceID: d.datasourceID, datasourceType: d.datasourceType, dataQueryTitle: title,
      dataQueryDescription: `${VERSION} · Read-only synthetic scenario.`, isDisabled: false, runOnLoad: false,
      dataQueryOptions: { timeoutSeconds: 20, inputDefinitions: [], ...options }, folderID: folder(group), sampleInputs });
  }
  const sql = (key, title, body, group = 'Commerce', inputs = [], sample = {}) => query(key, title,
    group === 'Reliability' ? 'reliability' : 'commerce', { queryType: 'sql', query: body, inputDefinitions: inputs }, group, sample);
  // Query templates permit safe input paths only. Use typed numeric selectors,
  // never interpolate untrusted text into SQL string literals.
  const regionInput = def('regionCode', 'number', 0);
  const region = '{{ inputs.regionCode }}';
  const threshold = '{{ inputs.threshold }}';
  const orderID = '{{ inputs.orderID }}';
  sql('orders', 'Orders · paged and region-filtered queue', `${orderSql} WHERE (${region}=0 OR CASE region WHEN 'APAC' THEN 1 WHEN 'EMEA' THEN 2 ELSE 3 END=${region}) ORDER BY risk DESC, order_id LIMIT 40`, 'Commerce', [regionInput], { regionCode: 0 });
  sql('orderDetail', 'Order · selected record and inventory join', `SELECT o.*, i.on_hand, i.reorder_point, i.supplier, i.lead_days FROM (${orderSql}) o JOIN (${inventorySql}) i USING (sku) WHERE o.order_id=${orderID}`, 'Commerce', [def('orderID', 'number', 1)], { orderID: 1 });
  sql('commerceSummary', 'Commerce · exposure and fulfillment KPIs', `SELECT count(*)::INTEGER AS orders, round(sum(amount),2) AS revenue, sum(CASE WHEN status='delayed' THEN 1 ELSE 0 END)::INTEGER AS delayed, round(avg(risk),1) AS avg_risk FROM (${orderSql}) o`);
  sql('regionRevenue', 'Commerce · region/channel revenue matrix', `SELECT region, channel, count(*)::INTEGER AS orders, round(sum(amount),2) AS revenue FROM (${orderSql}) o GROUP BY region,channel ORDER BY region,channel`);
  sql('dailyRevenue', 'Commerce · daily revenue and running total', `SELECT day,revenue, sum(revenue) OVER (ORDER BY day) AS running_total FROM (SELECT substr(ordered_at,1,10) AS day,sum(amount) AS revenue FROM (${orderSql}) o GROUP BY day) d ORDER BY day`);
  sql('riskQueue', 'Risk · threshold screen and customer rank', `SELECT *, CAST(dense_rank() OVER (PARTITION BY region ORDER BY risk DESC) AS INTEGER) AS region_rank FROM (${orderSql}) o WHERE risk>=${threshold} ORDER BY risk DESC,amount DESC LIMIT 30`, 'Risk', [def('threshold', 'number', 70)], { threshold: 70 });
  sql('riskSummary', 'Risk · flagged exposure and unpaid volume', `SELECT count(*)::INTEGER AS flagged,round(sum(amount),2) AS exposure,sum(CASE WHEN NOT paid THEN 1 ELSE 0 END)::INTEGER AS unpaid FROM (${orderSql}) o WHERE risk>=70`, 'Risk');
  query('riskPolicy', 'Risk · SQLite policy evaluation', 'risk', { query: "SELECT 'standard' AS policy, 70 AS review_threshold, 90 AS reject_threshold UNION ALL SELECT 'high_value',60,85", inputDefinitions: [] }, 'Risk');
  sql('customerRisk', 'Risk · repeat-customer anomaly clusters', `SELECT customer_id,customer,count(*)::INTEGER AS orders,round(avg(risk),1) AS avg_risk,round(sum(amount),2) AS exposure FROM (${orderSql}) o GROUP BY customer_id,customer HAVING avg(risk)>45 ORDER BY exposure DESC LIMIT 20`, 'Risk');
  sql('reconciliation', 'Treasury · settlement mismatches and aging buckets', `SELECT order_id,customer,amount,paid,settlement,age_hours,CASE WHEN NOT paid THEN 'unpaid' WHEN settlement IS NULL THEN 'missing_settlement' ELSE 'matched' END AS reconciliation_status FROM (${orderSql}) o WHERE NOT paid OR settlement IS NULL ORDER BY age_hours DESC`, 'Treasury');
  sql('treasurySummary', 'Treasury · receivables and settlement coverage', `SELECT round(sum(CASE WHEN NOT paid THEN amount ELSE 0 END),2) AS receivable,round(sum(CASE WHEN settlement IS NULL THEN amount ELSE 0 END),2) AS unsettled,round(100.0*sum(CASE WHEN paid AND settlement IS NOT NULL THEN 1 ELSE 0 END)/count(*),1) AS coverage FROM (${orderSql}) o`, 'Treasury');
  sql('aging', 'Treasury · receivables aging ladder', `SELECT CASE WHEN age_hours<24 THEN '0–24h' WHEN age_hours<48 THEN '24–48h' ELSE '48h+' END AS bucket,round(sum(amount),2) AS exposure,count(*)::INTEGER AS orders FROM (${orderSql}) o WHERE NOT paid GROUP BY bucket ORDER BY bucket`, 'Treasury');
  sql('incidents', 'Reliability · live-style incident queue', `${incidentSql} ORDER BY burn_rate DESC,incident_id LIMIT 48`, 'Reliability');
  sql('sloSummary', 'Reliability · SLO burn and customer impact', `SELECT count(*)::INTEGER AS incidents,round(avg(latency_ms),1) AS latency,round(avg(error_rate),2) AS error_rate,sum(customer_impact)::INTEGER AS impacted FROM (${incidentSql}) i`, 'Reliability');
  sql('serviceHealth', 'Reliability · service error/latency correlation', `SELECT service,round(avg(latency_ms),1) AS latency,round(avg(error_rate),2) AS error_rate,max(burn_rate) AS burn FROM (${incidentSql}) i GROUP BY service ORDER BY burn DESC`, 'Reliability');
  sql('inventory', 'Supply · demand versus availability and shortage', `SELECT i.*,coalesce(d.demand,0) AS demand,greatest(0,coalesce(d.demand,0)-i.on_hand) AS shortage FROM (${inventorySql}) i LEFT JOIN (SELECT sku,sum(units) AS demand FROM (${orderSql}) o WHERE status IN ('pending','allocated','delayed') GROUP BY sku) d USING(sku) ORDER BY shortage DESC,sku`, 'Supply');
  sql('supplierSummary', 'Supply · supplier concentration and reorder cost', `SELECT supplier,count(*)::INTEGER AS skus,sum(on_hand)::INTEGER AS available,round(sum(greatest(0,reorder_point-on_hand)*unit_cost),2) AS reorder_cost FROM (${inventorySql}) i WHERE supplier ILIKE '%{{ inputs.search }}%' GROUP BY supplier`, 'Supply', [def('search', 'string', '')], { search: '' });
  sql('events', 'Events · deterministic replay envelope history', `${eventSql} ORDER BY time,event_id`, 'Event Lab');
  sql('contractEdges', 'Events · null, Unicode and large-number contracts', "SELECT 1 AS id, 'Café 東京' AS label, NULL::VARCHAR AS optional, 0 AS zero_value, false AS enabled, 9007199254740990::DOUBLE AS large_safe_number UNION ALL SELECT 2,'', 'present',-1,true,42", 'Event Lab');
  query('githubRepo', 'Integrations · React repository health', 'github', { method: 'GET', path: '/repos/facebook/react', queryParams: [], headers: [] }, 'Integrations');
  query('githubIssues', 'Integrations · upstream issue triage', 'github', { method: 'GET', path: '/repos/facebook/react/issues', queryParams: [{ key: 'state', value: 'open' }, { key: 'per_page', value: '10' }], headers: [] }, 'Integrations');
  query('countries', 'Integrations · GraphQL country/currency lookup', 'graphql', { operationType: 'query', query: '{ countries(filter: {code: {in: ["SG", "DE", "US", "JP", "BR"]} }) { code name currency capital continent { name } } }', variables: '{}' }, 'Integrations');
  query('economy', 'Integrations · World Bank population context', 'rest', { method: 'GET', apiEndpoint: '/v2/country/SG/indicator/SP.POP.TOTL', headers: [], queryParams: [{ key: 'format', value: 'json' }, { key: 'per_page', value: '5' }], contentType: 'application/json' }, 'Integrations');

  function workflow(key, title, group, configure, inputDefinitions = []) {
    const w = { workflowID: ref('workflow', key), tenantID: T, creatorID: OWNER_ID, title,
      isDisabled: false, folderID: folder(group), workflowOptions: {
        description: `${VERSION} · Simulation only: no external side effects.`,
        inputDefinitions,
        workflowRunTimeout: 600,
        workflowTaskTimeout: 30,
        humanInLoopTimeout: 600,
        defaultNodeTimeoutSeconds: 30,
        defaultRetryLimit: 1,
        defaultRetryDelaySeconds: 2,
        nodeDefaults: {
          javascript: { timeoutSeconds: 10, retryLimit: 1, retryDelaySeconds: 1 },
          dataQuery: { timeoutSeconds: 30, retryLimit: 1, retryDelaySeconds: 2 },
        },
      }, nodes: [], edges: [] };
    const node = (k, type, config = {}) => {
      const nodeID = id(`node:${key}:${k}`);
      w.nodes.push({ nodeID, workflowID: w.workflowID, nodeType: type, timeoutSeconds: 20, retryLimit: 0,
        nodeConfig: { title: k, errorHandling: 'fail_workflow', joinMode: type==='join'?'all':'any', position: { x: (w.nodes.length % 4) * 320, y: Math.floor(w.nodes.length / 4) * 240 }, ...config } });
      return nodeID;
    };
    const edge = (from, to, handle = 'success') => w.edges.push({ edgeID: id(`edge:${key}:${w.edges.length}`), workflowID: w.workflowID, upstreamNodeID: from, downstreamNodeID: to, sourceHandle: handle, targetHandle: null, edgeType: 'smoothstep', edgeConfig: {} });
    configure(node, edge); m.workflows.push(w);
  }
  const queryNode = (key, outputVariable, inputValues = {}) => ({ dataQueryID: ref('query', key), outputVariable, inputValues });
  const endConfig = (variable) => ({ outputParameters: [{ name: 'result', sourceVariable: expr(`ctx.${variable}`) }] });
  workflow('riskScore', 'Risk · reusable scoring sub-playbook', 'Risk', (n,e) => {
    const s=n('Start','start'), c=n('Score order','javascript',{ code: "var o=ctx.input.order||{};var score=Math.min(100,Number(o.risk||0)+(o.paid===false?10:0));return {order_id:o.order_id,score:score,decision:score>=90?'reject':score>=70?'review':'release',synthetic:true};", outputVariable:'score' }), z=n('Return score','end',endConfig('score')); e(s,c,'output');e(c,z);
  }, [def('order','object',{})]);
  workflow('fulfillment', 'Commerce · risk-aware fulfillment simulation', 'Commerce', (n,e) => {
    const s=n('Start','start'),q=n('Load order and inventory','dataQuery',queryNode('orderDetail','orderRows',{orderID:expr('ctx.input.orderID || 1')})),child=n('Score risk in child workflow','subWorkflow',{ childWorkflowID:ref('workflow','riskScore'), inputMapping:{order:expr('ctx.orderRows[0] || {}')},outputVariable:'riskAssessment',maxDepth:2 }), gate=n('Route by stock and payment','condition',{ branches:[{id:'hold',label:'Insufficient stock or unpaid',condition:'!ctx.orderRows[0].paid || ctx.orderRows[0].on_hand < ctx.orderRows[0].units'}],defaultBranch:'release' }),hold=n('Produce hold decision','javascript',{code:"return {state:'held',order:ctx.orderRows[0],risk:ctx.riskAssessment,synthetic:true};",outputVariable:'decision'}),release=n('Produce allocation plan','javascript',{code:"return {state:'allocated',order:ctx.orderRows[0],risk:ctx.riskAssessment,synthetic:true};",outputVariable:'decision'}),z=n('Return simulation','end',endConfig('decision'));e(s,q,'output');e(q,child);e(child,gate);e(gate,hold,'hold');e(gate,release,'release');e(hold,z);e(release,z);
  }, [def('orderID','number',1)]);
  workflow('batchRisk', 'Risk · bounded batch scoring and exception isolation', 'Risk', (n,e) => {
    const s=n('Start','start'),q=n('Screen candidate orders','dataQuery',queryNode('riskQueue','candidates',{threshold:70})),trim=n('Bound manual test batch','javascript',{code:'return (ctx.candidates||[]).slice(0,8);',outputVariable:'batch'}),loop=n('Score up to eight orders','loop',{sourceVariable:'batch',itemVariable:'order',indexVariable:'index',outputVariable:'scores',maxIterations:8,errorHandling:'skip_item'}),body=n('Map risk decision','javascript',{code:"return {order_id:ctx.order.order_id,score:ctx.order.risk,decision:ctx.order.risk>=90?'reject':'review',synthetic:true};",outputVariable:'itemScore'}),sum=n('Aggregate batch exposure','javascript',{code:'return {processed:ctx.scores.length,rejected:ctx.scores.filter(function(x){return x.decision===\'reject\';}).length,scores:ctx.scores,synthetic:true};',outputVariable:'summary'}),z=n('Return batch result','end',endConfig('summary'));e(s,q,'output');e(q,trim);e(trim,loop);e(loop,body,'loop');e(loop,sum,'completed');e(sum,z);
  });
  workflow('reconciliation', 'Treasury · fan-out reconciliation and barrier merge', 'Treasury', (n,e) => {
    const s=n('Start','start'),f=n('Collect independent ledgers','fanout',{branches:[{id:'exposure',name:'Receivables'},{id:'exceptions',name:'Exceptions'}]}),a=n('Compute treasury totals','dataQuery',queryNode('treasurySummary','totals')),b=n('Load mismatch ledger','dataQuery',queryNode('reconciliation','exceptions')),j=n('Wait for both ledgers','join',{sourceVariables:['totals','exceptions'],joinMode:'all',requireAll:true,outputVariable:'ledgers'}),c=n('Build closeout packet','javascript',{code:'return {totals:ctx.ledgers.totals[0],exceptions:ctx.ledgers.exceptions.slice(0,10),exceptionCount:ctx.ledgers.exceptions.length,synthetic:true};',outputVariable:'packet'}),z=n('Return closeout packet','end',endConfig('packet'));e(s,f,'output');e(f,a,'exposure');e(f,b,'exceptions');e(a,j);e(b,j);e(j,c,'output');e(c,z);
  });
  workflow('approval', 'Risk · four-eyes high-value release approval', 'Risk', (n,e) => {
    const s=n('Start','start'),q=n('Load exposure','dataQuery',queryNode('riskSummary','exposure')),a=n('Human risk sign-off','approval',{title:'Approve synthetic exposure release?',description:'Review the risk desk before deciding. No real funds or orders will change.',requireComment:true,expiryMinutes:10,onTimeout:'expired',outputVariable:'approval'}),yes=n('Record simulated approval','javascript',{code:"return {decision:'approved',review:ctx.approval,synthetic:true};",outputVariable:'result'}),no=n('Record simulated rejection','javascript',{code:"return {decision:ctx.approval.expired?'expired':'rejected',review:ctx.approval,synthetic:true};",outputVariable:'result'}),z=n('Return decision','end',endConfig('result'));e(s,q,'output');e(q,a);e(a,yes,'approved');e(a,no,'rejected');e(a,no,'expired');e(yes,z);e(no,z);
  });
  workflow('incident', 'Reliability · incident severity routing and durable cooldown', 'Reliability', (n,e) => {
    const s=n('Start','start'),q=n('Fetch incident context','dataQuery',queryNode('incidents','incidents')),pick=n('Select incident','javascript',{code:'return (ctx.incidents||[])[0]||{};',outputVariable:'incident'}),sw=n('Severity escalation matrix','switch',{switchValue:expr('ctx.incident.severity'),cases:[{id:'critical',label:'P1 immediate',operator:'equals',matchValue:'P1'},{id:'major',label:'P2 triage',operator:'equals',matchValue:'P2'}]}),d=n('Durable quiet period','delay',{delayType:'fixed',delayMs:100}),critical=n('Build urgent response packet','javascript',{code:"return {priority:'immediate',incident:ctx.incident,runbook:'Rollback checkout and compare telemetry',synthetic:true};",outputVariable:'response'}),normal=n('Build standard triage packet','javascript',{code:"return {priority:'standard',incident:ctx.incident,runbook:'Inspect dependency and retry queue',synthetic:true};",outputVariable:'response'}),z=n('Return response plan','end',endConfig('response'));e(s,q,'output');e(q,pick);e(pick,sw);e(sw,critical,'critical');e(sw,d,'major');e(sw,normal,'default');e(d,normal,'output');e(critical,z);e(normal,z);
  });
  workflow('supplier', 'Supply · supplier exception intake and restock proposal', 'Supply', (n,e) => {
    const s=n('Start','start'),q=n('Compare demand and supply','dataQuery',queryNode('inventory','inventory')),form=n('Collect supplier exception','dataCollection',{title:'Synthetic supplier response',description:'Enter an ETA and explanation; nothing is ordered.',formSchema:{type:'object',properties:{etaDays:{type:'number',minimum:1,maximum:90,title:'Revised ETA (days)'},reason:{type:'string',minLength:5,title:'Exception reason'}},required:['etaDays','reason']},formUischema:{type:'VerticalLayout',elements:[{type:'Control',scope:'#/properties/etaDays'},{type:'Control',scope:'#/properties/reason'}]},expiryMinutes:10,outputVariable:'supplierReply'}),c=n('Build costed restock proposal','javascript',{code:'return {response:ctx.supplierReply,lines:(ctx.inventory||[]).filter(function(x){return Number(x.shortage)>0;}).slice(0,10),synthetic:true};',outputVariable:'proposal'}),z=n('Return proposal','end',endConfig('proposal'));e(s,q,'output');e(q,form);e(form,c,'output');e(c,z);
  });
  workflow('event', 'Events · normalize, derive dedupe key and route envelope', 'Event Lab', (n,e) => {
    const s=n('Start','start'),c=n('Validate synthetic envelope','javascript',{code:"var x=ctx.input.event;if(typeof x==='string'){try{x=JSON.parse(x)}catch(e){x=null}}if(!x||!x.event_id){x={event_id:'manual-demo',order_id:1,severity:'info'}}if(x.severity==='fail'){throw new Error('Synthetic envelope routing failure')}return {event_id:String(x.event_id),order_id:Number(x.order_id||0),severity:x.severity||'info',synthetic:true};",outputVariable:'event'}),sw=n('Route by severity','switch',{switchValue:expr('ctx.event.severity'),cases:[{id:'warning',label:'Exception',operator:'equals',matchValue:'warning'}]}),a=n('Exception decision','javascript',{code:"return {dedupeKey:ctx.event.event_id,route:'exception',event:ctx.event,synthetic:true};",outputVariable:'decision'}),b=n('Standard decision','javascript',{code:"return {dedupeKey:ctx.event.event_id,route:'standard',event:ctx.event,synthetic:true};",outputVariable:'decision'}),z=n('Return normalized event','end',endConfig('decision'));e(s,c,'output');e(c,sw);e(sw,a,'warning');e(sw,b,'default');e(a,z);e(b,z);
  }, [def('event','object',{event_id:'manual-demo',order_id:1,severity:'info'})]);
  workflow('recovery', 'Reliability · expected failure and compensating route', 'Reliability', (n,e) => {
    const s=n('Start','start'),fail=n('Inject bounded synthetic failure','javascript',{code:"throw new Error('Synthetic upstream unavailable');",outputVariable:'upstream',errorHandling:'continue',retryLimit:0}),recover=n('Compensate without external writes','javascript',{code:"return {recovered:true,reason:'Synthetic upstream unavailable',fallback:'cached synthetic telemetry',synthetic:true};",outputVariable:'recovery'}),z=n('Return recovery evidence','end',endConfig('recovery'));e(s,fail,'output');e(fail,recover,'error');e(recover,z);
  });

  function widget(key,title,type,config,group) {
    const widgetID=ref('widget',key);m.widgets.push({widgetID,tenantID:T,creatorID:OWNER_ID,widgetTitle:title,widgetDescription:`${VERSION} · ${title}`,widgetType:type,widgetConfig:{showHeader:true,...config},refreshInterval:null,folderID:folder(group)});return `widget_${widgetID}_1`;
  }
  const set = (key,value) => ({actionType:'SET_VARIABLE',config:{key:`state.variables.${key}`,value}});
  const execute = (alias,inputValues) => ({actionType:'EXECUTE_QUERY',config:inputValues?{alias,inputValues}:{alias}});
  const run = (key,inputValues={},toast={}) => ({actionType:'TRIGGER_WORKFLOW',config:{workflowID:ref('workflow',key),inputValues,...toast}});
  const table = (alias,columns,extra={}) => ({dataArrayTemplate:expr(qdata(alias)),columns:columns.map((key)=>({key,label:key.replace(/_/g,' '),sortable:true,type:['amount','risk','order_id','age_hours','shortage','on_hand','latency_ms','burn_rate'].includes(key)?'number':'text'})),pagination:{enabled:false,pageSize:10},search:{enabled:true},export:{enabled:true,format:'csv'},editing:{enabled:false},multiSelect:{enabled:false},emptyText:'No matching synthetic records.',emptyHint:'Reset the filter or select another record.',isLoading:expr(`(state.queries.${alias} || {}).isLoading || false`),...extra});
  const source = (alias,key,extra={}) => ({alias,type:'query',queryID:ref('query',key),triggerMode:'auto',inputValues:{},refreshOn:[],refetchInterval:null,...extra});
  function page(key,title,group,sources,configure,variables=[]) {
    const rows=[];const widgets=[];
    const add=(k,t,type,c,span=12)=>{const wk=widget(`${key}:${k}`,t,type,c,group);widgets.push(wk);return {id:id(`slot:${key}:${k}`),type:'widget',widgetKey:wk,span,sizing:'fill',minHeight:type.includes('vega')?320:type==='table'?360:undefined};};
    const row=(...children)=>rows.push({id:id(`row:${key}:${rows.length}`),type:'row',sizing:'auto',children});
    configure(add,row);
    m.pages.push({appPageID:ref('page',key),tenantID:T,creatorID:OWNER_ID,appPageTitle:title,appPageDescription:`${VERSION} · Synthetic operations scenario. Automation inactive; workflows are safe manual simulations.`,folderID:folder(group),appPageConfig:{layoutVersion:2,layout:{id:'root',type:'column',children:rows},layouts:{},widgets,variables,dataSources:sources}});
  }
  const heading = (title,detail) => ({content:`# ${title}\n${detail}\n\n**Synthetic showcase** · No real orders, funds or alerts are changed.`,format:'markdown',showHeader:false});
  const chart=(alias,x,y,mark='bar')=>({vegaSpec:{$schema:'https://vega.github.io/schema/vega-lite/v5.json',width:'container',height:'container',autosize:{type:'fit',contains:'padding'},data:{values:expr(qdata(alias))},mark:{type:mark,tooltip:true},encoding:{x:{field:x,type:'nominal',axis:{labelAngle:0}},y:{field:y,type:'quantitative'},color:{value:'#2563eb'}}},options:{renderer:'svg',showActions:false}});
  page('commerce','Order desk · fulfillment and exposure','Commerce',[source('orders','orders',{triggerMode:'reactive',refreshOn:['variables.regionCode'],inputValues:{regionCode:expr('state.variables.regionCode')}}),source('summary','commerceSummary'),source('daily','dailyRevenue'),source('detail','orderDetail',{triggerMode:'reactive',refreshOn:['variables.orderID'],inputValues:{orderID:expr('state.variables.orderID')}})],(add,row)=>{
    row(add('heading','Order desk','text',heading('Order desk','Filter a cross-border queue, inspect stock and payment risk, then run a child-workflow fulfillment simulation.')));
    row(add('region','Region','select',{label:'Fulfillment region',defaultValue:0,options:['All','APAC','EMEA','AMER'].map((v,i)=>({label:v,value:i})),events:{onChange:[set('regionCode',expr('Number(event.value)'))]}},4),add('simulate','Simulate selected order','button',{text:'Simulate fulfillment',events:{onClick:[run('fulfillment',{orderID:expr('state.variables.orderID')},{successToast:'Fulfillment simulation completed',errorToast:'Fulfillment simulation failed'})]}},4),add('reset','Reset queue','button',{text:'Reset region',variant:'outline',events:{onClick:[set('regionCode',0),set('orderID',1)]}},4));
    row(add('queue','Order work queue','table',table('orders',['order_id','customer','region','status','amount','risk'],{events:{onRowSelect:[set('orderID',expr('event.row.order_id'))]}}),8),add('detail','Selected order and inventory','key-value',{dataTemplate:expr(`${qdata('detail')}[0] || {}`),columns:1},4));
    row(add('trend','Revenue by order day','vega-lite',chart('daily','day','revenue','line'),8),add('summary','Fulfillment totals','key-value',{dataTemplate:expr(`${qdata('summary')}[0] || {}`),columns:1},4));
  },[def('regionCode','number',0),def('orderID','number',1)]);
  page('risk','Risk desk · anomaly review and approvals','Risk',[source('risk','riskQueue',{triggerMode:'reactive',refreshOn:['variables.threshold'],inputValues:{threshold:expr('state.variables.threshold')}}),source('summary','riskSummary'),source('clusters','customerRisk'),source('policy','riskPolicy')],(add,row)=>{
    row(add('heading','Risk desk','text',heading('Risk desk','Screen threshold outliers, score a bounded batch, or open a human approval task with explicit reject and expiry routes.')));
    row(add('threshold','Review threshold','slider',{label:'Minimum risk score',min:0,max:100,step:5,defaultValue:70,events:{onChange:[set('threshold',expr('event.value'))]}},6),add('batch','Score batch','button',{text:'Score eight orders',events:{onClick:[run('batchRisk',{},{successToast:'Batch risk scoring completed',errorToast:'Batch risk scoring failed'})]}},3),add('approval','Open approval','button',{text:'Request sign-off',variant:'outline',events:{onClick:[run('approval',{},{successToast:'Approval task completed',errorToast:'Approval task failed'})]}},3));
    row(add('queue','Flagged orders','table',table('risk',['order_id','customer','amount','risk','region_rank']),8),add('totals','Exposure summary','key-value',{dataTemplate:expr(`${qdata('summary')}[0] || {}`)},4));
    row(add('clusters','Customer anomaly clusters','vega-lite',chart('clusters','customer_id','exposure'),8),add('policy','Policy thresholds','table',table('policy',['policy','review_threshold','reject_threshold']),4));
  },[def('threshold','number',70)]);
  page('treasury','Treasury close · settlement reconciliation','Treasury',[source('exceptions','reconciliation'),source('summary','treasurySummary'),source('aging','aging')],(add,row)=>{
    row(add('heading','Treasury close','text',heading('Treasury close','Compare unpaid orders and missing settlements. Generate a reconciliation packet with fan-out, barrier join and explicit exception evidence.')));
    row(add('close','Prepare closeout packet','button',{text:'Prepare synthetic closeout',events:{onClick:[run('reconciliation',{},{successToast:'Reconciliation packet prepared',errorToast:'Reconciliation packet failed'})]}},4),add('coverage','Settlement coverage','stat',{label:'Matched and paid',valueTemplate:expr(`(${qdata('summary')}[0] || {}).coverage || 0`),suffix:'%'},4),add('receivable','Unpaid exposure','stat',{label:'Receivables',valueTemplate:expr(`(${qdata('summary')}[0] || {}).receivable || 0`),prefix:'$'},4));
    row(add('exceptions','Reconciliation exceptions','table',table('exceptions',['order_id','customer','amount','reconciliation_status','age_hours']),8),add('aging','Aging ladder','vega-lite',chart('aging','bucket','exposure'),4));
    row(add('note','Close controls','alert',{title:'Review before releasing funds',message:'This scenario prepares a packet only. It never sends payments or modifies settlements.',variant:'info'}));
  });
  page('reliability','Incident room · SLO routing and recovery','Reliability',[source('incidents','incidents'),source('health','serviceHealth'),source('summary','sloSummary')],(add,row)=>{
    row(add('heading','Incident room','text',heading('Incident room','Correlate service burn and customer impact. Exercise severity switches, durable delays, error handles and a compensating fallback.')));
    row(add('route','Route incident','button',{text:'Build response plan',events:{onClick:[run('incident',{},{successToast:'Incident response plan ready',errorToast:'Incident routing failed'})]}},4),add('failure','Test recovery path','button',{text:'Inject synthetic failure',variant:'outline',events:{onClick:[run('recovery',{},{successToast:'Recovery path completed',errorToast:'Recovery path failed'})]}},4),add('impact','Impacted customers','stat',{label:'Synthetic customer impact',valueTemplate:expr(`(${qdata('summary')}[0] || {}).impacted || 0`)},4));
    row(add('queue','Incident queue','table',table('incidents',['incident_id','service','severity','status','burn_rate','latency_ms']),8),add('health','Service latency','vega-lite',chart('health','service','latency'),4));
    row(add('summary','SLO snapshot','key-value',{dataTemplate:expr(`${qdata('summary')}[0] || {}`)}));
  });
  page('supply','Supply planner · shortages and supplier exceptions','Supply',[source('inventory','inventory'),source('suppliers','supplierSummary')],(add,row)=>{
    row(add('heading','Supply planner','text',heading('Supply planner','Join pending demand to inventory, cost reorder proposals and collect a revised supplier ETA through a human-input workflow.')));
    row(add('intake','Collect supplier response','button',{text:'Open supplier exception task',events:{onClick:[run('supplier',{},{successToast:'Supplier exception task opened',errorToast:'Supplier exception task failed'})]}},4),add('guide','Planner instructions','text',{content:'Select a shortage, review lead times, then submit the ETA and reason in the workflow run’s input request. The proposal is simulated; no purchase order is sent.',format:'plain'},8));
    row(add('inventory','Demand and stock position','table',table('inventory',['sku','supplier','warehouse','on_hand','demand','shortage','lead_days'])));
    row(add('concentration','Supplier reorder cost','vega-lite',chart('suppliers','supplier','reorder_cost'),7),add('suppliers','Supplier scorecard','table',table('suppliers',['supplier','skus','available','reorder_cost'],{search:{enabled:true,serverSide:true},events:{onSearch:[execute('suppliers',{search:expr(`String(event.searchTerm || '').replace(/[^A-Za-z0-9 ]/g, '')`)})]}}),5));
  });
  const eventSource={alias:'live_events',type:'listener',listenerID:ref('listener','orders'),channelName:'showcase:orders',triggerMode:'auto',inputValues:{},refreshOn:[],refetchInterval:null};
  page('events','Event lab · replay, contracts and live routing','Event Lab',[source('history','events'),source('edges','contractEdges'),eventSource],(add,row)=>{
    const eventAlias=`direct_workflow_${ref('workflow','event')}`;
    const eventState=`(state.workflows[${JSON.stringify(eventAlias)}] || {})`;
    row(add('heading','Event lab','text',heading('Event lab','Inspect replay envelopes and null/Unicode edge cases. Webhook listeners remain inactive; sample history is explicitly synthetic, not a claimed live feed.')));
    row(add('payload','Envelope intake','form',{fields:[{key:'event_id',label:'Event ID',type:'text',required:true,defaultValue:'manual-demo'},{key:'order_id',label:'Order ID',type:'number',required:true,defaultValue:1},{key:'severity',label:'Severity',type:'select',defaultValue:'info',options:[{label:'Info',value:'info'},{label:'Warning',value:'warning'},{label:'Failure (demo)',value:'fail'}]}],submitLabel:'Simulate envelope routing',isLoading:expr(`${eventState}.isLoading || false`),events:{onSubmit:[run('event',{event:expr('event.formData')},{successToast:'Envelope routed successfully',errorToast:'Envelope routing failed'})]}},5),add('history','Synthetic replay timeline','timeline',{dataTemplate:expr(qdata('history')),titleKey:'title',timeKey:'time',descriptionKey:'description'},7));
    row(add('routeStatus','Routing status','text',{content:expr(`${eventState}.isLoading ? '⏳ Routing envelope…' : (${eventState}.error ? '❌ Routing failed. Open the workflow history or the result panel for details.' : (${eventState}.data ? '✅ Envelope routed. Review the normalized decision below.' : 'Submit the form to route an envelope.'))`),format:'markdown'},4),add('routeResult','Routing result','json-viewer',{dataTemplate:expr(`${eventState}.data || null`),isLoading:expr(`${eventState}.isLoading || false`),maxHeight:260},8));
    row(add('live','Live listener buffer','json-viewer',{dataTemplate:expr('(state.listeners.live_events || {}).data || []')},6),add('edge','Boundary-value records','table',table('edges',['id','label','optional','zero_value','enabled','large_safe_number']),6));
    row(add('sample','Sample webhook body','code-block',{code:JSON.stringify({event_id:'EVT-DEMO-1',order_id:1,severity:'warning',synthetic:true},null,2),language:'json'}));
  });
  page('integrations','Integration observatory · public API enrichment','Integrations',[source('repo','githubRepo',{triggerMode:'manual'}),source('issues','githubIssues',{triggerMode:'manual'}),source('countries','countries',{triggerMode:'manual'}),source('economy','economy',{triggerMode:'manual'})],(add,row)=>{
    row(add('heading','Integration observatory','text',heading('Integration observatory','Combine native GitHub, REST and GraphQL connectors. Public network calls run only on request; provider failures are visible rather than replaced with fake success.')));
    row(add('github','Load repository context','button',{text:'Load GitHub context',events:{onClick:[execute('repo'),execute('issues')]}},4),add('countries','Load GraphQL directory','button',{text:'Load country directory',events:{onClick:[execute('countries')]}},4),add('economy','Load economic context','button',{text:'Load World Bank data',events:{onClick:[execute('economy')]}},4));
    row(add('repo','Repository metadata','json-viewer',{dataTemplate:expr('(state.queries.repo || {}).data || {}')},6),add('directory','Country and currency directory','json-viewer',{dataTemplate:expr('(state.queries.countries || {}).data || {}')},6));
    row(add('issues','Upstream issues','table',{...table('issues',['number','title','state','created_at']),dataArrayTemplate:expr('Array.isArray((state.queries.issues || {}).data) ? state.queries.issues.data : []')}));
    row(add('economyData','Economic context response','json-viewer',{dataTemplate:expr('(state.queries.economy || {}).data || []')}));
  });

  for (const key of ['orders','alerts','settlements','inventory']) {
    const workflowKey={orders:'event',alerts:'incident',settlements:'reconciliation',inventory:'batchRisk'}[key];
    m.listeners.push({listenerID:ref('listener',key),tenantID:T,creatorID:OWNER_ID,datasourceID:ref('datasource',key),listenerTitle:`Showcase ${key} · inactive event pipeline`,listenerDescription:`${VERSION} · Activate explicitly only; synthetic events.`,listenerType:'webhook',status:'inactive',folderID:folder('Event Lab'),endpointPath:`showcase-${key}`,listenerConfig:{pathSuffix:`showcase-${key}`,responseStatusCode:202,responseBody:'{"accepted":true,"synthetic":true}'},actions:[
      {actionType:'transform',actionConfig:{script:"var x=event.body||event;if(!x.event_id)throw new Error('event_id required');return Object.assign({},x,{synthetic:true});"}},
      {actionType:'save_to_buffer',actionConfig:{bufferName:`showcase_${key}`,maxRecords:100,maxAgeHours:24}},
      {actionType:'trigger_workflow',actionConfig:{workflowID:ref('workflow',workflowKey),inputValues:workflowKey==='event'?{event:expr('event')}:{}}},
      {actionType:'push_to_app_page',actionConfig:{appPageID:ref('page','events'),channelName:`showcase:${key}`,mode:'append',maxArrayLength:100}},
    ]});
  }
  const schedules=[['fulfillment','15 8 * * 1-5',{orderID:1}],['batchRisk','0 */6 * * *',{}],['reconciliation','30 18 * * 1-5',{}],['incident','0 */4 * * *',{}],['event','0 9 * * 1',{event:{event_id:'scheduled-synthetic',order_id:1,severity:'info'}}],['recovery','45 10 * * 1',{}]];
  for (const [key,schedule,inputs] of schedules) m.cronJobs.push({cronJobID:ref('cron',key),tenantID:T,creatorID:OWNER_ID,cronJobTitle:`Showcase · ${key} rehearsal (disabled)`,cronJobDescription:`${VERSION} · Disabled by request. Manual simulation only; no external writes.`,cronJobSchedule:schedule,isDisabled:true,nextRunAt:null,timeoutSeconds:120,retryAttempts:0,retryDelaySeconds:60,workflowID:ref('workflow',key),workflowConfig:{inputValues:inputs},folderID:folder(key==='reconciliation'?'Treasury':key==='incident'||key==='recovery'?'Reliability':key==='batchRisk'?'Risk':key==='event'?'Event Lab':'Commerce')});
  // Folders are entity-specific in Jet Admin, not shared cross-module folders.
  const folderTypes={datasources:'datasource',queries:'dataQuery',workflows:'workflow',widgets:'widget',pages:'appPage',listeners:'listener',cronJobs:'cronJob'};
  const typedFolders=[];
  for(const [collection,entityType] of Object.entries(folderTypes)) {
    for(const group of groups) {
      const rows=m[collection].filter(r=>r.folderID===folder(group));
      if(!rows.length)continue;
      const folderID=ref('folder',`${entityType}:${group}`);
      typedFolders.push({folderID,tenantID:T,creatorID:OWNER_ID,folderTitle:group,entityType,parentFolderID:null});
      rows.forEach(r=>{r.folderID=folderID;});
    }
  }
  m.folders=typedFolders;
  return m;
}
function summarize(m) {
  return {version:m.version,tenantID:m.tenantID,tenantTitle:m.tenantTitle,ownerID:m.ownerID,counts:Object.fromEntries(['folders','datasources','queries','workflows','widgets','pages','listeners','cronJobs'].map(k=>[k,m[k].length])),datasourceTypes:[...new Set(m.datasources.map(d=>d.datasourceType))],widgetTypes:[...new Set(m.widgets.map(w=>w.widgetType))],workflowNodeTypes:[...new Set(m.workflows.flatMap(w=>w.nodes.map(n=>n.nodeType)))],backgroundAutomation:'disabled'};
}
module.exports={VERSION,OWNER_ID,id,ref,expr,buildManifest,summarize,ORDERS,INVENTORY,INCIDENTS,EVENTS};
