
const { firebaseApp } = require("../../config/firebase.config");
const { prisma } = require("../../config/prisma.config");
const constants = require("../../constants");
const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { authService } = require("./auth.service");
const { AUTH_TYPES } = require("../../types/auth.types");
const { verifyAPIKeyHash } = require("../../utils/crypto.util");

//auth middlewares
const authMiddleware = {};

authMiddleware.authProviderSocket = async function (socket, next) {
  if (socket && socket.handshake && socket.handshake.auth) {
    try {
      let { token } = socket.handshake.auth;
      const decodedIdToken = await firebaseApp.auth().verifyIdToken(token);
      Logger.log("info", {
        message: "authMiddleware:authProviderSocket:params",
        params: { uid: decodedIdToken.uid, email: decodedIdToken.email },
      });
      if (!decodedIdToken) {
        throw constants.ERROR_CODES.USER_AUTH_TOKEN_EXPIRED;
      } else {
        Logger.log("success", {
          message: "authMiddleware:authProviderSocket:success",
          params: { uid: decodedIdToken.uid },
        });
        socket.handshake.auth.firebase_id = decodedIdToken.uid;
        socket.handshake.auth.firebaseUser = decodedIdToken;

        next();
      }
    } catch (error) {
      Logger.log("error", {
        message: "authMiddleware:authProviderSocket:catch-2",
        params: { errorMessage: error.message },
      });
      next(new Error(error.message));
    }
  } else {
    Logger.log("error", {
      message: "authMiddleware:authProviderSocket:catch-1",
      params: { error: constants.ERROR_CODES.USER_AUTH_TOKEN_NOT_FOUND },
    });
    next(new Error(constants.ERROR_CODES.USER_AUTH_TOKEN_NOT_FOUND.message));
  }
};

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
          req.authContext = {
            authType: AUTH_TYPES.USER,
            user: req.user,
            apiKey: null,
          };
        } catch (error) {
          Logger.log("error", {
            message: "authMiddleware:authProvider:catch-3",
            params: { errorMessage: error.message },
          });
        }
        return next();
      }
    } catch (error) {
      Logger.log("error", {
        message: "authMiddleware:authProvider:catch-2",
        params: { errorMessage: error.message },
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
      const prefix = apiKey.substring(0, 8);
      const candidateKeys = await prisma.tblAPIKeys.findMany({
        where: {
          apiKeyPrefix: prefix,
          isDisabled: false,
        },
        include: {
          tblUsers: true,
        },
      });

      const apiKeyData = candidateKeys.find((k) =>
        verifyAPIKeyHash(apiKey, k.apiKeyHash)
      );

      Logger.log("info", {
        message: "authMiddleware:authProvider:params",
        params: { authType: AUTH_TYPES.API_KEY },
      });
      if (!apiKeyData) {
        throw constants.ERROR_CODES.INVALID_API_KEY;
      } else {
        Logger.log("success", {
          message: "authMiddleware:authProvider:success",
          params: {
            creatorID: apiKeyData?.creatorID,
            apiKeyID: apiKeyData?.apiKeyID,
            authType: AUTH_TYPES.API_KEY,
          },
        });
        req.user = apiKeyData.tblUsers;
        req.authContext = {
          authType: AUTH_TYPES.API_KEY,
          user: apiKeyData.tblUsers,
          apiKey: {
            apiKeyID: apiKeyData.apiKeyID,
            tenantID: apiKeyData.tenantID,
            apiKeyTitle: apiKeyData.apiKeyTitle,
            creatorID: apiKeyData.creatorID,
            isDisabled: apiKeyData.isDisabled,
            createdAt: apiKeyData.createdAt,
          },
        };
        return next();
      }
    } catch (error) {
      Logger.log("error", {
        message: "authMiddleware:authProvider:catch-2",
        params: { errorMessage: error.message },
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
      params: { errorMessage: error.message },
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
  return async (req, res, next) => {
    try {
      const { user, authContext } = req;
      const { tenantID } = req.params;
      const userID = user?.userID;
      const authType = authContext?.authType || AUTH_TYPES.USER;
      const apiKeyID = authContext?.apiKey?.apiKeyID;

      Logger.log("info", {
        message: "authMiddleware:checkUserPermissions:params",
        params: { userID, tenantID, requiredPermissions, requireAll, authType, apiKeyID },
      });

      if (!tenantID) {
        Logger.log("error", {
          message: "authMiddleware:checkUserPermissions:missing-tenant",
          params: { tenantID, error: "Tenant information missing" },
        });
        return expressUtils.sendResponse(
          res,
          false,
          {},
          "Tenant information missing"
        );
      }

      let permissionCheck;

      if (authType === AUTH_TYPES.API_KEY && apiKeyID) {
        Logger.log("info", {
          message: "authMiddleware:checkUserPermissions:api-key-auth",
          params: { apiKeyID, tenantID, requiredPermissions },
        });

        permissionCheck = await authService.checkAPIKeyPermissions({
          apiKeyID,
          tenantID,
          requiredPermissions,
          requireAll,
        });
      } else {
        if (!userID) {
          Logger.log("error", {
            message: "authMiddleware:checkUserPermissions:missing-user",
            params: { userID, error: "User information missing" },
          });
          return expressUtils.sendResponse(
            res,
            false,
            {},
            "User information missing"
          );
        }

        permissionCheck = await authService.checkUserPermissions({
          userID,
          tenantID,
          requiredPermissions,
          requireAll,
        });
      }

      Logger.log("info", {
        message: "authMiddleware:checkUserPermissions:permissionCheck",
        params: {
          userID,
          apiKeyID,
          authType,
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
            apiKeyID,
            authType,
            tenantID,
            requiredPermissions,
            requireAll,
          },
        });
        return next();
      } else {
        Logger.log("error", {
          message: "authMiddleware:checkUserPermissions:permission-denied",
          params: {
            userID,
            apiKeyID,
            authType,
            tenantID,
            requiredPermissions,
            requireAll,
            reason: permissionCheck.reason,
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
        params: { errorMessage: error.message },
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
