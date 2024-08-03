const environment = require("../environment");
const { exec } = require("child_process");
const fs = require("fs").promises;
const path = require("path");
const Logger = require("../utils/logger");
const command =
  "npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script";

const execCommand = () => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        reject(`stderr: ${stderr}`);
        return;
      }
      resolve(stdout);
    });
  });
};
const writeToSQlFile = async (stdout) => {
  try {
    await fs.writeFile("prisma/schema.sql");
    Logger.log("success", {
      message: "writeToSQlFile:exec:success",
      params: { stdout },
    });
  } catch (err) {
    Logger.log("error", {
      message: "writeToSQlFile:catch-1",
      params: { error: err },
    });
  }
};
const generateSQlFromPrismaSchema = async () => {
  const rootDir = path.resolve(__dirname, ".."); // Adjust according to your folder structure

  // Change the working directory to the root directory
  process.chdir(rootDir);
  try {
    const output = await execCommand();
    // await writeToSQlFile(output);
    return output;
  } catch (err) {
    Logger.log("error", {
      message: "generateSQlFromPrismaSchema:exec:catch-1",
      params: { error: err },
    });
  }
};
generateSQlFromPrismaSchema();
module.exports = { generateSQlFromPrismaSchema };
