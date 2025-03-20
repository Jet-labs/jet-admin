const { LRUCache } = require("lru-cache");
const { Pool } = require("pg");
const { prisma } = require("./prisma.config");
const Logger = require("../utils/logger");

class TenantAwarePostgreSQLPoolManager {
  /**
   * @param {object} options
   * @param {number} options.maxPools - Maximum number of pools to cache.
   * @param {object} options.poolConfig - Default pool configuration.
   * @param {object} options.prisma - Prisma client instance for fetching tenant data.
   */
  constructor({ maxPools = 10, poolConfig = {}, prisma }) {
    if (!prisma) {
      throw new Error("Prisma client instance is required.");
    }

    this.prisma = prisma;
    this.pools = new LRUCache({
      max: maxPools,
      dispose: (_, pool) => {try{pool.end();}catch(e){}}, // Close pool when evicted
    });

    this.poolConfig = poolConfig;
    this.tenantsToDBURLMap = {};
    this.isSeeded = false;
  }

  /**
   * Helper function to acquire and release a database client.
   * @param {object} dbPool - The PostgreSQL connection pool.
   * @param {function} operation - The operation to perform with the client.
   * @returns {Promise<any>} - The result of the operation.
   */
  static withDatabaseClient = async (dbPool, operation) => {
    const client = await dbPool.connect();
    try {
      return await operation(client);
    } finally {
      client.release();
    }
  };

  /**
   * Seeds tenant data into memory.
   */
  async seedTenantData() {
    if (this.isSeeded) {
      Logger.log("info", {
        message:
          "TenantAwarePostgreSQLPoolManager:seedTenantData:already-seeded",
      });
      return;
    }

    try {
      const tenants = await this.prisma.tblTenants.findMany();
      this.tenantsToDBURLMap = tenants.reduce((map, tenant) => {
        map[tenant.tenantID] = tenant.tenantDBURL;
        return map;
      }, {});

      this.isSeeded = true;

      Logger.log("success", {
        message: "TenantAwarePostgreSQLPoolManager:seedTenantData:success",
        params: { tenantsToDBURLMap: this.tenantsToDBURLMap },
      });
    } catch (error) {
      Logger.log("error", {
        message: "TenantAwarePostgreSQLPoolManager:seedTenantData:catch-1",
        params: { error },
      });
      throw error;
    }
  }

  /**
   * Fetches the database URL for a given tenant ID.
   * @param {string} tenantId - The tenant ID.
   * @returns {string|null} - The database URL or null if not found.
   */
  getTenantDBURL(tenantId) {
    if (!this.isSeeded) {
      Logger.log("error", {
        message:
          "TenantAwarePostgreSQLPoolManager:getTenantDBURL:tenant-data-not-seeded",
        params: { tenantId },
      });
      throw new Error("Tenant data has not been seeded yet.");
    }

    const dbURL = this.tenantsToDBURLMap[tenantId];
    if (!dbURL) {
      Logger.log("error", {
        message:
          "TenantAwarePostgreSQLPoolManager:getTenantDBURL:no-database-url",
        params: { tenantId },
      });
      throw new Error(`No database URL found for tenant: ${tenantId}`);
    }

    return dbURL;
  }

  /**
   * Sets or updates the database URL for a tenant.
   * @param {string} tenantId - The tenant ID.
   * @param {string} dbURL - The new database URL.
   * @param {boolean} refreshPool - Whether to refresh the connection pool for the tenant.
   */
  async setTenantDBURL(tenantId, dbURL, refreshPool = true) {
    Logger.log("info", {
      message: "TenantAwarePostgreSQLPoolManager:setTenantDBURL:params",
      params: { tenantId, dbURL },
    });
    try {
      if (!tenantId || !dbURL) {
        Logger.log("error", {
          message: "TenantAwarePostgreSQLPoolManager:setTenantDBURL:catch-2",
          params: { tenantId, dbURL },
        });
        throw new Error("Tenant ID and database URL are required.");
      }

      // Update the tenant-to-database URL mapping
      this.tenantsToDBURLMap[tenantId] = dbURL;

      const newPool = new Pool({
        connectionString: dbURL,
        ...this.poolConfig,
      });

      // Add the new pool to the cache
      this.pools.set(tenantId, newPool);
      Logger.log("success", {
        message:
          "TenantAwarePostgreSQLPoolManager:setTenantDBURL:pool-refreshed",
        params: { tenantId, dbURL },
      });
    } catch (error) {
      Logger.log("error", {
        message: "TenantAwarePostgreSQLPoolManager:setTenantDBURL:catch-1",
        params: { tenantId, dbURL, error },
      });
    }
  }

  /**
   * Retrieves or creates a connection pool for the given tenant.
   * @param {string} tenantId - The tenant ID.
   * @returns {Promise<Pool>} - The connection pool for the tenant.
   */
  async getPool(tenantId) {
    if (!this.isSeeded) {
      await this.seedTenantData(); // Seed tenant data if not already seeded
    }

    if (this.pools.has(tenantId)) {
      Logger.log("info", {
        message: "TenantAwarePostgreSQLPoolManager:getPool:pool-already-exists",
        params: { tenantId },
      });
      return this.pools.get(tenantId);
    }

    const dbURL = this.getTenantDBURL(tenantId);

    const pool = new Pool({
      connectionString: dbURL,
      ...this.poolConfig,
    });

    this.pools.set(tenantId, pool);

    Logger.log("success", {
      message: "TenantAwarePostgreSQLPoolManager:getPool:pool-created",
      params: { tenantId },
    });

    return pool;
  }

  /**
   * Refreshes tenant data by re-fetching it from the database.
   */
  async refreshTenantData() {
    this.isSeeded = false; // Reset seeding flag
    await this.seedTenantData();

    Logger.log("success", {
      message: "TenantAwarePostgreSQLPoolManager:refreshTenantData:success",
    });
  }

  /**
   * Closes all connection pools gracefully.
   */
  async closeAllPools() {
    try {
      await Promise.all(this.pools.map((pool) => pool.end()));
      this.pools.dispose();

      Logger.log("success", {
        message: "TenantAwarePostgreSQLPoolManager:closeAllPools:success",
      });
    } catch (error) {
      Logger.log("error", {
        message: "TenantAwarePostgreSQLPoolManager:closeAllPools:catch-1",
        params: { error },
      });
      throw error;
    }
  }
}

// Singleton instance
const tenantAwarePostgreSQLPoolManager = new TenantAwarePostgreSQLPoolManager({
  maxPools: 10,
  poolConfig: { max: 5, idleTimeoutMillis: 30000 },
  prisma: prisma, // Replace with your Prisma instance
});

module.exports = {
  tenantAwarePostgreSQLPoolManager,
  TenantAwarePostgreSQLPoolManager,
};
