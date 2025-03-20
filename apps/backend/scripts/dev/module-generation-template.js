const fs = require("fs");
const path = require("path");

// Define the template for each file type
const controllerTemplate = (moduleName) => `
const constants = require("../../constants");
const { extractError } = require("../../utils/error.util");
const Logger = require("../../utils/logger");
const { ${moduleName}Service } = require("./${moduleName}.service");

const ${moduleName}Controller = {};
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
${moduleName}Controller.get = async (req, res) => {};

module.exports = { ${moduleName}Controller };
`;

const serviceTemplate = (moduleName) => `
const constants = require("../../constants");
const environmentVariables = require("../../environment");
const Logger = require("../../utils/logger");

const ${moduleName}Service = {};

${moduleName}Service.get = async () => {};

module.exports = { ${moduleName}Service };
`;

const routeTemplate = (moduleName) => `
const express = require("express");
const router = express.Router();
const { ${moduleName}Controller } = require("./${moduleName}.controller");
const { ${moduleName}Middleware } = require("./${moduleName}.middleware");

//${moduleName} routes

router.get("/",${moduleName}Middleware.middleware, ${moduleName}Controller.get);

module.exports = router;
`;

const middlewareTemplate = (moduleName) => `
const constants = require("../../constants");
const Logger = require("../../utils/logger");
const { ${moduleName}Service } = require("./${moduleName}.service");

//${moduleName} middlewares
const ${moduleName}Middleware = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
${moduleName}Middleware.middleware = async (req, res, next) => {};

module.exports = { ${moduleName}Middleware };
`;

// Main function to generate files
const generateModule = (moduleName) => {
  const moduleDir = path.join(__dirname, "..", "..", "modules", moduleName);

  if (fs.existsSync(moduleDir)) {
    console.log(`Module "${moduleName}" already exists.`);
    return;
  }

  // Create module directory
  fs.mkdirSync(moduleDir, { recursive: true });

  // Create files with the respective templates
  fs.writeFileSync(
    path.join(moduleDir, `${moduleName}.controller.js`),
    controllerTemplate(moduleName)
  );
  fs.writeFileSync(
    path.join(moduleDir, `${moduleName}.service.js`),
    serviceTemplate(moduleName)
  );
  fs.writeFileSync(
    path.join(moduleDir, `${moduleName}.v1.routes.js`),
    routeTemplate(moduleName)
  );
  fs.writeFileSync(
    path.join(moduleDir, `${moduleName}.middleware.js`),
    middlewareTemplate(moduleName)
  );

  console.log(`Module "${moduleName}" created successfully.`);
};

// Get module name from command line arguments
const moduleName = process.argv[2];
if (!moduleName) {
  console.log("Please specify a module name.");
  process.exit(1);
}

generateModule(moduleName);
