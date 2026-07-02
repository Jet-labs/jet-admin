import { MongoClient, ObjectId } from "mongodb";
import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

export default class MongoDBDataSource extends DataSource {
  async execute(dataQueryOptions, context) {
    Logger.log("info", {
      message: "mongodb:MongoDBDataSource:execute:params",
      params: { dataQueryOptions, datasourceID: this.config.datasourceID },
    });

    const datasourceOptions = this.config.datasourceOptions || {};
    const { operation, collection, filter, projection, sort, limit, skip, document, pipeline, options } = dataQueryOptions;

    let connectionString;
    let dbName;

    if (datasourceOptions.connectionString) {
      connectionString = datasourceOptions.connectionString;
      // Extract database name from connection string
      const urlMatch = connectionString.match(/\/([^/?]+)(\?|$)/);
      dbName = urlMatch ? urlMatch[1] : "test";
    } else {
      const details = datasourceOptions.connectionDetails || datasourceOptions;
      const { host, port, database, username, password, authSource, ssl, replicaSet } = details;
      
      dbName = database || datasourceOptions.database;
      
      let authPart = "";
      if (username && password) {
        authPart = `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`;
      }
      
      const params = new URLSearchParams();
      if (authSource) params.append("authSource", authSource);
      if (ssl) params.append("ssl", "true");
      if (replicaSet) params.append("replicaSet", replicaSet);
      
      const queryString = params.toString() ? `?${params.toString()}` : "";
      connectionString = `mongodb://${authPart}${host || "localhost"}:${port || 27017}/${dbName}${queryString}`;
    }

    let client;
    try {
      client = new MongoClient(connectionString);
      await client.connect();
      
      Logger.log("info", {
        message: "mongodb:MongoDBDataSource:execute:connected",
        params: { database: dbName },
      });

      const db = client.db(dbName);
      const col = db.collection(collection);
      
      let result;
      
      switch (operation) {
        case "find":
          result = await this.find(col, filter, projection, sort, limit, skip);
          break;
        case "findOne":
          result = await this.findOne(col, filter, projection);
          break;
        case "insertOne":
          result = await this.insertOne(col, document);
          break;
        case "insertMany":
          result = await this.insertMany(col, document);
          break;
        case "updateOne":
          result = await this.updateOne(col, filter, document, options);
          break;
        case "updateMany":
          result = await this.updateMany(col, filter, document, options);
          break;
        case "deleteOne":
          result = await this.deleteOne(col, filter);
          break;
        case "deleteMany":
          result = await this.deleteMany(col, filter);
          break;
        case "aggregate":
          result = await this.aggregate(col, pipeline);
          break;
        case "count":
          result = await this.count(col, filter);
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      Logger.log("info", {
        message: "mongodb:MongoDBDataSource:execute:success",
        params: { operation, collection },
      });

      return result;
    } catch (error) {
      Logger.log("error", {
        message: "mongodb:MongoDBDataSource:execute:catch",
        params: { error: error.message },
      });
      throw new Error(`MongoDB ${operation} failed: ${error.message}`);
    } finally {
      if (client) {
        await client.close();
      }
    }
  }

  parseJSON(str) {
    if (!str || str.trim() === "") return {};
    try {
      return JSON.parse(str);
    } catch {
      return {};
    }
  }

  async find(col, filter, projection, sort, limit, skip) {
    let cursor = col.find(this.parseJSON(filter));
    
    if (projection) {
      cursor = cursor.project(this.parseJSON(projection));
    }
    if (sort) {
      cursor = cursor.sort(this.parseJSON(sort));
    }
    if (skip) {
      cursor = cursor.skip(skip);
    }
    if (limit) {
      cursor = cursor.limit(limit);
    }
    
    return await cursor.toArray();
  }

  async findOne(col, filter, projection) {
    const options = projection ? { projection: this.parseJSON(projection) } : {};
    return await col.findOne(this.parseJSON(filter), options);
  }

  async insertOne(col, document) {
    const doc = this.parseJSON(document);
    const result = await col.insertOne(doc);
    return { insertedId: result.insertedId, ...doc };
  }

  async insertMany(col, document) {
    const docs = this.parseJSON(document);
    const docsArray = Array.isArray(docs) ? docs : [docs];
    const result = await col.insertMany(docsArray);
    return { insertedCount: result.insertedCount, insertedIds: result.insertedIds };
  }

  async updateOne(col, filter, update, options = {}) {
    const result = await col.updateOne(
      this.parseJSON(filter),
      this.parseJSON(update),
      { upsert: options.upsert || false }
    );
    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedId: result.upsertedId,
    };
  }

  async updateMany(col, filter, update, options = {}) {
    const result = await col.updateMany(
      this.parseJSON(filter),
      this.parseJSON(update),
      { upsert: options.upsert || false }
    );
    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    };
  }

  async deleteOne(col, filter) {
    const result = await col.deleteOne(this.parseJSON(filter));
    return { deletedCount: result.deletedCount };
  }

  async deleteMany(col, filter) {
    const result = await col.deleteMany(this.parseJSON(filter));
    return { deletedCount: result.deletedCount };
  }

  async aggregate(col, pipeline) {
    const stages = this.parseJSON(pipeline);
    const stagesArray = Array.isArray(stages) ? stages : [];
    return await col.aggregate(stagesArray).toArray();
  }

  async count(col, filter) {
    const count = await col.countDocuments(this.parseJSON(filter));
    return { count };
  }

  async subscribe(config, onEvent) {
    const datasourceOptions = this.config.datasourceOptions || {};
    let connectionString;
    let dbName;

    if (datasourceOptions.connectionString) {
      connectionString = datasourceOptions.connectionString;
      const urlMatch = connectionString.match(/\/([^/?]+)(\?|$)/);
      dbName = urlMatch ? urlMatch[1] : "test";
    } else {
      const details = datasourceOptions.connectionDetails || datasourceOptions;
      const { host, port, database, username, password, authSource, ssl, replicaSet } = details;
      
      dbName = database || datasourceOptions.database;
      
      let authPart = "";
      if (username && password) {
        authPart = `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`;
      }
      
      const params = new URLSearchParams();
      if (authSource) params.append("authSource", authSource);
      if (ssl) params.append("ssl", "true");
      if (replicaSet) params.append("replicaSet", replicaSet);
      
      const queryString = params.toString() ? `?${params.toString()}` : "";
      connectionString = `mongodb://${authPart}${host || "localhost"}:${port || 27017}/${dbName}${queryString}`;
    }

    const collectionName = config.collection;
    const operationTypes = config.operationTypes || [];

    Logger.log("info", {
      message: "mongodb:subscribe:start",
      params: { collectionName, operationTypes, datasourceID: this.config.datasourceID },
    });

    const client = new MongoClient(connectionString);
    await client.connect();

    const db = client.db(dbName);
    const target = collectionName ? db.collection(collectionName) : db;
    
    let pipeline = [];
    if (operationTypes.length > 0) {
      pipeline.push({ $match: { operationType: { $in: operationTypes } } });
    }

    const changeStream = target.watch(pipeline);
    
    changeStream.on("change", (next) => {
      onEvent({
        operationType: next.operationType,
        collection: next.ns?.coll,
        documentKey: next.documentKey,
        fullDocument: next.fullDocument,
        updateDescription: next.updateDescription,
        payload: next
      });
    });

    changeStream.on("error", (error) => {
      Logger.log("error", {
        message: "mongodb:subscribe:changeStreamError",
        params: { error: error.message }
      });
    });

    return { client, changeStream };
  }

  async unsubscribe(handle) {
    if (!handle) return;
    
    Logger.log("info", {
      message: "mongodb:unsubscribe",
      params: { datasourceID: this.config.datasourceID },
    });

    try {
      if (handle.changeStream) {
        await handle.changeStream.close();
      }
      if (handle.client) {
        await handle.client.close();
      }
    } catch (e) {
      Logger.log("error", {
        message: "mongodb:unsubscribe:error",
        params: { error: e.message },
      });
    }
  }

  async getSchema(params, context) {
    const datasourceOptions = this.config.datasourceOptions || {};
    let connectionString;
    let dbName;

    if (datasourceOptions.connectionString) {
      connectionString = datasourceOptions.connectionString;
      const urlMatch = connectionString.match(/\/([^/?]+)(\?|$)/);
      dbName = urlMatch ? urlMatch[1] : "test";
    } else {
      const details = datasourceOptions.connectionDetails || datasourceOptions;
      const { host, port, database, username, password, authSource, ssl, replicaSet } = details;
      
      dbName = database || datasourceOptions.database;
      let authPart = "";
      if (username && password) {
        authPart = `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`;
      }
      const params = new URLSearchParams();
      if (authSource) params.append("authSource", authSource);
      if (ssl) params.append("ssl", "true");
      if (replicaSet) params.append("replicaSet", replicaSet);
      const queryString = params.toString() ? `?${params.toString()}` : "";
      connectionString = `mongodb://${authPart}${host || "localhost"}:${port || 27017}/${dbName}${queryString}`;
    }

    let client;
    try {
      client = new MongoClient(connectionString);
      await client.connect();
      const db = client.db(dbName);
      const collections = await db.listCollections().toArray();
      
      const tables = [];
      for (const colInfo of collections) {
        if (colInfo.name.startsWith("system.")) continue;
        const col = db.collection(colInfo.name);
        const sampleDoc = await col.findOne({});
        const columns = [];
        if (sampleDoc) {
          for (const key of Object.keys(sampleDoc)) {
            const val = sampleDoc[key];
            let type = typeof val;
            if (val instanceof ObjectId) type = "ObjectId";
            else if (val instanceof Date) type = "Date";
            else if (Array.isArray(val)) type = "Array";
            
            columns.push({
              columnName: key,
              dataType: type,
              isNullable: true,
              isPrimaryKey: key === "_id",
            });
          }
        }
        tables.push({
          tableName: colInfo.name,
          columns: columns,
        });
      }
      return { tables };
    } catch (error) {
      Logger.log("error", {
        message: "mongodb:MongoDBDataSource:getSchema:catch",
        params: error.message || error,
      });
      throw error;
    } finally {
      if (client) {
        await client.close();
      }
    }
  }

  async getSampleData(params, context) {
    const { table, limit = 5 } = params;
    if (!table || typeof table !== 'string') {
      throw new Error("Invalid collection name");
    }
    const datasourceOptions = this.config.datasourceOptions || {};
    let connectionString;
    let dbName;

    if (datasourceOptions.connectionString) {
      connectionString = datasourceOptions.connectionString;
      const urlMatch = connectionString.match(/\/([^/?]+)(\?|$)/);
      dbName = urlMatch ? urlMatch[1] : "test";
    } else {
      const details = datasourceOptions.connectionDetails || datasourceOptions;
      const { host, port, database, username, password, authSource, ssl, replicaSet } = details;
      
      dbName = database || datasourceOptions.database;
      let authPart = "";
      if (username && password) {
        authPart = `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`;
      }
      const params = new URLSearchParams();
      if (authSource) params.append("authSource", authSource);
      if (ssl) params.append("ssl", "true");
      if (replicaSet) params.append("replicaSet", replicaSet);
      const queryString = params.toString() ? `?${params.toString()}` : "";
      connectionString = `mongodb://${authPart}${host || "localhost"}:${port || 27017}/${dbName}${queryString}`;
    }

    let client;
    try {
      client = new MongoClient(connectionString);
      await client.connect();
      const db = client.db(dbName);
      const col = db.collection(table);
      const rows = await col.find({}).limit(parseInt(limit, 10)).toArray();
      return rows;
    } catch (error) {
      Logger.log("error", {
        message: "mongodb:MongoDBDataSource:getSampleData:catch",
        params: error.message || error,
      });
      throw error;
    } finally {
      if (client) {
        await client.close();
      }
    }
  }
}
