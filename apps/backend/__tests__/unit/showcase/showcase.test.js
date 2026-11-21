const {buildManifest,ref,summarize}=require('../../../scripts/showcase/manifest');
const {validateManifest}=require('../../../scripts/showcase/validate');
const {createScenarioRuntime}=require('../../../scripts/showcase/runtime');
const {digest,encryptOptions,main}=require('../../../scripts/seed-platform-showcase');
jest.mock('../../../utils/logger',()=>({log:jest.fn()}));
jest.setTimeout(30000);
const m=buildManifest();
const runtime=createScenarioRuntime(m);

test('deterministic manifest and scoped valid references',()=>{
  expect(digest(buildManifest())).toBe(digest(m));
  expect(validateManifest(m)).toEqual({valid:true,warnings:[]});
  expect(summarize(m).workflowNodeTypes).toHaveLength(13);
  expect(m.cronJobs.every(c=>c.isDisabled&&c.nextRunAt===null)).toBe(true);
  expect(m.listeners.every(l=>l.status==='inactive')).toBe(true);
});
test('authoring validation rejects a dangling page reference',()=>{
  const bad=buildManifest();bad.pages[0].appPageConfig.dataSources[0].queryID='missing';
  expect(()=>validateManifest(bad)).toThrow('Unknown query');
});
test('datasource encryption is authenticated and not plaintext',()=>{
  const encrypted=encryptOptions({authSecret:'test-secret'},'0'.repeat(64));
  expect(encrypted.__encrypted).toBe(true);expect(JSON.stringify(encrypted)).not.toContain('test-secret');
  expect(()=>encryptOptions({},'bad')).toThrow('VAULT_ENCRYPTION_KEY');
});
test('default command is a no-connection dry run',async()=>{
  const log=jest.spyOn(console,'log').mockImplementation(()=>{});
  await main([]);expect(JSON.parse(log.mock.calls[0][0]).mode).toBe('dry-run');
});
test('apply refuses missing env before opening a connection',async()=>{
  await expect(main(['--apply'])).rejects.toThrow('--env');
});

test.each(m.queries.filter(q=>['duckdb','sqlite'].includes(q.datasourceType)))('embedded query: $dataQueryTitle',async q=>{
  const rows=await runtime.executeQuery(q.dataQueryID,q.sampleInputs);
  expect(Array.isArray(rows)).toBe(true);expect(rows.length).toBeGreaterThan(0);
  expect(()=>JSON.stringify(rows)).not.toThrow();
});
test('SQL input contract rejects injected strings',async()=>{
  await expect(runtime.executeQuery(ref('query','riskQueue'),{threshold:'0; DROP TABLE x'})).rejects.toThrow('finite number');
});
test('region filter and selected-order join change actual results',async()=>{
  const rows=await runtime.executeQuery(ref('query','orders'),{regionCode:2});
  expect(rows.every(r=>r.region==='EMEA')).toBe(true);
  const detail=await runtime.executeQuery(ref('query','orderDetail'),{orderID:2});
  expect(detail[0].order_id).toBe(2);expect(detail[0].supplier).toBeDefined();
});
test('supplier scorecard server-side search filters the query',async()=>{
  const rows=await runtime.executeQuery(ref('query','supplierSummary'),{search:'Harbor'});
  expect(rows).toHaveLength(1);
  expect(rows[0].supplier).toBe('Harbor Parts');
});
test('supplier scorecard is configured for explicit server-side search',()=>{
  const widget=m.widgets.find(w=>w.widgetTitle==='Supplier scorecard');
  expect(widget.widgetConfig.search).toEqual({enabled:true,serverSide:true});
  expect(widget.widgetConfig.events.onSearch[0]).toMatchObject({actionType:'EXECUTE_QUERY',config:{alias:'suppliers'}});
});
test.each(['riskScore','fulfillment','batchRisk','reconciliation','approval','incident','supplier','event','recovery'])('DSL graph simulation completes: %s',async key=>{
  const result=await runtime.runWorkflow(ref('workflow',key));
  expect(result.context._workflowStatus).toBe('COMPLETED');
  expect(result.context._workflowOutput.result).toBeDefined();
  expect(result.trace.some(t=>t.finalStatus==='COMPLETED')).toBe(true);
});
test('batch loop outputs eight scored records',async()=>{
  const {context}=await runtime.runWorkflow(ref('workflow','batchRisk'));
  expect(context._workflowOutput.result.processed).toBe(8);
});
test('approval reject and expiry follow their intended routes',async()=>{
  for(const outcome of ['reject','expired']){
    const {context}=await runtime.runWorkflow(ref('workflow','approval'),{},outcome);
    expect(context._workflowOutput.result.decision).toBe(outcome==='reject'?'rejected':'expired');
  }
});
test('event warning routes to exception and missing IDs use the synthetic fallback',async()=>{
  const {context}=await runtime.runWorkflow(ref('workflow','event'),{event:{event_id:'E-1',severity:'warning'}});
  expect(context._workflowOutput.result.route).toBe('exception');
  const {context:fallback}=await runtime.runWorkflow(ref('workflow','event'),{event:{}});
  expect(fallback._workflowOutput.result.event.event_id).toBe('manual-demo');
});
test('event failure demo fails so the UI can exercise error feedback',async()=>{
  await expect(runtime.runWorkflow(ref('workflow','event'),{event:{event_id:'E-FAIL',severity:'fail'}})).rejects.toThrow('Synthetic envelope routing failure');
});
test('expected upstream failure executes compensating recovery',async()=>{
  const {context}=await runtime.runWorkflow(ref('workflow','recovery'));
  expect(context._workflowOutput.result.recovered).toBe(true);
});
