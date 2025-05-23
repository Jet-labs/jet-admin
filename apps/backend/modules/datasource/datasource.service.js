const Logger = require("../../utils/logger");
const { prisma } = require("../../config/prisma.config");

const datasourceService = {};

/**
 *
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @returns {Promise<Array<object>>}
 */
datasourceService.getAllDatasources = async ({ userID, tenantID }) => {
  Logger.log("info", {
    message: "datasourceService:getAllDatasources:params",
    params: {
      userID,
      tenantID,
    },
  });
  try {
    const datasources = await prisma.tblDatasources.findMany({
      where: {
        tenantID: parseInt(tenantID),
      },
    });
    Logger.log("success", {
      message: "datasourceService:getAllDatasources:success",
      params: {
        userID,
        datasources,
      },
    });
    return datasources;
  } catch (error) {
    Logger.log("error", {
      message: "datasourceService:getAllDatasources:error",
      params: {
        userID,
        error,
      },
    });
    throw error;
  }
};

/**
 * @param {Object} param0
 * @param {number} param0.tenantID
 * @param {string} param0.datasourceTitle
 * @param {object} param0.datasourceOptions
 * @param {number} param0.userID
 */
datasourceService.createDatasource = async ({
  userID,
  tenantID,
  datasourceTitle,
  datasourceOptions,
}) => {
  Logger.log("info", {
    message: "datasourceService:createDatasource:params",
    params: {
      userID,
      tenantID,
      datasourceTitle,
      datasourceOptions,
    },
  });
  try {
    const newDatasource = await prisma.tblDatasources.create({
      data: {
        tenantID: parseInt(tenantID),
        datasourceTitle,
        datasourceOptions,
        creatorID: parseInt(userID),
      },
    });
    Logger.log("success", {
      message: "datasourceService:createDatasource:success",
      params: {
        userID,
        newDatasource,
      },
    });
    return newDatasource;
  } catch (error) {
    Logger.log("error", {
      message: "datasourceService:createDatasource:error",
      params: {
        userID,
        error,
      },
    });
    throw error;
  }
};

/**
 *
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @param {number} param0.datasourceID
 * @returns {Promise<boolean>}
 */
datasourceService.deleteDatasourceByID = async ({
  userID,
  tenantID,
  datasourceID,
}) => {
  Logger.log("info", {
    message: "datasourceService:deleteDatasourceByID:params",
    params: {
      userID,
      tenantID,
      datasourceID,
    },
  });
  try {
    await prisma.tblDatasources.delete({
      where: {
        datasourceID: parseInt(datasourceID),
        tenantID: parseInt(tenantID),
      },
    });
    Logger.log("success", {
      message: "datasourceService:deleteDatasourceByID:success",
      params: {
        userID,
        datasourceID,
      },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "datasourceService:deleteDatasourceByID:error",
      params: {
        userID,
        error,
      },
    });
    throw error;
  }
};

/**
 *
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @param {number} param0.datasourceID
 * @returns {Promise<boolean>}
 */
datasourceService.getDatasourceByID = async ({
  userID,
  tenantID,
  datasourceID,
}) => {
  Logger.log("info", {
    message: "datasourceService:getDatasourceByID:params",
    params: {
      userID,
      tenantID,
      datasourceID,
    },
  });
  try {
    const datasource = await prisma.tblDatasources.findUnique({
      where: {
        datasourceID: parseInt(datasourceID),
        tenantID: parseInt(tenantID),
        },
    });
    Logger.log("success", {
      message: "datasourceService:getDatasourceByID:success",
      params: {
        userID,
        datasource,
      },
    });
    return datasource;
  } catch (error) {
    Logger.log("error", {
      message: "datasourceService:getDatasourceByID:error",
      params: {
        userID,
        error,
      },
    });
    throw error;
  }
};

/**
 *
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @param {number} param0.datasourceID
 * @param {object} param0.datasource
 * @returns {Promise<boolean>}
 */
datasourceService.updateDatasourceByID = async ({
  userID,
  tenantID,
  datasourceID,
  datasource,
}) => {
  Logger.log("info", {
    message: "datasourceService:updateDatasourceByID:params",
    params: {
      userID,
      tenantID,
      datasourceID,
      datasource,
    },
  });
  try {
    await prisma.tblDatasources.update({
      where: {
        datasourceID: parseInt(datasourceID),
        tenantID: parseInt(tenantID),
      },
      data: {
        datasourceName: datasource.datasourceName,
        datasourceDescription: datasource.datasourceDescription,
        datasourceType: datasource.datasourceType,
        datasourceURL: datasource.datasourceURL,
        datasourceUsername: datasource.datasourceUsername,
        datasourcePassword: datasource.datasourcePassword,
        datasourceSchema: datasource.datasourceSchema,
      },
    });
    Logger.log("success", {
      message: "datasourceService:updateDatasourceByID:success",
      params: {
        userID,
        datasourceID,
      },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "datasourceService:updateDatasourceByID:error",
      params: {
        userID,
        error,
      },
    });
    throw error;
  }
};

module.exports = {datasourceService};

