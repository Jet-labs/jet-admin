
const { firebaseApp } = require("../../config/firebase.config");
const { prisma } = require("../../config/prisma.config");
const constants = require("../../constants");
const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { authService } = require("./auth.service");
const { AUTH_TYPES } = require("../../types/auth.types");
const { verifyAPIKeyHash } = require("../../utils/crypto.util");
const { enforce: casbinEnforce } = require("../../config/casbin.config");
const { fromRequest } = require("../../utils/executionContext");

//auth middlewares
const authMiddleware = {};


authMiddleware.authProviderSocket = async function (socket, next) {
  if (socket && socket.handshake && socket.handshake.auth) {
    try {
      let { token } = socket.handshake.auth;
      if (!firebaseApp) {
        throw new Error("Firebase Admin SDK is not initialized.");
      }
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
      if (!firebaseApp) {
        throw new Error("Firebase Admin SDK is not initialized.");
      }
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
          return expressUtils.sendResponse(
            res,
            false,
            {},
            constants.ERROR_CODES.INVALID_USER
          );
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
  if (process.env.NODE_ENV !== "test") {
    return expressUtils.sendResponse(res, false, {}, constants.ERROR_CODES.PERMISSION_DENIED);
  }
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
 * Casbin-based resource-level authorization middleware.
 *
 * Checks whether the current user/API key is allowed to perform
 * a specific action on a specific resource within the tenant.
 *
 * Usage in routes:
 *   authMiddleware.authorize("dataquery", "run")
 *   authMiddleware.authorize("workflow", "execute")
 *   authMiddleware.authorize("appPage", "read")
 *
 * The resource ID is resolved from req.params using the convention:
 *   resourceType "dataquery" → req.params.dataQueryID
 *   resourceType "workflow"  → req.params.workflowID
 *   resourceType "appPage"   → req.params.appPageID
 *
 * If no specific resource ID is found (e.g., list endpoints),
 * the resource selector becomes "dataquery:*" which requires
 * a wildcard policy.
 *
 * Also attaches req.executionCtx for downstream service calls.
 *
 * @param {string|Array<object>} resourceType - Resource type or array of checks (e.g. [{ resource: "appPage", action: "create" }])
 * @param {string} [action]       - Action if using single resource type
 * @param {object} [options]
 * @param {string} [options.paramKey] - Override the param key used to extract the resource ID
 * @param {string} [options.bodyKey] - Key to extract the resource ID from req.body (useful for bindings)
 * @param {boolean} [options.skipIfMissing] - If true and bodyKey is not in req.body, skip authorization (useful for PATCH)
 */
authMiddleware.authorize = (resourceTypeOrArray, action, options = {}) => {
  const checks = Array.isArray(resourceTypeOrArray)
    ? resourceTypeOrArray
    : [{ resource: resourceTypeOrArray, action, ...options }];

  return async (req, res, next) => {
    try {
      const { user, authContext } = req;
      const { tenantID } = req.params;
      const authType = authContext?.authType || AUTH_TYPES.USER;

      // Determine the subject (user ID or API key ID)
      let subjectID;
      if (authType === AUTH_TYPES.API_KEY && authContext?.apiKey?.apiKeyID) {
        subjectID = authContext.apiKey.apiKeyID;
      } else {
        subjectID = user?.userID;
      }

      if (!subjectID || !tenantID) {
        return expressUtils.sendResponse(
          res,
          false,
          {},
          "Authorization failed: Missing subject or tenant"
        );
      }

      for (const check of checks) {
        const { resource: resourceType, action: checkAction, paramKey: checkParamKey, bodyKey, reqKey, skipIfMissing } = check;

        // Resolve resource ID from req, route params, or body
        let resourceIDs;
        if (reqKey) {
          const getNestedValue = (obj, path) => path.split('.').reduce((acc, part) => acc && acc[part], obj);
          resourceIDs = getNestedValue(req, reqKey);
        } else {
          const paramKeyToUse = checkParamKey || `${resourceType}ID`;
          resourceIDs = req.params[paramKeyToUse];
          
          if (resourceIDs === undefined && bodyKey) {
            const getNestedValue = (obj, path) => path.split('.').reduce((acc, part) => acc && acc[part], obj);
            const bodyValue = getNestedValue(req.body, bodyKey);

            if (bodyValue === undefined && skipIfMissing) {
              // For PATCH requests where the binding ID is optional and omitted
              continue;
            }
            resourceIDs = bodyValue;
          }
        }
        
        // Normalize to array for iterative evaluation
        if (resourceIDs === undefined || resourceIDs === null) {
          resourceIDs = ["*"];
        } else if (!Array.isArray(resourceIDs)) {
          resourceIDs = [resourceIDs];
        }

        for (const id of resourceIDs) {
          const resourceSelector = `${resourceType}:${id}`;

          Logger.log("info", {
            message: "authMiddleware:authorize:check",
            params: { subjectID, tenantID, resourceSelector, action: checkAction, authType },
          });

          // Run Casbin enforcement
          const allowed = await casbinEnforce(
            subjectID,
            tenantID,
            resourceSelector,
            checkAction
          );

          if (!allowed) {
            Logger.log("error", {
              message: "authMiddleware:authorize:denied",
              params: { subjectID, tenantID, resourceSelector, action: checkAction },
            });

            return expressUtils.sendResponse(
              res,
              false,
              {},
              constants.ERROR_CODES.PERMISSION_DENIED
            );
          }
        }
      }

      Logger.log("success", {
        message: "authMiddleware:authorize:allowedAll",
        params: { subjectID, tenantID, checksCount: checks.length },
      });

      // Attach execution context for downstream services
      req.executionCtx = fromRequest(req);
      return next();
    } catch (error) {
      Logger.log("error", {
        message: "authMiddleware:authorize:error",
        params: { error: error.message },
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

authMiddleware.checkTenantMembership = async function (req, res, next) {
  try {
    const { user } = req;
    const { tenantID } = req.params;

    if (!user || !tenantID) {
      return expressUtils.sendResponse(res, false, {}, constants.ERROR_CODES.INVALID_REQUEST);
    }

    const membership = await prisma.tblUsersTenantsRelationship.findFirst({
      where: {
        tenantID,
        userID: user.userID,
      },
    });

    if (!membership) {
      Logger.log("warning", {
        message: "authMiddleware:checkTenantMembership:denied",
        params: { userID: user.userID, tenantID },
      });
      return expressUtils.sendResponse(res, false, {}, constants.ERROR_CODES.PERMISSION_DENIED);
    }

    return next();
  } catch (error) {
    Logger.log("error", {
      message: "authMiddleware:checkTenantMembership:error",
      params: { error: error.message },
    });
    return expressUtils.sendResponse(res, false, {}, error);
  }
};

module.exports = { authMiddleware };

