var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.js
var index_exports = {};
__export(index_exports, {
  DATASOURCE_LOGIC_COMPONENTS: () => DATASOURCE_LOGIC_COMPONENTS,
  dataSourceRegistry: () => data_sources_default
});
module.exports = __toCommonJS(index_exports);
var import_datasource_types = require("@jet-admin/datasource-types");

// src/data-sources/postgresql/connection.js
var import_pg = require("pg");

// src/config/winston.config.js
var winston = require("winston");
var appLogLevels = {
  levels: {
    error: 2,
    warning: 3,
    success: 4,
    info: 5
  },
  colors: {
    error: "red",
    warning: "yellow",
    success: "green",
    info: "cyan"
  }
};
winston.addColors(appLogLevels.colors);
var logFormatLogFormat = winston.format((info) => {
  const { message } = info;
  if (info.data) {
    info.message = `${message} |====| ${JSON.stringify(info.data)}`;
    delete info.data;
  }
  return info;
})();
var winstonLogger = winston.createLogger({
  levels: appLogLevels.levels,
  format: winston.format.combine(
    winston.format.colorize({
      all: true
    }),
    winston.format.label({
      label: "package:datasources"
    }),
    winston.format.timestamp({
      format: "DD-MM-YYYY HH:mm:ss"
    }),
    logFormatLogFormat,
    winston.format.printf(
      (info) => `${info.level}: ${info.label}: ${[info.timestamp]}: ${info.message}`
    )
  ),
  transports: [
    new winston.transports.Console()
  ]
});

// src/utils/logger.js
var logLevels = Object.freeze({
  info: "info",
  error: "error",
  success: "success",
  warning: "warning"
});
var Logger = class {
  static pageLogger = (page, obj) => {
    obj ? console.log(`-----> : ${page} |=====|`, obj) : console.log(`-----> : ${page}`);
  };
  /**
   *
   * @param {('info'|'error'|'success'|'warning')} status
   * @param {*} param1
   */
  static log = (status = "info", { message, params }) => {
    try {
      const statusArray = String(status).split(":");
      statusArray.forEach((s) => {
        if (s === logLevels.error) {
          console.log(s, message, params);
        }
        switch (s.toLowerCase()) {
          case logLevels.info: {
            winstonLogger.info(message, { data: params });
            break;
          }
          case logLevels.success: {
            winstonLogger.success(message, { data: params });
            break;
          }
          case logLevels.warning: {
            winstonLogger.warning(message, { data: params });
            break;
          }
          case logLevels.error: {
            winstonLogger.error(message, { data: params });
            break;
          }
          default: {
            winstonLogger.error("log level error", {
              data: { s, message, ...params }
            });
            break;
          }
        }
      });
    } catch (error) {
    }
  };
};

// src/data-sources/postgresql/connection.js
var postgresqlTestConnection = async ({
  connectionString,
  connectionData
}) => {
  try {
    Logger.log("info", {
      message: "postgresql:postgresqlTestConnection:params",
      params: { connectionString, connectionData }
    });
    const client = connectionString ? new import_pg.Client(connectionString) : new import_pg.Client({
      host: connectionData.host,
      port: connectionData.port,
      database: connectionData.database,
      user: connectionData.user,
      password: connectionData.password
    });
    await client.connect();
    Logger.log("info", {
      message: "postgresql:postgresqlTestConnection:connected",
      params: { connectionString, connectionData }
    });
    await client.end();
    Logger.log("info", {
      message: "postgresql:postgresqlTestConnection:disconnected",
      params: { connectionString, connectionData }
    });
    return {
      ok: true,
      status: 200,
      statusText: "Connected"
    };
  } catch (error) {
    Logger.log("error", {
      message: "postgresql:postgresqlTestConnection:catch-1",
      params: { error }
    });
    return {
      ok: false,
      error: error.message || error
    };
  }
};

// src/data-sources/restapi/connection.js
var import_node_fetch = __toESM(require("node-fetch"));
var import_url = require("url");
var import_https = require("https");
var import_http = require("http");
var restAPITestConnection = async ({ datasourceOptions }) => {
  const {
    baseUrl,
    method = "GET",
    timeout,
    authType,
    username,
    password,
    bearerToken,
    oauth2,
    headers = [],
    queryParams = [],
    body,
    contentType,
    followRedirects,
    sslVerify
  } = datasourceOptions;
  try {
    Logger.log("info", {
      message: "restapi:restAPITestConnection:params",
      params: datasourceOptions
    });
    const urlObj = new import_url.URL(baseUrl.trim());
    queryParams.forEach(({ key, value }) => {
      if (key) urlObj.searchParams.append(key, value);
    });
    const hdrs = {};
    headers.forEach(({ key, value }) => {
      if (key) hdrs[key] = value;
    });
    if (contentType) hdrs["Content-Type"] = contentType;
    if (authType === "basic" && username && password) {
      hdrs["Authorization"] = "Basic " + Buffer.from(`${username}:${password}`).toString("base64");
    } else if (authType === "bearer" && bearerToken) {
      hdrs["Authorization"] = `Bearer ${bearerToken}`;
    } else if (authType === "oauth2" && oauth2?.tokenUrl) {
      const tokenUrl = new import_url.URL(oauth2.tokenUrl);
      const tokenAgent = tokenUrl.protocol === "https:" ? new import_https.Agent({ rejectUnauthorized: sslVerify }) : new import_http.Agent({ rejectUnauthorized: sslVerify });
      const tokenRes = await (0, import_node_fetch.default)(tokenUrl.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new import_url.URLSearchParams({
          grant_type: "client_credentials",
          client_id: oauth2.clientId,
          client_secret: oauth2.clientSecret
        }),
        redirect: followRedirects ? "follow" : "manual",
        agent: tokenAgent,
        timeout: timeout * 1e3
      });
      const tokenJson = await tokenRes.json();
      if (tokenJson.access_token) {
        hdrs["Authorization"] = `Bearer ${tokenJson.access_token}`;
      }
    }
    const mainAgent = urlObj.protocol === "https:" ? new import_https.Agent({ rejectUnauthorized: sslVerify }) : new import_http.Agent({ rejectUnauthorized: sslVerify });
    const opts = {
      method,
      headers: hdrs,
      redirect: followRedirects ? "follow" : "manual",
      agent: mainAgent,
      timeout: timeout * 1e3
    };
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase()) && body != null) {
      opts.body = body;
    }
    const res = await (0, import_node_fetch.default)(urlObj.toString(), opts);
    const contentTypeHeader = res.headers.get("content-type") || "";
    let parsedBody;
    if (contentTypeHeader.includes("application/json")) {
      parsedBody = await res.json();
    } else {
      parsedBody = await res.text();
    }
    Logger.log("info", {
      message: "restapi:restAPITestConnection:response",
      params: {
        status: res.status,
        statusText: res.statusText,
        body: parsedBody
      }
    });
    return {
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      body: parsedBody
    };
  } catch (err) {
    Logger.log("error", {
      message: "restapi:restAPITestConnection:catch",
      params: err.message || err
    });
    return {
      ok: false,
      error: err.message || err
    };
  }
};

// src/data-sources/postgresql/datasource.js
var import_pg2 = require("pg");

// src/data-sources/datasource.js
var DataSource = class {
  constructor(config) {
    this.datasourceID = config?.datasourceID;
    this.datasourceType = config?.datasourceType;
    this.config = config;
  }
  async execute(query, context) {
    throw new Error("execute() method must be implemented");
  }
  async subscribe(config, onEvent) {
    throw new Error("subscribe() not supported by this datasource type");
  }
  async unsubscribe(handle) {
    throw new Error("unsubscribe() not supported by this datasource type");
  }
};

// src/data-sources/postgresql/datasource.js
var PostgreSQLDataSource = class extends DataSource {
  async execute(dataQueryOptions2, context) {
    Logger.log("info", {
      message: "postgresql:PostgreSQLDataSource:execute:params",
      params: { dataQueryOptions: dataQueryOptions2, config: this.config }
    });
    const { query } = dataQueryOptions2;
    const client = new import_pg2.Client({
      connectionString: this.config.datasourceOptions?.connectionString,
      ...this.config.datasourceOptions?.connectionData
    });
    try {
      await client.connect();
      Logger.log("info", {
        message: "postgresql:PostgreSQLDataSource:execute:connected",
        params: { connectionString: this.config.connectionString }
      });
      const result = await client.query(query);
      return result.rows;
    } catch (error) {
      Logger.log("error", {
        message: "postgresql:PostgreSQLDataSource:execute:catch",
        params: error.message || error
      });
      throw error;
    } finally {
      await client.end();
    }
  }
  async subscribe(config, onEvent) {
    const channels = (config.channels || "").split(",").map((c) => c.trim()).filter(Boolean);
    if (!channels.length) {
      throw new Error("No channels specified for PostgreSQL listener");
    }
    Logger.log("info", {
      message: "postgresql:subscribe:start",
      params: { channels, datasourceID: this.config.datasourceID }
    });
    const client = new import_pg2.Client({
      connectionString: this.config.datasourceOptions?.connectionString,
      ...this.config.datasourceOptions?.connectionData
    });
    await client.connect();
    client.on("notification", (msg) => {
      let payload = msg.payload;
      if (payload) {
        try {
          payload = JSON.parse(msg.payload);
        } catch {
        }
      }
      onEvent({
        channel: msg.channel,
        payload
      });
    });
    for (const channel of channels) {
      const escapedChannel = channel.replace(/"/g, '""');
      await client.query(`LISTEN "${escapedChannel}"`);
    }
    return { client, channels };
  }
  async unsubscribe(handle) {
    if (!handle || !handle.client) return;
    Logger.log("info", {
      message: "postgresql:unsubscribe",
      params: { datasourceID: this.config.datasourceID }
    });
    try {
      for (const channel of handle.channels || []) {
        try {
          const escapedChannel = channel.replace(/"/g, '""');
          await handle.client.query(`UNLISTEN "${escapedChannel}"`);
        } catch (e) {
        }
      }
      await handle.client.end();
    } catch (e) {
      Logger.log("error", {
        message: "postgresql:unsubscribe:error",
        params: { error: e.message }
      });
    }
  }
};

// src/data-sources/restapi/datasource.js
var import_axios = __toESM(require("axios"));
var RestAPIDataSource = class extends DataSource {
  async execute(dataQueryOptions2, context) {
    const {
      method,
      apiEndpoint,
      headers: queryHeaders = [],
      body: queryBody,
      queryParams = [],
      contentType: queryContentType
    } = dataQueryOptions2;
    Logger.log("info", {
      message: "restapi:RestAPIDataSource:execute:rawOptions",
      params: {
        dataQueryOptions: dataQueryOptions2
      }
    });
    const datasourceOptions = this.config.datasourceOptions || {};
    const finalUrl = `${datasourceOptions.baseUrl}${apiEndpoint}`;
    const kvArrayToObject = (arr) => {
      if (!arr || !Array.isArray(arr)) return {};
      return arr.reduce((acc, { key, value }) => {
        if (key) acc[key] = value;
        return acc;
      }, {});
    };
    try {
      const finalHeaders = {
        ...kvArrayToObject(datasourceOptions.headers),
        ...kvArrayToObject(queryHeaders)
      };
      const finalContentType = queryContentType || datasourceOptions.contentType || "application/json";
      if (finalContentType) {
        finalHeaders["Content-Type"] = finalContentType;
      }
      const finalParams = {
        ...kvArrayToObject(datasourceOptions.queryParams),
        ...kvArrayToObject(queryParams)
      };
      Logger.log("info", {
        message: "restapi:RestAPIDataSource:execute:params",
        params: {
          method,
          apiEndpoint,
          finalUrl,
          headers: finalHeaders,
          body: queryBody,
          params: finalParams,
          config: this.config
        }
      });
      const { authType, username, password, bearerToken, oauth2 } = datasourceOptions;
      if (authType === "basic" && username && password) {
        finalHeaders["Authorization"] = "Basic " + Buffer.from(`${username}:${password}`).toString("base64");
      } else if (authType === "bearer" && bearerToken) {
        finalHeaders["Authorization"] = `Bearer ${bearerToken}`;
      }
      const requestConfig = {
        method: method || "GET",
        url: finalUrl,
        headers: finalHeaders,
        data: queryBody,
        params: finalParams,
        timeout: (datasourceOptions.timeout || 15) * 1e3
      };
      Logger.log("info", {
        message: `restapi:RestAPIDataSource:execute: Executing ${requestConfig.method} ${requestConfig.url}`,
        params: {
          requestDetails: {
            method: requestConfig.method,
            url: requestConfig.url,
            headers: requestConfig.headers,
            queryParams: requestConfig.params,
            body: requestConfig.data,
            timeout: requestConfig.timeout
          }
        }
      });
      const response = await (0, import_axios.default)(requestConfig);
      Logger.log("info", {
        message: "restapi:RestAPIDataSource:execute:response",
        params: {
          method,
          finalUrl,
          headers: finalHeaders,
          body: queryBody,
          params: finalParams,
          status: response.status,
          statusText: response.statusText
        }
      });
      return response.data;
    } catch (error) {
      Logger.log("error", {
        message: `restapi:RestAPIDataSource:execute:catch - Failed to execute ${method || "GET"} ${finalUrl}`,
        params: {
          error: error.message || error,
          responseStatus: error.response?.status,
          responseStatusText: error.response?.statusText,
          responseBody: error.response?.data,
          requestUrl: finalUrl
        }
      });
      throw new Error(
        `API request failed: ${error.response?.status || "No response"}`
      );
    }
  }
};

// src/data-sources/weburl/datasource.js
var import_node_fetch2 = __toESM(require("node-fetch"));
var WebURLDataSource = class extends DataSource {
  async execute(dataQueryOptions2, context) {
    Logger.log("info", {
      message: "weburl:WebURLDataSource:execute:params",
      params: { dataQueryOptions: dataQueryOptions2, config: this.config }
    });
    const { action, args } = dataQueryOptions2;
    const { url, timeout } = this.config.datasourceOptions;
    try {
      const opts = {
        method: action || "GET",
        headers: {},
        redirect: "follow",
        timeout
      };
      const res = await (0, import_node_fetch2.default)(url, opts);
      const contentTypeHeader = res.headers.get("content-type") || "";
      let parsedBody;
      if (contentTypeHeader.includes("application/json")) {
        parsedBody = await res.json();
      } else {
        parsedBody = await res.text();
      }
      Logger.log("info", {
        message: "weburl:WebURLDataSource:execute:response",
        params: {
          status: res.status,
          statusText: res.statusText,
          body: parsedBody
        }
      });
      return parsedBody;
    } catch (err) {
      Logger.log("error", {
        message: "weburl:WebURLDataSource:execute:catch",
        params: err.message || err
      });
      throw new Error(
        `Web URL request failed: ${err.message || "No response"}`
      );
    }
  }
};

// src/data-sources/firestore/datasource.js
var import_app = require("firebase-admin/app");
var import_firestore = require("firebase-admin/firestore");
var FirestoreDataSource = class extends DataSource {
  constructor(config) {
    super(config);
    this.app = null;
    this.db = null;
  }
  async getFirestoreDb() {
    if (this.db) return this.db;
    const { projectId, serviceAccountKey, databaseURL } = this.config.datasourceOptions;
    const appName = `firestore-${this.config.datasourceID || Date.now()}`;
    try {
      this.app = (0, import_app.getApp)(appName);
    } catch (e) {
      let credential;
      if (serviceAccountKey) {
        const serviceAccount = typeof serviceAccountKey === "string" ? JSON.parse(serviceAccountKey) : serviceAccountKey;
        credential = (0, import_app.cert)(serviceAccount);
      }
      const appConfig = {
        credential,
        projectId
      };
      if (databaseURL) {
        appConfig.databaseURL = databaseURL;
      }
      this.app = (0, import_app.initializeApp)(appConfig, appName);
    }
    this.db = (0, import_firestore.getFirestore)(this.app);
    return this.db;
  }
  async execute(dataQueryOptions2, context) {
    Logger.log("info", {
      message: "firestore:FirestoreDataSource:execute:params",
      params: { dataQueryOptions: dataQueryOptions2, datasourceID: this.config.datasourceID }
    });
    const { operation, collectionPath, documentId, data, where, orderBy, limit } = dataQueryOptions2;
    try {
      const db = await this.getFirestoreDb();
      let result;
      switch (operation) {
        case "get":
          result = await this.getDocument(db, collectionPath, documentId);
          break;
        case "list":
        case "query":
          result = await this.queryDocuments(db, collectionPath, where, orderBy, limit);
          break;
        case "add":
          result = await this.addDocument(db, collectionPath, data);
          break;
        case "set":
          result = await this.setDocument(db, collectionPath, documentId, data);
          break;
        case "update":
          result = await this.updateDocument(db, collectionPath, documentId, data);
          break;
        case "delete":
          result = await this.deleteDocument(db, collectionPath, documentId);
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
      Logger.log("info", {
        message: "firestore:FirestoreDataSource:execute:success",
        params: { operation, collectionPath, result }
      });
      return result;
    } catch (error) {
      Logger.log("error", {
        message: "firestore:FirestoreDataSource:execute:catch",
        params: { error: error.message }
      });
      throw new Error(`Firestore ${operation} failed: ${error.message}`);
    }
  }
  async getDocument(db, collectionPath, documentId) {
    const docRef = db.collection(collectionPath).doc(documentId);
    const doc = await docRef.get();
    if (!doc.exists) {
      return null;
    }
    return { id: doc.id, ...doc.data() };
  }
  async queryDocuments(db, collectionPath, where, orderBy, limit) {
    let query = db.collection(collectionPath);
    if (where && Array.isArray(where)) {
      for (const condition of where) {
        query = query.where(condition.field, condition.operator, this.parseValue(condition.value));
      }
    }
    if (orderBy && orderBy.field) {
      query = query.orderBy(orderBy.field, orderBy.direction || "asc");
    }
    if (limit) {
      query = query.limit(limit);
    }
    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
  async addDocument(db, collectionPath, data) {
    const parsedData = typeof data === "string" ? JSON.parse(data) : data;
    const docRef = await db.collection(collectionPath).add(parsedData);
    return { id: docRef.id, ...parsedData };
  }
  async setDocument(db, collectionPath, documentId, data) {
    const parsedData = typeof data === "string" ? JSON.parse(data) : data;
    await db.collection(collectionPath).doc(documentId).set(parsedData);
    return { id: documentId, ...parsedData };
  }
  async updateDocument(db, collectionPath, documentId, data) {
    const parsedData = typeof data === "string" ? JSON.parse(data) : data;
    await db.collection(collectionPath).doc(documentId).update(parsedData);
    return { id: documentId, ...parsedData };
  }
  async deleteDocument(db, collectionPath, documentId) {
    await db.collection(collectionPath).doc(documentId).delete();
    return { id: documentId, deleted: true };
  }
  parseValue(value) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  async subscribe(config, onEvent) {
    const { collection, documentId } = config;
    if (!collection) {
      throw new Error("Collection is required for Firestore listener");
    }
    Logger.log("info", {
      message: "firestore:subscribe:start",
      params: { collection, documentId, datasourceID: this.config.datasourceID }
    });
    const db = await this.getFirestoreDb();
    let target;
    if (documentId) {
      target = db.collection(collection).doc(documentId);
    } else {
      target = db.collection(collection);
    }
    const unsubscribeFn = target.onSnapshot(
      (snapshot) => {
        if (documentId) {
          onEvent({
            collection,
            documentId,
            exists: snapshot.exists,
            payload: snapshot.data() || null
          });
        } else {
          snapshot.docChanges().forEach((change) => {
            onEvent({
              collection,
              documentId: change.doc.id,
              type: change.type,
              // 'added', 'modified', 'removed'
              payload: change.doc.data()
            });
          });
        }
      },
      (error) => {
        Logger.log("error", {
          message: "firestore:subscribe:error",
          params: { error: error.message }
        });
      }
    );
    return { unsubscribeFn };
  }
  async unsubscribe(handle) {
    if (!handle || !handle.unsubscribeFn) return;
    Logger.log("info", {
      message: "firestore:unsubscribe",
      params: { datasourceID: this.config.datasourceID }
    });
    try {
      handle.unsubscribeFn();
    } catch (e) {
      Logger.log("error", {
        message: "firestore:unsubscribe:error",
        params: { error: e.message }
      });
    }
  }
};

// src/data-sources/mysql/datasource.js
var import_promise = __toESM(require("mysql2/promise"));
var MySQLDataSource = class extends DataSource {
  async execute(dataQueryOptions2, context) {
    Logger.log("info", {
      message: "mysql:MySQLDataSource:execute:params",
      params: { dataQueryOptions: dataQueryOptions2, config: this.config }
    });
    const { query } = dataQueryOptions2;
    const datasourceOptions = this.config.datasourceOptions || {};
    let connectionConfig;
    if (datasourceOptions.connectionString) {
      connectionConfig = datasourceOptions.connectionString;
    } else {
      const { host, port, database, user, password, ssl, additionalOptions } = datasourceOptions.connectionDetails || datasourceOptions;
      connectionConfig = {
        host: host || datasourceOptions.host,
        port: port || datasourceOptions.port || 3306,
        database: database || datasourceOptions.database,
        user: user || datasourceOptions.user,
        password: password || datasourceOptions.password,
        ssl: ssl || datasourceOptions.ssl ? { rejectUnauthorized: false } : void 0,
        connectTimeout: additionalOptions?.connectTimeout || 1e4,
        timezone: additionalOptions?.timezone || "Z"
      };
    }
    let connection;
    try {
      connection = await import_promise.default.createConnection(connectionConfig);
      Logger.log("info", {
        message: "mysql:MySQLDataSource:execute:connected",
        params: { host: connectionConfig.host || "connection-string" }
      });
      const [rows] = await connection.execute(query);
      return rows;
    } catch (error) {
      Logger.log("error", {
        message: "mysql:MySQLDataSource:execute:catch",
        params: error.message || error
      });
      throw new Error(
        `MySQL request failed: ${error.message || "Unknown error"}`
      );
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }
};

// src/data-sources/mongodb/datasource.js
var import_mongodb = require("mongodb");
var MongoDBDataSource = class extends DataSource {
  async execute(dataQueryOptions2, context) {
    Logger.log("info", {
      message: "mongodb:MongoDBDataSource:execute:params",
      params: { dataQueryOptions: dataQueryOptions2, datasourceID: this.config.datasourceID }
    });
    const datasourceOptions = this.config.datasourceOptions || {};
    const { operation, collection, filter, projection, sort, limit, skip, document, pipeline, options } = dataQueryOptions2;
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
      client = new import_mongodb.MongoClient(connectionString);
      await client.connect();
      Logger.log("info", {
        message: "mongodb:MongoDBDataSource:execute:connected",
        params: { database: dbName }
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
        params: { operation, collection }
      });
      return result;
    } catch (error) {
      Logger.log("error", {
        message: "mongodb:MongoDBDataSource:execute:catch",
        params: { error: error.message }
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
      upsertedId: result.upsertedId
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
      modifiedCount: result.modifiedCount
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
      params: { collectionName, operationTypes, datasourceID: this.config.datasourceID }
    });
    const client = new import_mongodb.MongoClient(connectionString);
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
      params: { datasourceID: this.config.datasourceID }
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
        params: { error: e.message }
      });
    }
  }
};

// src/data-sources/googlesheets/datasource.js
var import_googleapis = require("googleapis");
var GoogleSheetsDataSource = class extends DataSource {
  constructor(config) {
    super(config);
    this.sheets = null;
    this.auth = null;
  }
  async getAuth() {
    if (this.auth) return this.auth;
    const datasourceOptions = this.config.datasourceOptions || {};
    const { authType, serviceAccountKey, oauth2 } = datasourceOptions;
    if (authType === "serviceAccount" && serviceAccountKey) {
      const credentials = typeof serviceAccountKey === "string" ? JSON.parse(serviceAccountKey) : serviceAccountKey;
      this.auth = new import_googleapis.google.auth.GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"]
      });
    } else if (authType === "oauth2" && oauth2) {
      const { clientId, clientSecret, refreshToken } = oauth2;
      const oauth2Client = new import_googleapis.google.auth.OAuth2(clientId, clientSecret);
      oauth2Client.setCredentials({ refresh_token: refreshToken });
      this.auth = oauth2Client;
    } else {
      throw new Error("Invalid authentication configuration");
    }
    return this.auth;
  }
  async getSheetsClient() {
    if (this.sheets) return this.sheets;
    const auth = await this.getAuth();
    this.sheets = import_googleapis.google.sheets({ version: "v4", auth });
    return this.sheets;
  }
  async execute(dataQueryOptions2, context) {
    Logger.log("info", {
      message: "googlesheets:GoogleSheetsDataSource:execute:params",
      params: { dataQueryOptions: dataQueryOptions2, datasourceID: this.config.datasourceID }
    });
    const {
      operation,
      spreadsheetId,
      sheetName,
      range,
      data,
      valueInputOption,
      insertDataOption,
      majorDimension,
      includeHeaders
    } = dataQueryOptions2;
    const datasourceOptions = this.config.datasourceOptions || {};
    const finalSpreadsheetId = spreadsheetId || datasourceOptions.defaultSpreadsheetId;
    if (!finalSpreadsheetId) {
      throw new Error("Spreadsheet ID is required");
    }
    try {
      const sheets = await this.getSheetsClient();
      let result;
      const fullRange = sheetName && range && !range.includes("!") ? `${sheetName}!${range}` : range || sheetName;
      switch (operation) {
        case "read":
          result = await this.readData(sheets, finalSpreadsheetId, fullRange, majorDimension, includeHeaders);
          break;
        case "write":
          result = await this.writeData(sheets, finalSpreadsheetId, fullRange, data, valueInputOption);
          break;
        case "append":
          result = await this.appendData(sheets, finalSpreadsheetId, fullRange, data, valueInputOption, insertDataOption);
          break;
        case "update":
          result = await this.updateData(sheets, finalSpreadsheetId, fullRange, data, valueInputOption);
          break;
        case "clear":
          result = await this.clearData(sheets, finalSpreadsheetId, fullRange);
          break;
        case "getSpreadsheetInfo":
          result = await this.getSpreadsheetInfo(sheets, finalSpreadsheetId);
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
      Logger.log("info", {
        message: "googlesheets:GoogleSheetsDataSource:execute:success",
        params: { operation, spreadsheetId: finalSpreadsheetId }
      });
      return result;
    } catch (error) {
      Logger.log("error", {
        message: "googlesheets:GoogleSheetsDataSource:execute:catch",
        params: { error: error.message }
      });
      throw new Error(`Google Sheets ${operation} failed: ${error.message}`);
    }
  }
  async readData(sheets, spreadsheetId, range, majorDimension = "ROWS", includeHeaders = true) {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
      majorDimension
    });
    const values = response.data.values || [];
    if (includeHeaders && values.length > 1) {
      const headers = values[0];
      const rows = values.slice(1);
      return rows.map((row) => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] !== void 0 ? row[index] : null;
        });
        return obj;
      });
    }
    return values;
  }
  async writeData(sheets, spreadsheetId, range, data, valueInputOption = "USER_ENTERED") {
    const values = this.parseData(data);
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption,
      requestBody: {
        values
      }
    });
    return {
      updatedCells: response.data.updatedCells,
      updatedRows: response.data.updatedRows,
      updatedColumns: response.data.updatedColumns,
      updatedRange: response.data.updatedRange
    };
  }
  async appendData(sheets, spreadsheetId, range, data, valueInputOption = "USER_ENTERED", insertDataOption = "INSERT_ROWS") {
    const values = this.parseData(data);
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption,
      insertDataOption,
      requestBody: {
        values
      }
    });
    return {
      updatedCells: response.data.updates?.updatedCells,
      updatedRows: response.data.updates?.updatedRows,
      updatedRange: response.data.updates?.updatedRange
    };
  }
  async updateData(sheets, spreadsheetId, range, data, valueInputOption = "USER_ENTERED") {
    return await this.writeData(sheets, spreadsheetId, range, data, valueInputOption);
  }
  async clearData(sheets, spreadsheetId, range) {
    const response = await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range
    });
    return {
      clearedRange: response.data.clearedRange
    };
  }
  async getSpreadsheetInfo(sheets, spreadsheetId) {
    const response = await sheets.spreadsheets.get({
      spreadsheetId
    });
    return {
      title: response.data.properties?.title,
      locale: response.data.properties?.locale,
      sheets: response.data.sheets?.map((sheet) => ({
        sheetId: sheet.properties?.sheetId,
        title: sheet.properties?.title,
        index: sheet.properties?.index,
        rowCount: sheet.properties?.gridProperties?.rowCount,
        columnCount: sheet.properties?.gridProperties?.columnCount
      }))
    };
  }
  parseData(data) {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch {
        return [[data]];
      }
    }
    return [[data]];
  }
};

// src/data-sources/graphql/datasource.js
var import_axios2 = __toESM(require("axios"));
var import_graphql_ws = require("graphql-ws");
var import_ws = __toESM(require("ws"));
var GraphQLDataSource = class extends DataSource {
  async execute(dataQueryOptions2, context) {
    Logger.log("info", {
      message: "graphql:GraphQLDataSource:execute:params",
      params: { dataQueryOptions: dataQueryOptions2, datasourceID: this.config.datasourceID }
    });
    const { query, variables, operationName } = dataQueryOptions2;
    const datasourceOptions = this.config.datasourceOptions || {};
    const {
      endpoint,
      authType,
      bearerToken,
      apiKey,
      basicAuth,
      headers: customHeaders = [],
      timeout = 30
    } = datasourceOptions;
    if (!endpoint) {
      throw new Error("GraphQL endpoint is required");
    }
    try {
      const headers = {
        "Content-Type": "application/json"
      };
      if (authType === "bearer" && bearerToken) {
        headers["Authorization"] = `Bearer ${bearerToken}`;
      } else if (authType === "apiKey" && apiKey?.value) {
        headers[apiKey.headerName || "x-api-key"] = apiKey.value;
      } else if (authType === "basic" && basicAuth?.username && basicAuth?.password) {
        const credentials = Buffer.from(`${basicAuth.username}:${basicAuth.password}`).toString("base64");
        headers["Authorization"] = `Basic ${credentials}`;
      }
      if (customHeaders && Array.isArray(customHeaders)) {
        customHeaders.forEach((header) => {
          if (header.key && header.value) {
            headers[header.key] = header.value;
          }
        });
      }
      let parsedVariables = {};
      if (variables) {
        try {
          parsedVariables = typeof variables === "string" ? JSON.parse(variables) : variables;
        } catch (e) {
          Logger.log("warn", {
            message: "graphql:GraphQLDataSource:execute:variableParseError",
            params: { error: e.message }
          });
        }
      }
      const response = await (0, import_axios2.default)({
        method: "POST",
        url: endpoint,
        headers,
        data: {
          query,
          variables: parsedVariables,
          ...operationName ? { operationName } : {}
        },
        timeout: timeout * 1e3
      });
      Logger.log("info", {
        message: "graphql:GraphQLDataSource:execute:success",
        params: {
          endpoint,
          hasData: !!response.data?.data,
          hasErrors: !!response.data?.errors
        }
      });
      if (response.data?.errors && response.data.errors.length > 0) {
        const errorMessages = response.data.errors.map((e) => e.message).join("; ");
        throw new Error(`GraphQL errors: ${errorMessages}`);
      }
      return response.data?.data || response.data;
    } catch (error) {
      Logger.log("error", {
        message: "graphql:GraphQLDataSource:execute:catch",
        params: {
          error: error.message,
          response: error.response?.data
        }
      });
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map((e) => e.message).join("; ");
        throw new Error(`GraphQL errors: ${errorMessages}`);
      }
      throw new Error(`GraphQL request failed: ${error.message}`);
    }
  }
  /**
   * Perform introspection query to get schema information
   */
  async introspect() {
    const introspectionQuery = `
      query IntrospectionQuery {
        __schema {
          queryType { name }
          mutationType { name }
          types {
            name
            kind
            description
            fields {
              name
              description
              type {
                name
                kind
              }
            }
          }
        }
      }
    `;
    return await this.execute({ query: introspectionQuery });
  }
  async subscribe(config, onEvent) {
    const datasourceOptions = this.config.datasourceOptions || {};
    const endpoint = datasourceOptions.endpoint;
    if (!endpoint) {
      throw new Error("GraphQL endpoint is required for subscriptions");
    }
    let wsEndpoint = endpoint.replace(/^http/, "ws");
    if (datasourceOptions.wsEndpoint) {
      wsEndpoint = datasourceOptions.wsEndpoint;
    }
    const { subscription, variables } = config;
    if (!subscription) {
      throw new Error("GraphQL subscription query is required");
    }
    Logger.log("info", {
      message: "graphql:subscribe:start",
      params: { wsEndpoint, datasourceID: this.config.datasourceID }
    });
    let parsedVariables = {};
    if (variables) {
      try {
        parsedVariables = typeof variables === "string" ? JSON.parse(variables) : variables;
      } catch (e) {
        Logger.log("warn", {
          message: "graphql:subscribe:variableParseError",
          params: { error: e.message }
        });
      }
    }
    const connectionParams = {};
    if (datasourceOptions.authType === "bearer" && datasourceOptions.bearerToken) {
      connectionParams.Authorization = `Bearer ${datasourceOptions.bearerToken}`;
    } else if (datasourceOptions.authType === "apiKey" && datasourceOptions.apiKey?.value) {
      connectionParams[datasourceOptions.apiKey.headerName || "x-api-key"] = datasourceOptions.apiKey.value;
    }
    if (datasourceOptions.headers && Array.isArray(datasourceOptions.headers)) {
      datasourceOptions.headers.forEach((header) => {
        if (header.key && header.value) {
          connectionParams[header.key] = header.value;
        }
      });
    }
    const client = (0, import_graphql_ws.createClient)({
      url: wsEndpoint,
      webSocketImpl: import_ws.default,
      connectionParams: Object.keys(connectionParams).length > 0 ? connectionParams : void 0
    });
    const unsubscribeFn = client.subscribe(
      {
        query: subscription,
        variables: parsedVariables
      },
      {
        next: (data) => {
          onEvent({ payload: data.data || data });
        },
        error: (error) => {
          Logger.log("error", {
            message: "graphql:subscribe:error",
            params: { error }
          });
        },
        complete: () => {
          Logger.log("info", {
            message: "graphql:subscribe:complete",
            params: { datasourceID: this.config.datasourceID }
          });
        }
      }
    );
    return { client, unsubscribeFn };
  }
  async unsubscribe(handle) {
    if (!handle) return;
    Logger.log("info", {
      message: "graphql:unsubscribe",
      params: { datasourceID: this.config.datasourceID }
    });
    try {
      if (handle.unsubscribeFn) {
        handle.unsubscribeFn();
      }
      if (handle.client) {
        await handle.client.dispose();
      }
    } catch (e) {
      Logger.log("error", {
        message: "graphql:unsubscribe:error",
        params: { error: e.message }
      });
    }
  }
};

// src/data-sources/rabbitmq/datasource.js
var import_amqplib = __toESM(require("amqplib"));
var RabbitMQDataSource = class extends DataSource {
  buildConnectionUrl() {
    const opts = this.config.datasourceOptions || {};
    if (opts.connectionUrl) {
      return opts.connectionUrl;
    }
    const details = opts.connectionDetails || opts;
    const protocol = details.ssl ? "amqps" : "amqp";
    const auth = details.username && details.password ? `${encodeURIComponent(details.username)}:${encodeURIComponent(details.password)}@` : "";
    const vhost = encodeURIComponent(details.vhost || "/");
    const heartbeat = details.heartbeat ? `?heartbeat=${details.heartbeat}` : "";
    return `${protocol}://${auth}${details.host || "localhost"}:${details.port || 5672}/${vhost}${heartbeat}`;
  }
  async execute(dataQueryOptions2, context) {
    Logger.log("info", {
      message: "rabbitmq:RabbitMQDataSource:execute:params",
      params: { dataQueryOptions: dataQueryOptions2, datasourceID: this.config.datasourceID }
    });
    const {
      operation,
      queue,
      exchange,
      routingKey,
      message,
      messageCount = 1,
      consumeMode = "preview",
      storeDestination,
      queueOptions = {},
      messageOptions = {}
    } = dataQueryOptions2;
    let connection;
    let channel;
    try {
      const url = this.buildConnectionUrl();
      const maskedUrl = url.replace(/([^:]+):([^@]+)@/, "$1:****@");
      Logger.log("info", {
        message: "rabbitmq:RabbitMQDataSource:connecting",
        params: { url: maskedUrl, datasourceID: this.config.datasourceID }
      });
      connection = await import_amqplib.default.connect(url);
      connection.on("error", (err) => {
        Logger.log("error", { message: "rabbitmq:connection:error", params: { error: err.message, datasourceID: this.config.datasourceID } });
      });
      channel = await connection.createChannel();
      channel.on("error", (err) => {
        Logger.log("error", { message: "rabbitmq:channel:error", params: { error: err.message, datasourceID: this.config.datasourceID } });
      });
      let result;
      switch (operation) {
        case "publish":
          result = await this.publish(channel, queue, exchange, routingKey, message, queueOptions, messageOptions);
          break;
        case "consume":
        case "peek":
          result = await this.consume(channel, queue, messageCount, consumeMode, storeDestination, queueOptions, context);
          break;
        case "ack":
          result = { success: true, message: "Messages acknowledged" };
          break;
        case "nack":
          result = { success: true, message: "Messages rejected" };
          break;
        case "purge":
          result = await this.purge(channel, queue);
          break;
        case "getQueueInfo":
          result = await this.getQueueInfo(channel, queue);
          break;
        case "deleteQueue":
          result = await this.deleteQueue(channel, queue);
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
      Logger.log("info", {
        message: "rabbitmq:RabbitMQDataSource:execute:success",
        params: { operation, queue }
      });
      return result;
    } catch (error) {
      Logger.log("error", {
        message: "rabbitmq:RabbitMQDataSource:execute:catch",
        params: { error: error.message }
      });
      throw new Error(`RabbitMQ ${operation} failed: ${error.message}`);
    } finally {
      if (channel) await channel.close();
      if (connection) await connection.close();
    }
  }
  async publish(channel, queue, exchange, routingKey, message, queueOptions, messageOptions) {
    const msgContent = typeof message === "string" ? message : JSON.stringify(message);
    const buffer = Buffer.from(msgContent);
    const options = {
      persistent: messageOptions.persistent !== false,
      contentType: messageOptions.contentType || "application/json",
      ...messageOptions.expiration ? { expiration: messageOptions.expiration } : {}
    };
    if (exchange) {
      const exchangeType = dataQueryOptions.exchangeType || "direct";
      await channel.assertExchange(exchange, exchangeType, { durable: true });
      channel.publish(exchange, routingKey || queue, buffer, options);
    } else {
      await channel.assertQueue(queue, {
        durable: queueOptions.durable !== false,
        autoDelete: queueOptions.autoDelete || false,
        exclusive: queueOptions.exclusive || false
      });
      channel.sendToQueue(queue, buffer, options);
    }
    return { success: true, queue, exchange, routingKey, messageSize: buffer.length };
  }
  async consume(channel, queue, messageCount, consumeMode, storeDestination, queueOptions, context) {
    await channel.assertQueue(queue, {
      durable: queueOptions.durable !== false,
      autoDelete: queueOptions.autoDelete || false,
      exclusive: queueOptions.exclusive || false
    });
    const messages = [];
    for (let i = 0; i < messageCount; i++) {
      const msg = await channel.get(queue, { noAck: false });
      if (!msg) break;
      let content;
      try {
        content = JSON.parse(msg.content.toString());
      } catch {
        content = msg.content.toString();
      }
      const messageData = {
        content,
        properties: {
          messageId: msg.properties.messageId,
          contentType: msg.properties.contentType,
          timestamp: msg.properties.timestamp,
          deliveryTag: msg.fields.deliveryTag,
          redelivered: msg.fields.redelivered
        }
      };
      messages.push(messageData);
      if (consumeMode === "preview") {
        channel.nack(msg, false, true);
      } else if (consumeMode === "consume" || consumeMode === "consumeAndStore") {
        channel.ack(msg);
        if (consumeMode === "consumeAndStore" && storeDestination?.dataQueryId && context?.executeDataQuery) {
          await context.executeDataQuery(storeDestination.dataQueryId, { message: content });
        }
      }
    }
    return {
      messages,
      count: messages.length,
      queue,
      consumeMode
    };
  }
  async purge(channel, queue) {
    const result = await channel.purgeQueue(queue);
    return { success: true, messageCount: result.messageCount, queue };
  }
  async getQueueInfo(channel, queue) {
    const info = await channel.checkQueue(queue);
    return {
      queue: info.queue,
      messageCount: info.messageCount,
      consumerCount: info.consumerCount
    };
  }
  async deleteQueue(channel, queue) {
    const result = await channel.deleteQueue(queue);
    return { success: true, messageCount: result.messageCount, queue };
  }
  async subscribe(config, onEvent) {
    const exchange = config.exchange;
    const routingKey = config.routingKey || "#";
    const queueName = config.queue || "";
    const prefetch = config.prefetch || 10;
    if (!exchange) {
      throw new Error("Exchange is required for RabbitMQ listener");
    }
    Logger.log("info", {
      message: "rabbitmq:subscribe:start",
      params: { exchange, routingKey, queueName, datasourceID: this.config.datasourceID }
    });
    const connection = await import_amqplib.default.connect(this.buildConnectionUrl());
    connection.on("error", (err) => {
      Logger.log("error", { message: "rabbitmq:connection:error", params: { error: err.message, datasourceID: this.config.datasourceID } });
    });
    const channel = await connection.createChannel();
    channel.on("error", (err) => {
      Logger.log("error", { message: "rabbitmq:channel:error", params: { error: err.message, datasourceID: this.config.datasourceID } });
    });
    await channel.prefetch(prefetch);
    const exchangeType = config.exchangeType || "topic";
    await channel.assertExchange(exchange, exchangeType, { durable: true });
    const q = await channel.assertQueue(queueName, {
      exclusive: !queueName
      // if no queue name provided, it's exclusive to this connection
    });
    await channel.bindQueue(q.queue, exchange, routingKey);
    const { consumerTag } = await channel.consume(q.queue, (msg) => {
      if (msg !== null) {
        let content;
        try {
          content = JSON.parse(msg.content.toString());
        } catch {
          content = msg.content.toString();
        }
        onEvent({
          exchange,
          routingKey: msg.fields.routingKey,
          payload: content
        });
        channel.ack(msg);
      }
    });
    return { connection, channel, consumerTag };
  }
  async unsubscribe(handle) {
    if (!handle) return;
    Logger.log("info", {
      message: "rabbitmq:unsubscribe",
      params: { datasourceID: this.config.datasourceID }
    });
    try {
      if (handle.channel) {
        await handle.channel.cancel(handle.consumerTag);
        await handle.channel.close();
      }
      if (handle.connection) {
        await handle.connection.close();
      }
    } catch (e) {
      Logger.log("error", {
        message: "rabbitmq:unsubscribe:error",
        params: { error: e.message }
      });
    }
  }
};

// src/data-sources/kafka/datasource.js
var import_kafkajs = require("kafkajs");
var KafkaDataSource = class extends DataSource {
  getKafkaClient() {
    const opts = this.config.datasourceOptions || {};
    const brokers = (opts.brokers || "localhost:9092").split(",").map((b) => b.trim());
    const config = {
      clientId: opts.clientId || "jet-admin",
      brokers,
      connectionTimeout: opts.connectionTimeout || 1e4,
      requestTimeout: opts.requestTimeout || 3e4,
      logLevel: import_kafkajs.logLevel.WARN
    };
    if (opts.ssl) {
      config.ssl = true;
    }
    if (opts.sasl?.enabled) {
      config.sasl = {
        mechanism: opts.sasl.mechanism || "plain",
        username: opts.sasl.username,
        password: opts.sasl.password
      };
    }
    return new import_kafkajs.Kafka(config);
  }
  async execute(dataQueryOptions2, context) {
    Logger.log("info", {
      message: "kafka:KafkaDataSource:execute:params",
      params: { dataQueryOptions: dataQueryOptions2, datasourceID: this.config.datasourceID }
    });
    const {
      operation,
      topic,
      message,
      key,
      partition,
      consumerGroup,
      messageCount = 10,
      fromBeginning = false,
      consumeMode = "preview",
      storeDestination,
      topicConfig
    } = dataQueryOptions2;
    const kafka = this.getKafkaClient();
    try {
      let result;
      switch (operation) {
        case "produce":
          result = await this.produce(kafka, topic, message, key, partition);
          break;
        case "consume":
          result = await this.consume(kafka, topic, consumerGroup, messageCount, fromBeginning, consumeMode, storeDestination, context);
          break;
        case "getTopicMetadata":
          result = await this.getTopicMetadata(kafka, topic);
          break;
        case "listTopics":
          result = await this.listTopics(kafka);
          break;
        case "createTopic":
          result = await this.createTopic(kafka, topic, topicConfig);
          break;
        case "deleteTopic":
          result = await this.deleteTopic(kafka, topic);
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
      Logger.log("info", {
        message: "kafka:KafkaDataSource:execute:success",
        params: { operation, topic }
      });
      return result;
    } catch (error) {
      Logger.log("error", {
        message: "kafka:KafkaDataSource:execute:catch",
        params: { error: error.message }
      });
      throw new Error(`Kafka ${operation} failed: ${error.message}`);
    }
  }
  async produce(kafka, topic, message, key, partition) {
    const producer = kafka.producer();
    await producer.connect();
    try {
      const msgValue = typeof message === "string" ? message : JSON.stringify(message);
      const record = {
        topic,
        messages: [{
          value: msgValue,
          ...key ? { key } : {},
          ...partition !== void 0 ? { partition } : {}
        }]
      };
      const result = await producer.send(record);
      return {
        success: true,
        topic,
        partition: result[0]?.partition,
        offset: result[0]?.baseOffset
      };
    } finally {
      await producer.disconnect();
    }
  }
  async consume(kafka, topic, consumerGroup, messageCount, fromBeginning, consumeMode, storeDestination, context) {
    const consumer = kafka.consumer({ groupId: consumerGroup || `jet-admin-${Date.now()}` });
    await consumer.connect();
    const messages = [];
    try {
      await consumer.subscribe({ topic, fromBeginning });
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          resolve();
        }, 5e3);
        consumer.run({
          eachMessage: async ({ topic: topic2, partition, message }) => {
            if (messages.length >= messageCount) return;
            let content;
            try {
              content = JSON.parse(message.value.toString());
            } catch {
              content = message.value.toString();
            }
            messages.push({
              content,
              key: message.key?.toString(),
              partition,
              offset: message.offset,
              timestamp: message.timestamp
            });
            if (consumeMode === "consumeAndStore" && storeDestination?.dataQueryId && context?.executeDataQuery) {
              await context.executeDataQuery(storeDestination.dataQueryId, { message: content });
            }
            if (messages.length >= messageCount) {
              clearTimeout(timeout);
              resolve();
            }
          }
        }).catch(reject);
      });
      return {
        messages,
        count: messages.length,
        topic,
        consumerGroup,
        consumeMode
      };
    } finally {
      await consumer.disconnect();
    }
  }
  async getTopicMetadata(kafka, topic) {
    const admin = kafka.admin();
    await admin.connect();
    try {
      const metadata = await admin.fetchTopicMetadata({ topics: topic ? [topic] : [] });
      return {
        topics: metadata.topics.map((t) => ({
          name: t.name,
          partitions: t.partitions.map((p) => ({
            partitionId: p.partitionId,
            leader: p.leader,
            replicas: p.replicas,
            isr: p.isr
          }))
        }))
      };
    } finally {
      await admin.disconnect();
    }
  }
  async listTopics(kafka) {
    const admin = kafka.admin();
    await admin.connect();
    try {
      const topics = await admin.listTopics();
      return { topics };
    } finally {
      await admin.disconnect();
    }
  }
  async createTopic(kafka, topic, config = {}) {
    const admin = kafka.admin();
    await admin.connect();
    try {
      await admin.createTopics({
        topics: [{
          topic,
          numPartitions: config.numPartitions || 1,
          replicationFactor: config.replicationFactor || 1
        }]
      });
      return { success: true, topic };
    } finally {
      await admin.disconnect();
    }
  }
  async deleteTopic(kafka, topic) {
    const admin = kafka.admin();
    await admin.connect();
    try {
      await admin.deleteTopics({ topics: [topic] });
      return { success: true, topic };
    } finally {
      await admin.disconnect();
    }
  }
  async subscribe(config, onEvent) {
    const { topic, consumerGroup, fromBeginning = false } = config;
    const kafka = this.getKafkaClient();
    const consumer = kafka.consumer({ groupId: consumerGroup || `jet-admin-sub-${Date.now()}` });
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning });
    consumer.run({
      eachMessage: async ({ topic: topic2, partition, message }) => {
        let payload;
        const msgStr = message.value?.toString();
        try {
          payload = JSON.parse(msgStr);
        } catch {
          payload = msgStr;
        }
        const event = {
          topic: topic2,
          partition,
          key: message.key?.toString(),
          payload,
          timestamp: message.timestamp
        };
        if (onEvent) {
          await onEvent(event);
        }
      }
    }).catch((err) => {
      Logger.log("error", {
        message: "kafka:KafkaDataSource:subscribe:runError",
        params: { topic, consumerGroup, error: err.message }
      });
    });
    return consumer;
  }
  async unsubscribe(consumer) {
    if (consumer) {
      await consumer.disconnect();
    }
  }
};

// src/data-sources/redis/datasource.js
var import_ioredis = __toESM(require("ioredis"));
var RedisDataSource = class extends DataSource {
  getRedisClient() {
    const opts = this.config.datasourceOptions || {};
    if (opts.connectionUrl) {
      return new import_ioredis.default(opts.connectionUrl);
    }
    if (opts.clusterMode && opts.clusterNodes) {
      const nodes = opts.clusterNodes.split(",").map((n) => {
        const [host, port] = n.trim().split(":");
        return { host, port: parseInt(port) || 6379 };
      });
      return new import_ioredis.default.Cluster(nodes);
    }
    const details = opts.connectionDetails || opts;
    return new import_ioredis.default({
      host: details.host || "localhost",
      port: details.port || 6379,
      password: details.password || void 0,
      db: details.database || 0,
      username: details.username || void 0,
      tls: details.tls ? {} : void 0
    });
  }
  async execute(dataQueryOptions2, context) {
    Logger.log("info", {
      message: "redis:RedisDataSource:execute:params",
      params: { dataQueryOptions: dataQueryOptions2, datasourceID: this.config.datasourceID }
    });
    const redis = this.getRedisClient();
    try {
      const result = await this.executeOperation(redis, dataQueryOptions2, context);
      Logger.log("info", {
        message: "redis:RedisDataSource:execute:success",
        params: { operation: dataQueryOptions2.operation }
      });
      return result;
    } catch (error) {
      Logger.log("error", {
        message: "redis:RedisDataSource:execute:catch",
        params: { error: error.message }
      });
      throw new Error(`Redis ${dataQueryOptions2.operation} failed: ${error.message}`);
    } finally {
      redis.disconnect();
    }
  }
  async executeOperation(redis, opts, context) {
    const { operation, key, value, field, pattern, ttl, start, stop, count, streamId, channel, consumeMode, storeDestination } = opts;
    const parseValue = (v) => {
      if (!v) return v;
      try {
        return JSON.parse(v);
      } catch {
        return v;
      }
    };
    const stringifyValue = (v) => {
      if (typeof v === "string") return v;
      return JSON.stringify(v);
    };
    switch (operation) {
      // String operations
      case "get": {
        const result = await redis.get(key);
        return { key, value: parseValue(result) };
      }
      case "set": {
        const args = [key, stringifyValue(value)];
        if (ttl > 0) args.push("EX", ttl);
        await redis.set(...args);
        return { success: true, key };
      }
      case "del": {
        const deleted = await redis.del(key);
        return { success: true, key, deleted };
      }
      case "exists": {
        const exists = await redis.exists(key);
        return { key, exists: exists === 1 };
      }
      case "keys": {
        const keys = await redis.keys(pattern || "*");
        return { pattern, keys, count: keys.length };
      }
      case "expire": {
        await redis.expire(key, ttl);
        return { success: true, key, ttl };
      }
      case "ttl": {
        const remaining = await redis.ttl(key);
        return { key, ttl: remaining };
      }
      // Hash operations
      case "hget": {
        const result = await redis.hget(key, field);
        return { key, field, value: parseValue(result) };
      }
      case "hset": {
        await redis.hset(key, field, stringifyValue(value));
        return { success: true, key, field };
      }
      case "hgetall": {
        const result = await redis.hgetall(key);
        const parsed = {};
        for (const [k, v] of Object.entries(result)) {
          parsed[k] = parseValue(v);
        }
        return { key, data: parsed };
      }
      case "hdel": {
        const deleted = await redis.hdel(key, field);
        return { success: true, key, field, deleted };
      }
      // List operations
      case "lpush": {
        const length = await redis.lpush(key, stringifyValue(value));
        return { success: true, key, length };
      }
      case "rpush": {
        const length = await redis.rpush(key, stringifyValue(value));
        return { success: true, key, length };
      }
      case "lpop": {
        const result = await redis.lpop(key);
        const parsed = parseValue(result);
        if (consumeMode === "consumeAndStore" && storeDestination?.dataQueryId && context?.executeDataQuery) {
          await context.executeDataQuery(storeDestination.dataQueryId, { message: parsed });
        }
        return { key, value: parsed };
      }
      case "rpop": {
        const result = await redis.rpop(key);
        const parsed = parseValue(result);
        if (consumeMode === "consumeAndStore" && storeDestination?.dataQueryId && context?.executeDataQuery) {
          await context.executeDataQuery(storeDestination.dataQueryId, { message: parsed });
        }
        return { key, value: parsed };
      }
      case "lrange": {
        const items = await redis.lrange(key, start || 0, stop ?? -1);
        return { key, items: items.map(parseValue), count: items.length };
      }
      case "llen": {
        const length = await redis.llen(key);
        return { key, length };
      }
      // Set operations
      case "sadd": {
        const added = await redis.sadd(key, stringifyValue(value));
        return { success: true, key, added };
      }
      case "smembers": {
        const members = await redis.smembers(key);
        return { key, members: members.map(parseValue), count: members.length };
      }
      case "srem": {
        const removed = await redis.srem(key, stringifyValue(value));
        return { success: true, key, removed };
      }
      case "sismember": {
        const isMember = await redis.sismember(key, stringifyValue(value));
        return { key, value, isMember: isMember === 1 };
      }
      // Pub/Sub
      case "publish": {
        const receivers = await redis.publish(channel || key, stringifyValue(value));
        return { success: true, channel: channel || key, receivers };
      }
      // Stream operations
      case "xadd": {
        const data = parseValue(value);
        const fields = [];
        if (typeof data === "object") {
          for (const [k, v] of Object.entries(data)) {
            fields.push(k, stringifyValue(v));
          }
        } else {
          fields.push("data", stringifyValue(data));
        }
        const id = await redis.xadd(key, "*", ...fields);
        return { success: true, key, id };
      }
      case "xread": {
        const result = await redis.xread("COUNT", count || 10, "STREAMS", key, streamId || "0");
        if (!result) return { key, messages: [], count: 0 };
        const messages = result[0][1].map(([id, fields]) => {
          const data = {};
          for (let i = 0; i < fields.length; i += 2) {
            data[fields[i]] = parseValue(fields[i + 1]);
          }
          return { id, data };
        });
        if (consumeMode === "consumeAndStore" && storeDestination?.dataQueryId && context?.executeDataQuery) {
          for (const msg of messages) {
            await context.executeDataQuery(storeDestination.dataQueryId, { message: msg });
          }
        }
        return { key, messages, count: messages.length };
      }
      case "xrange": {
        const entries = await redis.xrange(key, start || "-", stop || "+", "COUNT", count || 10);
        const messages = entries.map(([id, fields]) => {
          const data = {};
          for (let i = 0; i < fields.length; i += 2) {
            data[fields[i]] = parseValue(fields[i + 1]);
          }
          return { id, data };
        });
        return { key, messages, count: messages.length };
      }
      case "xlen": {
        const length = await redis.xlen(key);
        return { key, length };
      }
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }
  async subscribe(config, onEvent) {
    const redis = this.getRedisClient();
    const subType = config.subscriptionType || "pubsub";
    Logger.log("info", {
      message: "redis:subscribe:start",
      params: { subType, datasourceID: this.config.datasourceID }
    });
    if (subType === "pubsub") {
      const channels = (config.channels || "").split(",").map((c) => c.trim()).filter(Boolean);
      if (!channels.length) {
        redis.disconnect();
        throw new Error("No channels specified for Redis pubsub listener");
      }
      await redis.subscribe(...channels);
      redis.on("message", (channel, message) => {
        let parsed = message;
        try {
          parsed = JSON.parse(message);
        } catch {
        }
        onEvent({ channel, payload: parsed });
      });
      return { type: "pubsub", client: redis };
    } else if (subType === "stream") {
      const stream = config.stream;
      const group = config.consumerGroup;
      const consumer = config.consumerName || "jet-listener-1";
      if (!stream || !group) {
        redis.disconnect();
        throw new Error("Stream and consumerGroup required for Redis stream listener");
      }
      try {
        await redis.xgroup("CREATE", stream, group, "$", "MKSTREAM");
      } catch (e) {
        if (!e.message.includes("BUSYGROUP")) {
          redis.disconnect();
          throw e;
        }
      }
      let isRunning = true;
      const poll = async () => {
        while (isRunning) {
          try {
            const result = await redis.xreadgroup(
              "GROUP",
              group,
              consumer,
              "BLOCK",
              5e3,
              "COUNT",
              10,
              "STREAMS",
              stream,
              ">"
            );
            if (result && result.length > 0) {
              const messages = result[0][1];
              for (const [id, fields] of messages) {
                const data = {};
                for (let i = 0; i < fields.length; i += 2) {
                  let val = fields[i + 1];
                  try {
                    val = JSON.parse(val);
                  } catch {
                  }
                  data[fields[i]] = val;
                }
                onEvent({ stream, id, payload: data });
                await redis.xack(stream, group, id);
              }
            }
          } catch (e) {
            if (isRunning) {
              Logger.log("error", {
                message: "redis:stream:poll:error",
                params: { error: e.message }
              });
              await new Promise((r) => setTimeout(r, 5e3));
            }
          }
        }
      };
      poll();
      return { type: "stream", client: redis, stop: () => {
        isRunning = false;
      } };
    }
    redis.disconnect();
    throw new Error(`Unknown Redis subscription type: ${subType}`);
  }
  async unsubscribe(handle) {
    if (!handle) return;
    Logger.log("info", {
      message: "redis:unsubscribe",
      params: { type: handle.type, datasourceID: this.config.datasourceID }
    });
    if (handle.type === "pubsub") {
      await handle.client.unsubscribe();
      handle.client.disconnect();
    } else if (handle.type === "stream") {
      handle.stop();
      handle.client.disconnect();
    }
  }
};

// src/data-sources/mssql/datasource.js
var import_mssql = __toESM(require("mssql"));
var MSSQLDataSource = class extends DataSource {
  async execute(dataQueryOptions2, context) {
    Logger.log("info", {
      message: "mssql:MSSQLDataSource:execute:params",
      params: { dataQueryOptions: dataQueryOptions2, config: this.config }
    });
    const { query } = dataQueryOptions2;
    const datasourceOptions = this.config.datasourceOptions;
    let config;
    if (datasourceOptions?.connectionString) {
      config = datasourceOptions.connectionString;
    } else {
      const details = datasourceOptions?.connectionDetails || datasourceOptions;
      config = {
        server: details?.server,
        port: details?.port || 1433,
        database: details?.database,
        user: details?.user,
        password: details?.password,
        options: {
          encrypt: details?.encrypt !== false,
          trustServerCertificate: details?.trustServerCertificate || false
        }
      };
    }
    let pool;
    try {
      pool = await import_mssql.default.connect(config);
      Logger.log("info", {
        message: "mssql:MSSQLDataSource:execute:connected"
      });
      const result = await pool.request().query(query);
      return result.recordset;
    } catch (error) {
      Logger.log("error", {
        message: "mssql:MSSQLDataSource:execute:catch",
        params: error.message || error
      });
      throw new Error(`MSSQL query failed: ${error.message || error}`);
    } finally {
      if (pool) {
        await pool.close();
      }
    }
  }
};

// src/data-sources/supabase/datasource.js
var import_supabase_js = require("@supabase/supabase-js");
var SupabaseDataSource = class extends DataSource {
  async execute(dataQueryOptions2, context) {
    Logger.log("info", {
      message: "supabase:SupabaseDataSource:execute:params",
      params: { dataQueryOptions: dataQueryOptions2 }
    });
    const {
      queryType,
      table,
      columns,
      filters,
      data,
      functionName,
      functionArgs,
      limit,
      orderBy,
      ascending
    } = dataQueryOptions2;
    const datasourceOptions = this.config.datasourceOptions;
    const supabase = (0, import_supabase_js.createClient)(
      datasourceOptions.projectUrl,
      datasourceOptions.serviceRoleKey || datasourceOptions.anonKey
    );
    try {
      let result;
      switch (queryType) {
        case "select": {
          let query = supabase.from(table).select(columns || "*");
          if (filters && Array.isArray(filters)) {
            for (const filter of filters) {
              query = query[filter.operator](filter.column, filter.value);
            }
          }
          if (orderBy) {
            query = query.order(orderBy, { ascending: ascending !== false });
          }
          if (limit) {
            query = query.limit(limit);
          }
          const { data: selectData, error } = await query;
          if (error) throw error;
          result = selectData;
          break;
        }
        case "insert": {
          const insertData = typeof data === "string" ? JSON.parse(data) : data;
          const { data: insertedData, error } = await supabase.from(table).insert(insertData).select();
          if (error) throw error;
          result = insertedData;
          break;
        }
        case "update": {
          const updateData = typeof data === "string" ? JSON.parse(data) : data;
          let query = supabase.from(table).update(updateData);
          if (filters && Array.isArray(filters)) {
            for (const filter of filters) {
              query = query[filter.operator](filter.column, filter.value);
            }
          }
          const { data: updatedData, error } = await query.select();
          if (error) throw error;
          result = updatedData;
          break;
        }
        case "delete": {
          let query = supabase.from(table).delete();
          if (filters && Array.isArray(filters)) {
            for (const filter of filters) {
              query = query[filter.operator](filter.column, filter.value);
            }
          }
          const { data: deletedData, error } = await query.select();
          if (error) throw error;
          result = deletedData;
          break;
        }
        case "rpc": {
          const args = typeof functionArgs === "string" ? JSON.parse(functionArgs) : functionArgs;
          const { data: rpcData, error } = await supabase.rpc(functionName, args || {});
          if (error) throw error;
          result = rpcData;
          break;
        }
        default:
          throw new Error(`Unsupported query type: ${queryType}`);
      }
      return result;
    } catch (error) {
      Logger.log("error", {
        message: "supabase:SupabaseDataSource:execute:catch",
        params: error.message || error
      });
      throw new Error(`Supabase query failed: ${error.message || error}`);
    }
  }
};

// src/data-sources/bigquery/datasource.js
var import_bigquery = require("@google-cloud/bigquery");
var BigQueryDataSource = class extends DataSource {
  async execute(dataQueryOptions2, context) {
    Logger.log("info", {
      message: "bigquery:BigQueryDataSource:execute:params",
      params: { dataQueryOptions: dataQueryOptions2 }
    });
    const { query, useLegacySql, args } = dataQueryOptions2;
    const datasourceOptions = this.config.datasourceOptions;
    let bigquery;
    if (datasourceOptions?.credentials) {
      const credentials = typeof datasourceOptions.credentials === "string" ? JSON.parse(datasourceOptions.credentials) : datasourceOptions.credentials;
      bigquery = new import_bigquery.BigQuery({
        projectId: datasourceOptions.projectId,
        credentials
      });
    } else if (datasourceOptions?.keyFilePath) {
      bigquery = new import_bigquery.BigQuery({
        projectId: datasourceOptions.projectId,
        keyFilename: datasourceOptions.keyFilePath
      });
    } else {
      bigquery = new import_bigquery.BigQuery({
        projectId: datasourceOptions.projectId
      });
    }
    try {
      const options = {
        query,
        useLegacySql: useLegacySql || false,
        location: datasourceOptions?.location || "US"
      };
      if (args && Array.isArray(args) && args.length > 0) {
        options.params = {};
        for (const arg of args) {
          options.params[arg.key] = context?.[arg.key] || null;
        }
      }
      const [rows] = await bigquery.query(options);
      Logger.log("info", {
        message: "bigquery:BigQueryDataSource:execute:success",
        params: { rowCount: rows.length }
      });
      return rows;
    } catch (error) {
      Logger.log("error", {
        message: "bigquery:BigQueryDataSource:execute:catch",
        params: error.message || error
      });
      throw new Error(`BigQuery query failed: ${error.message || error}`);
    }
  }
};

// src/data-sources/airtable/datasource.js
var import_airtable = __toESM(require("airtable"));
var AirtableDataSource = class extends DataSource {
  async execute(dataQueryOptions2, context) {
    Logger.log("info", {
      message: "airtable:AirtableDataSource:execute:params",
      params: { dataQueryOptions: dataQueryOptions2 }
    });
    const {
      operation,
      tableName,
      recordId,
      fields,
      filterByFormula,
      maxRecords,
      sortField,
      sortDirection,
      view
    } = dataQueryOptions2;
    const datasourceOptions = this.config.datasourceOptions;
    import_airtable.default.configure({
      apiKey: datasourceOptions.apiKey
    });
    const base = import_airtable.default.base(datasourceOptions.baseId);
    const table = base(tableName);
    try {
      let result;
      switch (operation) {
        case "list": {
          const selectOptions = {};
          if (filterByFormula) {
            selectOptions.filterByFormula = filterByFormula;
          }
          if (maxRecords) {
            selectOptions.maxRecords = maxRecords;
          }
          if (view) {
            selectOptions.view = view;
          }
          if (sortField) {
            selectOptions.sort = [{ field: sortField, direction: sortDirection || "asc" }];
          }
          const records = await table.select(selectOptions).all();
          result = records.map((record) => ({
            id: record.id,
            ...record.fields
          }));
          break;
        }
        case "find": {
          const record = await table.find(recordId);
          result = {
            id: record.id,
            ...record.fields
          };
          break;
        }
        case "create": {
          const fieldsData = typeof fields === "string" ? JSON.parse(fields) : fields;
          const record = await table.create(fieldsData);
          result = {
            id: record.id,
            ...record.fields
          };
          break;
        }
        case "update": {
          const updateFields = typeof fields === "string" ? JSON.parse(fields) : fields;
          const record = await table.update(recordId, updateFields);
          result = {
            id: record.id,
            ...record.fields
          };
          break;
        }
        case "delete": {
          const deletedRecord = await table.destroy(recordId);
          result = {
            id: deletedRecord.id,
            deleted: true
          };
          break;
        }
        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }
      Logger.log("info", {
        message: "airtable:AirtableDataSource:execute:success"
      });
      return result;
    } catch (error) {
      Logger.log("error", {
        message: "airtable:AirtableDataSource:execute:catch",
        params: error.message || error
      });
      throw new Error(`Airtable operation failed: ${error.message || error}`);
    }
  }
};

// src/data-sources/s3/datasource.js
var import_client_s3 = require("@aws-sdk/client-s3");
var S3DataSource = class extends DataSource {
  async execute(dataQueryOptions2, context) {
    Logger.log("info", {
      message: "s3:S3DataSource:execute:params",
      params: { dataQueryOptions: dataQueryOptions2 }
    });
    const {
      operation,
      bucket,
      prefix,
      key,
      body,
      contentType,
      maxKeys,
      responseType
    } = dataQueryOptions2;
    const datasourceOptions = this.config.datasourceOptions;
    const targetBucket = bucket || datasourceOptions.bucket;
    const config = {
      region: datasourceOptions.region || "us-east-1",
      credentials: {
        accessKeyId: datasourceOptions.accessKeyId,
        secretAccessKey: datasourceOptions.secretAccessKey
      }
    };
    if (datasourceOptions.endpoint) {
      config.endpoint = datasourceOptions.endpoint;
      config.forcePathStyle = true;
    }
    const client = new import_client_s3.S3Client(config);
    try {
      let result;
      switch (operation) {
        case "listObjects": {
          const command = new import_client_s3.ListObjectsV2Command({
            Bucket: targetBucket,
            Prefix: prefix || "",
            MaxKeys: maxKeys || 1e3
          });
          const response = await client.send(command);
          result = {
            contents: response.Contents || [],
            isTruncated: response.IsTruncated,
            keyCount: response.KeyCount
          };
          break;
        }
        case "getObject": {
          const command = new import_client_s3.GetObjectCommand({
            Bucket: targetBucket,
            Key: key
          });
          const response = await client.send(command);
          const streamToString = async (stream) => {
            const chunks = [];
            for await (const chunk of stream) {
              chunks.push(chunk);
            }
            return Buffer.concat(chunks);
          };
          const bodyBuffer = await streamToString(response.Body);
          if (responseType === "json") {
            result = JSON.parse(bodyBuffer.toString("utf-8"));
          } else if (responseType === "base64") {
            result = bodyBuffer.toString("base64");
          } else {
            result = bodyBuffer.toString("utf-8");
          }
          break;
        }
        case "putObject": {
          const command = new import_client_s3.PutObjectCommand({
            Bucket: targetBucket,
            Key: key,
            Body: body,
            ContentType: contentType || "application/octet-stream"
          });
          await client.send(command);
          result = { success: true, key };
          break;
        }
        case "deleteObject": {
          const command = new import_client_s3.DeleteObjectCommand({
            Bucket: targetBucket,
            Key: key
          });
          await client.send(command);
          result = { success: true, deleted: key };
          break;
        }
        case "headObject": {
          const command = new import_client_s3.HeadObjectCommand({
            Bucket: targetBucket,
            Key: key
          });
          const response = await client.send(command);
          result = {
            contentLength: response.ContentLength,
            contentType: response.ContentType,
            lastModified: response.LastModified,
            eTag: response.ETag,
            metadata: response.Metadata
          };
          break;
        }
        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }
      Logger.log("info", {
        message: "s3:S3DataSource:execute:success"
      });
      return result;
    } catch (error) {
      Logger.log("error", {
        message: "s3:S3DataSource:execute:catch",
        params: error.message || error
      });
      throw new Error(`S3 operation failed: ${error.message || error}`);
    }
  }
};

// src/data-sources/elasticsearch/datasource.js
var import_elasticsearch = require("@elastic/elasticsearch");
var ElasticsearchDataSource = class extends DataSource {
  getClient() {
    const datasourceOptions = this.config.datasourceOptions;
    let clientConfig = {};
    switch (datasourceOptions?.authType) {
      case "none":
        clientConfig = { node: datasourceOptions.node };
        break;
      case "basic":
        clientConfig = {
          node: datasourceOptions.node,
          auth: {
            username: datasourceOptions.username,
            password: datasourceOptions.password
          }
        };
        break;
      case "apiKey":
        clientConfig = {
          node: datasourceOptions.node,
          auth: { apiKey: datasourceOptions.apiKey }
        };
        break;
      case "cloud":
        clientConfig = {
          cloud: { id: datasourceOptions.cloudId },
          auth: { apiKey: datasourceOptions.apiKey }
        };
        break;
      default:
        clientConfig = { node: datasourceOptions?.node };
    }
    return new import_elasticsearch.Client(clientConfig);
  }
  async execute(dataQueryOptions2, context) {
    Logger.log("info", {
      message: "elasticsearch:ElasticsearchDataSource:execute:params",
      params: { dataQueryOptions: dataQueryOptions2 }
    });
    const {
      operation,
      index,
      documentId,
      query,
      body,
      size,
      from,
      sort
    } = dataQueryOptions2;
    const client = this.getClient();
    try {
      let result;
      switch (operation) {
        case "search": {
          const queryDSL = typeof query === "string" ? JSON.parse(query) : query;
          const sortParsed = sort ? typeof sort === "string" ? JSON.parse(sort) : sort : void 0;
          const response = await client.search({
            index,
            query: queryDSL,
            size: size || 10,
            from: from || 0,
            sort: sortParsed
          });
          result = {
            hits: response.hits.hits.map((hit) => ({
              _id: hit._id,
              _score: hit._score,
              ...hit._source
            })),
            total: response.hits.total,
            took: response.took
          };
          break;
        }
        case "get": {
          const response = await client.get({
            index,
            id: documentId
          });
          result = {
            _id: response._id,
            found: response.found,
            ...response._source
          };
          break;
        }
        case "index": {
          const docBody = typeof body === "string" ? JSON.parse(body) : body;
          const response = await client.index({
            index,
            id: documentId || void 0,
            document: docBody
          });
          result = {
            _id: response._id,
            result: response.result
          };
          break;
        }
        case "update": {
          const updateBody = typeof body === "string" ? JSON.parse(body) : body;
          const response = await client.update({
            index,
            id: documentId,
            doc: updateBody
          });
          result = {
            _id: response._id,
            result: response.result
          };
          break;
        }
        case "delete": {
          const response = await client.delete({
            index,
            id: documentId
          });
          result = {
            _id: response._id,
            result: response.result
          };
          break;
        }
        case "count": {
          const countQuery = typeof query === "string" ? JSON.parse(query) : query;
          const response = await client.count({
            index,
            query: countQuery
          });
          result = {
            count: response.count
          };
          break;
        }
        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }
      Logger.log("info", {
        message: "elasticsearch:ElasticsearchDataSource:execute:success"
      });
      return result;
    } catch (error) {
      Logger.log("error", {
        message: "elasticsearch:ElasticsearchDataSource:execute:catch",
        params: error.message || error
      });
      throw new Error(`Elasticsearch operation failed: ${error.message || error}`);
    }
  }
};

// src/data-sources/stripe/datasource.js
var import_stripe = __toESM(require("stripe"));
var StripeDataSource = class extends DataSource {
  getStripeClient() {
    const datasourceOptions = this.config.datasourceOptions;
    const config = {};
    if (datasourceOptions?.apiVersion) {
      config.apiVersion = datasourceOptions.apiVersion;
    }
    return new import_stripe.default(datasourceOptions?.secretKey, config);
  }
  async execute(dataQueryOptions2, context) {
    Logger.log("info", {
      message: "stripe:StripeDataSource:execute:params",
      params: { dataQueryOptions: dataQueryOptions2 }
    });
    const {
      resource,
      operation,
      resourceId,
      params,
      limit,
      startingAfter,
      expand
    } = dataQueryOptions2;
    const stripe = this.getStripeClient();
    try {
      let result;
      const parsedParams = params ? typeof params === "string" ? JSON.parse(params) : params : {};
      const resourceMap = {
        customers: stripe.customers,
        charges: stripe.charges,
        paymentIntents: stripe.paymentIntents,
        invoices: stripe.invoices,
        subscriptions: stripe.subscriptions,
        products: stripe.products,
        prices: stripe.prices,
        refunds: stripe.refunds,
        balanceTransactions: stripe.balanceTransactions,
        payouts: stripe.payouts
      };
      const stripeResource = resourceMap[resource];
      if (!stripeResource) {
        throw new Error(`Unsupported resource: ${resource}`);
      }
      switch (operation) {
        case "list": {
          const listParams = {
            ...parsedParams,
            limit: limit || 10
          };
          if (startingAfter) {
            listParams.starting_after = startingAfter;
          }
          if (expand && expand.length > 0) {
            listParams.expand = expand;
          }
          const response = await stripeResource.list(listParams);
          result = {
            data: response.data,
            hasMore: response.has_more,
            url: response.url
          };
          break;
        }
        case "retrieve": {
          const retrieveParams = {};
          if (expand && expand.length > 0) {
            retrieveParams.expand = expand;
          }
          result = await stripeResource.retrieve(resourceId, retrieveParams);
          break;
        }
        case "create": {
          const createParams = { ...parsedParams };
          if (expand && expand.length > 0) {
            createParams.expand = expand;
          }
          result = await stripeResource.create(createParams);
          break;
        }
        case "update": {
          const updateParams = { ...parsedParams };
          if (expand && expand.length > 0) {
            updateParams.expand = expand;
          }
          result = await stripeResource.update(resourceId, updateParams);
          break;
        }
        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }
      Logger.log("info", {
        message: "stripe:StripeDataSource:execute:success"
      });
      return result;
    } catch (error) {
      Logger.log("error", {
        message: "stripe:StripeDataSource:execute:catch",
        params: error.message || error
      });
      throw new Error(`Stripe operation failed: ${error.message || error}`);
    }
  }
};

// src/data-sources/oracle/datasource.js
var import_oracledb = __toESM(require("oracledb"));
var OracleDataSource = class extends DataSource {
  async execute(dataQueryOptions2, context) {
    Logger.log("info", {
      message: "oracle:OracleDataSource:execute:params",
      params: { dataQueryOptions: dataQueryOptions2 }
    });
    const { query } = dataQueryOptions2;
    const datasourceOptions = this.config.datasourceOptions;
    let connection;
    try {
      if (datasourceOptions?.connectionString) {
        connection = await import_oracledb.default.getConnection({
          connectionString: datasourceOptions.connectionString,
          user: datasourceOptions.user,
          password: datasourceOptions.password
        });
      } else {
        const details = datasourceOptions?.connectionDetails || datasourceOptions;
        connection = await import_oracledb.default.getConnection({
          user: details?.user,
          password: details?.password,
          connectString: `${details?.host}:${details?.port || 1521}/${details?.serviceName}`
        });
      }
      const result = await connection.execute(query, [], { outFormat: import_oracledb.default.OUT_FORMAT_OBJECT });
      return result.rows;
    } catch (error) {
      Logger.log("error", {
        message: "oracle:OracleDataSource:execute:catch",
        params: error.message || error
      });
      throw new Error(`Oracle query failed: ${error.message || error}`);
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
};

// src/data-sources/sqlite/datasource.js
var import_better_sqlite3 = __toESM(require("better-sqlite3"));
var SQLiteDataSource = class extends DataSource {
  async execute(dataQueryOptions2, context) {
    Logger.log("info", {
      message: "sqlite:SQLiteDataSource:execute:params",
      params: { dataQueryOptions: dataQueryOptions2 }
    });
    const { query } = dataQueryOptions2;
    const datasourceOptions = this.config.datasourceOptions;
    let db;
    try {
      db = new import_better_sqlite3.default(datasourceOptions?.databasePath, {
        readonly: datasourceOptions?.readonly || false
      });
      const stmt = db.prepare(query);
      const isSelect = query.trim().toUpperCase().startsWith("SELECT");
      if (isSelect) {
        return stmt.all();
      } else {
        return stmt.run();
      }
    } catch (error) {
      Logger.log("error", {
        message: "sqlite:SQLiteDataSource:execute:catch",
        params: error.message || error
      });
      throw new Error(`SQLite query failed: ${error.message || error}`);
    } finally {
      if (db) {
        db.close();
      }
    }
  }
};

// src/data-sources/cockroachdb/datasource.js
var import_pg3 = require("pg");
var CockroachDBDataSource = class extends DataSource {
  async execute(dataQueryOptions2, context) {
    Logger.log("info", {
      message: "cockroachdb:CockroachDBDataSource:execute:params",
      params: { dataQueryOptions: dataQueryOptions2 }
    });
    const { query } = dataQueryOptions2;
    const datasourceOptions = this.config.datasourceOptions;
    const client = new import_pg3.Client({
      connectionString: datasourceOptions?.connectionString,
      ssl: datasourceOptions?.ssl ? { rejectUnauthorized: false } : false
    });
    try {
      await client.connect();
      const result = await client.query(query);
      return result.rows;
    } catch (error) {
      Logger.log("error", {
        message: "cockroachdb:CockroachDBDataSource:execute:catch",
        params: error.message || error
      });
      throw new Error(`CockroachDB query failed: ${error.message || error}`);
    } finally {
      await client.end();
    }
  }
};

// src/data-sources/neo4j/datasource.js
var import_neo4j_driver = __toESM(require("neo4j-driver"));
var Neo4jDataSource = class extends DataSource {
  async execute(dataQueryOptions2, context) {
    Logger.log("info", {
      message: "neo4j:Neo4jDataSource:execute:params",
      params: { dataQueryOptions: dataQueryOptions2 }
    });
    const { query, args } = dataQueryOptions2;
    const datasourceOptions = this.config.datasourceOptions;
    const driver = import_neo4j_driver.default.driver(
      datasourceOptions?.uri,
      import_neo4j_driver.default.auth.basic(datasourceOptions?.username, datasourceOptions?.password)
    );
    const session = driver.session({
      database: datasourceOptions?.database || "neo4j"
    });
    try {
      const params = {};
      if (args && Array.isArray(args)) {
        for (const arg of args) {
          params[arg.key] = context?.[arg.key] || null;
        }
      }
      const result = await session.run(query, params);
      return result.records.map((record) => record.toObject());
    } catch (error) {
      Logger.log("error", {
        message: "neo4j:Neo4jDataSource:execute:catch",
        params: error.message || error
      });
      throw new Error(`Neo4j query failed: ${error.message || error}`);
    } finally {
      await session.close();
      await driver.close();
    }
  }
};

// src/data-sources/twilio/datasource.js
var import_twilio = __toESM(require("twilio"));
var TwilioDataSource = class extends DataSource {
  async execute(dataQueryOptions2, context) {
    Logger.log("info", {
      message: "twilio:TwilioDataSource:execute:params",
      params: { dataQueryOptions: dataQueryOptions2 }
    });
    const { resource, operation, resourceSid, params, limit } = dataQueryOptions2;
    const datasourceOptions = this.config.datasourceOptions;
    const client = (0, import_twilio.default)(datasourceOptions?.accountSid, datasourceOptions?.authToken);
    const parsedParams = params ? typeof params === "string" ? JSON.parse(params) : params : {};
    try {
      let result;
      switch (resource) {
        case "messages":
          if (operation === "list") {
            result = await client.messages.list({ limit: limit || 20, ...parsedParams });
          } else if (operation === "fetch") {
            result = await client.messages(resourceSid).fetch();
          } else if (operation === "create") {
            result = await client.messages.create(parsedParams);
          }
          break;
        case "calls":
          if (operation === "list") {
            result = await client.calls.list({ limit: limit || 20, ...parsedParams });
          } else if (operation === "fetch") {
            result = await client.calls(resourceSid).fetch();
          } else if (operation === "create") {
            result = await client.calls.create(parsedParams);
          }
          break;
        case "accounts":
          if (operation === "list") {
            result = await client.api.accounts.list({ limit: limit || 20 });
          } else if (operation === "fetch") {
            result = await client.api.accounts(resourceSid || datasourceOptions?.accountSid).fetch();
          }
          break;
        case "phonenumbers":
          if (operation === "list") {
            result = await client.incomingPhoneNumbers.list({ limit: limit || 20 });
          }
          break;
        default:
          throw new Error(`Unsupported resource: ${resource}`);
      }
      return result;
    } catch (error) {
      Logger.log("error", {
        message: "twilio:TwilioDataSource:execute:catch",
        params: error.message || error
      });
      throw new Error(`Twilio operation failed: ${error.message || error}`);
    }
  }
};

// src/data-sources/sendgrid/datasource.js
var import_mail = __toESM(require("@sendgrid/mail"));
var import_client = __toESM(require("@sendgrid/client"));
var SendGridDataSource = class extends DataSource {
  async execute(dataQueryOptions2, context) {
    Logger.log("info", {
      message: "sendgrid:SendGridDataSource:execute:params",
      params: { dataQueryOptions: dataQueryOptions2 }
    });
    const { resource, operation, params, startDate, endDate } = dataQueryOptions2;
    const datasourceOptions = this.config.datasourceOptions;
    import_client.default.setApiKey(datasourceOptions?.apiKey);
    import_mail.default.setApiKey(datasourceOptions?.apiKey);
    const parsedParams = params ? typeof params === "string" ? JSON.parse(params) : params : {};
    try {
      let result;
      switch (resource) {
        case "stats":
          if (operation === "list") {
            const queryParams = { start_date: startDate || "2024-01-01" };
            if (endDate) queryParams.end_date = endDate;
            const [response] = await import_client.default.request({
              method: "GET",
              url: "/v3/stats",
              qs: queryParams
            });
            result = response.body;
          }
          break;
        case "messages":
          if (operation === "send") {
            result = await import_mail.default.send(parsedParams);
          }
          break;
        case "contacts":
          if (operation === "list") {
            const [response] = await import_client.default.request({
              method: "GET",
              url: "/v3/marketing/contacts"
            });
            result = response.body;
          }
          break;
        case "templates":
          if (operation === "list") {
            const [response] = await import_client.default.request({
              method: "GET",
              url: "/v3/templates",
              qs: { generations: "dynamic" }
            });
            result = response.body;
          }
          break;
        case "suppressions":
          if (operation === "list") {
            const [response] = await import_client.default.request({
              method: "GET",
              url: "/v3/suppression/bounces"
            });
            result = response.body;
          }
          break;
        default:
          throw new Error(`Unsupported resource: ${resource}`);
      }
      return result;
    } catch (error) {
      Logger.log("error", {
        message: "sendgrid:SendGridDataSource:execute:catch",
        params: error.message || error
      });
      throw new Error(`SendGrid operation failed: ${error.message || error}`);
    }
  }
};

// src/data-sources/slack/datasource.js
var import_web_api = require("@slack/web-api");
var SlackDataSource = class extends DataSource {
  async execute(dataQueryOptions2, context) {
    Logger.log("info", {
      message: "slack:SlackDataSource:execute:params",
      params: { dataQueryOptions: dataQueryOptions2 }
    });
    const { resource, operation, channelId, userId, message, limit } = dataQueryOptions2;
    const datasourceOptions = this.config.datasourceOptions;
    const client = new import_web_api.WebClient(datasourceOptions?.botToken);
    try {
      let result;
      switch (resource) {
        case "channels":
          if (operation === "list") {
            result = await client.conversations.list({ limit: limit || 100 });
          } else if (operation === "info") {
            result = await client.conversations.info({ channel: channelId });
          }
          break;
        case "users":
          if (operation === "list") {
            result = await client.users.list({ limit: limit || 100 });
          } else if (operation === "info") {
            result = await client.users.info({ user: userId });
          }
          break;
        case "messages":
        case "conversations":
          if (operation === "history") {
            result = await client.conversations.history({ channel: channelId, limit: limit || 100 });
          } else if (operation === "post") {
            result = await client.chat.postMessage({ channel: channelId, text: message });
          }
          break;
        default:
          throw new Error(`Unsupported resource: ${resource}`);
      }
      return result;
    } catch (error) {
      Logger.log("error", {
        message: "slack:SlackDataSource:execute:catch",
        params: error.message || error
      });
      throw new Error(`Slack operation failed: ${error.message || error}`);
    }
  }
};

// src/data-sources/notion/datasource.js
var import_client2 = require("@notionhq/client");
var NotionDataSource = class extends DataSource {
  async execute(dataQueryOptions2, context) {
    Logger.log("info", {
      message: "notion:NotionDataSource:execute:params",
      params: { dataQueryOptions: dataQueryOptions2 }
    });
    const { resource, operation, databaseId, pageId, filter, sorts, searchQuery, pageSize } = dataQueryOptions2;
    const datasourceOptions = this.config.datasourceOptions;
    const notion = new import_client2.Client({ auth: datasourceOptions?.apiToken });
    try {
      let result;
      const parsedFilter = filter ? typeof filter === "string" ? JSON.parse(filter) : filter : void 0;
      const parsedSorts = sorts ? typeof sorts === "string" ? JSON.parse(sorts) : sorts : void 0;
      switch (resource) {
        case "databases":
          if (operation === "list") {
            result = await notion.search({ filter: { property: "object", value: "database" }, page_size: pageSize || 100 });
          } else if (operation === "query") {
            result = await notion.databases.query({
              database_id: databaseId,
              filter: parsedFilter,
              sorts: parsedSorts,
              page_size: pageSize || 100
            });
          } else if (operation === "retrieve") {
            result = await notion.databases.retrieve({ database_id: databaseId });
          }
          break;
        case "pages":
          if (operation === "retrieve") {
            result = await notion.pages.retrieve({ page_id: pageId });
          } else if (operation === "create") {
            result = await notion.pages.create(parsedFilter);
          } else if (operation === "update") {
            result = await notion.pages.update({ page_id: pageId, ...parsedFilter });
          }
          break;
        case "blocks":
          if (operation === "list") {
            result = await notion.blocks.children.list({ block_id: pageId, page_size: pageSize || 100 });
          } else if (operation === "retrieve") {
            result = await notion.blocks.retrieve({ block_id: pageId });
          }
          break;
        case "users":
          if (operation === "list") {
            result = await notion.users.list({ page_size: pageSize || 100 });
          }
          break;
        case "search":
          result = await notion.search({ query: searchQuery, page_size: pageSize || 100 });
          break;
        default:
          throw new Error(`Unsupported resource: ${resource}`);
      }
      return result;
    } catch (error) {
      Logger.log("error", {
        message: "notion:NotionDataSource:execute:catch",
        params: error.message || error
      });
      throw new Error(`Notion operation failed: ${error.message || error}`);
    }
  }
};

// src/data-sources/jira/datasource.js
var JiraDataSource = class extends DataSource {
  getAuthHeader() {
    const datasourceOptions = this.config.datasourceOptions;
    return Buffer.from(`${datasourceOptions?.email}:${datasourceOptions?.apiToken}`).toString("base64");
  }
  async execute(dataQueryOptions2, context) {
    Logger.log("info", {
      message: "jira:JiraDataSource:execute:params",
      params: { dataQueryOptions: dataQueryOptions2 }
    });
    const { resource, operation, jql, issueKey, projectKey, fields, maxResults, startAt } = dataQueryOptions2;
    const datasourceOptions = this.config.datasourceOptions;
    const auth = this.getAuthHeader();
    const baseUrl = datasourceOptions?.host;
    try {
      let result;
      switch (resource) {
        case "issues":
          if (operation === "search") {
            const params = new URLSearchParams({
              jql: jql || "ORDER BY created DESC",
              maxResults: String(maxResults || 50),
              startAt: String(startAt || 0)
            });
            if (fields) params.append("fields", fields);
            const response = await fetch(`${baseUrl}/rest/api/3/search?${params}`, {
              headers: { Authorization: `Basic ${auth}`, Accept: "application/json" }
            });
            result = await response.json();
          } else if (operation === "get") {
            const params = fields ? `?fields=${fields}` : "";
            const response = await fetch(`${baseUrl}/rest/api/3/issue/${issueKey}${params}`, {
              headers: { Authorization: `Basic ${auth}`, Accept: "application/json" }
            });
            result = await response.json();
          }
          break;
        case "projects":
          if (operation === "search") {
            const response = await fetch(`${baseUrl}/rest/api/3/project/search?maxResults=${maxResults || 50}&startAt=${startAt || 0}`, {
              headers: { Authorization: `Basic ${auth}`, Accept: "application/json" }
            });
            result = await response.json();
          } else if (operation === "get") {
            const response = await fetch(`${baseUrl}/rest/api/3/project/${projectKey}`, {
              headers: { Authorization: `Basic ${auth}`, Accept: "application/json" }
            });
            result = await response.json();
          }
          break;
        case "users":
          if (operation === "search") {
            const response = await fetch(`${baseUrl}/rest/api/3/users/search?maxResults=${maxResults || 50}&startAt=${startAt || 0}`, {
              headers: { Authorization: `Basic ${auth}`, Accept: "application/json" }
            });
            result = await response.json();
          }
          break;
        case "boards":
          if (operation === "search") {
            const response = await fetch(`${baseUrl}/rest/agile/1.0/board?maxResults=${maxResults || 50}&startAt=${startAt || 0}`, {
              headers: { Authorization: `Basic ${auth}`, Accept: "application/json" }
            });
            result = await response.json();
          }
          break;
        case "sprints":
          if (operation === "search") {
            const response = await fetch(`${baseUrl}/rest/agile/1.0/board/${projectKey}/sprint?maxResults=${maxResults || 50}&startAt=${startAt || 0}`, {
              headers: { Authorization: `Basic ${auth}`, Accept: "application/json" }
            });
            result = await response.json();
          }
          break;
        default:
          throw new Error(`Unsupported resource: ${resource}`);
      }
      return result;
    } catch (error) {
      Logger.log("error", {
        message: "jira:JiraDataSource:execute:catch",
        params: error.message || error
      });
      throw new Error(`Jira operation failed: ${error.message || error}`);
    }
  }
};

// src/data-sources/googleanalytics/datasource.js
var import_data = require("@google-analytics/data");
var GoogleAnalyticsDataSource = class extends DataSource {
  async execute(dataQueryOptions2, context) {
    Logger.log("info", {
      message: "googleanalytics:GoogleAnalyticsDataSource:execute:params",
      params: { dataQueryOptions: dataQueryOptions2 }
    });
    const { reportType, dateRanges, dimensions, metrics, limit } = dataQueryOptions2;
    const datasourceOptions = this.config.datasourceOptions;
    let clientConfig = {};
    if (datasourceOptions?.credentials) {
      const credentials = typeof datasourceOptions.credentials === "string" ? JSON.parse(datasourceOptions.credentials) : datasourceOptions.credentials;
      clientConfig = { credentials };
    }
    const analyticsDataClient = new import_data.BetaAnalyticsDataClient(clientConfig);
    try {
      let result;
      if (reportType === "runReport") {
        const [response] = await analyticsDataClient.runReport({
          property: `properties/${datasourceOptions?.propertyId}`,
          dateRanges: dateRanges || [{ startDate: "30daysAgo", endDate: "today" }],
          dimensions: dimensions || [],
          metrics: metrics || [{ name: "activeUsers" }],
          limit: limit || 1e4
        });
        result = {
          rows: response.rows?.map((row) => ({
            dimensions: row.dimensionValues?.map((d) => d.value),
            metrics: row.metricValues?.map((m) => m.value)
          })) || [],
          dimensionHeaders: response.dimensionHeaders?.map((h) => h.name),
          metricHeaders: response.metricHeaders?.map((h) => h.name),
          rowCount: response.rowCount
        };
      } else if (reportType === "runRealtimeReport") {
        const [response] = await analyticsDataClient.runRealtimeReport({
          property: `properties/${datasourceOptions?.propertyId}`,
          dimensions: dimensions || [],
          metrics: metrics || [{ name: "activeUsers" }],
          limit: limit || 1e4
        });
        result = {
          rows: response.rows?.map((row) => ({
            dimensions: row.dimensionValues?.map((d) => d.value),
            metrics: row.metricValues?.map((m) => m.value)
          })) || [],
          dimensionHeaders: response.dimensionHeaders?.map((h) => h.name),
          metricHeaders: response.metricHeaders?.map((h) => h.name),
          rowCount: response.rowCount
        };
      } else {
        throw new Error(`Unsupported report type: ${reportType}`);
      }
      return result;
    } catch (error) {
      Logger.log("error", {
        message: "googleanalytics:GoogleAnalyticsDataSource:execute:catch",
        params: error.message || error
      });
      throw new Error(`Google Analytics query failed: ${error.message || error}`);
    }
  }
};

// src/data-sources/syslog/datasource.js
var import_dgram = __toESM(require("dgram"));
var SyslogDataSource = class extends DataSource {
  async execute(dataQueryOptions2, context) {
    throw new Error("Syslog is a listener-only datasource.");
  }
  async subscribe(config, onEvent) {
    const dsOptions = this.config.datasourceOptions || {};
    const port = dsOptions.port || config.port || 514;
    const address = dsOptions.address || config.address || "0.0.0.0";
    Logger.log("info", {
      message: "syslog:subscribe:start",
      params: { port, address, datasourceID: this.config.datasourceID }
    });
    const server = import_dgram.default.createSocket("udp4");
    server.on("message", (msg, rinfo) => {
      const messageStr = msg.toString();
      onEvent({ source: `${rinfo.address}:${rinfo.port}`, payload: messageStr });
    });
    server.on("error", (error) => {
      Logger.log("error", {
        message: "syslog:subscribe:error",
        params: { error: error.message }
      });
      server.close();
    });
    return new Promise((resolve, reject) => {
      server.bind(port, address, () => {
        resolve({ server });
      });
    });
  }
  async unsubscribe(handle) {
    if (!handle || !handle.server) return;
    Logger.log("info", {
      message: "syslog:unsubscribe",
      params: { datasourceID: this.config.datasourceID }
    });
    try {
      handle.server.close();
    } catch (e) {
      Logger.log("error", {
        message: "syslog:unsubscribe:error",
        params: { error: e.message }
      });
    }
  }
};

// src/data-sources/index.js
var dataSources = {
  postgresql: PostgreSQLDataSource,
  restapi: RestAPIDataSource,
  weburl: WebURLDataSource,
  firestore: FirestoreDataSource,
  mysql: MySQLDataSource,
  mongodb: MongoDBDataSource,
  googlesheets: GoogleSheetsDataSource,
  graphql: GraphQLDataSource,
  rabbitmq: RabbitMQDataSource,
  kafka: KafkaDataSource,
  redis: RedisDataSource,
  // Batch 1 datasources
  mssql: MSSQLDataSource,
  supabase: SupabaseDataSource,
  bigquery: BigQueryDataSource,
  airtable: AirtableDataSource,
  s3: S3DataSource,
  elasticsearch: ElasticsearchDataSource,
  stripe: StripeDataSource,
  // Batch 2 datasources
  oracle: OracleDataSource,
  sqlite: SQLiteDataSource,
  cockroachdb: CockroachDBDataSource,
  neo4j: Neo4jDataSource,
  twilio: TwilioDataSource,
  sendgrid: SendGridDataSource,
  slack: SlackDataSource,
  notion: NotionDataSource,
  jira: JiraDataSource,
  googleanalytics: GoogleAnalyticsDataSource,
  // Listeners
  syslog: SyslogDataSource
};
var data_sources_default = {
  getDataSource(type) {
    const DataSource2 = dataSources[type.toLowerCase()];
    if (!DataSource2) throw new Error(`Unsupported data source: ${type}`);
    return DataSource2;
  },
  registerDataSource(type, implementation) {
    dataSources[type.toLowerCase()] = implementation;
  }
};

// src/data-sources/weburl/connection.js
var import_node_fetch3 = __toESM(require("node-fetch"));
var webURLTestConnection = async ({ datasourceOptions }) => {
  const { url, timeout } = datasourceOptions;
  try {
    Logger.log("info", {
      message: "weburl:webURLTestConnection:params",
      params: { url, timeout }
    });
    const opts = {
      method: "GET",
      headers: {},
      redirect: "follow",
      timeout
    };
    const res = await (0, import_node_fetch3.default)(url, opts);
    const contentTypeHeader = res.headers.get("content-type") || "";
    let parsedBody;
    if (contentTypeHeader.includes("application/json")) {
      parsedBody = await res.json();
    } else {
      parsedBody = await res.text();
    }
    Logger.log("info", {
      message: "weburl:webURLTestConnection:response",
      params: {
        status: res.status,
        statusText: res.statusText,
        body: parsedBody
      }
    });
    return {
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      body: parsedBody
    };
  } catch (err) {
    Logger.log("error", {
      message: "weburl:webURLTestConnection:catch",
      params: err.message || err
    });
    return {
      ok: false,
      error: err.message || err
    };
  }
};

// src/data-sources/firestore/connection.js
var import_app2 = require("firebase-admin/app");
var import_firestore2 = require("firebase-admin/firestore");
var firestoreTestConnection = async ({ datasourceOptions }) => {
  const { projectId, serviceAccountKey, databaseURL } = datasourceOptions;
  let app = null;
  try {
    Logger.log("info", {
      message: "firestore:firestoreTestConnection:params",
      params: { projectId, databaseURL }
    });
    let credential;
    if (serviceAccountKey) {
      try {
        const serviceAccount = typeof serviceAccountKey === "string" ? JSON.parse(serviceAccountKey) : serviceAccountKey;
        credential = (0, import_app2.cert)(serviceAccount);
      } catch (parseError) {
        Logger.log("error", {
          message: "firestore:firestoreTestConnection:parseError",
          params: { error: parseError.message }
        });
        return {
          ok: false,
          error: "Invalid service account JSON: " + parseError.message
        };
      }
    }
    const appName = `test-${Date.now()}`;
    const appConfig = {
      credential,
      projectId
    };
    if (databaseURL) {
      appConfig.databaseURL = databaseURL;
    }
    app = (0, import_app2.initializeApp)(appConfig, appName);
    const db = (0, import_firestore2.getFirestore)(app);
    const collections = await db.listCollections();
    const collectionNames = collections.map((col) => col.id);
    Logger.log("info", {
      message: "firestore:firestoreTestConnection:success",
      params: { projectId, collectionCount: collectionNames.length }
    });
    return {
      ok: true,
      status: 200,
      statusText: "Connected",
      collections: collectionNames
    };
  } catch (error) {
    Logger.log("error", {
      message: "firestore:firestoreTestConnection:catch",
      params: { error: error.message }
    });
    return {
      ok: false,
      error: error.message || error
    };
  } finally {
    if (app) {
      try {
        await (0, import_app2.deleteApp)(app);
      } catch (e) {
      }
    }
  }
};

// src/data-sources/mssql/connection.js
var import_mssql2 = __toESM(require("mssql"));
var mssqlTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "mssql:mssqlTestConnection:params",
      params: { datasourceOptions: { ...datasourceOptions, password: "[REDACTED]" } }
    });
    let config;
    if (datasourceOptions.connectionString) {
      config = datasourceOptions.connectionString;
    } else {
      const details = datasourceOptions.connectionDetails || datasourceOptions;
      config = {
        server: details.server,
        port: details.port || 1433,
        database: details.database,
        user: details.user,
        password: details.password,
        options: {
          encrypt: details.encrypt !== false,
          trustServerCertificate: details.trustServerCertificate || false
        }
      };
    }
    const pool = await import_mssql2.default.connect(config);
    Logger.log("info", {
      message: "mssql:mssqlTestConnection:connected"
    });
    await pool.close();
    Logger.log("info", {
      message: "mssql:mssqlTestConnection:disconnected"
    });
    return {
      ok: true,
      status: 200,
      statusText: "Connected"
    };
  } catch (error) {
    Logger.log("error", {
      message: "mssql:mssqlTestConnection:catch",
      params: { error: error.message || error }
    });
    return {
      ok: false,
      error: error.message || error
    };
  }
};

// src/data-sources/supabase/connection.js
var import_supabase_js2 = require("@supabase/supabase-js");
var supabaseTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "supabase:supabaseTestConnection:params",
      params: { projectUrl: datasourceOptions.projectUrl }
    });
    const supabase = (0, import_supabase_js2.createClient)(
      datasourceOptions.projectUrl,
      datasourceOptions.serviceRoleKey || datasourceOptions.anonKey
    );
    const { data, error } = await supabase.auth.getSession();
    if (error && error.message !== "Auth session missing!") {
      throw error;
    }
    Logger.log("info", {
      message: "supabase:supabaseTestConnection:connected"
    });
    return {
      ok: true,
      status: 200,
      statusText: "Connected"
    };
  } catch (error) {
    Logger.log("error", {
      message: "supabase:supabaseTestConnection:catch",
      params: { error: error.message || error }
    });
    return {
      ok: false,
      error: error.message || error
    };
  }
};

// src/data-sources/bigquery/connection.js
var import_bigquery2 = require("@google-cloud/bigquery");
var bigqueryTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "bigquery:bigqueryTestConnection:params",
      params: { projectId: datasourceOptions.projectId }
    });
    let bigquery;
    if (datasourceOptions.credentials) {
      const credentials = typeof datasourceOptions.credentials === "string" ? JSON.parse(datasourceOptions.credentials) : datasourceOptions.credentials;
      bigquery = new import_bigquery2.BigQuery({
        projectId: datasourceOptions.projectId,
        credentials
      });
    } else if (datasourceOptions.keyFilePath) {
      bigquery = new import_bigquery2.BigQuery({
        projectId: datasourceOptions.projectId,
        keyFilename: datasourceOptions.keyFilePath
      });
    } else {
      bigquery = new import_bigquery2.BigQuery({
        projectId: datasourceOptions.projectId
      });
    }
    const [datasets] = await bigquery.getDatasets({ maxResults: 1 });
    Logger.log("info", {
      message: "bigquery:bigqueryTestConnection:connected",
      params: { datasetsFound: datasets.length }
    });
    return {
      ok: true,
      status: 200,
      statusText: "Connected"
    };
  } catch (error) {
    Logger.log("error", {
      message: "bigquery:bigqueryTestConnection:catch",
      params: { error: error.message || error }
    });
    return {
      ok: false,
      error: error.message || error
    };
  }
};

// src/data-sources/airtable/connection.js
var import_airtable2 = __toESM(require("airtable"));
var airtableTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "airtable:airtableTestConnection:params",
      params: { baseId: datasourceOptions.baseId }
    });
    import_airtable2.default.configure({
      apiKey: datasourceOptions.apiKey
    });
    const base = import_airtable2.default.base(datasourceOptions.baseId);
    const tables = await base.tables();
    Logger.log("info", {
      message: "airtable:airtableTestConnection:connected"
    });
    return {
      ok: true,
      status: 200,
      statusText: "Connected"
    };
  } catch (error) {
    Logger.log("error", {
      message: "airtable:airtableTestConnection:catch",
      params: { error: error.message || error }
    });
    return {
      ok: false,
      error: error.message || error
    };
  }
};

// src/data-sources/s3/connection.js
var import_client_s32 = require("@aws-sdk/client-s3");
var s3TestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "s3:s3TestConnection:params",
      params: { region: datasourceOptions.region }
    });
    const config = {
      region: datasourceOptions.region || "us-east-1",
      credentials: {
        accessKeyId: datasourceOptions.accessKeyId,
        secretAccessKey: datasourceOptions.secretAccessKey
      }
    };
    if (datasourceOptions.endpoint) {
      config.endpoint = datasourceOptions.endpoint;
      config.forcePathStyle = true;
    }
    const client = new import_client_s32.S3Client(config);
    const command = new import_client_s32.ListBucketsCommand({});
    await client.send(command);
    Logger.log("info", {
      message: "s3:s3TestConnection:connected"
    });
    return {
      ok: true,
      status: 200,
      statusText: "Connected"
    };
  } catch (error) {
    Logger.log("error", {
      message: "s3:s3TestConnection:catch",
      params: { error: error.message || error }
    });
    return {
      ok: false,
      error: error.message || error
    };
  }
};

// src/data-sources/elasticsearch/connection.js
var import_elasticsearch2 = require("@elastic/elasticsearch");
var elasticsearchTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "elasticsearch:elasticsearchTestConnection:params",
      params: { authType: datasourceOptions.authType }
    });
    let clientConfig = {};
    switch (datasourceOptions.authType) {
      case "none":
        clientConfig = { node: datasourceOptions.node };
        break;
      case "basic":
        clientConfig = {
          node: datasourceOptions.node,
          auth: {
            username: datasourceOptions.username,
            password: datasourceOptions.password
          }
        };
        break;
      case "apiKey":
        clientConfig = {
          node: datasourceOptions.node,
          auth: { apiKey: datasourceOptions.apiKey }
        };
        break;
      case "cloud":
        clientConfig = {
          cloud: { id: datasourceOptions.cloudId },
          auth: { apiKey: datasourceOptions.apiKey }
        };
        break;
      default:
        clientConfig = { node: datasourceOptions.node };
    }
    const client = new import_elasticsearch2.Client(clientConfig);
    const health = await client.cluster.health();
    Logger.log("info", {
      message: "elasticsearch:elasticsearchTestConnection:connected",
      params: { clusterName: health.cluster_name, status: health.status }
    });
    return {
      ok: true,
      status: 200,
      statusText: `Connected to ${health.cluster_name}`
    };
  } catch (error) {
    Logger.log("error", {
      message: "elasticsearch:elasticsearchTestConnection:catch",
      params: { error: error.message || error }
    });
    return {
      ok: false,
      error: error.message || error
    };
  }
};

// src/data-sources/stripe/connection.js
var import_stripe2 = __toESM(require("stripe"));
var stripeTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "stripe:stripeTestConnection:params"
    });
    const stripeConfig = {};
    if (datasourceOptions.apiVersion) {
      stripeConfig.apiVersion = datasourceOptions.apiVersion;
    }
    const stripe = new import_stripe2.default(datasourceOptions.secretKey, stripeConfig);
    const account = await stripe.accounts.retrieve();
    Logger.log("info", {
      message: "stripe:stripeTestConnection:connected",
      params: { accountId: account.id }
    });
    return {
      ok: true,
      status: 200,
      statusText: "Connected"
    };
  } catch (error) {
    Logger.log("error", {
      message: "stripe:stripeTestConnection:catch",
      params: { error: error.message || error }
    });
    return {
      ok: false,
      error: error.message || error
    };
  }
};

// src/data-sources/googlesheets/connection.js
var import_googleapis2 = require("googleapis");
var googlesheetsTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "googlesheets:googlesheetsTestConnection:params"
    });
    let auth;
    if (datasourceOptions.authType === "serviceAccount" && datasourceOptions.serviceAccountKey) {
      const credentials = typeof datasourceOptions.serviceAccountKey === "string" ? JSON.parse(datasourceOptions.serviceAccountKey) : datasourceOptions.serviceAccountKey;
      auth = new import_googleapis2.google.auth.GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
      });
    } else if (datasourceOptions.authType === "oauth2" && datasourceOptions.oauth2) {
      const { clientId, clientSecret, refreshToken } = datasourceOptions.oauth2;
      const oauth2Client = new import_googleapis2.google.auth.OAuth2(clientId, clientSecret);
      oauth2Client.setCredentials({ refresh_token: refreshToken });
      auth = oauth2Client;
    } else {
      return {
        ok: false,
        error: "Invalid authentication configuration. Provide service account key or OAuth2 credentials."
      };
    }
    const sheets = import_googleapis2.google.sheets({ version: "v4", auth });
    if (datasourceOptions.defaultSpreadsheetId) {
      await sheets.spreadsheets.get({
        spreadsheetId: datasourceOptions.defaultSpreadsheetId
      });
    }
    Logger.log("info", {
      message: "googlesheets:googlesheetsTestConnection:connected"
    });
    return {
      ok: true,
      status: 200,
      statusText: "Connected"
    };
  } catch (error) {
    Logger.log("error", {
      message: "googlesheets:googlesheetsTestConnection:catch",
      params: { error: error.message || error }
    });
    return {
      ok: false,
      error: error.message || error
    };
  }
};

// src/data-sources/graphql/connection.js
var import_axios3 = __toESM(require("axios"));
var graphqlTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "graphql:graphqlTestConnection:params"
    });
    const {
      endpoint,
      authType,
      bearerToken,
      apiKey,
      basicAuth,
      headers: customHeaders = [],
      timeout = 30
    } = datasourceOptions;
    if (!endpoint) {
      return {
        ok: false,
        error: "GraphQL endpoint is required"
      };
    }
    const headers = {
      "Content-Type": "application/json"
    };
    if (authType === "bearer" && bearerToken) {
      headers["Authorization"] = `Bearer ${bearerToken}`;
    } else if (authType === "apiKey" && apiKey?.value) {
      headers[apiKey.headerName || "x-api-key"] = apiKey.value;
    } else if (authType === "basic" && basicAuth?.username && basicAuth?.password) {
      const credentials = Buffer.from(`${basicAuth.username}:${basicAuth.password}`).toString("base64");
      headers["Authorization"] = `Basic ${credentials}`;
    }
    if (customHeaders && Array.isArray(customHeaders)) {
      customHeaders.forEach((header) => {
        if (header.key && header.value) {
          headers[header.key] = header.value;
        }
      });
    }
    const introspectionQuery = `
      query IntrospectionQuery {
        __schema {
          queryType { name }
        }
      }
    `;
    const response = await (0, import_axios3.default)({
      method: "POST",
      url: endpoint,
      headers,
      data: { query: introspectionQuery },
      timeout: timeout * 1e3
    });
    if (response.data?.errors && response.data.errors.length > 0) {
      const errorMessages = response.data.errors.map((e) => e.message).join("; ");
      if (errorMessages.toLowerCase().includes("introspection")) {
        Logger.log("info", {
          message: "graphql:graphqlTestConnection:connected (introspection disabled)"
        });
        return {
          ok: true,
          status: 200,
          statusText: "Connected (introspection disabled)"
        };
      }
    }
    Logger.log("info", {
      message: "graphql:graphqlTestConnection:connected"
    });
    return {
      ok: true,
      status: 200,
      statusText: "Connected"
    };
  } catch (error) {
    Logger.log("error", {
      message: "graphql:graphqlTestConnection:catch",
      params: { error: error.message || error }
    });
    return {
      ok: false,
      error: error.message || error
    };
  }
};

// src/data-sources/mongodb/connection.js
var import_mongodb2 = require("mongodb");
var mongodbTestConnection = async ({ datasourceOptions }) => {
  let client;
  try {
    Logger.log("info", {
      message: "mongodb:mongodbTestConnection:params"
    });
    let connectionString;
    if (datasourceOptions.connectionString) {
      connectionString = datasourceOptions.connectionString;
    } else {
      const details = datasourceOptions.connectionDetails || datasourceOptions;
      const { host, port, database, username, password, authSource, ssl, replicaSet } = details;
      let authPart = "";
      if (username && password) {
        authPart = `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`;
      }
      const params = new URLSearchParams();
      if (authSource) params.append("authSource", authSource);
      if (ssl) params.append("ssl", "true");
      if (replicaSet) params.append("replicaSet", replicaSet);
      const dbName = database || datasourceOptions.database || "test";
      const queryString = params.toString() ? `?${params.toString()}` : "";
      connectionString = `mongodb://${authPart}${host || "localhost"}:${port || 27017}/${dbName}${queryString}`;
    }
    client = new import_mongodb2.MongoClient(connectionString, {
      serverSelectionTimeoutMS: 1e4,
      connectTimeoutMS: 1e4
    });
    await client.connect();
    await client.db().command({ ping: 1 });
    Logger.log("info", {
      message: "mongodb:mongodbTestConnection:connected"
    });
    return {
      ok: true,
      status: 200,
      statusText: "Connected"
    };
  } catch (error) {
    Logger.log("error", {
      message: "mongodb:mongodbTestConnection:catch",
      params: { error: error.message || error }
    });
    return {
      ok: false,
      error: error.message || error
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
};

// src/data-sources/mysql/connection.js
var import_promise2 = __toESM(require("mysql2/promise"));
var mysqlTestConnection = async ({ datasourceOptions }) => {
  let connection;
  try {
    Logger.log("info", {
      message: "mysql:mysqlTestConnection:params"
    });
    let connectionConfig;
    if (datasourceOptions.connectionString) {
      connectionConfig = datasourceOptions.connectionString;
    } else {
      const { host, port, database, user, password, ssl, additionalOptions } = datasourceOptions.connectionDetails || datasourceOptions;
      connectionConfig = {
        host: host || datasourceOptions.host,
        port: port || datasourceOptions.port || 3306,
        database: database || datasourceOptions.database,
        user: user || datasourceOptions.user,
        password: password || datasourceOptions.password,
        ssl: ssl || datasourceOptions.ssl ? { rejectUnauthorized: false } : void 0,
        connectTimeout: additionalOptions?.connectTimeout || 1e4
      };
    }
    connection = await import_promise2.default.createConnection(connectionConfig);
    await connection.execute("SELECT 1");
    Logger.log("info", {
      message: "mysql:mysqlTestConnection:connected"
    });
    return {
      ok: true,
      status: 200,
      statusText: "Connected"
    };
  } catch (error) {
    Logger.log("error", {
      message: "mysql:mysqlTestConnection:catch",
      params: { error: error.message || error }
    });
    return {
      ok: false,
      error: error.message || error
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// src/data-sources/kafka/connection.js
var import_kafkajs2 = require("kafkajs");
var kafkaTestConnection = async ({ datasourceOptions }) => {
  let admin;
  try {
    Logger.log("info", {
      message: "kafka:kafkaTestConnection:params"
    });
    const brokers = (datasourceOptions.brokers || "localhost:9092").split(",").map((b) => b.trim());
    const config = {
      clientId: datasourceOptions.clientId || "jet-admin",
      brokers,
      connectionTimeout: datasourceOptions.connectionTimeout || 1e4,
      requestTimeout: datasourceOptions.requestTimeout || 3e4,
      logLevel: import_kafkajs2.logLevel.WARN
    };
    if (datasourceOptions.ssl) {
      config.ssl = true;
    }
    if (datasourceOptions.sasl?.enabled) {
      config.sasl = {
        mechanism: datasourceOptions.sasl.mechanism || "plain",
        username: datasourceOptions.sasl.username,
        password: datasourceOptions.sasl.password
      };
    }
    const kafka = new import_kafkajs2.Kafka(config);
    admin = kafka.admin();
    await admin.connect();
    await admin.listTopics();
    Logger.log("info", {
      message: "kafka:kafkaTestConnection:connected"
    });
    return {
      ok: true,
      status: 200,
      statusText: "Connected"
    };
  } catch (error) {
    Logger.log("error", {
      message: "kafka:kafkaTestConnection:catch",
      params: { error: error.message || error }
    });
    return {
      ok: false,
      error: error.message || error
    };
  } finally {
    if (admin) {
      await admin.disconnect();
    }
  }
};

// src/data-sources/rabbitmq/connection.js
var import_amqplib2 = __toESM(require("amqplib"));
var rabbitmqTestConnection = async ({ datasourceOptions }) => {
  let connection;
  try {
    Logger.log("info", {
      message: "rabbitmq:rabbitmqTestConnection:params"
    });
    let connectionUrl;
    if (datasourceOptions.connectionUrl) {
      connectionUrl = datasourceOptions.connectionUrl;
    } else {
      const details = datasourceOptions.connectionDetails || datasourceOptions;
      const protocol = details.ssl ? "amqps" : "amqp";
      const auth = details.username && details.password ? `${encodeURIComponent(details.username)}:${encodeURIComponent(details.password)}@` : "";
      const vhost = encodeURIComponent(details.vhost || "/");
      const heartbeat = details.heartbeat ? `?heartbeat=${details.heartbeat}` : "";
      connectionUrl = `${protocol}://${auth}${details.host || "localhost"}:${details.port || 5672}/${vhost}${heartbeat}`;
    }
    connection = await import_amqplib2.default.connect(connectionUrl);
    Logger.log("info", {
      message: "rabbitmq:rabbitmqTestConnection:connected"
    });
    return {
      ok: true,
      status: 200,
      statusText: "Connected"
    };
  } catch (error) {
    Logger.log("error", {
      message: "rabbitmq:rabbitmqTestConnection:catch",
      params: { error: error.message || error }
    });
    return {
      ok: false,
      error: error.message || error
    };
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

// src/data-sources/redis/connection.js
var import_ioredis2 = __toESM(require("ioredis"));
var redisTestConnection = async ({ datasourceOptions }) => {
  let redis;
  try {
    Logger.log("info", {
      message: "redis:redisTestConnection:params"
    });
    if (datasourceOptions.connectionUrl) {
      redis = new import_ioredis2.default(datasourceOptions.connectionUrl, {
        lazyConnect: true,
        connectTimeout: 1e4
      });
    } else if (datasourceOptions.clusterMode && datasourceOptions.clusterNodes) {
      const nodes = datasourceOptions.clusterNodes.split(",").map((n) => {
        const [host, port] = n.trim().split(":");
        return { host, port: parseInt(port) || 6379 };
      });
      redis = new import_ioredis2.default.Cluster(nodes, {
        lazyConnect: true
      });
    } else {
      const details = datasourceOptions.connectionDetails || datasourceOptions;
      redis = new import_ioredis2.default({
        host: details.host || "localhost",
        port: details.port || 6379,
        password: details.password || void 0,
        db: details.database || 0,
        username: details.username || void 0,
        tls: details.tls ? {} : void 0,
        lazyConnect: true,
        connectTimeout: 1e4
      });
    }
    await redis.connect();
    await redis.ping();
    Logger.log("info", {
      message: "redis:redisTestConnection:connected"
    });
    return {
      ok: true,
      status: 200,
      statusText: "Connected"
    };
  } catch (error) {
    Logger.log("error", {
      message: "redis:redisTestConnection:catch",
      params: { error: error.message || error }
    });
    return {
      ok: false,
      error: error.message || error
    };
  } finally {
    if (redis) {
      redis.disconnect();
    }
  }
};

// src/data-sources/oracle/connection.js
var import_oracledb2 = __toESM(require("oracledb"));
var oracleTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "oracle:oracleTestConnection:params",
      params: { host: datasourceOptions.connectionDetails?.host }
    });
    let connection;
    if (datasourceOptions.connectionString) {
      connection = await import_oracledb2.default.getConnection({
        connectionString: datasourceOptions.connectionString,
        user: datasourceOptions.user,
        password: datasourceOptions.password
      });
    } else {
      const details = datasourceOptions.connectionDetails || datasourceOptions;
      connection = await import_oracledb2.default.getConnection({
        user: details.user,
        password: details.password,
        connectString: `${details.host}:${details.port || 1521}/${details.serviceName}`
      });
    }
    await connection.close();
    return {
      ok: true,
      status: 200,
      statusText: "Connected"
    };
  } catch (error) {
    Logger.log("error", {
      message: "oracle:oracleTestConnection:catch",
      params: { error: error.message || error }
    });
    return {
      ok: false,
      error: error.message || error
    };
  }
};

// src/data-sources/sqlite/connection.js
var import_better_sqlite32 = __toESM(require("better-sqlite3"));
var sqliteTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "sqlite:sqliteTestConnection:params",
      params: { databasePath: datasourceOptions.databasePath }
    });
    const db = new import_better_sqlite32.default(datasourceOptions.databasePath, {
      readonly: datasourceOptions.readonly || false
    });
    db.prepare("SELECT 1").get();
    db.close();
    return {
      ok: true,
      status: 200,
      statusText: "Connected"
    };
  } catch (error) {
    Logger.log("error", {
      message: "sqlite:sqliteTestConnection:catch",
      params: { error: error.message || error }
    });
    return {
      ok: false,
      error: error.message || error
    };
  }
};

// src/data-sources/cockroachdb/connection.js
var import_pg4 = require("pg");
var cockroachdbTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "cockroachdb:cockroachdbTestConnection:params"
    });
    const client = new import_pg4.Client({
      connectionString: datasourceOptions.connectionString,
      ssl: datasourceOptions.ssl ? { rejectUnauthorized: false } : false
    });
    await client.connect();
    await client.end();
    return {
      ok: true,
      status: 200,
      statusText: "Connected"
    };
  } catch (error) {
    Logger.log("error", {
      message: "cockroachdb:cockroachdbTestConnection:catch",
      params: { error: error.message || error }
    });
    return {
      ok: false,
      error: error.message || error
    };
  }
};

// src/data-sources/neo4j/connection.js
var import_neo4j_driver2 = __toESM(require("neo4j-driver"));
var neo4jTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "neo4j:neo4jTestConnection:params",
      params: { uri: datasourceOptions.uri }
    });
    const driver = import_neo4j_driver2.default.driver(
      datasourceOptions.uri,
      import_neo4j_driver2.default.auth.basic(datasourceOptions.username, datasourceOptions.password)
    );
    await driver.verifyConnectivity();
    await driver.close();
    return {
      ok: true,
      status: 200,
      statusText: "Connected"
    };
  } catch (error) {
    Logger.log("error", {
      message: "neo4j:neo4jTestConnection:catch",
      params: { error: error.message || error }
    });
    return {
      ok: false,
      error: error.message || error
    };
  }
};

// src/data-sources/twilio/connection.js
var import_twilio2 = __toESM(require("twilio"));
var twilioTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "twilio:twilioTestConnection:params"
    });
    const client = (0, import_twilio2.default)(datasourceOptions.accountSid, datasourceOptions.authToken);
    await client.api.accounts(datasourceOptions.accountSid).fetch();
    return {
      ok: true,
      status: 200,
      statusText: "Connected"
    };
  } catch (error) {
    Logger.log("error", {
      message: "twilio:twilioTestConnection:catch",
      params: { error: error.message || error }
    });
    return {
      ok: false,
      error: error.message || error
    };
  }
};

// src/data-sources/sendgrid/connection.js
var import_mail2 = __toESM(require("@sendgrid/mail"));
var import_client3 = __toESM(require("@sendgrid/client"));
var sendgridTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "sendgrid:sendgridTestConnection:params"
    });
    import_client3.default.setApiKey(datasourceOptions.apiKey);
    const [response] = await import_client3.default.request({ method: "GET", url: "/v3/user/profile" });
    if (response.statusCode === 200) {
      return {
        ok: true,
        status: 200,
        statusText: "Connected"
      };
    }
    throw new Error("Failed to authenticate");
  } catch (error) {
    Logger.log("error", {
      message: "sendgrid:sendgridTestConnection:catch",
      params: { error: error.message || error }
    });
    return {
      ok: false,
      error: error.message || error
    };
  }
};

// src/data-sources/slack/connection.js
var import_web_api2 = require("@slack/web-api");
var slackTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "slack:slackTestConnection:params"
    });
    const client = new import_web_api2.WebClient(datasourceOptions.botToken);
    await client.auth.test();
    return {
      ok: true,
      status: 200,
      statusText: "Connected"
    };
  } catch (error) {
    Logger.log("error", {
      message: "slack:slackTestConnection:catch",
      params: { error: error.message || error }
    });
    return {
      ok: false,
      error: error.message || error
    };
  }
};

// src/data-sources/notion/connection.js
var import_client4 = require("@notionhq/client");
var notionTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "notion:notionTestConnection:params"
    });
    const notion = new import_client4.Client({ auth: datasourceOptions.apiToken });
    await notion.users.me({});
    return {
      ok: true,
      status: 200,
      statusText: "Connected"
    };
  } catch (error) {
    Logger.log("error", {
      message: "notion:notionTestConnection:catch",
      params: { error: error.message || error }
    });
    return {
      ok: false,
      error: error.message || error
    };
  }
};

// src/data-sources/jira/connection.js
var jiraTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "jira:jiraTestConnection:params",
      params: { host: datasourceOptions.host }
    });
    const auth = Buffer.from(`${datasourceOptions.email}:${datasourceOptions.apiToken}`).toString("base64");
    const response = await fetch(`${datasourceOptions.host}/rest/api/3/myself`, {
      headers: { Authorization: `Basic ${auth}`, Accept: "application/json" }
    });
    if (response.ok) {
      return {
        ok: true,
        status: 200,
        statusText: "Connected"
      };
    }
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  } catch (error) {
    Logger.log("error", {
      message: "jira:jiraTestConnection:catch",
      params: { error: error.message || error }
    });
    return {
      ok: false,
      error: error.message || error
    };
  }
};

// src/data-sources/googleanalytics/connection.js
var import_data2 = require("@google-analytics/data");
var googleanalyticsTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "googleanalytics:googleanalyticsTestConnection:params",
      params: { propertyId: datasourceOptions.propertyId }
    });
    let clientConfig = {};
    if (datasourceOptions.credentials) {
      const credentials = typeof datasourceOptions.credentials === "string" ? JSON.parse(datasourceOptions.credentials) : datasourceOptions.credentials;
      clientConfig = { credentials };
    }
    const analyticsDataClient = new import_data2.BetaAnalyticsDataClient(clientConfig);
    await analyticsDataClient.runReport({
      property: `properties/${datasourceOptions.propertyId}`,
      dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
      metrics: [{ name: "activeUsers" }],
      limit: 1
    });
    return {
      ok: true,
      status: 200,
      statusText: "Connected"
    };
  } catch (error) {
    Logger.log("error", {
      message: "googleanalytics:googleanalyticsTestConnection:catch",
      params: { error: error.message || error }
    });
    return {
      ok: false,
      error: error.message || error
    };
  }
};

// src/data-sources/syslog/connection.js
var syslogTestConnection = async ({ datasourceOptions }) => {
  return { success: true };
};

// src/data-sources/manifests.js
var postgresqlManifest = {
  name: "PostgreSQL",
  description: `A relational SQL database. Use this when the user asks about structured 
    transactional data \u2014 bookings, orders, users, restaurants, inventory, appointments, 
    payments stored directly in the database. Supports complex JOINs, GROUP BY aggregations, 
    date range filters, and COUNT/SUM/AVG operations. Best for historical data analysis 
    and reporting.`,
  capabilities: ["read", "aggregate", "filter", "write"],
  queryInstructions: `
    Write standard PostgreSQL SQL in the 'query' field of dataQueryOptions.
    
    Query shape:
    {
      "query": "SELECT ... FROM schema.table WHERE ...",
      "args": [
        { "key": "paramName", "type": "string", "value": "{{args.paramName}}" }
      ]
    }
    
    Rules:
    - Always schema-qualify tables: public.bookings NOT just bookings
    - Use $1, $2 for parameterized values mapped to args array
    - Date ranges: use >= and <= or BETWEEN on timestamp/date columns
    - For aggregations, always include a human-readable alias: SUM(amount) as total_amount
    - Never use SELECT * \u2014 always specify columns
    - Amounts stored in paise (integer) \u2014 divide by 100 for INR display
    
    Template syntax for dynamic args: {{args.paramName}}
  `,
  exampleQueries: [
    {
      description: "Total bookings and revenue for a restaurant in a date range",
      dataQueryOptions: {
        query: `SELECT 
          COUNT(*) as total_bookings,
          SUM(p.amount)/100 as revenue_inr,
          DATE(b.created_at) as booking_date
        FROM public.bookings b
        JOIN public.payments p ON p.booking_id = b.booking_id
        WHERE b.restaurant_id = $1
          AND b.created_at >= $2
          AND b.created_at <= $3
        GROUP BY DATE(b.created_at)
        ORDER BY booking_date`,
        args: [
          { key: "restaurantId", type: "string" },
          { key: "startDate", type: "string" },
          { key: "endDate", type: "string" }
        ]
      }
    }
  ],
  semanticHints: {
    amount: "Stored in paise (smallest currency unit). Divide by 100 for INR.",
    status: "Common values: CONFIRMED, PENDING, CANCELLED, REFUNDED",
    created_at: "Timezone-aware timestamp. Use TIMESTAMPTZ comparisons.",
    restaurant_id: "UUID foreign key. Usually filterable from context."
  }
};
var mysqlManifest = {
  name: "MySQL",
  description: `A relational SQL database (MySQL dialect). Use for structured transactional 
    data. Similar to PostgreSQL but uses MySQL-specific syntax. Supports JOINs, GROUP BY, 
    aggregations.`,
  capabilities: ["read", "aggregate", "filter", "write"],
  queryInstructions: `
    Write MySQL SQL in the 'query' field of dataQueryOptions.
    
    Query shape:
    {
      "query": "SELECT ... FROM table WHERE ...",
      "args": [
        { "key": "paramName", "type": "string", "value": "{{args.paramName}}" }
      ]
    }
    
    Rules:
    - Use backticks for identifiers: \`table_name\`.\`column_name\`
    - Use ? for parameterized values mapped to args array
    - For date functions: DATE(), DATE_FORMAT(), NOW()
    - Use LIMIT instead of FETCH FIRST
    - Never use SELECT * \u2014 always specify columns
  `,
  exampleQueries: [],
  semanticHints: {}
};
var mssqlManifest = {
  name: "Microsoft SQL Server",
  description: `Microsoft SQL Server relational database. Use for enterprise transactional 
    data in T-SQL dialect. Supports complex JOINs, CTEs, window functions.`,
  capabilities: ["read", "aggregate", "filter", "write"],
  queryInstructions: `
    Write T-SQL in the 'query' field of dataQueryOptions.
    
    Query shape:
    {
      "query": "SELECT ... FROM dbo.table WHERE ...",
      "args": [
        { "key": "paramName", "type": "string", "value": "{{args.paramName}}" }
      ]
    }
    
    Rules:
    - Use square brackets for identifiers: [schema].[table].[column]
    - Use @paramName for parameterized values
    - For date functions: GETDATE(), DATEADD(), DATEDIFF()
    - Use TOP instead of LIMIT
    - Schema-qualify with dbo. by default
  `,
  exampleQueries: [],
  semanticHints: {}
};
var oracleManifest = {
  name: "Oracle",
  description: `Oracle relational database. Enterprise-grade SQL with PL/SQL dialect. 
    Use for large-scale enterprise data.`,
  capabilities: ["read", "aggregate", "filter", "write"],
  queryInstructions: `
    Write Oracle SQL in the 'query' field of dataQueryOptions.
    
    Query shape:
    {
      "query": "SELECT ... FROM schema.table WHERE ...",
      "args": [
        { "key": "paramName", "type": "string", "value": "{{args.paramName}}" }
      ]
    }
    
    Rules:
    - Use double quotes for case-sensitive identifiers
    - Use :paramName for bind variables
    - For date: SYSDATE, TO_DATE(), TO_CHAR()
    - Use FETCH FIRST N ROWS ONLY (12c+) or ROWNUM for limiting
  `,
  exampleQueries: [],
  semanticHints: {}
};
var sqliteManifest = {
  name: "SQLite",
  description: `SQLite embedded relational database. Lightweight, file-based. Use for 
    local or embedded application data.`,
  capabilities: ["read", "aggregate", "filter", "write"],
  queryInstructions: `
    Write SQLite SQL in the 'query' field of dataQueryOptions.
    
    Query shape:
    {
      "query": "SELECT ... FROM table WHERE ...",
      "args": [
        { "key": "paramName", "type": "string", "value": "{{args.paramName}}" }
      ]
    }
    
    Rules:
    - No schema qualification needed
    - Use ? for parameterized values
    - For date: datetime(), date(), strftime()
    - Use LIMIT for row limiting
  `,
  exampleQueries: [],
  semanticHints: {}
};
var cockroachdbManifest = {
  name: "CockroachDB",
  description: `CockroachDB distributed SQL database. PostgreSQL-compatible syntax. 
    Use for distributed, fault-tolerant transactional data.`,
  capabilities: ["read", "aggregate", "filter", "write"],
  queryInstructions: `
    Write PostgreSQL-compatible SQL in the 'query' field.
    CockroachDB is wire-compatible with PostgreSQL. Follow PostgreSQL query rules.
    
    Query shape: Same as PostgreSQL.
  `,
  exampleQueries: [],
  semanticHints: {}
};
var supabaseManifest = {
  name: "Supabase",
  description: `Supabase (hosted PostgreSQL). Use for Supabase-backed application data. 
    Query using standard PostgreSQL SQL.`,
  capabilities: ["read", "aggregate", "filter", "write"],
  queryInstructions: `
    Write PostgreSQL SQL in the 'query' field. Supabase uses PostgreSQL under the hood.
    Follow PostgreSQL query rules. Tables are usually in the public schema.
    
    Query shape: Same as PostgreSQL.
  `,
  exampleQueries: [],
  semanticHints: {}
};
var bigqueryManifest = {
  name: "BigQuery",
  description: `Google BigQuery data warehouse. Use for large-scale analytics, 
    data warehouse queries. Best for aggregations over massive datasets.`,
  capabilities: ["read", "aggregate", "filter"],
  queryInstructions: `
    Write BigQuery Standard SQL in the 'query' field.
    
    Query shape:
    {
      "query": "SELECT ... FROM \`project.dataset.table\` WHERE ...",
      "args": [
        { "key": "paramName", "type": "string", "value": "{{args.paramName}}" }
      ]
    }
    
    Rules:
    - Use backtick-qualified table names: \`project.dataset.table\`
    - Use @paramName for parameterized values
    - For date: CURRENT_DATE(), DATE(), TIMESTAMP()
    - Use LIMIT for row limiting
    - Use UNNEST for arrays
  `,
  exampleQueries: [],
  semanticHints: {}
};
var mongodbManifest = {
  name: "MongoDB",
  description: `MongoDB NoSQL document database. Use for document-oriented data \u2014 
    user profiles, product catalogs, logs, events. Supports aggregation pipelines.`,
  capabilities: ["read", "aggregate", "filter", "write"],
  queryInstructions: `
    MongoDB queries use a JSON-based query format.
    
    Query shape:
    {
      "collection": "collectionName",
      "operation": "find|aggregate|count",
      "query": { "field": "value" },
      "projection": { "field1": 1, "field2": 1 },
      "sort": { "field": -1 },
      "limit": 100,
      "pipeline": [] // for aggregate operations
    }
    
    Rules:
    - For filtering: use MongoDB query operators ($eq, $gt, $lt, $in, etc.)
    - For aggregation: use $match, $group, $sort, $project, $limit stages
    - Date comparisons: use ISODate strings or $date operator
  `,
  exampleQueries: [],
  semanticHints: {}
};
var firestoreManifest = {
  name: "Firestore",
  description: `Google Firestore NoSQL document database. Use for real-time 
    application data, user profiles, settings. Document-collection model.`,
  capabilities: ["read", "filter", "write"],
  queryInstructions: `
    Firestore queries use collection paths and query operators.
    
    Query shape:
    {
      "collection": "collectionPath",
      "operation": "get|query|list",
      "filters": [
        { "field": "fieldName", "operator": "==", "value": "someValue" }
      ],
      "orderBy": { "field": "fieldName", "direction": "asc" },
      "limit": 100
    }
    
    Rules:
    - Operators: ==, !=, <, <=, >, >=, array-contains, in
    - Composite queries may require indexes
    - Use collection group queries for subcollections
  `,
  exampleQueries: [],
  semanticHints: {}
};
var neo4jManifest = {
  name: "Neo4j",
  description: `Neo4j graph database. Use for relationship-heavy data \u2014 social networks, 
    fraud detection, knowledge graphs. Query using Cypher.`,
  capabilities: ["read", "aggregate", "filter", "write"],
  queryInstructions: `
    Write Cypher queries in the 'query' field.
    
    Query shape:
    {
      "query": "MATCH (n:Label) -[r:RELATES]-> (m) WHERE n.prop = $param RETURN n, r, m",
      "args": [
        { "key": "param", "type": "string" }
      ]
    }
    
    Rules:
    - Use MATCH for pattern matching
    - Use WHERE for filtering
    - Use RETURN for output
    - Use $paramName for parameters
    - Use WITH for chaining queries
  `,
  exampleQueries: [],
  semanticHints: {}
};
var elasticsearchManifest = {
  name: "Elasticsearch",
  description: `Elasticsearch search and analytics engine. Use for full-text search, 
    log analysis, metrics aggregation, monitoring data.`,
  capabilities: ["read", "aggregate", "filter"],
  queryInstructions: `
    Elasticsearch queries use the Query DSL JSON format.
    
    Query shape:
    {
      "index": "indexName",
      "body": {
        "query": { "match": { "field": "value" } },
        "aggs": { "agg_name": { "terms": { "field": "field.keyword" } } },
        "size": 100,
        "sort": [{ "timestamp": "desc" }]
      }
    }
    
    Rules:
    - Use .keyword suffix for exact match on text fields
    - Use bool query for complex filtering (must, should, must_not)
    - Aggregations: terms, date_histogram, sum, avg, cardinality
  `,
  exampleQueries: [],
  semanticHints: {}
};
var airtableManifest = {
  name: "Airtable",
  description: `Airtable spreadsheet-database hybrid. Use for structured data managed 
    in Airtable bases \u2014 project tracking, CRM, inventory.`,
  capabilities: ["read", "filter", "write"],
  queryInstructions: `
    Airtable queries use the Airtable API format.
    
    Query shape:
    {
      "baseId": "appXXXXXXX",
      "tableName": "TableName",
      "operation": "list|get|create|update",
      "filterByFormula": "AND({Field}='value', {Date}>='2024-01-01')",
      "sort": [{ "field": "FieldName", "direction": "asc" }],
      "maxRecords": 100
    }
    
    Rules:
    - Use filterByFormula with Airtable formula syntax
    - Field names are case-sensitive and wrapped in {}
    - Date format: YYYY-MM-DD
  `,
  exampleQueries: [],
  semanticHints: {}
};
var googlesheetsManifest = {
  name: "Google Sheets",
  description: `Google Sheets spreadsheet datasource. Use for data stored in 
    Google Sheets \u2014 reports, shared data, manual entry data.`,
  capabilities: ["read", "filter", "write"],
  queryInstructions: `
    Google Sheets queries use spreadsheet range notation.
    
    Query shape:
    {
      "spreadsheetId": "spreadsheet-id",
      "range": "Sheet1!A1:Z1000",
      "operation": "read|append|update"
    }
    
    Rules:
    - Use A1 notation for ranges
    - First row is typically headers
    - Use sheet name prefix: SheetName!A1:Z100
  `,
  exampleQueries: [],
  semanticHints: {}
};
var restapiManifest = {
  name: "REST API",
  description: `A generic REST API datasource. Use this for external services like 
    payment gateways (Razorpay, Stripe), booking platforms, CRMs, or any HTTP API. 
    Can fetch, create, update data via HTTP methods. Use when data lives outside 
    the main database \u2014 payment records, SMS logs, email events, third-party bookings.`,
  capabilities: ["read", "write", "filter"],
  queryInstructions: `
    Query shape for REST API datasource:
    {
      "apiEndpoint": "/v1/endpoint",
      "method": "GET",
      "headers": [{ "key": "Authorization", "value": "Bearer {{args.token}}" }],
      "queryParams": [
        { "key": "from", "value": "{{args.startDate}}" },
        { "key": "to", "value": "{{args.endDate}}" }
      ],
      "body": null,
      "args": [
        { "key": "startDate", "type": "string" },
        { "key": "endDate", "type": "string" }
      ]
    }
    
    Rules:
    - For Razorpay: base URL is https://api.razorpay.com/v1
      Payments: GET /payments?from={unix_timestamp}&to={unix_timestamp}
      from/to are UNIX timestamps (seconds since epoch), NOT ISO strings
    - Automatically prefixed with the datasource baseUrl. Only provide the relative apiEndpoint (e.g. /users, NOT https://...).
    - queryParams and headers MUST be arrays of { key, value } objects.
    - Response is returned as-is \u2014 the agent will handle parsing
  `,
  exampleQueries: [
    {
      description: "Fetch Razorpay payments for a date range",
      dataQueryOptions: {
        apiEndpoint: "/payments",
        method: "GET",
        queryParams: [
          { key: "from", value: "{{args.fromTimestamp}}" },
          { key: "to", value: "{{args.toTimestamp}}" },
          { key: "count", value: "100" }
        ],
        args: [
          { key: "fromTimestamp", type: "number" },
          { key: "toTimestamp", type: "number" }
        ]
      }
    }
  ],
  semanticHints: {
    amount: "In Razorpay: paise (divide by 100 for INR). In Stripe: smallest currency unit.",
    from: "Razorpay uses UNIX timestamp in SECONDS",
    status: "Razorpay: captured|authorized|refunded|failed"
  }
};
var graphqlManifest = {
  name: "GraphQL",
  description: `GraphQL API datasource. Use for APIs that expose a GraphQL endpoint. 
    Supports queries, mutations, and subscriptions.`,
  capabilities: ["read", "write", "filter"],
  queryInstructions: `
    Query shape for GraphQL datasource:
    {
      "url": "https://api.example.com/graphql",
      "query": "query GetUsers($limit: Int) { users(limit: $limit) { id name email } }",
      "variables": { "limit": 100 },
      "headers": { "Authorization": "Bearer {{args.token}}" },
      "args": [
        { "key": "token", "type": "string" }
      ]
    }
    
    Rules:
    - Write valid GraphQL queries/mutations
    - Use variables for parameterization (not inline values)
    - Include auth headers from datasource config
  `,
  exampleQueries: [],
  semanticHints: {}
};
var stripeManifest = {
  name: "Stripe",
  description: `Stripe payment processor. Use for payment data, subscription info, 
    invoices, refunds, customer records. Best for revenue analytics, payment failure 
    analysis, subscription metrics.`,
  capabilities: ["read", "filter"],
  queryInstructions: `
    Stripe datasource uses Stripe API operations.
    
    Query shape:
    {
      "operation": "list",
      "resource": "payment_intents",
      "params": {
        "created[gte]": 1234567890,
        "created[lte]": 1234567890,
        "limit": 100
      },
      "args": [{ "key": "paramName", "type": "number" }]
    }
    
    Key resources: payment_intents, charges, customers, invoices, refunds, subscriptions
    Dates: UNIX timestamps in SECONDS
    Amounts: in smallest currency unit (paise for INR, cents for USD)
  `,
  exampleQueries: [],
  semanticHints: {
    amount: "Smallest currency unit. For INR: paise (divide by 100).",
    created: "UNIX timestamp in seconds"
  }
};
var twilioManifest = {
  name: "Twilio",
  description: `Twilio communication platform. Use for SMS/call logs, message delivery 
    status, phone number management.`,
  capabilities: ["read", "write", "filter"],
  queryInstructions: `
    Twilio datasource uses Twilio REST API operations.
    
    Query shape:
    {
      "resource": "messages|calls",
      "operation": "list|create|get",
      "params": {
        "DateSent>": "2024-01-01",
        "To": "+1234567890",
        "PageSize": 100
      }
    }
  `,
  exampleQueries: [],
  semanticHints: {}
};
var sendgridManifest = {
  name: "SendGrid",
  description: `SendGrid email delivery platform. Use for email send logs, delivery 
    metrics, bounce rates, email campaign data.`,
  capabilities: ["read", "write", "filter"],
  queryInstructions: `
    SendGrid datasource uses the SendGrid v3 API.
    
    Query shape:
    {
      "endpoint": "/v3/messages",
      "method": "GET",
      "params": {
        "limit": 100,
        "query": "status='delivered'"
      }
    }
  `,
  exampleQueries: [],
  semanticHints: {}
};
var slackManifest = {
  name: "Slack",
  description: `Slack workspace API. Use for channel messages, user info, workspace 
    activity. Read-only analytics on team communication.`,
  capabilities: ["read", "write", "filter"],
  queryInstructions: `
    Slack datasource uses Slack Web API methods.
    
    Query shape:
    {
      "method": "conversations.history|users.list|channels.list",
      "params": {
        "channel": "C1234567890",
        "limit": 100,
        "oldest": "1234567890.123456"
      }
    }
  `,
  exampleQueries: [],
  semanticHints: {}
};
var notionManifest = {
  name: "Notion",
  description: `Notion workspace API. Use for page content, database entries, 
    project management data stored in Notion.`,
  capabilities: ["read", "write", "filter"],
  queryInstructions: `
    Notion datasource uses the Notion API.
    
    Query shape:
    {
      "operation": "query_database|get_page|search",
      "database_id": "database-uuid",
      "filter": {
        "property": "Status",
        "select": { "equals": "Done" }
      },
      "sorts": [{ "property": "Created", "direction": "descending" }]
    }
  `,
  exampleQueries: [],
  semanticHints: {}
};
var jiraManifest = {
  name: "Jira",
  description: `Jira project management. Use for issue tracking data, sprint metrics, 
    project velocity, bug reports.`,
  capabilities: ["read", "write", "filter"],
  queryInstructions: `
    Jira datasource uses JQL (Jira Query Language) and the Jira REST API.
    
    Query shape:
    {
      "operation": "search|get_issue",
      "jql": "project = PROJ AND status = 'In Progress' ORDER BY created DESC",
      "maxResults": 100,
      "fields": ["summary", "status", "assignee", "created"]
    }
  `,
  exampleQueries: [],
  semanticHints: {}
};
var googleanalyticsManifest = {
  name: "Google Analytics",
  description: `Google Analytics web analytics. Use for website traffic data, 
    user behavior, page views, conversion metrics.`,
  capabilities: ["read", "aggregate", "filter"],
  queryInstructions: `
    Google Analytics datasource uses the GA4 Data API.
    
    Query shape:
    {
      "propertyId": "properties/123456789",
      "dateRanges": [{ "startDate": "2024-01-01", "endDate": "2024-12-31" }],
      "metrics": [{ "name": "activeUsers" }, { "name": "sessions" }],
      "dimensions": [{ "name": "date" }, { "name": "country" }],
      "limit": 1000
    }
  `,
  exampleQueries: [],
  semanticHints: {}
};
var kafkaManifest = {
  name: "Kafka",
  description: `Apache Kafka message streaming platform. Use for event streams, 
    real-time data pipelines, message consumption.`,
  capabilities: ["read", "write"],
  queryInstructions: `
    Kafka datasource operates on topics and consumer groups.
    
    Query shape:
    {
      "operation": "consume|produce|list_topics",
      "topic": "topicName",
      "consumerGroup": "groupName",
      "maxMessages": 100
    }
  `,
  exampleQueries: [],
  semanticHints: {}
};
var rabbitmqManifest = {
  name: "RabbitMQ",
  description: `RabbitMQ message broker. Use for queue messages, exchange routing, 
    message publishing/consuming.`,
  capabilities: ["read", "write"],
  queryInstructions: `
    RabbitMQ datasource operates on queues and exchanges.
    
    Query shape:
    {
      "operation": "consume|publish|list_queues",
      "queue": "queueName",
      "exchange": "exchangeName",
      "maxMessages": 100
    }
  `,
  exampleQueries: [],
  semanticHints: {}
};
var redisManifest = {
  name: "Redis",
  description: `Redis in-memory data store. Use for cached data, session data, 
    counters, sorted sets, real-time leaderboards.`,
  capabilities: ["read", "write", "filter"],
  queryInstructions: `
    Redis datasource uses Redis commands.
    
    Query shape:
    {
      "command": "GET|SET|HGETALL|KEYS|SCAN",
      "args": ["keyPattern*"],
      "key": "keyName"
    }
    
    Rules:
    - For key scanning: use SCAN with pattern matching
    - For hash data: use HGETALL, HGET
    - For sorted sets: use ZRANGE, ZRANGEBYSCORE
  `,
  exampleQueries: [],
  semanticHints: {}
};
var s3Manifest = {
  name: "AWS S3",
  description: `AWS S3 object storage. Use for file listings, object metadata, 
    bucket contents. Not for querying data within files.`,
  capabilities: ["read", "write", "filter"],
  queryInstructions: `
    S3 datasource operates on buckets and objects.
    
    Query shape:
    {
      "operation": "listObjects|getObject|putObject",
      "bucket": "bucketName",
      "prefix": "path/to/",
      "maxKeys": 100
    }
    
    Rules:
    - Use prefix for folder-like filtering
    - listObjects returns object keys and metadata
    - getObject fetches object contents
  `,
  exampleQueries: [],
  semanticHints: {}
};
var weburlManifest = {
  name: "Web URL",
  description: `Web URL datasource. Fetches content from web pages. Use for 
    scraping public web content or fetching data from URLs.`,
  capabilities: ["read"],
  queryInstructions: `
    Web URL datasource fetches content from a URL.
    
    Query shape:
    {
      "url": "https://example.com/data",
      "method": "GET",
      "headers": {},
      "responseType": "json|text|html"
    }
  `,
  exampleQueries: [],
  semanticHints: {}
};
var DATASOURCE_MANIFESTS = {
  // SQL Databases
  postgresql: postgresqlManifest,
  mysql: mysqlManifest,
  mssql: mssqlManifest,
  oracle: oracleManifest,
  sqlite: sqliteManifest,
  cockroachdb: cockroachdbManifest,
  supabase: supabaseManifest,
  bigquery: bigqueryManifest,
  // NoSQL / Document
  mongodb: mongodbManifest,
  firestore: firestoreManifest,
  neo4j: neo4jManifest,
  elasticsearch: elasticsearchManifest,
  airtable: airtableManifest,
  googlesheets: googlesheetsManifest,
  // APIs & Services
  restapi: restapiManifest,
  graphql: graphqlManifest,
  stripe: stripeManifest,
  twilio: twilioManifest,
  sendgrid: sendgridManifest,
  slack: slackManifest,
  notion: notionManifest,
  jira: jiraManifest,
  googleanalytics: googleanalyticsManifest,
  // Messaging & Cache
  kafka: kafkaManifest,
  rabbitmq: rabbitmqManifest,
  redis: redisManifest,
  // Storage
  s3: s3Manifest,
  // Web
  weburl: weburlManifest
};
function getManifestForType(datasourceType) {
  const manifest = DATASOURCE_MANIFESTS[datasourceType];
  if (manifest) return { ...manifest };
  return {
    name: datasourceType,
    description: `${datasourceType} datasource. No detailed manifest available.`,
    capabilities: ["read"],
    queryInstructions: `Use standard ${datasourceType} query format as configured in dataQueryOptions.`,
    exampleQueries: [],
    semanticHints: {}
  };
}

// src/index.js
function _buildGetDatasourceInfo(datasourceType) {
  return async ({ datasourceOptions } = {}) => {
    return getManifestForType(datasourceType);
  };
}
var DATASOURCE_LOGIC_COMPONENTS = {
  [import_datasource_types.DATASOURCE_TYPES.POSTGRESQL.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await postgresqlTestConnection({
        connectionString: datasourceOptions.connectionString,
        connectionData: {
          host: datasourceOptions.host,
          port: datasourceOptions.port,
          database: datasourceOptions.database,
          user: datasourceOptions.user,
          password: datasourceOptions.password
        }
      });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("postgresql")
  },
  [import_datasource_types.DATASOURCE_TYPES.RESTAPI.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await restAPITestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("restapi")
  },
  [import_datasource_types.DATASOURCE_TYPES.WEB_URL.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await webURLTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("weburl")
  },
  [import_datasource_types.DATASOURCE_TYPES.FIRESTORE.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await firestoreTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("firestore")
  },
  [import_datasource_types.DATASOURCE_TYPES.MYSQL.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await mysqlTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("mysql")
  },
  [import_datasource_types.DATASOURCE_TYPES.MONGODB.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await mongodbTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("mongodb")
  },
  [import_datasource_types.DATASOURCE_TYPES.GOOGLESHEETS.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await googlesheetsTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("googlesheets")
  },
  [import_datasource_types.DATASOURCE_TYPES.GRAPHQL.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await graphqlTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("graphql")
  },
  // Batch 1 datasources
  [import_datasource_types.DATASOURCE_TYPES.MSSQL.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await mssqlTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("mssql")
  },
  [import_datasource_types.DATASOURCE_TYPES.SUPABASE.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await supabaseTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("supabase")
  },
  [import_datasource_types.DATASOURCE_TYPES.BIGQUERY.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await bigqueryTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("bigquery")
  },
  [import_datasource_types.DATASOURCE_TYPES.AIRTABLE.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await airtableTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("airtable")
  },
  [import_datasource_types.DATASOURCE_TYPES.KAFKA.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await kafkaTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("kafka")
  },
  [import_datasource_types.DATASOURCE_TYPES.RABBITMQ.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await rabbitmqTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("rabbitmq")
  },
  [import_datasource_types.DATASOURCE_TYPES.REDIS.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await redisTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("redis")
  },
  [import_datasource_types.DATASOURCE_TYPES.S3.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await s3TestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("s3")
  },
  [import_datasource_types.DATASOURCE_TYPES.ELASTICSEARCH.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await elasticsearchTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("elasticsearch")
  },
  [import_datasource_types.DATASOURCE_TYPES.STRIPE.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await stripeTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("stripe")
  },
  // Batch 2 datasources
  [import_datasource_types.DATASOURCE_TYPES.ORACLE.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await oracleTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("oracle")
  },
  [import_datasource_types.DATASOURCE_TYPES.SQLITE.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await sqliteTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("sqlite")
  },
  [import_datasource_types.DATASOURCE_TYPES.COCKROACHDB.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await cockroachdbTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("cockroachdb")
  },
  [import_datasource_types.DATASOURCE_TYPES.NEO4J.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await neo4jTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("neo4j")
  },
  [import_datasource_types.DATASOURCE_TYPES.TWILIO.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await twilioTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("twilio")
  },
  [import_datasource_types.DATASOURCE_TYPES.SENDGRID.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await sendgridTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("sendgrid")
  },
  [import_datasource_types.DATASOURCE_TYPES.SLACK.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await slackTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("slack")
  },
  [import_datasource_types.DATASOURCE_TYPES.NOTION.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await notionTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("notion")
  },
  [import_datasource_types.DATASOURCE_TYPES.JIRA.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await jiraTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("jira")
  },
  [import_datasource_types.DATASOURCE_TYPES.GOOGLEANALYTICS.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await googleanalyticsTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("googleanalytics")
  },
  // Listeners
  [import_datasource_types.DATASOURCE_TYPES.SYSLOG.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await syslogTestConnection({ datasourceOptions });
    },
    getDatasourceInfo: _buildGetDatasourceInfo("syslog")
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DATASOURCE_LOGIC_COMPONENTS,
  dataSourceRegistry
});
//# sourceMappingURL=index.cjs.map
