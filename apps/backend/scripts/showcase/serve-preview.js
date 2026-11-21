/** Local-only authenticated preview. No cron startup, recovery sweep, Redis
 * consumers or listener ingress. Uses real app routers and permissions.
 * Optional dedicated Temporal worker processes manual showcase runs only.
 */
const fs=require('fs');
const path=require('path');
const {buildManifest}=require('./manifest');
const args=process.argv.slice(2),value=k=>args[args.indexOf(k)+1];
if(!args.includes('--env'))throw new Error('--env required');
Object.assign(process.env,require('dotenv').parse(fs.readFileSync(path.resolve(value('--env')))),{
  REDIS_URL:'',TEMPORAL_ADDRESS:'127.0.0.1:17233',TEMPORAL_NAMESPACE:'default',TEMPORAL_TASK_QUEUE:'showcase-manual-20261106',TEMPORAL_WORKER_RESTART_ON_CRASH:'false',
  ENABLED_MODULES:'auth,tenant,datasource,dataQuery,workflow,widget,appPage,listener,cronJob,userManagement,tenantRole,apiKey,audit,notification',
  LOG_LEVEL:'error',SYSLOG_HOST:'127.0.0.1',SYSLOG_PROTOCOL:'udp4',
});
BigInt.prototype.toJSON=function(){return this.toString();};
const {expressApp}=require('../../config/express-app.config');
const {httpServer}=require('../../config/http-server.config');
const {socketIO}=require('../../config/socket.io');
const m=buildManifest();
expressApp.use(require('cookie-parser')());
// Stop accidental API access to operational tenants and prevent CRUD/activation.
expressApp.use((req,res,next)=>{
  const match=req.path.match(/^\/api\/v1\/tenants\/([0-9a-f-]{36})(?:\/|$)/i);
  if(match&&match[1]!==m.tenantID)return res.status(403).json({success:false,error:'Preview is confined to Platform Showcase'});
  if(!['GET','HEAD','OPTIONS'].includes(req.method)&&!/^\/api\/v1\/auth\/(login|logout)/.test(req.path)&&!(/\/execute\/?$/.test(req.path)||/\/data-collection\//.test(req.path)))return res.status(403).json({success:false,error:'Preview permits reads and bounded manual execution only'});
  next();
});
expressApp.get('/health',(_req,res)=>res.json({status:'ok',mode:'showcase-preview',schedules:false,listenerIngress:false}));
expressApp.use('/api/v1/auth',require('../../modules/auth/auth.v1.routes'));
expressApp.use('/api/v1/tenants',require('../../modules/tenant/tenant.v1.routes'));
expressApp.use((err,_req,res,_next)=>res.status(err.statusCode||err.status||500).json({success:false,error:{message:err.message,code:err.code}}));
const {widgetSocketController}=require('../../modules/widget/widget.socket.controller');
const constants=require('../../constants');
socketIO.on('connection',socket=>{
  const firebaseID=socket.handshake.auth.firebase_id;
  socket.on(constants.SOCKET_RECEIVE_EVENTS.WIDGET_WORKFLOW_CONNECT,async data=>{
    if(data.tenantID!==m.tenantID)return;
    try{await widgetSocketController.onWidgetWorkflowConnect({...data,socket,firebaseID});}catch(e){console.error('Showcase widget connection:',e.message);}
  });
  socket.on(constants.SOCKET_RECEIVE_EVENTS.WIDGET_SEND_INPUT,async data=>{try{await widgetSocketController.onWidgetSendInput({...data,socket});}catch(e){console.error(e.message);}});
  socket.on(constants.SOCKET_RECEIVE_EVENTS.WIDGET_REFRESH,async data=>{if(data.tenantID!==m.tenantID)return;try{await widgetSocketController.onWidgetRefresh({...data,socket});}catch(e){console.error(e.message);}});
  socket.on(constants.SOCKET_RECEIVE_EVENTS.WIDGET_WORKFLOW_DISCONNECT,async data=>{await widgetSocketController.onWidgetWorkflowDisconnect({...data,socket});});
  socket.on('disconnect',()=>widgetSocketController.onSocketDisconnect({socket,firebaseID}));
});
let worker;
async function main(){
  if(args.includes('--worker')){worker=require('../../modules/workflow/temporal/worker');await worker.startTemporalWorker();}
  const port=args.includes('--port')?Number(value('--port')):8090;
  await new Promise(resolve=>httpServer.listen(port,'127.0.0.1',resolve));
  console.log(`SHOWCASE_PREVIEW_READY http://localhost:${port}; schedules and ingress OFF`);
}
async function stop(){
  if(worker)await worker.stopTemporalWorker();
  socketIO.close();httpServer.close();
  await require('../../config/prisma.config').prisma.$disconnect();process.exit(0);
}
process.on('SIGINT',stop);process.on('SIGTERM',stop);
main().catch(e=>{console.error(e.message);process.exit(1);});
