const assert = require('node:assert/strict');
const { DATASOURCE_TYPES } = require('@jet-admin/datasource-types');
const { validateWidgetConfig } = require('@jet-admin/widget-types');
const { NODE_TYPE } = require('@jet-admin/workflow-nodes-logic');

function validateManifest(m) {
  const collections=['folders','datasources','queries','workflows','widgets','pages','listeners','cronJobs'];
  const keyFields=['folderID','datasourceID','dataQueryID','workflowID','widgetID','appPageID','listenerID','cronJobID'];
  const ids=new Set();
  collections.forEach((key,i)=>m[key].forEach(row=>{
    assert.equal(row.tenantID,m.tenantID,`${key} tenant mismatch`);
    assert.equal(row.creatorID,m.ownerID,`${key} owner mismatch`);
    assert.ok(!ids.has(row[keyFields[i]]),'Duplicate resource ID');ids.add(row[keyFields[i]]);
    if(row.folderID && key!=='folders') assert.ok(m.folders.some(f=>f.folderID===row.folderID),'Unknown folder');
  }));
  const queries=new Set(m.queries.map(q=>q.dataQueryID));
  const workflows=new Set(m.workflows.map(w=>w.workflowID));
  const pages=new Set(m.pages.map(p=>p.appPageID));
  const listeners=new Set(m.listeners.map(l=>l.listenerID));
  const widgetIDs=new Set(m.widgets.map(w=>w.widgetID));
  const knownTypes=new Set(Object.values(DATASOURCE_TYPES).map(d=>d.value));
  m.datasources.forEach(d=>assert.ok(knownTypes.has(d.datasourceType),`Unknown datasource ${d.datasourceType}`));
  m.queries.forEach(q=>{
    assert.ok(m.datasources.some(d=>d.datasourceID===q.datasourceID&&d.datasourceType===q.datasourceType),'Query datasource mismatch');
    assert.ok(q.dataQueryOptions.timeoutSeconds<=30,'Unbounded query');
  });
  const types=new Set(Object.values(NODE_TYPE));
  m.workflows.forEach(w=>{
    const nodes=new Set(w.nodes.map(n=>n.nodeID));
    assert.equal(w.nodes.filter(n=>n.nodeType==='start').length,1,'Workflow needs one start');
    w.nodes.forEach(n=>{
      assert.ok(types.has(n.nodeType),'Unknown workflow node');
      if(n.nodeConfig.dataQueryID) assert.ok(queries.has(n.nodeConfig.dataQueryID),'Unknown workflow query');
      if(n.nodeConfig.childWorkflowID) assert.ok(workflows.has(n.nodeConfig.childWorkflowID),'Unknown child workflow');
      if(n.nodeType==='loop') assert.ok(n.nodeConfig.maxIterations<=10,'Unbounded loop');
    });
    w.edges.forEach(e=>{assert.ok(nodes.has(e.upstreamNodeID));assert.ok(nodes.has(e.downstreamNodeID));});
    const reachable=new Set(w.nodes.filter(n=>n.nodeType==='start').map(n=>n.nodeID));
    for(let i=0;i<w.nodes.length;i++)w.edges.forEach(e=>{if(reachable.has(e.upstreamNodeID))reachable.add(e.downstreamNodeID);});
    assert.equal(reachable.size,nodes.size,`Unreachable nodes in ${w.title}`);
  });
  function refs(value) {
    if(!value||typeof value!=='object')return;
    for(const [key,v] of Object.entries(value)) {
      if(['dataQueryID','queryID'].includes(key)&&v) assert.ok(queries.has(v),`Unknown query ${v}`);
      if(['workflowID','childWorkflowID'].includes(key)&&v) assert.ok(workflows.has(v),`Unknown workflow ${v}`);
      if(key==='listenerID'&&v) assert.ok(listeners.has(v),`Unknown listener ${v}`);
      if(key==='appPageID'&&v) assert.ok(pages.has(v),`Unknown page ${v}`);
      if(typeof v==='object')refs(v);
    }
  }
  const warnings=[];
  m.widgets.forEach(w=>{
    const result=validateWidgetConfig(w.widgetType,w.widgetConfig);
    assert.ok(result.valid,`${w.widgetTitle}: ${JSON.stringify(result.errors)}`);
    if(result.warnings?.length)warnings.push({widgetID:w.widgetID,warnings:result.warnings});
    refs(w.widgetConfig);
  });
  m.pages.forEach(p=>{
    const registered=new Set(p.appPageConfig.widgets);
    p.appPageConfig.widgets.forEach(k=>assert.ok(widgetIDs.has(k.split('_')[1]),`Unknown widget ${k}`));
    const walk=n=>{if(n.type==='widget')assert.ok(registered.has(n.widgetKey),'Unregistered layout slot');(n.children||[]).forEach(walk);};walk(p.appPageConfig.layout);
    const aliases=p.appPageConfig.dataSources.map(s=>s.alias);assert.equal(new Set(aliases).size,aliases.length,'Duplicate source alias');
    refs(p.appPageConfig);
  });
  m.listeners.forEach(l=>{assert.equal(l.status,'inactive');assert.ok(m.datasources.some(d=>d.datasourceID===l.datasourceID));l.actions.forEach(a=>refs(a.actionConfig));});
  m.cronJobs.forEach(c=>{assert.equal(c.isDisabled,true);assert.equal(c.nextRunAt,null);assert.ok(workflows.has(c.workflowID));});
  return {valid:true,warnings};
}
module.exports={validateManifest};
