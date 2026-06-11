import { google } from "googleapis";
import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

export default class GoogleSheetsDataSource extends DataSource {
  constructor(config) {
    super(config);
    this.sheets = null;
    this.auth = null;
  }

  async getAuth(helpers) {
    if (this.auth) return this.auth;

    const datasourceOptions = this.config.datasourceOptions || {};
    const { authType, serviceAccountKey, oauth2 } = datasourceOptions;

    if (authType === "serviceAccount" && serviceAccountKey) {
      const credentials = typeof serviceAccountKey === "string"
        ? JSON.parse(serviceAccountKey)
        : serviceAccountKey;

      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: [
          "https://www.googleapis.com/auth/spreadsheets",
          "https://www.googleapis.com/auth/drive.readonly",
        ],
      });
    } else if (authType === "oauth2" && oauth2) {
      const activeHelpers = helpers || this.helpers;
      let clientId = null;
      let clientSecret = null;

      if (activeHelpers && typeof activeHelpers.getGoogleClientConfig === "function") {
        const clientConfig = activeHelpers.getGoogleClientConfig();
        if (clientConfig) {
          clientId = clientConfig.clientId;
          clientSecret = clientConfig.clientSecret;
        }
      }

      let refreshToken = null;

      if (oauth2.vaultCredentialID && activeHelpers && typeof activeHelpers.getCredential === "function") {
        try {
          const credential = await activeHelpers.getCredential(oauth2.vaultCredentialID);
          if (credential) {
            refreshToken = credential.refreshToken;
          }
        } catch (err) {
          Logger.log("error", {
            message: "googlesheets:getAuth:failed_vault",
            params: { error: err.message },
          });
        }
      }

      if (!clientId || !clientSecret) {
        throw new Error("Google OAuth app credentials are not configured on the server.");
      }

      if (!refreshToken) {
        throw new Error("OAuth2 credentials not found in vault.");
      }
      
      const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
      oauth2Client.setCredentials({ refresh_token: refreshToken });
      
      this.auth = oauth2Client;
    } else {
      throw new Error("Invalid authentication configuration");
    }

    return this.auth;
  }

  async getSheetsClient(helpers) {
    if (this.sheets) return this.sheets;
    
    const auth = await this.getAuth(helpers);
    this.sheets = google.sheets({ version: "v4", auth });
    return this.sheets;
  }

  async execute(dataQueryOptions, context, helpers) {
    Logger.log("info", {
      message: "googlesheets:GoogleSheetsDataSource:execute:params",
      params: { dataQueryOptions, datasourceID: this.config.datasourceID },
    });

    const { 
      operation = "read", 
      spreadsheetId, 
      sheetName, 
      range, 
      data, 
      valueInputOption, 
      insertDataOption,
      majorDimension,
      includeHeaders 
    } = dataQueryOptions;

    const datasourceOptions = this.config.datasourceOptions || {};
    const finalSpreadsheetId = spreadsheetId || datasourceOptions.defaultSpreadsheetId;

    if (!finalSpreadsheetId) {
      throw new Error("Spreadsheet ID is required");
    }

    try {
      const sheets = await this.getSheetsClient(helpers);
      let result;

      // Build full range with sheet name if provided
      const fullRange = sheetName && range && !range.includes("!")
        ? `${sheetName}!${range}`
        : range || sheetName;

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
        params: { operation, spreadsheetId: finalSpreadsheetId },
      });

      return result;
    } catch (error) {
      Logger.log("error", {
        message: "googlesheets:GoogleSheetsDataSource:execute:catch",
        params: { error: error.message },
      });
      throw new Error(`Google Sheets ${operation} failed: ${error.message}`);
    }
  }

  async readData(sheets, spreadsheetId, range, majorDimension = "ROWS", includeHeaders = true) {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
      majorDimension,
    });

    const values = response.data.values || [];

    // If includeHeaders is true, convert to array of objects
    if (includeHeaders && values.length > 1) {
      const headers = values[0];
      const rows = values.slice(1);
      
      return rows.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] !== undefined ? row[index] : null;
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
        values,
      },
    });

    return {
      updatedCells: response.data.updatedCells,
      updatedRows: response.data.updatedRows,
      updatedColumns: response.data.updatedColumns,
      updatedRange: response.data.updatedRange,
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
        values,
      },
    });

    return {
      updatedCells: response.data.updates?.updatedCells,
      updatedRows: response.data.updates?.updatedRows,
      updatedRange: response.data.updates?.updatedRange,
    };
  }

  async updateData(sheets, spreadsheetId, range, data, valueInputOption = "USER_ENTERED") {
    // Same as write for single range updates
    return await this.writeData(sheets, spreadsheetId, range, data, valueInputOption);
  }

  async clearData(sheets, spreadsheetId, range) {
    const response = await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range,
    });

    return {
      clearedRange: response.data.clearedRange,
    };
  }

  async getSpreadsheetInfo(sheets, spreadsheetId) {
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    return {
      title: response.data.properties?.title,
      locale: response.data.properties?.locale,
      sheets: response.data.sheets?.map(sheet => ({
        sheetId: sheet.properties?.sheetId,
        title: sheet.properties?.title,
        index: sheet.properties?.index,
        rowCount: sheet.properties?.gridProperties?.rowCount,
        columnCount: sheet.properties?.gridProperties?.columnCount,
      })),
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

  // ─── Proxy-callable helper methods ──────────────────────────────────────────
  // These are invoked via POST /datasources/:id/proxy from dedicated editors.

  /**
   * Lists spreadsheets the authenticated user has access to.
   * Uses Google Drive API to search for spreadsheet files.
   *
   * @param {Object} params
   * @param {string} [params.query]      — Search term to filter by title
   * @param {string} [params.pageToken]  — Token for next page
   * @param {number} [params.pageSize]   — Results per page (default 20)
   * @returns {Promise<{ spreadsheets: Array, nextPageToken: string|null }>}
   */
  async listSpreadsheets(params = {}, context, helpers) {
    const { query, pageToken, pageSize = 20 } = params;
    const auth = await this.getAuth(helpers);
    const drive = google.drive({ version: "v3", auth });

    // Build the query: only spreadsheets, optionally filtered by name
    let q = "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false";
    if (query && query.trim()) {
      // Escape single quotes in user input
      const safeQuery = query.trim().replace(/'/g, "\\'");
      q += ` and name contains '${safeQuery}'`;
    }

    const response = await drive.files.list({
      q,
      pageSize,
      pageToken: pageToken || undefined,
      fields: "nextPageToken, files(id, name, modifiedTime, owners, webViewLink)",
      orderBy: "modifiedTime desc",
    });

    return {
      spreadsheets: (response.data.files || []).map((f) => ({
        id: f.id,
        name: f.name,
        modifiedTime: f.modifiedTime,
        owner: f.owners?.[0]?.displayName || null,
        webViewLink: f.webViewLink || null,
      })),
      nextPageToken: response.data.nextPageToken || null,
    };
  }

  /**
   * Lists all sheets/tabs in a given spreadsheet.
   * Reuses the existing getSpreadsheetInfo method.
   *
   * @param {Object} params
   * @param {string} params.spreadsheetId
   * @returns {Promise<{ title: string, sheets: Array }>}
   */
  async listSheets(params = {}, context, helpers) {
    const { spreadsheetId } = params;
    if (!spreadsheetId) {
      throw new Error("spreadsheetId is required");
    }
    const sheets = await this.getSheetsClient(helpers);
    return await this.getSpreadsheetInfo(sheets, spreadsheetId);
  }

  /**
   * Returns the first N rows from a sheet for preview purposes.
   *
   * @param {Object} params
   * @param {string} params.spreadsheetId
   * @param {string} [params.sheetName]  — Sheet tab name (default "Sheet1")
   * @param {string} [params.range]      — Override range in A1 notation
   * @param {number} [params.limit]      — Max rows to return (default 5)
   * @returns {Promise<{ headers: string[], rows: string[][], totalRows: number }>}
   */
  async previewData(params = {}, context, helpers) {
    const { spreadsheetId, sheetName = "Sheet1", range, limit = 5 } = params;
    if (!spreadsheetId) {
      throw new Error("spreadsheetId is required");
    }

    const sheets = await this.getSheetsClient(helpers);
    const previewRange = range || `${sheetName}!A1:Z${limit + 1}`;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: previewRange,
      majorDimension: "ROWS",
    });

    const values = response.data.values || [];
    const headers = values.length > 0 ? values[0] : [];
    const rows = values.length > 1 ? values.slice(1, limit + 1) : [];

    return {
      headers,
      rows,
      totalRows: values.length > 0 ? values.length - 1 : 0,
    };
  }
}
