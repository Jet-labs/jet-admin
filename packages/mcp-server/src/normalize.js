/**
 * normalize.js — output shaping shared by tools.
 * Keeps responses small and makes the shapes match the tool descriptions.
 */

export function normalizeWorkflow(raw) {
  const w = raw?.workflow ?? raw ?? {};
  const rawNodes = w.tblWorkflowNodes || w.nodes || [];
  const rawEdges = w.tblWorkflowEdge || w.edges || [];
  const nodes = rawNodes.map((n) => ({
    id: n.nodeID ?? n.id,
    type: n.nodeType ?? n.type,
    data: n.nodeConfig ?? n.data ?? {},
  }));
  const edges = rawEdges.map((e) => {
    const cfg = e.edgeConfig || {};
    return {
      id: e.edgeID ?? e.id,
      source: e.upstreamNodeID ?? e.source,
      target: e.downstreamNodeID ?? e.target,
      sourceHandle: e.sourceHandle ?? null,
      targetHandle: e.targetHandle ?? null,
      type: e.edgeType ?? e.type ?? 'smoothstep',
      ...(cfg.label !== undefined ? { label: cfg.label } : {}),
      ...(cfg.data !== undefined ? { data: cfg.data } : {}),
      ...(cfg.style !== undefined ? { style: cfg.style } : {}),
      ...(cfg.animated !== undefined ? { animated: cfg.animated } : {}),
    };
  });
  return {
    workflowID: w.workflowID,
    title: w.title ?? w.workflowTitle ?? '(untitled)',
    status: w.isDisabled ? 'inactive' : 'active',
    isDisabled: w.isDisabled ?? null,
    description: w.workflowOptions?.description ?? null,
    workflowOptions: w.workflowOptions || {},
    folderID: w.folderID ?? null,
    createdAt: w.createdAt,
    updatedAt: w.updatedAt,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    nodes,
    edges,
  };
}

export function summarizeInstance(raw, { verbosity = 'summary', maxLogs = 50 } = {}) {
  if (!raw) return raw;
  if (verbosity === 'full') return raw;
  const allLogs = Array.isArray(raw.logs) ? raw.logs : [];
  const slice = maxLogs > 0 ? allLogs.slice(-maxLogs) : [];
  const logs = slice.map((l) => {
    const payload = { ...(l.payload || {}) };
    delete payload.__contextSnapshot;
    return { ...l, payload };
  });
  const errors = [];
  for (const l of allLogs) {
    if (l.errorMessage) errors.push({ nodeID: l.nodeID || null, eventType: l.eventType, message: l.errorMessage });
    const p = l.payload || {};
    if (p.__temporalStartError) errors.push({ nodeID: null, eventType: l.eventType, message: p.__temporalStartError, code: 'WORKFLOW_START_FAILED' });
    if (p.error?.message) errors.push({ nodeID: l.nodeID || null, eventType: l.eventType, message: p.error.message });
  }
  const failedLog = [...allLogs].reverse().find((l) => l.nodeStatus === 'failed' || l.eventType === 'NODE_FAILED');
  const failedNode = errors.find((e) => e.nodeID)?.nodeID || failedLog?.nodeID || null;
  const contextData = {};
  const nodeOutputs = {};
  for (const [k, v] of Object.entries(raw.contextData || {})) {
    if (k.startsWith('__node_')) nodeOutputs[k.slice('__node_'.length)] = v;
    else if (!k.startsWith('__')) contextData[k] = v;
  }
  return {
    instanceID: raw.instanceID,
    workflowID: raw.workflowID,
    status: raw.status,
    isTest: raw.isTest,
    parentInstanceID: raw.parentInstanceID ?? null,
    parentNodeID: raw.parentNodeID ?? null,
    startedAt: raw.startedAt,
    completedAt: raw.completedAt,
    output: raw.output,
    errors,
    failedNode,
    contextData,
    nodeOutputs,
    logCount: allLogs.length,
    logsTruncated: allLogs.length > logs.length,
    logs,
    suspended: Array.isArray(raw.pendingDataCollectionRequests) && raw.pendingDataCollectionRequests.length > 0,
    pendingDataCollectionRequests: raw.pendingDataCollectionRequests || [],
  };
}

export function compactSchemaMap(map) {
  const entries = Object.entries(map || {});
  const types = entries.map(([type, value]) => {
    const schema = value?.schema || value?.widgetType ? value.schema : value;
    const props = schema?.properties || {};
    return {
      type,
      fields: Object.keys(props),
      required: schema?.required || [],
      ...(value?.widgetType ? { widgetType: value.widgetType, dataKey: value.descriptor?.dataKey || null } : {}),
    };
  });
  return {
    totalCount: types.length,
    types,
    hint: 'This is a compact field index. Pass the type parameter to get the full JSON schema and UI schema for one type.',
  };
}

export function dedupePermissions(rows = []) {
  const byTitle = new Map();
  for (const row of rows) {
    const p = row?.tblPermissions || row;
    const key = p?.permissionTitle || p?.permissionID;
    if (!key || byTitle.has(key)) continue;
    byTitle.set(key, {
      permissionID: p.permissionID,
      permissionTitle: p.permissionTitle,
      permissionDescription: p.permissionDescription || null,
    });
  }
  return { permissions: [...byTitle.values()], totalCount: byTitle.size, rawCount: rows.length };
}

export function compactAuditLog(log) {
  const req = log?.metadata?.request || {};
  const res = log?.metadata?.response || {};
  const body = req.body || {};
  return {
    auditLogID: log.auditLogID,
    createdAt: log.createdAt,
    type: log.type,
    subType: log.subType,
    success: log.success,
    userID: log.userID || null,
    apiKeyID: log.metadata?.apiKeyID || null,
    authType: log.metadata?.authType || null,
    method: req.method || log.subType || null,
    path: req.url || null,
    statusCode: res.statusCode || null,
    title: body.title || body.workflowTitle || body.dataQueryTitle || body.widgetTitle || body.appPageTitle || body.listenerTitle || body.cronJobTitle || body.roleTitle || body.apiKeyTitle || body.folderTitle || null,
  };
}
