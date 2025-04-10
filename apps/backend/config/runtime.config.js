const Logger = require("../utils/logger");
const { prisma } = require("./prisma.config");


// In-memory cache for the current configuration state
let runtimeAppConfig = {};
let isRuntimeAppConfigInitialized = false;

/**
 * @returns {Promise<void>}
 */
async function initializeRuntimeAppConfig() {
  if (isRuntimeAppConfigInitialized) {
    Logger.log("info",{
      message: "runtimeConfig:initializeRuntimeAppConfig:already-initialized",
      params: { runtimeAppConfig },
    });
    return;
  }
  Logger.log("info",{
    message: "runtimeConfig:initializeRuntimeAppConfig:initializing",
  });
  try {
    const allConfigEntries = await prisma.tblRuntimeConfig.findMany();
    const loadedRuntimeAppConfig = {};
    allConfigEntries.forEach((entry) => {
      try {
        loadedRuntimeAppConfig[entry.key] = entry.value;
      } catch (e) {
        // If parsing fails, assume it's a plain string
        loadedRuntimeAppConfig[entry.key] = entry.value;
      }
    });

    runtimeAppConfig = loadedRuntimeAppConfig;
    isRuntimeAppConfigInitialized = true;
    Logger.log("success",{
      message: "runtimeConfig:initializeRuntimeAppConfig:success",
      params: { runtimeAppConfig },
    });
    // Optionally log loaded keys/values at a debug level if needed
    // logger.info('Loaded configuration:', runtimeAppConfig);
  } catch (error) {
    Logger.log("error",{
      message: "runtimeConfig:initializeRuntimeAppConfig:catch-1",
      params: { error },
    });
    runtimeAppConfig = {}; // Start with empty config on error?
    isRuntimeAppConfigInitialized = false; // Mark as not successfully initialized
  }
}

/**
 * @param {string} key
 * @param {*} [defaultValue]
 * @returns {*}
 */
function getRunTimeAppConfig(key, defaultValue = undefined) {
  if (!isRuntimeAppConfigInitialized) {
    Logger.log("error",{
      message: "runtimeConfig:getRunTimeAppConfig:not-initialized",
      params: { key, defaultValue },
    });
  }
  return runtimeAppConfig.hasOwnProperty(key) ? runtimeAppConfig[key] : defaultValue;
}

/**
 * @returns {object} A shallow copy of the current configuration.
 */
function getAllRunTimeAppConfig() {
  if (!isRuntimeAppConfigInitialized) {
    Logger.log("error",{
      message: "runtimeConfig:getAllRunTimeAppConfig:not-initialized",
    });
  }
  return { ...runtimeAppConfig };
}

/**
 * @param {string} key
 * @param {*} value
 * @returns {Promise<void>}
 * @throws {Error}
 */
async function setRunTimeAppConfig(key, value) {
  if (!key || typeof key !== "string") {
    throw new Error("Invalid configuration key provided.");
  }

  Logger.log("info",{
    message: "runtimeConfig:setRunTimeAppConfig:params",
    params: { key, value },
  });

  try {
    const upsertResult = await prisma.tblRuntimeConfig.upsert({
      where: { key: key },
      update: { value: value },
      create: { key: key, value: value },
    });
    Logger.log("success",{
      message: "runtimeConfig:setRunTimeAppConfig:success",
      params: { key, value },
    });
    runtimeAppConfig[key] = value;
    Logger.log("info",{
      message: "runtimeConfig:setRunTimeAppConfig:in-memory-updated",
      params: { key, value },
    });
  } catch (error) {
    Logger.log("error",{
      message: "runtimeConfig:setRunTimeAppConfig:catch-1",
      params: { key, value, error },
    });
    throw new Error(
      `Failed to persist config for key '${key}': ${error.message}`
    );
  }
}


/**
 * @returns {Promise<void>}
 * @throws {Error}
 */
async function syncRuntimeAppConfigWithDB() {
  Logger.log("info",{
    message: "runtimeConfig:syncRuntimeAppConfigWithDB:params",
  });
  
    try {
        const allConfigEntries = await prisma.tblRuntimeConfig.findMany();
        const loadedRuntimeAppConfig = {};
        allConfigEntries.forEach((entry) => {
            try {
                loadedRuntimeAppConfig[entry.key] = entry.value;
            } catch (e) {
                loadedRuntimeAppConfig[entry.key] = entry.value;
            }
        });
        const loadedKeyCount = Object.keys(loadedRuntimeAppConfig).length;
        runtimeAppConfig = loadedRuntimeAppConfig;
        Logger.log("success",{
          message: "runtimeConfig:syncRuntimeAppConfigWithDB:success",
          params: { loadedKeyCount },
        });
    } catch (error) {
        Logger.log("error",{
          message: "runtimeConfig:syncRuntimeAppConfigWithDB:catch-1",
          params: { error },
        });
        throw new Error(`Runtime synchronization from database failed: ${error.message}`);
    }
}

/**
 * @param {object} [configToSync]
 * @returns {Promise<void>}
 */
async function syncDBWithRuntimeAppConfig(configToSync = runtimeAppConfig) {
  Logger.log("info",{
    message: "runtimeConfig:syncDBWithRuntimeAppConfig:params",
    params: { configToSync },
  });
  if (typeof configToSync !== "object" || configToSync === null) {
    Logger.log("error",{
      message: "runtimeConfig:syncDBWithRuntimeAppConfig:catch-1",
      params: { configToSync },
    });
    throw new Error(
      "Invalid configuration object provided for syncDbWithRuntime."
    );
  }
  const keys = Object.keys(configToSync);

  Logger.log("info",{
    message: "runtimeConfig:syncDBWithRuntimeAppConfig:keys",
    params: { keys },
  });

  const upsertOperations = keys.map((key) => {
    const value = configToSync[key];
    return prisma.tblRuntimeConfig.upsert({
      where: { key: key },
      update: { value: value },
      create: { key: key, value: value },
    });
  });

  try {
    await prisma.$transaction(upsertOperations);
    Logger.log("success",{
      message: "runtimeConfig:syncDBWithRuntimeAppConfig:success",
      params: { keys },
    });
  } catch (error) {
    Logger.log("error",{
      message: "runtimeConfig:syncDBWithRuntimeAppConfig:catch-1",
      params: { keys, error },
    });
    throw new Error(`Database synchronization failed: ${error.message}`);
  }
}


module.exports = {
  initializeRuntimeAppConfig,
  getRunTimeAppConfig,
  getAllRunTimeAppConfig,
  setRunTimeAppConfig,
  syncRuntimeAppConfigWithDB,
  syncDBWithRuntimeAppConfig,
};
