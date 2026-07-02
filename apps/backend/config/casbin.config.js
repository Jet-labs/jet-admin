/**
 * Casbin Enforcer Service
 *
 * Manages the Casbin enforcer lifecycle using Prisma.
 * Uses a custom Prisma adapter to query the casbin_rule table
 * via the shared Prisma client.
 */
const { newEnforcer, Helper } = require("casbin");
const path = require("path");
const Logger = require("../utils/logger");
const { prisma } = require("./prisma.config");

// ── Custom Prisma Adapter for Casbin ─────────────────────────────────────────

class PrismaCasbinAdapter {
  constructor(prismaInstance) {
    this.prisma = prismaInstance;
    this.tableName = "casbin_rule";
  }

  async init() {
    // Ensure table exists on startup
    await this.prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "${this.tableName}" (
        id SERIAL PRIMARY KEY,
        ptype VARCHAR(255) NOT NULL,
        v0 VARCHAR(255),
        v1 VARCHAR(255),
        v2 VARCHAR(255),
        v3 VARCHAR(255),
        v4 VARCHAR(255),
        v5 VARCHAR(255)
      );
    `);
  }

  async loadPolicy(model) {
    const rules = await this.prisma.$queryRawUnsafe(
      `SELECT ptype, v0, v1, v2, v3, v4, v5 FROM "${this.tableName}"`
    );

    for (const rule of rules) {
      const parts = [rule.ptype, rule.v0, rule.v1, rule.v2, rule.v3, rule.v4, rule.v5];
      const line = parts.filter(val => val !== null && val !== undefined && val !== "").join(", ");
      Helper.loadPolicyLine(line, model);
    }
  }

  async savePolicy(model) {
    const lines = [];
    
    const astMap = model.model.get("p");
    if (astMap) {
      for (const [ptype, ast] of astMap) {
        for (const rule of ast.policy) {
          lines.push(this.savePolicyLine(ptype, rule));
        }
      }
    }

    const gAstMap = model.model.get("g");
    if (gAstMap) {
      for (const [ptype, ast] of gAstMap) {
        for (const rule of ast.policy) {
          lines.push(this.savePolicyLine(ptype, rule));
        }
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`DELETE FROM "${this.tableName}"`);
      if (lines.length === 0) return;

      const valueStrings = [];
      const params = [];
      let paramIndex = 1;

      for (const line of lines) {
        valueStrings.push(
          `($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4}, $${paramIndex + 5}, $${paramIndex + 6})`
        );
        params.push(
          line.ptype,
          line.v0 || null,
          line.v1 || null,
          line.v2 || null,
          line.v3 || null,
          line.v4 || null,
          line.v5 || null
        );
        paramIndex += 7;
      }

      const query = `INSERT INTO "${this.tableName}" (ptype, v0, v1, v2, v3, v4, v5) VALUES ${valueStrings.join(", ")}`;
      await tx.$executeRawUnsafe(query, ...params);
    }, {
      timeout: 30000,
    });

    return true;
  }

  savePolicyLine(ptype, rule) {
    return {
      ptype,
      v0: rule[0] || "",
      v1: rule[1] || "",
      v2: rule[2] || "",
      v3: rule[3] || "",
      v4: rule[4] || "",
      v5: rule[5] || "",
    };
  }

  async addPolicy(sec, ptype, rule) {
    const line = {
      ptype,
      v0: rule[0] || null,
      v1: rule[1] || null,
      v2: rule[2] || null,
      v3: rule[3] || null,
      v4: rule[4] || null,
      v5: rule[5] || null,
    };
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO "${this.tableName}" (ptype, v0, v1, v2, v3, v4, v5) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      line.ptype,
      line.v0,
      line.v1,
      line.v2,
      line.v3,
      line.v4,
      line.v5
    );
  }

  async removePolicy(sec, ptype, rule) {
    const line = { ptype };
    for (let i = 0; i < rule.length; i++) {
      if (rule[i] !== undefined && rule[i] !== null) {
        line[`v${i}`] = rule[i];
      }
    }

    let query = `DELETE FROM "${this.tableName}" WHERE ptype = $1`;
    const params = [ptype];
    
    Object.keys(line).forEach((key) => {
      if (key !== "ptype") {
        query += ` AND ${key} = $${params.length + 1}`;
        params.push(line[key]);
      }
    });

    await this.prisma.$executeRawUnsafe(query, ...params);
  }

  async removeFilteredPolicy(sec, ptype, fieldIndex, ...fieldValues) {
    const line = { ptype };
    const idx = fieldIndex + fieldValues.length;
    
    if (fieldIndex <= 0 && 0 < idx && fieldValues[0 - fieldIndex] !== undefined) {
      line.v0 = fieldValues[0 - fieldIndex];
    }
    if (fieldIndex <= 1 && 1 < idx && fieldValues[1 - fieldIndex] !== undefined) {
      line.v1 = fieldValues[1 - fieldIndex];
    }
    if (fieldIndex <= 2 && 2 < idx && fieldValues[2 - fieldIndex] !== undefined) {
      line.v2 = fieldValues[2 - fieldIndex];
    }
    if (fieldIndex <= 3 && 3 < idx && fieldValues[3 - fieldIndex] !== undefined) {
      line.v3 = fieldValues[3 - fieldIndex];
    }
    if (fieldIndex <= 4 && 4 < idx && fieldValues[4 - fieldIndex] !== undefined) {
      line.v4 = fieldValues[4 - fieldIndex];
    }
    if (fieldIndex <= 5 && 5 < idx && fieldValues[5 - fieldIndex] !== undefined) {
      line.v5 = fieldValues[5 - fieldIndex];
    }

    let query = `DELETE FROM "${this.tableName}" WHERE ptype = $1`;
    const params = [ptype];
    
    Object.keys(line).forEach((key) => {
      if (key !== "ptype") {
        query += ` AND ${key} = $${params.length + 1}`;
        params.push(line[key]);
      }
    });

    await this.prisma.$executeRawUnsafe(query, ...params);
  }
}

// ── Singleton ────────────────────────────────────────────────────────────────

let _enforcer = null;
let _enforcerPromise = null;

/**
 * Returns the singleton Casbin enforcer.
 *
 * @returns {Promise<import("casbin").Enforcer>}
 */
async function getEnforcer() {
  if (_enforcer) return _enforcer;
  if (_enforcerPromise) return _enforcerPromise;

  _enforcerPromise = (async () => {
    Logger.log("info", {
      message: "casbin:getEnforcer:initializing",
    });

    try {
      // Create and initialize the custom Prisma adapter
      const adapter = new PrismaCasbinAdapter(prisma);
      await adapter.init();

      // Load Model
      const modelPath = path.join(__dirname, "casbin_model.conf");

      // Initialize Enforcer
      _enforcer = await newEnforcer(modelPath, adapter);
      await _enforcer.loadPolicy();

      Logger.log("success", {
        message: "casbin:getEnforcer:ready",
      });

      return _enforcer;
    } catch (error) {
      Logger.log("error", {
        message: "casbin:getEnforcer:failed",
        params: { error: error.message },
      });
      _enforcerPromise = null;
      _enforcer = null;
      throw error;
    }
  })();

  return _enforcerPromise;
}

// ── Policy helpers ───────────────────────────────────────────────────────────

/**
 * Reload all policies from the database.
 * Call this after role/permission changes.
 */
async function reloadPolicies() {
  const enforcer = await getEnforcer();
  await enforcer.loadPolicy();
  Logger.log("info", { message: "casbin:reloadPolicies:done" });
}

/**
 * Check whether a subject (user/apiKey) is allowed to perform
 * an action on a resource within a tenant.
 *
 * @param {string} sub     - User ID or API Key ID
 * @param {string} dom     - Tenant ID
 * @param {string} obj     - Resource selector, e.g. "dataquery:uuid-123"
 * @param {string} act     - Action, e.g. "read", "run", "update"
 * @returns {Promise<boolean>}
 */
async function enforce(sub, dom, obj, act) {
  const enforcer = await getEnforcer();
  return enforcer.enforce(sub, dom, obj, act);
}

// ── Role management helpers ──────────────────────────────────────────────────

/**
 * Assign a role to a subject within a domain (tenant).
 * e.g. addRoleForUser("usr_123", "role_viewer", "tenant_abc")
 */
async function addRoleForUser(sub, role, dom) {
  const enforcer = await getEnforcer();
  await enforcer.addRoleForUser(sub, role, dom);
}

/**
 * Remove a role from a subject within a domain.
 */
async function removeRoleForUser(sub, role, dom) {
  const enforcer = await getEnforcer();
  await enforcer.deleteRoleForUser(sub, role, dom);
}

/**
 * Get all roles for a subject within a domain.
 */
async function getRolesForUser(sub, dom) {
  const enforcer = await getEnforcer();
  return enforcer.getRolesForUserInDomain(sub, dom);
}

// ── Policy CRUD helpers ──────────────────────────────────────────────────────

/**
 * Add a named policy rule.
 * e.g. addPolicy("role_viewer", "tenant_1", "dataquery:q_001", "run", "allow")
 */
async function addPolicy(sub, dom, obj, act, eft = "allow") {
  const enforcer = await getEnforcer();
  return enforcer.addPolicy(sub, dom, obj, act, eft);
}

/**
 * Helper to grant the creator of a resource wildcard (*) access to that resource.
 */
async function grantCreatorAccess(tenantID, resourceType, resourceID, authContext, directUserID = null) {
  if (!tenantID || !resourceType || !resourceID) return;

  let creatorID = directUserID;
  let createdByApiKeyID = null;

  if (authContext) {
    const { getCreationContextFromAuthContext } = require("../utils/auth.context.utils");
    const context = getCreationContextFromAuthContext(authContext);
    creatorID = context.creatorID || creatorID;
    createdByApiKeyID = context.createdByApiKeyID;
  }

  const obj = `${resourceType}:${resourceID}`;

  if (creatorID) {
    await addPolicy(creatorID, tenantID, obj, "*", "allow");
  }
  if (createdByApiKeyID) {
    await addPolicy(createdByApiKeyID, tenantID, obj, "*", "allow");
  }
}

/**
 * Remove a named policy rule.
 */
async function removePolicyRule(sub, dom, obj, act, eft = "allow") {
  const enforcer = await getEnforcer();
  return enforcer.removePolicy(sub, dom, obj, act, eft);
}

/**
 * Remove all policies for a specific role within a domain.
 * Useful when a role is deleted.
 */
async function removePoliciesForRole(role, dom) {
  const enforcer = await getEnforcer();
  return enforcer.removeFilteredPolicy(0, role, dom);
}

/**
 * Remove all policies referencing a specific resource within a domain.
 * Useful when a query/workflow/page is deleted.
 */
async function removePoliciesForResource(dom, obj) {
  const enforcer = await getEnforcer();
  return enforcer.removeFilteredPolicy(1, dom, obj);
}

/**
 * Get all policies for a domain (tenant).
 */
async function getPoliciesForDomain(dom) {
  const enforcer = await getEnforcer();
  return enforcer.getFilteredPolicy(1, dom);
}

// ── Cleanup ──────────────────────────────────────────────────────────────────

async function shutdown() {
  _enforcer = null;
  _enforcerPromise = null;
  Logger.log("info", { message: "casbin:shutdown:done" });
}

module.exports = {
  getEnforcer,
  reloadPolicies,
  enforce,
  addRoleForUser,
  removeRoleForUser,
  getRolesForUser,
  addPolicy,
  removePolicy: removePolicyRule,
  removePoliciesForRole,
  removePoliciesForResource,
  getPoliciesForDomain,
  grantCreatorAccess,
  shutdown,
};
