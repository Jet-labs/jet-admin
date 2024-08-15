const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");
const Logger = require("../../../utils/logger");

const exportTableRows = async (rows, format) => {
  try {
    Logger.log("info", {
      message: "tableController:exportRowByMultipleIDs:params",
      params: { rowsLength: rows?.length },
    });
    let filePath;
    let fileName;
    if (format === "json") {
      fileName = "data.json";
      filePath = path.join(__dirname, fileName);
      fs.writeFileSync(filePath, JSON.stringify(rows, null, 2));
    } else if (format === "csv") {
      fileName = "data.csv";
      filePath = path.join(__dirname, fileName);

      const csvWriter = createCsvWriter({
        path: filePath,
        header: Object.keys(rows[0] || {}).map((key) => ({
          id: key,
          title: key,
        })),
      });
      await csvWriter.writeRecords(rows);
    } else if (format === "excel") {
      fileName = "data.xlsx";
      filePath = path.join(__dirname, fileName);

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Data");

      worksheet.columns = Object.keys(rows[0] || {}).map((key) => ({
        header: key,
        key,
      }));

      rows.forEach((row) => {
        worksheet.addRow(row);
      });

      await workbook.xlsx.writeFile(filePath);
    } else {
      fileName = "data.json";
      filePath = path.join(__dirname, fileName);
      fs.writeFileSync(filePath, JSON.stringify(rows, null, 2));
    }

    // Send the file to the frontend
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("File download error:", err);
      }
      fs.unlinkSync(filePath); // Delete the file after download
    });
  } catch (error) {
    Logger.log("error", {
      message: "tableController:exportRowByMultipleIDs:catch-1",
      params: { error },
    });
  }
};
// Endpoint to download the file
app.get("/download/:format", async (req, res) => {
  const { format } = req.params;

  // Fetch data from Prisma
  const rows = await prisma.yourModelName.findMany();

  let filePath;
  let fileName;

  // Convert data to desired format
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
