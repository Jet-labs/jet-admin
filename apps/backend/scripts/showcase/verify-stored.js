/** Read-only DB verification; executions use only this manifest's saved resources. */
const fs=require('fs');
const crypto=require('crypto');
const {Client}=require('pg');
const dotenv=require('dotenv');
const {buildManifest}=require('./manifest');
const {TABLES,verifyDatabase}=require('../seed-platform-showcase');

function decryptOptions(o,key){
  if(!o.__encrypted)return o;
  const d=crypto.createDecipheriv('aes-256-gcm',Buffer.from(key,'hex'),Buffer.from(o.iv,'hex'));
  d.setAuthTag(Buffer.from(o.authTag,'hex'));
  return JSON.parse(Buffer.concat([d.update(Buffer.from(o.data,'hex')),d.final()]).toString('utf8'));
}
async function main(){
  const args=process.argv.slice(2),value=k=>args[args.indexOf(k)+1];
  if(!args.includes('--env')||!args.includes('--output'))throw new Error('--env and --output required');
  const env=dotenv.parse(fs.readFileSync(value('--env')));
  // Imported runtime modules must use the selected environment, never fallback credentials.
  Object.assign(process.env,env,{LOG_LEVEL:'error',REDIS_URL:''});
  const url=new URL(env.DATABASE_URL);url.searchParams.delete('sslmode');url.searchParams.delete('channel_binding');
  const local=['127.0.0.1','localhost'].includes(url.hostname);
  const client=new Client({connectionString:url.toString(),ssl:local?undefined:{rejectUnauthorized:true},connectionTimeoutMillis:10000,statement_timeout:20000,query_timeout:25000});
  // Resolve native runtime dependencies before opening a database transaction.
  const {createScenarioRuntime}=require('./runtime');
  // Keep this verifier's console readable; the real engine still executes.
  require('../../config/winston.config').winstonLogger.silent=true;
  const expected=buildManifest(),m={...expected};const result={mode:'stored-resource-verification',tenantID:m.tenantID,checkedAt:new Date().toISOString(),checks:[]};
  try{
    console.log('Connecting for read-only stored-resource verification');
    await client.connect();await client.query('BEGIN READ ONLY');
    result.database=await verifyDatabase(client,m);
    for(const [collection,[table]]of Object.entries(TABLES)) {m[collection]=(await client.query(`SELECT * FROM "${table}" WHERE "tenantID"=$1`,[m.tenantID])).rows;console.log(`Loaded ${collection}: ${m[collection].length}`);}
    for(const d of m.datasources)d.datasourceOptions=decryptOptions(d.datasourceOptions,env.VAULT_ENCRYPTION_KEY);
    for(const q of m.queries)q.sampleInputs=expected.queries.find(e=>e.dataQueryID===q.dataQueryID).sampleInputs;
    const workflowIDs=m.workflows.map(w=>w.workflowID);
    const nodes=(await client.query('SELECT * FROM "tblWorkflowNodes" WHERE "workflowID"=ANY($1::uuid[])',[workflowIDs])).rows;
    const edges=(await client.query('SELECT * FROM "tblWorkflowEdge" WHERE "workflowID"=ANY($1::uuid[])',[workflowIDs])).rows;
    for(const w of m.workflows){w.nodes=nodes.filter(n=>n.workflowID===w.workflowID);w.edges=edges.filter(e=>e.workflowID===w.workflowID);}
    console.log(`Loaded ${nodes.length} nodes and ${edges.length} edges`);
    const baselinePath=args.includes('--baseline')?value('--baseline'):null;
    if(baselinePath){
      const baseline=JSON.parse(fs.readFileSync(baselinePath));const drift=[];
      for(const [collection,[table]]of Object.entries(TABLES)){
        const rows=(await client.query(`SELECT "tenantID",count(*)::integer AS count FROM "${table}" WHERE "tenantID"<>$1 GROUP BY "tenantID" ORDER BY "tenantID"`,[m.tenantID])).rows;
        if(JSON.stringify(rows)!==JSON.stringify(baseline.counts[collection]))drift.push(collection);
      }
      result.preexistingTenantCounts={unchanged:drift.length===0,changedCollections:drift};
      if(drift.length)throw new Error('Pre-existing tenant count drift; investigate before proceeding');
    }
    await client.query('ROLLBACK');console.log('Read-only database snapshot complete');
  }finally{await client.end();}
  console.log('Loading local query and DSL runtime');
  const runtime=createScenarioRuntime(m);
  console.log('Executing stored query checks');
  for(const q of m.queries){
    const network=!['duckdb','sqlite'].includes(q.datasourceType);
    if(network&&!args.includes('--network'))continue;
    try{
      const rows=await runtime.executeQuery(q.dataQueryID,q.sampleInputs);
      JSON.stringify(rows);
      result.checks.push({kind:network?'public-api':'embedded-query',id:q.dataQueryID,title:q.dataQueryTitle,status:'PASS',rows:Array.isArray(rows)?rows.length:undefined});
    }catch(e){result.checks.push({kind:network?'public-api':'embedded-query',id:q.dataQueryID,title:q.dataQueryTitle,status:'FAIL',error:e.message});}
  }
  for(const w of m.workflows){
    try{const r=await runtime.runWorkflow(w.workflowID);if(r.context._workflowStatus!=='COMPLETED'||!r.context._workflowOutput?.result)throw new Error('Workflow did not return a completed result');result.checks.push({kind:'stored-dsl-simulation',id:w.workflowID,title:w.title,status:'PASS',steps:r.trace.length});}
    catch(e){result.checks.push({kind:'stored-dsl-simulation',id:w.workflowID,title:w.title,status:'FAIL',error:e.message});}
  }
  result.limitations=['Temporal timers, transport and human signals in this script are simulated; live-worker verification is separate.','Listeners and cron jobs remain inactive; no claim of scheduled or live ingress execution.'];
  fs.writeFileSync(value('--output'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({checks:result.checks.length,passed:result.checks.filter(c=>c.status==='PASS').length,failures:result.checks.filter(c=>c.status!=='PASS'),preexistingTenantCounts:result.preexistingTenantCounts},null,2));
  if(result.checks.some(c=>c.status==='FAIL'))process.exitCode=1;
}
if(require.main===module)main().catch(e=>{console.error(e.message);process.exitCode=1;});
module.exports={decryptOptions};
