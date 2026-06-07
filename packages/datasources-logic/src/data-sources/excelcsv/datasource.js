import ExcelJS from "exceljs";
import axios from "axios";
import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

// In-memory parse cache to optimize repeated executions on large sheets
const parseCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL

export default class ExcelCSVDataSource extends DataSource {
  async execute(dataQueryOptions, context) {
    Logger.log("info", {
      message: "excelcsv:ExcelCSVDataSource:execute:params",
      params: { dataQueryOptions },
    });

    const {
      sheetName,
      headerRow = 1,
      range,
      limit,
    } = dataQueryOptions || {};

    const fileInfo = this.config.datasourceOptions?.fileInfo || {};
    const fileUrl = this.config.datasourceOptions?.fileUrl || fileInfo.fileUrl;
    const fileType = this.config.datasourceOptions?.fileType || fileInfo.fileType;


    if (!fileUrl) {
      throw new Error("No Excel or CSV file URL configured for this data source.");
    }

    const targetHeaderRow = parseInt(headerRow, 10) || 1;
    const cacheKey = `${fileUrl}|${sheetName || ""}|${targetHeaderRow}|${range || ""}|${limit || ""}`;
    const cachedEntry = parseCache.get(cacheKey);

    if (cachedEntry && (Date.now() - cachedEntry.timestamp < CACHE_TTL_MS)) {
      Logger.log("info", {
        message: "excelcsv:ExcelCSVDataSource:execute:cacheHit",
        params: { fileUrl },
      });
      return cachedEntry.data;
    }

    try {
      // Fetch file buffer from the Supabase public URL
      const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
      const buffer = Buffer.from(response.data);

      const workbook = new ExcelJS.Workbook();
      const isCsv = fileUrl.toLowerCase().split("?")[0].endsWith(".csv") || 
                    (fileType && fileType.includes("csv"));

      if (isCsv) {
        const { Readable } = await import("stream");
        const stream = Readable.from(buffer);
        await workbook.csv.read(stream);
      } else {
        await workbook.xlsx.load(buffer);
      }


      // Resolve sheet (Excel supports multiple tabs, CSV maps to first sheet)
      const worksheet = sheetName 
        ? workbook.getWorksheet(sheetName) 
        : workbook.worksheets[0];

      if (!worksheet) {
        throw new Error(`Worksheet "${sheetName || 0}" not found in the spreadsheet.`);
      }

      // Read headers (1-based index)
      const headerRowObj = worksheet.getRow(targetHeaderRow);
      const headers = [];
      
      headerRowObj.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const val = cell.value;
        if (val !== null && val !== undefined) {
          headers[colNumber] = String(val).trim();
        } else {
          headers[colNumber] = `Column_${colNumber}`;
        }
      });

      // Parse records starting from targetHeaderRow + 1
      const data = [];
      worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber <= targetHeaderRow) return;

        // Apply range logic if range specified (e.g. A1:Z100)
        // Here we do simple check to ensure we do not exceed range row numbers if applicable
        if (range) {
          const match = range.match(/\d+/g);
          if (match && match.length >= 2) {
            const endRow = parseInt(match[1], 10);
            if (rowNumber > endRow) return;
          }
        }

        const rowData = {};
        let hasValues = false;

        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const header = headers[colNumber] || `Column_${colNumber}`;
          let cellValue = cell.value;

          // Resolve formula or special cell types
          if (cellValue && typeof cellValue === "object") {
            if (cellValue.result !== undefined) {
              cellValue = cellValue.result;
            } else if (cellValue.text !== undefined) {
              cellValue = cellValue.text;
            } else if (Array.isArray(cellValue.richText)) {
              cellValue = cellValue.richText.map(t => t.text).join("");
            }
          }

          if (cellValue !== null && cellValue !== undefined) {
            rowData[header] = cellValue;
            hasValues = true;
          } else {
            rowData[header] = null;
          }
        });

        if (hasValues) {
          data.push(rowData);
        }
      });

      const finalResult = limit ? data.slice(0, parseInt(limit, 10)) : data;

      // Update in-memory parse cache
      parseCache.set(cacheKey, {
        timestamp: Date.now(),
        data: finalResult,
      });

      return finalResult;
    } catch (err) {
      Logger.log("error", {
        message: "excelcsv:ExcelCSVDataSource:execute:error",
        params: { error: err.message || err },
      });
      throw new Error(`Failed to execute Excel/CSV query: ${err.message || err}`);
    }
  }
}
