
const { firebaseApp } = require("../../config/firebase.config");
const { prisma } = require("../../config/prisma.config");
const constants = require("../../constants");
const environmentVariables = require("../../environment");
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
      // Preserve structured error code so Socket.IO error handlers and
      // consumers that inspect error.code get the right value (e.g. USER_AUTH_TOKEN_EXPIRED)
      const socketErr = new Error(error.message || String(error));
      socketErr.code = error.code;
      next(socketErr);
    }
  } else {
    Logger.log("error", {
      message: "authMiddleware:authProviderSocket:catch-1",
      params: { error: constants.ERROR_CODES.USER_AUTH_TOKEN_NOT_FOUND },
    });
    const socketErr = new Error(constants.ERROR_CODES.USER_AUTH_TOKEN_NOT_FOUND.message);
    socketErr.code = constants.ERROR_CODES.USER_AUTH_TOKEN_NOT_FOUND.code;
    next(socketErr);
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
    req.headers.authorization.startsWith(constants.AUTH_PREFIXES.BEARER)
  ) {
    try {
      let idToken = req.headers.authorization.split(constants.AUTH_PREFIXES.BEARER)[1];
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
            constants.ERROR_CODES.INVALID_USER,
            constants.HTTP_STATUS.UNAUTHORIZED
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
        error,
        constants.HTTP_STATUS.UNAUTHORIZED
      );
    }
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith(constants.AUTH_PREFIXES.API_KEY)
  ) {
    try {
      let apiKey = req.headers.authorization.split(constants.AUTH_PREFIXES.API_KEY)[1];
      const prefix = apiKey.substring(0, constants.DEFAULTS.API_KEY_PREFIX_LENGTH);
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
        error,
        constants.HTTP_STATUS.UNAUTHORIZED
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
      constants.ERROR_CODES.USER_AUTH_TOKEN_NOT_FOUND,
      constants.HTTP_STATUS.UNAUTHORIZED
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
  if (environmentVariables.NODE_ENV !== constants.ENVIRONMENTS.TEST) {
    return expressUtils.sendResponse(res, false, {}, constants.ERROR_CODES.PERMISSION_DENIED, constants.HTTP_STATUS.FORBIDDEN);
  }
  try {
    req.user = await authService.getUserFromEmailID({
      email: constants.DEFAULTS.TEST_USER_EMAIL,
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
      error,
      constants.HTTP_STATUS.UNAUTHORIZED
    );
  }
};


/**
 * Casbin-based resource-level authorization middleware.
 *
 * Checks whether the current user/API key is allowed to perform
 * a specific action on a specific resource within the tenant.
 *
 * Usage in routes:
 *   authMiddleware.authorize(P.dataquery.list)
 *   authMiddleware.authorize({ ...P.workflow.execute, paramKey: "workflowID" })
 *   authMiddleware.authorize([P.appPage.create, { ...P.dataquery.execute, reqKey: "dataQueryIDs", skipIfMissing: true }])
 *
 * Also accepts the legacy two-string form:
 *   authMiddleware.authorize("dataquery", "list")
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
 * @param {string|object|Array<object>} resourceTypeOrArray - Resource type string, single descriptor
 *   object ({resource, action, ...opts}), or array of descriptor objects
 * @param {string} [action] - Action if using single resource type (legacy two-string form)
 * @param {object} [options]
 * @param {string} [options.paramKey] - Override the param key used to extract the resource ID
 * @param {string} [options.bodyKey] - Key to extract the resource ID from req.body (useful for bindings)
 * @param {string} [options.reqKey] - Dot-path into req object to extract the resource ID(s)
 * @param {boolean} [options.skipIfMissing] - If true and bodyKey/reqKey value is missing, skip authorization (useful for PATCH)
 */
authMiddleware.authorize = (resourceTypeOrArray, action, options = {}) => {
  let checks;
  if (Array.isArray(resourceTypeOrArray)) {
    checks = resourceTypeOrArray;
  } else if (
    resourceTypeOrArray &&
    typeof resourceTypeOrArray === "object" &&
    "resource" in resourceTypeOrArray
  ) {
    checks = [resourceTypeOrArray];
  } else {
    checks = [{ resource: resourceTypeOrArray, action, ...options }];
  }

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
        Logger.log("error", {
          message: "authMiddleware:authorize:missingContext",
          params: { hasSubject: !!subjectID, hasTenant: !!tenantID },
        });
        return expressUtils.sendResponse(
          res,
          false,
          {},
          constants.ERROR_CODES.INVALID_REQUEST,
          constants.HTTP_STATUS.BAD_REQUEST
        );
      }

      for (const check of checks) {
        const { resource: resourceType, action: checkAction, paramKey: checkParamKey, bodyKey, reqKey, skipIfMissing } = check;

        // Resolve resource ID from req, route params, or body
        let resourceIDs;
        if (reqKey) {
          const getNestedValue = (obj, path) => path.split('.').reduce((acc, part) => acc && acc[part], obj);
          resourceIDs = getNestedValue(req, reqKey);
          if (resourceIDs === undefined && skipIfMissing) {
            continue;
          }
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
              constants.ERROR_CODES.PERMISSION_DENIED,
              constants.HTTP_STATUS.FORBIDDEN
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
        constants.ERROR_CODES.SERVER_ERROR,
        constants.HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  };
};

authMiddleware.checkTenantMembership = async function (req, res, next) {
  try {
    const { user } = req;
    const { tenantID } = req.params;

    if (!user || !tenantID) {
      return expressUtils.sendResponse(res, false, {}, constants.ERROR_CODES.INVALID_REQUEST, constants.HTTP_STATUS.BAD_REQUEST);
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
      return expressUtils.sendResponse(res, false, {}, constants.ERROR_CODES.PERMISSION_DENIED, constants.HTTP_STATUS.FORBIDDEN);
    }

    return next();
  } catch (error) {
    Logger.log("error", {
      message: "authMiddleware:checkTenantMembership:error",
      params: { error: error.message },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

module.exports = { authMiddleware };

