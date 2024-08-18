const { auth_db } = require("../../config/sqlite.db");
const constants = require("../../constants");
const { generateSaltAndPasswordHash } = require("../../utils/crypto");
const Logger = require("../../utils/logger");
class AccountService {
  constructor() {}

  /**
   *
   * @param {object} param0
   * @param {String} param0.firstName
   * @param {String} param0.lastName
   * @param {String} param0.address1
   * @param {String} param0.password
   * @param {Number} param0.policyID
   * @param {String} param0.username
   *
   */
  static addAccount = async ({
    firstName,
    lastName,
    address1,
    password,
    policyID,
    username,
  }) => {
    Logger.log("info", {
      message: "AccountService:addAccount:params",
      params: {
        firstName,
        lastName,
        address1,
        policyID,
        username,
      },
    });
    try {
      const userWithUsername = auth_db
        .prepare(`SELECT * FROM tbl_pm_users WHERE TRIM(username) = ? LIMIT 1`)
        .get(username.trim());
      if (userWithUsername) {
        Logger.log("error", {
          message: "AccountService:addAccount:catch-2",
          params: { error: constants.ERROR_CODES.USERNAME_TAKEN },
        });
        throw constants.ERROR_CODES.USERNAME_TAKEN;
      }
      const { salt, passwordHash } = generateSaltAndPasswordHash({
        password: String(password),
      });

      const stmt = auth_db.prepare(`INSERT INTO tbl_pm_users (
      first_name, last_name, address1, salt, password_hash, pm_policy_object_id, username, created_at, updated_at) VALUES (
      ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`);

      const newAccount = stmt.run(
        String(firstName),
        String(lastName),
        String(address1),
        String(salt),
        String(passwordHash),
        parseInt(policyID),
        String(username)
      );

      return newAccount;
    } catch (error) {
      Logger.log("error", {
        message: "AccountService:addAccount:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Number} param0.pmUserID
   * @param {String} param0.firstName
   * @param {String} param0.lastName
   * @param {String} param0.address1
   * @param {String} param0.password
   * @param {Number} param0.policyID
   * @param {String} param0.username
   *
   */
  static updateAccount = async ({
    pmUserID,
    firstName,
    lastName,
    address1,
    policyID,
  }) => {
    Logger.log("info", {
      message: "AccountService:updateAccount:params",
      params: {
        pmUserID,
        firstName,
        lastName,
        address1,
        policyID,
      },
    });
    try {
      const stmt = auth_db.prepare(`UPDATE tbl_pm_users SET
      first_name = ?,
      last_name = ?,
      address1 = ?,
      pm_policy_object_id = ?,
      updated_at = CURRENT_TIMESTAMP
      WHERE
      pm_user_id = ?
      `);

      const updatedAccount = stmt.run(
        String(firstName),
        String(lastName),
        String(address1),
        parseInt(policyID),
        parseInt(pmUserID)
      );
      Logger.log("success", {
        message: "AccountService:updateAccount:success",
        params: {
          pmUserID,
          firstName,
          lastName,
          address1,
          policyID,
        },
      });
      return updatedAccount;
    } catch (error) {
      Logger.log("error", {
        message: "AccountService:updateAccount:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Number} param0.pmUserID
   * @param {String} param0.password
   *
   */
  static updatePassword = async ({ pmUserID, password }) => {
    Logger.log("info", {
      message: "AccountService:updatePassword:params",
      params: {
        pmUserID,
      },
    });
    try {
      const { salt, passwordHash } = generateSaltAndPasswordHash({
        password: String(password),
      });

      const stmt = auth_db.prepare(`UPDATE tbl_pm_users
      SET
      salt = ?,
      password_hash = ?,
      updated_at = CURRENT_TIMESTAMP
      WHERE
      pm_user_id = ?
      `);

      const updatedAccount = stmt.run(
        String(salt),
        String(passwordHash),
        parseInt(pmUserID)
      );
      return updatedAccount;
    } catch (error) {
      Logger.log("error", {
        message: "AccountService:updatePassword:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @returns {any|null}
   */
  static getAllAccounts = async () => {
    Logger.log("info", {
      message: "PolicyService:getAllAccounts:init",
    });
    try {
      const stmt = auth_db.prepare(`
        SELECT *
        FROM tbl_pm_users
      `);
      const accounts = stmt.all();
      Logger.log("success", {
        message: "PolicyService:getAllAccounts:accounts",
        params: {
          accounts,
        },
      });
      return accounts;
    } catch (error) {
      Logger.log("error", {
        message: "PolicyService:getAllAccounts:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   * Fetches a policy from the database by its ID.
   *
   * @param {object} param0 - The options object.
   * @param {number} param0.pmAccountID - The ID of the policy to fetch.
   * @returns {any|null} The policy object if found, or null if not found or an error occurs.
   */
  static getAccountByID = async ({ pmAccountID }) => {
    Logger.log("info", {
      message: "PolicyService:getAccountByID:init",
      params: {
        pmAccountID,
      },
    });

    try {
      const stmt = auth_db.prepare(`
      SELECT *
      FROM tbl_pm_users
      WHERE pm_user_id = ?
    `);

      const account = stmt.get(parseInt(pmAccountID));

      if (account) {
        Logger.log("success", {
          message: "PolicyService:getAccountByID:policyFound",
          params: {
            account,
          },
        });
      } else {
        Logger.log("info", {
          message: "PolicyService:getAccountByID:noPolicyFound",
          params: {
            pmAccountID,
          },
        });
      }

      return account;
    } catch (error) {
      Logger.log("error", {
        message: "PolicyService:getAccountByID:catch-1",
        params: { error },
      });

      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Number} param0.pmAccountID
   * @returns {any|null}
   */
  static deleteAccount = async ({ pmAccountID }) => {
    Logger.log("info", {
      message: "PolicyService:deleteAccount:params",
      params: {
        pmAccountID,
      },
    });
    try {
      const stmt = auth_db.prepare(`
          DELETE FROM tbl_pm_users
          WHERE pm_user_id = ?
        `);

      const deletedAccount = stmt.run(parseInt(pmAccountID));
      Logger.log("success", {
        message: "PolicyService:deleteAccount:success",
        params: {
          pmAccountID,
        },
      });
      return true;
    } catch (error) {
      Logger.log("error", {
        message: "PolicyService:deleteAccount:catch-1",
        params: { error },
      });
      throw error;
    }
  };
}

module.exports = { AccountService };
