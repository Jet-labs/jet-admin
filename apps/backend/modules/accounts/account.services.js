const { prisma } = require("../../config/prisma");
const constants = require("../../constants");
const { generateSaltAndPasswordHash } = require("../../utils/crypto.utils");
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
   * @returns {import("@prisma/client").tbl_pm_users}
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
      const userWithUsername = await prisma.tbl_pm_users.findFirst({
        where: {
          username: String(username),
        },
      });
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
      const newAccount = await prisma.tbl_pm_users.create({
        data: {
          first_name: String(firstName),
          last_name: String(lastName),
          address1: String(address1),
          salt: salt,
          password_hash: passwordHash,
          pm_policy_object_id: parseInt(policyID),
          username: String(username),
        },
      });

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
   * @returns {import("@prisma/client").tbl_pm_users}
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
      const updatedAccount = await prisma.tbl_pm_users.update({
        where: {
          pm_user_id: parseInt(pmUserID),
        },
        data: {
          first_name: String(firstName),
          last_name: String(lastName),
          address1: String(address1),
          pm_policy_object_id: parseInt(policyID),
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
   * @returns {import("@prisma/client").tbl_pm_users}
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
      const updatedAccount = await prisma.tbl_pm_users.update({
        where: {
          pm_user_id: parseInt(pmUserID),
        },
        data: {
          salt: salt,
          password_hash: passwordHash,
        },
      });
      return updatedAccount;
    } catch (error) {
      Logger.log("error", {
        message: "AccountService:updatePassword:catch-1",
        params: { error },
      });
      throw error;
    }
  };
}

module.exports = { AccountService };
