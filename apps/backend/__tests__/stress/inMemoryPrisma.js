/**
 * In-Memory Prisma Store
 * Replaces all DB calls with fast in-process state.
 * Single shared singleton — reset between tests via store.reset().
 *
 * Changes from previous version:
 *   - tblWorkflowInstances.create: adds version: 0
 *   - tblWorkflowInstances.updateMany: correctly handles instanceID as direct
 *     string equality, instanceID.in array, and version field in where clause.
 *     Previously only checked instanceID.in, so _bumpVersion('inst-1', 0) would
 *     match and bump ALL instances — breaking CAS across concurrent test instances.
 *   - tblWorkflowInstanceLogs.create: adds nodeAttempt field
 *   - tblWorkflowInstanceLogs.create: simulates P2002 unique constraint on
 *     (instanceID, nodeID, eventType, nodeAttempt) for non-null nodeIDs,
 *     matching the production unique index from the migration.
 */

let _logSeq = 1;
let _instanceSeq = 1;

const state = {
  instances: new Map(),  // instanceID → instance row
  logs: new Map(),  // instanceID → log[]
  nodes: new Map(),  // workflowID → node[]
  edges: new Map(),  // workflowID → edge[]
  logUniqueKeys: new Set(), // "instanceID::nodeID::eventType::nodeAttempt" for unique enforcement
};

// ─── Seed helpers ─────────────────────────────────────────────────────────────

function seedWorkflow({ workflowID, nodes, edges }) {
  state.nodes.set(workflowID, nodes);
  state.edges.set(workflowID, edges);
}

function reset() {
  state.instances.clear();
  state.logs.clear();
  state.nodes.clear();
  state.edges.clear();
  state.logUniqueKeys.clear();
  _logSeq = 1;
  _instanceSeq = 1;
}

// ─── Read helpers (used by tests to assert state) ─────────────────────────────

function getInstance(instanceID) {
  return state.instances.get(instanceID) ?? null;
}

function getLogs(instanceID) {
  return state.logs.get(instanceID) ?? [];
}

function getCompletedNodes(instanceID) {
  return getLogs(instanceID)
    .filter(l => l.eventType === 'NODE_COMPLETED')
    .map(l => l.nodeID);
}

function getNodeExecutionCount(instanceID, nodeID) {
  return getLogs(instanceID).filter(
    l => l.eventType === 'NODE_COMPLETED' && l.nodeID === nodeID
  ).length;
}

// ─── Where clause helpers ─────────────────────────────────────────────────────

/**
 * Match a row against a Prisma-style where object.
 * Handles: direct string equality, .in arrays, .lt comparisons, undefined checks.
 */
function matchesWhere(row, where) {
  for (const [key, condition] of Object.entries(where)) {
    const value = row[key];

    if (condition === undefined || condition === null) continue;

    if (typeof condition === 'object' && !Array.isArray(condition)) {
      // Prisma filter operators
      if ('in' in condition) {
        if (!condition.in.includes(value)) return false;
        continue;
      }
      if ('lt' in condition) {
        if (!(value < condition.lt)) return false;
        continue;
      }
      if ('gt' in condition) {
        if (!(value > condition.gt)) return false;
        continue;
      }
      if ('not' in condition) {
        if (value === condition.not) return false;
        continue;
      }
      // Unknown operator — skip
      continue;
    }

    // Direct equality
    if (value !== condition) return false;
  }
  return true;
}

// ─── Prisma client mock ───────────────────────────────────────────────────────

const prisma = {
  // ── tblWorkflowInstances ──────────────────────────────────────────────────
  tblWorkflowInstances: {
    create: async ({ data }) => {
      const instanceID = data.instanceID ?? `inst-${_instanceSeq++}`;
      const row = {
        workflowID: data.workflowID ?? null,
        tenantID: data.tenantID,
        status: data.status ?? 'RUNNING',
        isTest: data.isTest ?? false,
        startedAt: data.startedAt ?? new Date(),
        completedAt: null,
        updatedAt: new Date(),
        version: 0,   // ← required for CAS; must start at 0
        ...data,
        instanceID,       // ensure our generated ID wins over any data.instanceID
        version: data.version ?? 0,  // ensure version is always present
      };
      state.instances.set(instanceID, row);
      return row;
    },

    findUnique: async ({ where }) => {
      return state.instances.get(where.instanceID) ?? null;
    },

    findMany: async ({ where = {} } = {}) => {
      return [...state.instances.values()].filter(inst => matchesWhere(inst, where));
    },

    update: async ({ where, data }) => {
      const row = state.instances.get(where.instanceID);
      if (!row) throw new Error(`Instance ${where.instanceID} not found`);
      Object.assign(row, data, { updatedAt: new Date() });
      return row;
    },

    /**
     * updateMany — the critical fix.
     *
     * Previously only checked `where.instanceID?.in`, so a call like:
     *   updateMany({ where: { instanceID: 'inst-1', version: 0, status: 'RUNNING' }, data: { version: 1 } })
     * would match ALL running instances because `!where.instanceID?.in` was always
     * true when instanceID is a plain string. This caused _bumpVersion('inst-1', 0)
     * to increment the version of every other running instance, breaking their CAS.
     *
     * The fix uses matchesWhere() which handles direct string equality correctly.
     */
    updateMany: async ({ where, data }) => {
      let count = 0;
      for (const row of state.instances.values()) {
        if (matchesWhere(row, where)) {
          Object.assign(row, data, { updatedAt: new Date() });
          count++;
        }
      }
      return { count };
    },

    delete: async ({ where }) => {
      const row = state.instances.get(where.instanceID);
      state.instances.delete(where.instanceID);
      return row;
    },
  },

  // ── tblWorkflowInstanceLogs ───────────────────────────────────────────────
  tblWorkflowInstanceLogs: {
    create: async ({ data }) => {
      // Simulate the production unique index on (instanceID, nodeID, eventType, nodeAttempt)
      // Only enforced when nodeID is not null (matches the partial WHERE clause in migration.sql)
      if (data.nodeID != null && data.nodeAttempt != null) {
        const uniqueKey = `${data.instanceID}::${data.nodeID}::${data.eventType}::${data.nodeAttempt}`;
        if (state.logUniqueKeys.has(uniqueKey)) {
          const err = new Error(
            `Unique constraint violation on (instanceID, nodeID, eventType, nodeAttempt): ${uniqueKey}`
          );
          err.code = 'P2002';
          throw err;
        }
        state.logUniqueKeys.add(uniqueKey);
      }

      const logID = _logSeq++;
      const row = {
        logID,
        instanceID: data.instanceID,
        nodeID: data.nodeID ?? null,
        eventType: data.eventType,
        nodeStatus: data.nodeStatus ?? null,
        outputVariable: data.outputVariable ?? null,
        payload: data.payload ?? {},
        errorMessage: data.errorMessage ?? null,
        nodeAttempt: data.nodeAttempt ?? null,  // ← added
        createdAt: new Date(),
      };

      if (!state.logs.has(data.instanceID)) state.logs.set(data.instanceID, []);
      state.logs.get(data.instanceID).push(row);
      return row;
    },

    createMany: async ({ data }) => {
      for (const item of data) {
        await prisma.tblWorkflowInstanceLogs.create({ data: item });
      }
      return { count: data.length };
    },

    findMany: async ({ where = {}, orderBy, select } = {}) => {
      // Get the base set — scoped to instanceID when provided for performance
      const allLogs = (where.instanceID && typeof where.instanceID === 'string')
        ? (state.logs.get(where.instanceID) ?? [])
        : [...state.logs.values()].flat();

      // Build a where clause that excludes instanceID (already used for scoping)
      // so matchesWhere doesn't re-check it against the string value
      const { instanceID: _ignored, ...restWhere } = where;

      let results = allLogs.filter(row => matchesWhere(row, restWhere));

      if (orderBy?.logID === 'asc') results = [...results].sort((a, b) => a.logID - b.logID);
      if (orderBy?.logID === 'desc') results = [...results].sort((a, b) => b.logID - a.logID);

      if (select) {
        return results.map(row =>
          Object.fromEntries(Object.keys(select).map(k => [k, row[k]]))
        );
      }

      return results;
    },

    deleteMany: async ({ where }) => {
      if (where.instanceID) {
        // Also clean up unique keys for this instance
        for (const key of state.logUniqueKeys) {
          if (key.startsWith(`${where.instanceID}::`)) {
            state.logUniqueKeys.delete(key);
          }
        }
        const deleted = (state.logs.get(where.instanceID) ?? []).length;
        state.logs.delete(where.instanceID);
        return { count: deleted };
      }
      return { count: 0 };
    },
  },

  // ── tblWorkflowNodes ──────────────────────────────────────────────────────
  tblWorkflowNodes: {
    findFirst: async ({ where }) => {
      const nodes = state.nodes.get(where.workflowID) ?? [];
      return nodes.find(n => {
        if (where.nodeType && n.nodeType !== where.nodeType) return false;
        return true;
      }) ?? null;
    },

    findMany: async ({ where }) => {
      let nodes = where.workflowID
        ? (state.nodes.get(where.workflowID) ?? [])
        : [...state.nodes.values()].flat();

      if (where.nodeID?.in) return nodes.filter(n => where.nodeID.in.includes(n.nodeID));
      return nodes;
    },
  },

  // ── tblWorkflowEdge ───────────────────────────────────────────────────────
  tblWorkflowEdge: {
    findMany: async ({ where }) => {
      let edges = where.workflowID
        ? (state.edges.get(where.workflowID) ?? [])
        : [...state.edges.values()].flat();

      return edges.filter(e => {
        if (where.upstreamNodeID && e.upstreamNodeID !== where.upstreamNodeID) return false;
        if (where.downstreamNodeID?.in && !where.downstreamNodeID.in.includes(e.downstreamNodeID)) return false;
        return true;
      });
    },
  },

  // ── $transaction ──────────────────────────────────────────────────────────
  $transaction: async (operations) => {
    return Promise.all(operations);
  },
};

module.exports = {
  prisma,
  store: {
    seedWorkflow,
    reset,
    getInstance,
    getLogs,
    getCompletedNodes,
    getNodeExecutionCount,
    state,
  },
};