const constants = require("../../constants");

const jwt = require("jsonwebtoken");
const environmentVariables = require("../../environment");
const Logger = require("../../utils/logger");
const { comparePasswordWithHash } = require("../../utils/crypto.util");
const { sqliteDB } = require("../../db/sqlite");

class AuthService {
  constructor() {}

  /**
   *
   * @param {object} param0
   * @param {Number} param0.pm_user_id
   * @returns {String}
   */
  static generateAccessToken = ({ pm_user_id }) => {
    const accessToken = jwt.sign(
      { pm_user_id },
      environmentVariables.JWT_ACCESS_TOKEN_SECRET,
      {
        expiresIn: constants.ACCESS_TOKEN_TIMEOUT,
      }
    );
    return accessToken;
  };

  /**
   *
   * @param {object} param0
   * @param {Number} param0.pm_user_id
   * @returns {String}
   */
  static generateRefreshToken = ({ pm_user_id }) => {
    const refreshToken = jwt.sign(
      { pm_user_id },
      environmentVariables.JWT_REFRESH_TOKEN_SECRET,
      {
        expiresIn: constants.REFRESH_TOKEN_TIMEOUT,
      }
    );
    return refreshToken;
  };

  /**
   *
   * @param {*} param0
   * @param {String} param0.accessToken
   * @returns
   */
  static verifyAccessToken = async ({ accessToken }) => {
    try {
      const payload = await jwt.verify(
        accessToken,
        environmentVariables.JWT_ACCESS_TOKEN_SECRET
      );
      Logger.log("info", {
        message: "AuthService:verifyAccessToken:pm_user_id",
        params: { pm_user_id: payload.pm_user_id },
      });
      const pmUser = sqliteDB
        .prepare(
          `SELECT u.*, p.* FROM tbl_pm_users u LEFT JOIN tbl_pm_policy_objects p ON u.pm_policy_object_id = p.pm_policy_object_id WHERE u.pm_user_id = ? AND u.is_disabled = false`
        )
        .get(payload.pm_user_id);
      if (!pmUser) {
        Logger.log("error", {
          message: "AuthService:verifyAccessToken:catch-2",
          params: { error: constants.ERROR_CODES.INVALID_USER },
        });
        throw constants.ERROR_CODES.INVALID_USER;
      } else {
        Logger.log("success", {
          message: "AuthService:verifyAccessToken:success",
          params: { pm_user_id: payload.pm_user_id },
        });
        return pmUser;
      }
    } catch (error) {
      Logger.log("error", {
        message: "AuthService:verifyAccessToken:catch-1",
        params: { error },
      });
      throw constants.ERROR_CODES.USER_AUTH_TOKEN_EXPIRED;
    }
  };

  /**
   *
   * @param {*} param0
   * @param {String} param0.refreshToken
   * @returns
   */
  static verifyRefreshToken = async ({ refreshToken }) => {
    try {
      const payload = await jwt.verify(
        refreshToken,
        environmentVariables.JWT_REFRESH_TOKEN_SECRET
      );
      Logger.log("success", {
        message: "AuthService:verifyRefreshToken:success",
        params: { pm_user_id: payload.pm_user_id },
      });
      return parseInt(payload.pm_user_id);
    } catch (error) {
      Logger.log("error", {
        message: "AuthService:verifyRefreshToken:catch-1",
        params: { error },
      });
      throw constants.ERROR_CODES.USER_REFRESH_TOKEN_EXPIRED;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {String} param0.username
   * @param {String} param0.password
   * @returns
   */
  static loginUserWithUsernamePassword = async ({ username, password }) => {
    try {
      Logger.log("info", {
        message: "AuthService:loginUserWithUsernamePassword:params",
        params: {
          username,
        },
      });

      const pmUser = sqliteDB
        .prepare(`SELECT * FROM tbl_pm_users WHERE TRIM(username) = ? LIMIT 1`)
        .get(username.trim());

      Logger.log("info", {
        message: "AuthService:loginUserWithUsernamePassword:pmUser",
        params: { pmUser },
      });
      if (!pmUser || pmUser.is_disabled) {
        Logger.log("error", {
          message: "AuthService:loginUserWithUsernamePassword:catch-2",
          params: { error: constants.ERROR_CODES.INVALID_USER },
        });
        throw constants.ERROR_CODES.INVALID_USER;
      }
      if (
        comparePasswordWithHash({
          password,
          salt: pmUser.salt,
          passwordHash: pmUser.password_hash,
        })
      ) {
        const accessToken = this.generateAccessToken({
          pm_user_id: pmUser.pm_user_id,
        });
        const refreshToken = this.generateRefreshToken({
          pm_user_id: pmUser.pm_user_id,
        });

        Logger.log("success", {
          message: "AuthService:loginUserWithUsernamePassword:success",
          params: { username },
        });

        return { accessToken, refreshToken };
      } else {
        Logger.log("error", {
          message: "AuthService:loginUserWithUsernamePassword:catch-2",
          params: { error: constants.ERROR_CODES.INVALID_LOGIN },
        });
        throw constants.ERROR_CODES.INVALID_LOGIN;
      }
    } catch (error) {
      Logger.log("error", {
        message: "AuthService:loginUserWithUsernamePassword:catch-1",
        params: { error },
      });
      throw error;
    }
  };
}

module.exports = { AuthService };
