import { initializeApp, cert, getApps, getApp, deleteApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

export default class FirestoreDataSource extends DataSource {
  constructor(config) {
    super(config);
    this.app = null;
    this.db = null;
  }

  async getFirestoreDb() {
    if (this.db) return this.db;

    const { projectId, serviceAccountKey, databaseURL } = this.config.datasourceOptions;
    const appName = `firestore-${this.config.datasourceID || Date.now()}`;

    // Check if app already exists
    try {
      this.app = getApp(appName);
    } catch (e) {
      // App doesn't exist, create it
      let credential;
      if (serviceAccountKey) {
        const serviceAccount = typeof serviceAccountKey === "string"
          ? JSON.parse(serviceAccountKey)
          : serviceAccountKey;
        credential = cert(serviceAccount);
      }

      const appConfig = {
        credential,
        projectId,
      };

      if (databaseURL) {
        appConfig.databaseURL = databaseURL;
      }

      this.app = initializeApp(appConfig, appName);
    }

    this.db = getFirestore(this.app);
    return this.db;
  }

  async execute(dataQueryOptions, context) {
    Logger.log("info", {
      message: "firestore:FirestoreDataSource:execute:params",
      params: { dataQueryOptions, datasourceID: this.config.datasourceID },
    });

    const { operation, collectionPath, documentId, data, where, orderBy, limit } = dataQueryOptions;

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
        params: { operation, collectionPath, result },
      });

      return result;
    } catch (error) {
      Logger.log("error", {
        message: "firestore:FirestoreDataSource:execute:catch",
        params: { error: error.message },
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

    // Apply where conditions
    if (where && Array.isArray(where)) {
      for (const condition of where) {
        query = query.where(condition.field, condition.operator, this.parseValue(condition.value));
      }
    }

    // Apply orderBy
    if (orderBy && orderBy.field) {
      query = query.orderBy(orderBy.field, orderBy.direction || "asc");
    }

    // Apply limit
    if (limit) {
      query = query.limit(limit);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
    // Try to parse as JSON (for arrays, objects, booleans, numbers)
    try {
      return JSON.parse(value);
    } catch {
      return value; // Return as string if not valid JSON
    }
  }
}
