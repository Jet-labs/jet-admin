/** Guarded correction of our initial seed's literal GraphQL brace adjacency.
 * No general repair/overwrite path: accepts exactly the original options/hash.
 */
const fs=require('fs');
const {Client}=require('pg');
const {buildManifest,ref,id}=require('./manifest');
const {digest}=require('../seed-platform-showcase');
async function correct(client){
  const next=buildManifest();
  const q=next.queries.find(q=>q.dataQueryID===ref('query','countries'));
  const old=JSON.parse(JSON.stringify(next));
  const prior=old.queries.find(x=>x.dataQueryID===q.dataQueryID);
  prior.dataQueryOptions.query=prior.dataQueryOptions.query.replace(']} })',']}})');
  await client.query('BEGIN');
  try{
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))',[next.version]);
    const cfg=(await client.query('SELECT config FROM "tblUserTenantConfigMap" WHERE "tenantID"=$1 AND "userID"=$2 FOR UPDATE',[next.tenantID,next.ownerID])).rows[0]?.config;
    const saved=(await client.query('SELECT "dataQueryOptions" FROM "tblDataQueries" WHERE "tenantID"=$1 AND "dataQueryID"=$2 AND "creatorID"=$3 FOR UPDATE',[next.tenantID,q.dataQueryID,next.ownerID])).rows[0]?.dataQueryOptions;
    if(cfg?.showcaseManifestHash===digest(next)&&saved?.query===q.dataQueryOptions.query){await client.query('ROLLBACK');return 'already_correct';}
    if(cfg?.showcaseManifestHash!==digest(old)||JSON.stringify(saved)!==JSON.stringify(prior.dataQueryOptions))throw new Error('Seed ownership/content drift; refusing correction');
    await client.query('UPDATE "tblDataQueries" SET "dataQueryOptions"=$1::json,"updatedAt"=now() WHERE "tenantID"=$2 AND "dataQueryID"=$3',[JSON.stringify(q.dataQueryOptions),next.tenantID,q.dataQueryID]);
    await client.query('UPDATE "tblUserTenantConfigMap" SET config=$1::jsonb WHERE "tenantID"=$2 AND "userID"=$3',[JSON.stringify({...cfg,showcaseManifestHash:digest(next)}),next.tenantID,next.ownerID]);
    await client.query('INSERT INTO "tblAuditLogs"("auditLogID","tenantID","userID",type,"subType",success,metadata) VALUES($1,$2,$3,$4,$5,true,$6::jsonb)',[id('graphql-correction-audit'),next.tenantID,next.ownerID,'SHOWCASE_SEED','SYNTAX_CORRECTION',JSON.stringify({queryID:q.dataQueryID,oldHash:digest(old),newHash:digest(next)})]);
    await client.query('COMMIT');return 'corrected';
  }catch(e){await client.query('ROLLBACK');throw e;}
}
async function main(){
  const file=process.argv[2];if(!file)throw new Error('Explicit env file required');
  const config=require('dotenv').parse(fs.readFileSync(file));const u=new URL(config.DATABASE_URL);u.searchParams.delete('sslmode');u.searchParams.delete('channel_binding');
  const client=new Client({connectionString:u.toString(),ssl:['127.0.0.1','localhost'].includes(u.hostname)?undefined:{rejectUnauthorized:true},connectionTimeoutMillis:10000,query_timeout:20000});
  try{await client.connect();console.log(JSON.stringify({host:u.hostname,result:await correct(client)}));}finally{await client.end();}
}
if(require.main===module)main().catch(e=>{console.error(e.message);process.exitCode=1;});
module.exports={correct};
