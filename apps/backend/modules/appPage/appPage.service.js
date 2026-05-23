const Logger = require("../../utils/logger");
const { prisma } = require("../../config/prisma.config");
const { getCreationContextFromAuthContext } = require("../../utils/auth.context.utils");
const appPageService = {};

/**
 *
 * @param {object} param0
 * @param {number} param0.userID
 * @param {number} param0.tenantID
 * @returns {Promise<Array<object>>}
 */
appPageService.getAllAppPages = async ({ userID, tenantID }) => {
  Logger.log("info", {
    message: "appPageService:getAllAppPages:params",
    params: {
      userID,
      tenantID,
    },
  });

  try {
    const appPages = await prisma.tblAppPages.findMany({
      where: {
        tenantID: tenantID,
      },
    });
    Logger.log("success", {
      message: "appPageService:getAllAppPages:success",
      params: {
        userID,
        appPages,
      },
    });
    return appPages;
  } catch (error) {
    Logger.log("error", {
      message: "appPageService:getAllAppPages:failure",
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
 * @param {string} param0.appPageTitle
 * @param {string} param0.appPageDescription
 * @param {JSON} param0.appPageConfig
 * @returns {Promise<boolean>}
 */
appPageService.createAppPage = async ({
  userID,
  tenantID,
  appPageTitle,
  appPageDescription,
  appPageConfig,
  authContext,
}) => {
  Logger.log("info", {
    message: "appPageService:createAppPage:params",
    params: {
      userID,
      tenantID,
      appPageTitle,
      appPageDescription,
      appPageConfig,
      authContext,
    },
  });

  try {
    const { creatorID, createdByApiKeyID } = getCreationContextFromAuthContext(authContext);
    await prisma.$transaction(async (tx) => {
      const appPage = await tx.tblAppPages.create({
        data: {
          tenantID: tenantID,
          appPageTitle,
          appPageDescription,
          appPageConfig,
          creatorID,
          createdByApiKeyID,
        },
      });
    });

    Logger.log("success", {
      message: "appPageService:createAppPage:success",
      params: {
        userID,
        tenantID: tenantID,
        appPageTitle,
        appPageDescription,
        appPageConfig,
      },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "appPageService:createAppPage:failure",
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
 * @param {string} param0.appPageID
 * @returns {Promise<Array<object>>}
 */
appPageService.getAppPageByID = async ({
  userID,
  tenantID,
  appPageID,
}) => {
  Logger.log("info", {
    message: "appPageService:getAppPageByID:params",
    params: {
      userID,
      tenantID,
      appPageID,
    },
  });

  try {
    const appPage = await prisma.tblAppPages.findFirst({
      where: {
        tenantID: tenantID,
        appPageID: appPageID,
      },
    });
    Logger.log("success", {
      message: "appPageService:getAppPageByID:success",
      params: {
        userID,
        appPage,
      },
    });
    return appPage;
  } catch (error) {
    Logger.log("error", {
      message: "appPageService:getAppPageByID:failure",
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
 * @param {number} param0.appPageID
 * @returns {Promise<boolean>}
 */
appPageService.cloneAppPageByID = async ({
  userID,
  tenantID,
  appPageID,
}) => {
  Logger.log("info", {
    message: "appPageService:cloneAppPageByID:params",
    params: {
      userID,
      tenantID,
      appPageID,
    },
  });

  try {
    const appPage = await prisma.tblAppPages.findFirst({
      where: {
        tenantID: tenantID,
        appPageID: appPageID,
      },
    });
    if (!appPage) {
      throw new Error("App page not found");
    }
    await prisma.$transaction(async (tx) => {
      const newAppPage = await tx.tblAppPages.create({
        data: {
          tenantID: tenantID,
          appPageTitle: appPage.appPageTitle + " (Copy)",
          appPageDescription: appPage.appPageDescription,
          appPageConfig: appPage.appPageConfig,
          creatorID: userID,
        },
      });
    });
    Logger.log("success", {
      message: "appPageService:cloneAppPageByID:success",
      params: {
        userID,
        appPageID,
      },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "appPageService:cloneAppPageByID:failure",
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
 * @param {Object} params
 * @param {number} params.appPageID
 * @param {number} [params.userID]
 * @param {number} [params.tenantID]
 * @param {string} [params.appPageTitle]
 * @param {string} [params.appPageDescription]
 * @param {JSON} [params.appPageConfig]
 *
 * @returns {Promise<boolean>} True if update succeeded
 * @throws {Error} If database operation fails
 */
appPageService.updateAppPageByID = async ({
  appPageID,
  userID,
  tenantID,
  appPageTitle,
  appPageDescription,
  appPageConfig,
}) => {
  Logger.log("info", {
    message: "appPageService:updateAppPageByID:params",
    params: {
      appPageID,
      userID,
      tenantID,
      appPageTitle,
      appPageDescription,
      appPageConfig,
    },
  });

  try {
    const existingAppPage = await prisma.tblAppPages.findFirst({
      where: {
        appPageID: appPageID,
        tenantID: tenantID,
      },
    });

    if (!existingAppPage) {
      throw new Error("App page not found");
    }
    await prisma.$transaction(async (tx) => {
      const updatedAppPage = await tx.tblAppPages.update({
        where: { appPageID: appPageID },
        data: {
          ...(appPageTitle != undefined && { appPageTitle }),
          ...(appPageDescription != undefined && {
            appPageDescription,
          }),
          ...(appPageConfig != undefined && {
            appPageConfig,
          }),
        },
      });
    });

    Logger.log("success", {
      message: "appPageService:updateAppPageByID:success",
      params: {
        appPageID,
        userID,
        tenantID,
        appPageTitle,
        appPageDescription,
        appPageConfig,
      },
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "appPageService:updateAppPageByID:catch-1",
      params: {
        appPageID,
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
 * @param {string} param0.tenantID
 * @param {number} param0.appPageID
 * @returns {Promise<boolean>}
 */
appPageService.deleteAppPageByID = async ({
  userID,
  tenantID,
  appPageID,
}) => {
  Logger.log("info", {
    message: "appPageService:deleteAppPageByID:params",
    params: {
      userID,
      tenantID,
      appPageID,
    },
  });

  try {
    await prisma.tblAppPages.delete({
      where: {
        appPageID: appPageID,
        tenantID: tenantID,
      },
    });

    Logger.log("success", {
      message: "appPageService:deleteAppPageByID:success",
      params: {
        userID,
        tenantID,
        appPageID,
      },
    });

    return true;
  } catch (error) {
    Logger.log("error", {
      message: "appPageService:deleteAppPageByID:failure",
      params: {
        userID,
        tenantID,
        appPageID,
        error,
      },
    });
    throw error;
  }
};

module.exports = { appPageService };
