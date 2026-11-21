import Client from "ldapjs-client";
import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

function buildClient(options) {
  const timeoutMs = Math.max(1, Number(options.timeout) || 15) * 1000;
  const tlsOptions = {};
  if (String(options.url || "").startsWith("ldaps://")) {
    tlsOptions.rejectUnauthorized = options.rejectUnauthorized !== false;
  }

  return new Client({
    url: options.url,
    timeout: timeoutMs,
    tlsOptions,
  });
}

function assertBalancedFilter(filter) {
  if (typeof filter !== "string" || filter.length === 0) throw new Error("filter is required.");
  if (filter.includes("\0")) throw new Error("filter must not contain NUL bytes.");
  let depth = 0;
  for (const ch of filter) {
    if (ch === "(") depth += 1;
    else if (ch === ")") depth -= 1;
    if (depth < 0) break;
  }
  if (depth !== 0) throw new Error("filter has unbalanced parentheses.");
}

async function withClient(options, fn) {
  const client = buildClient(options);
  try {
    if (options.bindDN) {
      await client.bind(options.bindDN, options.password || "");
    }
    return await fn(client);
  } finally {
    try {
      await client.unbind().catch(() => client.destroy());
    } catch {
      try {
        client.destroy();
      } catch {}
    }
  }
}

function normalizeEntries(entries) {
  // ldapjs-client resolves searches with the parsed entry objects.
  // Prefer the LDAP field contents over transport metadata and strip the
  // verbose SearchEntry wrapper into a plain row shape.
  return (entries || []).map((entry) => {
    if (!entry || typeof entry !== "object") return entry;
    if (entry.objectName || entry.attributes) {
      const row = {};
      if (entry.objectName) row.dn = entry.objectName;
      const attrs = entry.attributes && typeof entry.attributes === "object" ? entry.attributes : {};
      for (const [key, value] of Object.entries(attrs)) {
        row[key] = value;
      }
      if (Object.keys(row).length > 0) return row;
    }
    return entry;
  });
}

export default class LDAPDataSource extends DataSource {
  async execute(dataQueryOptions) {
    const options = this.config.datasourceOptions || {};
    const operation = String(dataQueryOptions?.operation || "search");

    Logger.log("info", {
      message: "ldap:LDAPDataSource:execute:params",
      params: { operation, base: dataQueryOptions?.base || options.searchBase, scope: dataQueryOptions?.scope },
    });

    if (!options.url) {
      throw new Error("LDAP url is required.");
    }

    try {
      if (operation === "bind") {
        if (!options.bindDN) throw new Error("bindDN is required for an LDAP bind.");
        await withClient(options, async () => {});
        return { success: true, bound: options.bindDN };
      }

      if (operation === "search") {
        const base = String(dataQueryOptions?.base || options.searchBase || "").trim();
        const filter = String(dataQueryOptions?.filter || "").trim();
        if (!base) throw new Error("base or searchBase is required for an LDAP search.");
        assertBalancedFilter(filter);

        const entries = await withClient(options, (client) =>
          client.search(base, {
            filter,
            scope: dataQueryOptions.scope || "sub",
            attributes:
              Array.isArray(dataQueryOptions.attributes) && dataQueryOptions.attributes.length > 0
                ? dataQueryOptions.attributes
                : undefined,
            sizeLimit: Number(dataQueryOptions.sizeLimit) > 0 ? Number(dataQueryOptions.sizeLimit) : 100,
          })
        );

        return normalizeEntries(entries);
      }

      throw new Error(`Unsupported LDAP operation: ${operation}`);
    } catch (error) {
      Logger.log("error", {
        message: "ldap:LDAPDataSource:execute:catch",
        params: { error: error.message || String(error) },
      });
      throw new Error(`LDAP query failed: ${error.message || String(error)}`);
    }
  }
}

export { buildClient, withClient, normalizeEntries, assertBalancedFilter };
