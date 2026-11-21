/** Local harness: real query engine, real node handlers and real DSL graph walk.
 * Temporal transport/timers/signals are simulated, explicitly NOT a live-worker test.
 * No database connections, worker startup or scheduled jobs are invoked here.
 */
const path=require('path');
const vm=require('vm');
const {buildSync}=require('esbuild');
const {resolveTemplate}=require('@jet-admin/expression-engine');
const {executeNode}=require('@jet-admin/workflow-nodes-logic');
const {QueryEngine}=require('../../modules/dataQuery/queryEngine/engine');
const {buildResolveTemplate}=require('../../modules/workflow/temporal/activities/resolveTemplate');

function createScenarioRuntime(manifest){
  const queries=new Map(manifest.queries.map(q=>[q.dataQueryID,q]));
  const sources=new Map(manifest.datasources.map(d=>[d.datasourceID,d]));
  const engine=new QueryEngine(async key=>queries.get(key),async key=>sources.get(key));
  const bundle=buildSync({entryPoints:[path.join(__dirname,'../../modules/workflow/temporal/workflows/dslWorkflow.js')],bundle:true,write:false,format:'cjs',platform:'node',external:['@temporalio/workflow']}).outputFiles[0].text;
  async function executeQuery(queryID,values={}){
    const q=queries.get(queryID);if(!q)throw new Error('Unknown scenario query');
    const inputs={};
    for(const d of q.dataQueryOptions.inputDefinitions||[]){
      let v=values[d.key]??d.defaultValue;
      if(d.type==='number'){
        if(typeof v!=='number'||!Number.isFinite(v))throw new Error(`Input ${d.key} must be a finite number`);
      }
      inputs[d.key]=v;
    }
    return engine.executeQuery(queryID,inputs,{tenantID:manifest.tenantID});
  }
  async function runWorkflow(workflowID,inputs={},humanDecision='approve',depth=0){
    if(depth>2)throw new Error('Scenario sub-workflow depth exceeded');
    const w=manifest.workflows.find(w=>w.workflowID===workflowID);if(!w)throw new Error('Unknown workflow');
    const signals=new Map(),trace=[];let pending=null;
    const activities={
      emitProgressActivity:async p=>{trace.push({nodeID:p.nodeID,status:p.status,output:p.output});},
      emitWorkflowCompletedActivity:async p=>{trace.push({finalStatus:p.finalStatus});},
      createDataCollectionRequestActivity:async request=>{
        pending=request;
        if(humanDecision==='expired')return;
        const data=request.collectionConfig.collectionType==='approval'?{decision:humanDecision,comment:'Synthetic verification decision'}:{etaDays:5,reason:'Synthetic supplier port delay'};
        const submit=[...signals.entries()].find(([name])=>/submit/i.test(name));
        if(!submit)throw new Error('Human-input signal handler not registered');
        submit[1]({nodeID:request.nodeID,data});
      },
      executeNodeActivity:async({node,context,tenantID,instanceID,workflowID:currentWorkflowID})=>{
        const resolve=buildResolveTemplate(context);
        return executeNode({node,context,helpers:{resolveTemplate:resolve,tenantID,instanceID,workflowID:currentWorkflowID,nodeID:node.id},services:{
          resolveInputs:async({inputValues,contextData})=>({valid:true,errors:[],resolved:resolveTemplate(inputValues,contextData.ctx,{allowedRoots:['ctx'],preserveSingleExpressionType:true})}),
          authorizedExecuteDataQuery:async({dataQueryID,executionInputs})=>executeQuery(dataQueryID,executionInputs),
          createSystemContext:()=>({tenantID}),ORIGIN_TYPES:{WORKFLOW:'workflow'},
          runSubWorkflow:async({childWorkflowID,inputValues})=>{
            const result=await runWorkflow(childWorkflowID,inputValues,humanDecision,depth+1);
            return {status:'COMPLETED',output:result.context._workflowOutput,contextSnapshot:result.context,childInstanceID:`local-${depth+1}`};
          },
        }});
      },
    };
    const temporal={proxyActivities:()=>activities,defineSignal:name=>name,setHandler:(name,handler)=>signals.set(name,handler),condition:async predicate=>Boolean(predicate()),sleep:async ms=>{trace.push({simulatedDelayMs:ms});},ApplicationFailure:{nonRetryable:message=>new Error(message)},CancellationScope:{nonCancellable:fn=>fn()}};
    const module={exports:{}};
    vm.runInNewContext(bundle,{module,exports:module.exports,require:name=>{if(name==='@temporalio/workflow')return temporal;throw new Error(`Unexpected DSL dependency ${name}`);},console,Date,setTimeout,clearTimeout},{timeout:5000});
    const initial=Object.fromEntries((w.workflowOptions.inputDefinitions||[]).map(d=>[d.key,d.defaultValue]));
    Object.assign(initial,inputs);
    const context=await module.exports.dslInterpreterWorkflow({nodes:w.nodes.map(n=>({id:n.nodeID,type:n.nodeType,data:n.nodeConfig})),edges:w.edges.map(e=>({id:e.edgeID,source:e.upstreamNodeID,target:e.downstreamNodeID,sourceHandle:e.sourceHandle})),initialContext:{input:initial},instanceID:'local-verification',tenantID:manifest.tenantID,workflowID,isTestRun:true,workflowOptions:w.workflowOptions});
    return {context,trace,humanRequest:pending};
  }
  return {executeQuery,runWorkflow,engine};
}
module.exports={createScenarioRuntime};
