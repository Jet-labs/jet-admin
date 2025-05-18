
const { firebaseApp } = require("../../config/firebase.config");
const { prisma } = require("../../config/prisma.config");
const constants = require("../../constants");
const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { authService } = require("./auth.service");

//auth middlewares
const authMiddleware = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
authMiddleware.authProvider = async function (req, res, next) {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      let idToken = req.headers.authorization.split("Bearer ")[1];
      const decodedIdToken = await firebaseApp.auth().verifyIdToken(idToken);
      Logger.log("info", {
        message: "authMiddleware:authProvider:params",
        params: { uid: decodedIdToken.uid, email: decodedIdToken.email },
      });
      if (!decodedIdToken) {
        throw constants.ERROR_CODES.USER_AUTH_TOKEN_EXPIRED;
      } else {
        Logger.log("success", {
          message: "authMiddleware:authProvider:success",
          params: { uid: decodedIdToken.uid },
        });
        req.firebaseUser = decodedIdToken;
        try {
          req.user = await authService.getUserFromFirebaseID({
            firebaseID: decodedIdToken.uid,
          });
        } catch (error) {}
        return next();
      }
    } catch (error) {
      Logger.log("error", {
        message: "authMiddleware:authProvider:catch-2",
        params: { error },
      });
      return expressUtils.sendResponse(
        res,
        false,
        {},
        error
      );
    }
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("api_key ")
  ) {
    try {
      let apiKey = req.headers.authorization.split("api_key ")[1];
      const apiKeyData = await prisma.tblAPIKeys.findFirst({
        where: {
          apiKey,
          isDisabled: false,
        },
        include:{
          tblUsers:true
        }
      });
      
      Logger.log("info", {
        message: "authMiddleware:authProvider:params",
        params: { creatorID:apiKeyData?.creatorID },
      });
      if (!apiKeyData?.creatorID) {
        throw constants.ERROR_CODES.INVALID_API_KEY;
      } else {
        Logger.log("success", {
          message: "authMiddleware:authProvider:success",
          params: { creatorID: apiKeyData?.creatorID },
        });
        req.user = apiKeyData.tblUsers;
        return next();
      }
    } catch (error) {
      Logger.log("error", {
        message: "authMiddleware:authProvider:catch-2",
        params: { error },
      });
      return expressUtils.sendResponse(
        res,
        false,
        {},
        error
      );
    }
  } else {
    Logger.log("error", {
      message: "authMiddleware:authProvider:catch-1",
      params: { error: constants.ERROR_CODES.USER_AUTH_TOKEN_NOT_FOUND },
    });
    return expressUtils.sendResponse(
      res,
      false,
      {},
      constants.ERROR_CODES.USER_AUTH_TOKEN_NOT_FOUND
    );
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
authMiddleware.authProviderTest = async function (req, res, next) {
  try {
    req.user = await authService.getUserFromEmailID({
      email: "test@test.com",
    });
    return next();
  } catch (error) {
    Logger.log("error", {
      message: "authMiddleware:authProviderTest:catch-2",
      params: { error },
    });
    return expressUtils.sendResponse(
      res,
      false,
      {},
      error
    )
  }
};

/**
 * Middleware factory to check if a user has the required permissions.
 *
 * @param {string[]} requiredPermissions - An array of permission names to check, e.g., ["create_table", "manage_tables"].
 * @param {Object} options - Optional configuration for the middleware.
 * @param {boolean} [options.requireAll=true] - Whether the user must have all permissions (`true`) or any of the permissions (`false`).
 * @returns {function(import("express").Request, import("express").Response, import("express").NextFunction): Promise<void>} - Express middleware function.
 */
authMiddleware.checkUserPermissions = (
  requiredPermissions,
  { requireAll = true } = {}
) => {
  /**
   * Express middleware to check user permissions.
   *
   * @param {import("express").Request} req - The Express request object.
   * @param {import("express").Response} res - The Express response object.
   * @param {import("express").NextFunction} next - The Express next function.
   * @returns {Promise<void>}
   */
  return async (req, res, next) => {
    try {
      const { user } = req;
      const { tenantID } = req.params;
      const userID = user.userID;

      // Log the incoming request for debugging
      Logger.log("info", {
        message: "authMiddleware:checkUserPermissions:params",
        params: { userID, tenantID, requiredPermissions, requireAll },
      });

      // Validate user and tenant information
      if (!userID || !tenantID) {
        Logger.log("error", {
          message: "authMiddleware:checkUserPermissions:catch-2",
          params: {
            userID,
            tenantID,
            error: "User or Tenant information missing",
          },
        });
        return expressUtils.sendResponse(
          res,
          false,
          {},
          "User or Tenant information missing"
        );
      }
      const permissionCheck = await authService.checkUserPermissions({
        userID,
        tenantID: parseInt(tenantID),
        requiredPermissions,
        requireAll,
      });

      // Permission check passed
      Logger.log("info", {
        message: "authMiddleware:checkUserPermissions:permissionCheck",
        params: {
          userID,
          tenantID,
          requiredPermissions,
          requireAll,
          permissionCheck,
        },
      });
      if (permissionCheck.permission) {
        Logger.log("success", {
          message: "authMiddleware:checkUserPermissions:success",
          params: {
            userID,
            tenantID,
            requiredPermissions,
            requireAll,
          },
        });
        return next();
      } else {
        Logger.log("error", {
          message: "authMiddleware:checkUserPermissions:catch-2",
          params: {
            userID,
            tenantID,
            requiredPermissions,
            requireAll,
          },
        });
        return expressUtils.sendResponse(
          res,
          false,
          {},
          constants.ERROR_CODES.PERMISSION_DENIED
        );
      }
    } catch (error) {
      Logger.log("error", {
        message: "authMiddleware:checkUserPermissions:catch-1",
        params: { error },
      });
      return expressUtils.sendResponse(
        res,
        false,
        {},
        constants.ERROR_CODES.SERVER_ERROR
      );
    }
  };
};


module.exports = { authMiddleware };
