/**
 * Additive, transactionally isolated production showcase seed.
 * Dry-run (default): node apps/backend/scripts/seed-platform-showcase.js
 * Apply requires --apply --env <file> --confirm-host <exact hostname>.
 * Verification: --verify --env <file> (read-only; no repairs or activation).
 * Never starts the application, scheduler, workers or listener proxy.
 */
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const {Client}=require('pg');
const dotenv=require('dotenv');
const {buildManifest,summarize,id}=require('./showcase/manifest');
const {validateManifest}=require('./showcase/validate');

const TABLES={folders:['tblFolders','folderID'],datasources:['tblDatasources','datasourceID'],queries:['tblDataQueries','dataQueryID'],workflows:['tblWorkflows','workflowID'],widgets:['tblWidgets','widgetID'],pages:['tblAppPages','appPageID'],listeners:['tblListeners','listenerID'],cronJobs:['tblCronJobs','cronJobID']};
const JSON_KEYS=new Set(['config','metadata','datasourceOptions','dataQueryOptions','workflowOptions','nodeConfig','edgeConfig','widgetConfig','appPageConfig','listenerConfig','actionConfig','workflowConfig']);
function digest(m){return crypto.createHash('sha256').update(JSON.stringify(m)).digest('hex');}
function encryptOptions(options,keyHex){
  if(!/^[a-f0-9]{64}$/i.test(keyHex||''))throw new Error('A valid VAULT_ENCRYPTION_KEY is required');
  const iv=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',Buffer.from(keyHex,'hex'),iv);
  const data=Buffer.concat([cipher.update(JSON.stringify(options),'utf8'),cipher.final()]);
  return {__encrypted:true,iv:iv.toString('hex'),data:data.toString('hex'),authTag:cipher.getAuthTag().toString('hex')};
}
async function insertRows(client,table,rows,keys){
  if(!rows.length)return 0;
  const columns=keys||Object.keys(rows[0]);const params=[];
  const tuples=rows.map(row=>'('+columns.map(k=>{
    let value=row[k]??null;
    if(JSON_KEYS.has(k)&&value!==null)value=JSON.stringify(value);
    params.push(value);return `$${params.length}`;
  }).join(',')+')');
  const result=await client.query(`INSERT INTO "${table}" (${columns.map(k=>`"${k}"`).join(',')}) VALUES ${tuples.join(',')} ON CONFLICT DO NOTHING`,params);
  return result.rowCount;
}
async function verifyDatabase(client,m){
  const counts={};
  for(const [collection,[table,key]]of Object.entries(TABLES)){
    const expected=m[collection].map(r=>r[key]);
    const rows=(await client.query(`SELECT "${key}" FROM "${table}" WHERE "tenantID"=$1`,[m.tenantID])).rows;
    const actual=new Set(rows.map(r=>r[key]));
    if(expected.some(k=>!actual.has(k)))throw new Error(`Missing seeded ${collection}`);
    counts[collection]={seeded:expected.length,total:actual.size};
  }
  const live=(await client.query('SELECT (SELECT count(*) FROM "tblCronJobs" WHERE "tenantID"=$1 AND NOT "isDisabled") AS jobs,(SELECT count(*) FROM "tblListeners" WHERE "tenantID"=$1 AND status<>\'inactive\') AS listeners',[m.tenantID])).rows[0];
  if(Number(live.jobs)||Number(live.listeners))throw new Error('Background activation has changed; refusing to claim disabled state');
  const owner=(await client.query('SELECT 1 FROM "tblUsersTenantsRelationship" WHERE "tenantID"=$1 AND "userID"=$2 AND role=\'ADMIN\'',[m.tenantID,m.ownerID])).rowCount;
  const policy=(await client.query("SELECT 1 FROM casbin_rule WHERE ptype='p' AND v0=$1 AND v1=$2 AND v2='*' AND v3='*' AND v4='allow'",[m.ownerID,m.tenantID])).rowCount;
  if(!owner||!policy)throw new Error('Showcase owner is missing membership or policy');
  for(const [table,key]of [['tblWorkflowNodes','nodeID'],['tblWorkflowEdge','edgeID']]){
    const actual=Number((await client.query(`SELECT count(*) AS n FROM "${table}" x JOIN "tblWorkflows" w ON w."workflowID"=x."workflowID" WHERE w."tenantID"=$1`,[m.tenantID])).rows[0].n);
    const expected=m.workflows.reduce((n,w)=>n+(key==='nodeID'?w.nodes.length:w.edges.length),0);
    if(actual!==expected)throw new Error(`Unexpected ${table} count ${actual}, expected ${expected}`);
    counts[table]=actual;
  }
  return {tenantID:m.tenantID,counts,ownerAccess:true,backgroundAutomation:'disabled'};
}
async function applyManifest(client,m,keyHex){
  const inserted={};
  await client.query('BEGIN');
  try{
    await client.query("SET LOCAL lock_timeout='5s'");
    await client.query("SET LOCAL statement_timeout='20s'");
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))',[m.version]);
    const owner=await client.query('SELECT "userID" FROM "tblUsers" WHERE "userID"=$1 AND NOT coalesce("isDisabled",false)',[m.ownerID]);
    if(!owner.rowCount)throw new Error('Approved owner does not exist or is disabled');
    const existing=(await client.query('SELECT "tenantID","creatorID","tenantTitle" FROM "tblTenants" WHERE "tenantID"=$1 OR "tenantTitle"=$2',[m.tenantID,m.tenantTitle])).rows;
    if(existing.length&&(existing.length!==1||existing[0].tenantID!==m.tenantID||existing[0].creatorID!==m.ownerID))throw new Error('Tenant identity collision; no existing tenant will be reused');
    if(existing.length){
      const configs=(await client.query('SELECT config FROM "tblUserTenantConfigMap" WHERE "tenantID"=$1 AND "userID"=$2',[m.tenantID,m.ownerID])).rows;
      if(configs[0]?.config?.showcaseManifestHash!==digest(m))throw new Error('Existing tenant is not this exact manifest; refusing to overwrite or repair');
      const verification=await verifyDatabase(client,m);
      await client.query('ROLLBACK');
      return {action:'already_present',inserted,verification};
    }
    // Check deterministic IDs across every collection before inserting any resource.
    for(const [collection,[table,key]]of Object.entries(TABLES)){
      const conflicts=await client.query(`SELECT "${key}" FROM "${table}" WHERE "${key}"=ANY($1::uuid[])`,[m[collection].map(r=>r[key])]);
      if(conflicts.rowCount)throw new Error(`ID collision in ${table}; preserving existing rows`);
    }
    await insertRows(client,'tblTenants',[{tenantID:m.tenantID,tenantTitle:m.tenantTitle,creatorID:m.ownerID,isDisabled:false}]);
    await insertRows(client,'tblUsersTenantsRelationship',[{tenantID:m.tenantID,userID:m.ownerID,role:'ADMIN'}]);
    await insertRows(client,'tblUserTenantConfigMap',[{tenantID:m.tenantID,userID:m.ownerID,config:{showcaseVersion:m.version,showcaseManifestHash:digest(m)}}]);
    await client.query("INSERT INTO casbin_rule(ptype,v0,v1,v2,v3,v4) VALUES('p',$1,$2,'*','*','allow')",[m.ownerID,m.tenantID]);
    for(const [collection,[table]]of Object.entries(TABLES)){
      const rows=m[collection].map(row=>{
        const out={...row};delete out.sampleInputs;delete out.nodes;delete out.edges;delete out.actions;
        if(collection==='datasources'){
          const options={...out.datasourceOptions};
          if(options.authSecret==='__GENERATE_ON_INSERT__')options.authSecret=crypto.randomBytes(32).toString('hex');
          out.datasourceOptions=encryptOptions(options,keyHex);
        }
        return out;
      });
      inserted[collection]=await insertRows(client,table,rows);
    }
    inserted.nodes=await insertRows(client,'tblWorkflowNodes',m.workflows.flatMap(w=>w.nodes));
    inserted.edges=await insertRows(client,'tblWorkflowEdge',m.workflows.flatMap(w=>w.edges));
    const actions=m.listeners.flatMap(l=>l.actions.map((a,i)=>({actionID:id(`action:${l.listenerID}:${i}`),listenerID:l.listenerID,actionType:a.actionType,actionConfig:a.actionConfig,isEnabled:true,orderIndex:i})));
    inserted.actions=await insertRows(client,'tblListenerActions',actions);
    await insertRows(client,'tblAuditLogs',[{auditLogID:id('seed-audit'),tenantID:m.tenantID,userID:m.ownerID,type:'SHOWCASE_SEED',subType:'CREATE',success:true,metadata:{version:m.version,manifestHash:digest(m),counts:summarize(m).counts,backgroundAutomation:'disabled'}}]);
    const verification=await verifyDatabase(client,m);
    await client.query('COMMIT');
    return {action:'created',inserted,verification};
  }catch(error){await client.query('ROLLBACK');throw error;}
}
async function main(argv=process.argv.slice(2)){
  const option=key=>{const at=argv.indexOf(key);return at<0?null:argv[at+1];};
  const m=buildManifest();validateManifest(m);
  const summary={...summarize(m),manifestHash:digest(m)};
  if(!argv.includes('--apply')&&!argv.includes('--verify')){console.log(JSON.stringify({mode:'dry-run',...summary},null,2));return;}
  if(argv.includes('--apply')&&argv.includes('--verify'))throw new Error('Choose apply OR verify');
  const filename=option('--env');if(!filename)throw new Error('Explicit --env path required');
  const config=dotenv.parse(fs.readFileSync(path.resolve(filename)));
  const url=new URL(config.DATABASE_URL);
  if(argv.includes('--apply')&&option('--confirm-host')!==url.hostname)throw new Error('--confirm-host must match the configured database host exactly');
  const sslmode=url.searchParams.get('sslmode');url.searchParams.delete('sslmode');url.searchParams.delete('channel_binding');
  const local=['localhost','127.0.0.1','::1'].includes(url.hostname);
  if(!local&&sslmode==='disable')throw new Error('TLS required for remote database');
  const client=new Client({connectionString:url.toString(),ssl:local?undefined:{rejectUnauthorized:true},connectionTimeoutMillis:10000,statement_timeout:20000,application_name:m.version});
  try{
    await client.connect();
    let result;
    if(argv.includes('--verify')){await client.query('BEGIN READ ONLY');result=await verifyDatabase(client,m);await client.query('ROLLBACK');}
    else result=await applyManifest(client,m,config.VAULT_ENCRYPTION_KEY);
    const receipt={mode:argv.includes('--verify')?'verify':'apply',target:{host:url.hostname,database:url.pathname.slice(1)},summary,result,resources:Object.fromEntries(Object.entries(TABLES).map(([key,[,field]])=>[key,m[key].map(r=>({id:r[field],title:r.appPageTitle||r.widgetTitle||r.title||r.dataQueryTitle||r.datasourceTitle||r.listenerTitle||r.cronJobTitle||r.folderTitle}))]))};
    const output=option('--receipt');if(output)fs.writeFileSync(output,JSON.stringify(receipt,null,2)+'\n');
    console.log(JSON.stringify(receipt,null,2));
  }finally{await client.end();}
}
if(require.main===module)main().catch(e=>{console.error(`Showcase seed failed: ${e.code||e.name}: ${e.message}`);process.exitCode=1;});
module.exports={TABLES,JSON_KEYS,digest,encryptOptions,insertRows,verifyDatabase,applyManifest,main};
