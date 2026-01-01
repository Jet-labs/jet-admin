import { google } from "googleapis";
import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

export default class GoogleSheetsDataSource extends DataSource {
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
      const credentials = typeof serviceAccountKey === "string"
        ? JSON.parse(serviceAccountKey)
        : serviceAccountKey;

      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });
    } else if (authType === "oauth2" && oauth2) {
      const { clientId, clientSecret, refreshToken } = oauth2;
      
      const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
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
    this.sheets = google.sheets({ version: "v4", auth });
    return this.sheets;
  }

  async execute(dataQueryOptions, context) {
    Logger.log("info", {
      message: "googlesheets:GoogleSheetsDataSource:execute:params",
      params: { dataQueryOptions, datasourceID: this.config.datasourceID },
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
    } = dataQueryOptions;

    const datasourceOptions = this.config.datasourceOptions || {};
    const finalSpreadsheetId = spreadsheetId || datasourceOptions.defaultSpreadsheetId;

    if (!finalSpreadsheetId) {
      throw new Error("Spreadsheet ID is required");
    }

    try {
      const sheets = await this.getSheetsClient();
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
}
