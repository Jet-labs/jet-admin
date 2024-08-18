const constants = require("../../constants");
const { extractError } = require("../../utils/error");
const Logger = require("../../utils/logger");
const { AccountService } = require("./account.services");

const accountController = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
accountController.getAllAccounts = async (req, res) => {
  try {
    const { pmUser, state, params } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_accounts = state.authorized_accounts;
    Logger.log("info", {
      message: "accountController:getAllAccounts:params",
      params: { pm_user_id },
    });
    if (
      !authorized_accounts ||
      (Array.isArray(authorized_accounts) && authorized_accounts.length == 0)
    ) {
      Logger.log("error", {
        message: "accountController:getAllAccounts:catch-1",
        params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
      });
      return res.json({
        success: false,
        error: extractError(constants.ERROR_CODES.PERMISSION_DENIED),
      });
    }
    const accounts = await AccountService.getAllAccounts();
    Logger.log("success", {
      message: "accountController:getAllAccounts:success",
      params: { pm_user_id, accounts },
    });

    return res.json({
      success: true,
      accounts: accounts,
    });
  } catch (error) {
    Logger.log("error", {
      message: "accountController:getAllAccounts:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
accountController.getAccountByID = async (req, res) => {
  try {
    const { pmUser, state, params } = req;
    const pm_account_id = parseInt(params.id);
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_accounts = state.authorized_accounts;
    Logger.log("info", {
      message: "accountController:getAccountByID:params",
      params: { pm_user_id, pm_account_id },
    });

    if (
      !authorized_accounts ||
      (Array.isArray(authorized_accounts) && authorized_accounts.length == 0)
    ) {
      Logger.log("error", {
        message: "accountController:getAccountByID:catch-1",
        params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
      });
      return res.json({
        success: false,
        error: extractError(constants.ERROR_CODES.PERMISSION_DENIED),
      });
    }
    const account = await AccountService.getAccountByID({
      pmAccountID: pm_account_id,
    });

    Logger.log("success", {
      message: "accountController:getAccountByID:success",
      params: { pm_user_id, account },
    });

    return res.json({
      success: true,
      account: account,
    });
  } catch (error) {
    Logger.log("error", {
      message: "accountController:getAccountByID:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
accountController.addAccount = async (req, res) => {
  try {
    const { pmUser, state, body } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);

    Logger.log("info", {
      message: "accountController:addAccount:params",
      params: { pm_user_id, body },
    });
    const account = await AccountService.addAccount({
      firstName: body.first_name,
      lastName: body.last_name,
      password: body.password,
      username: body.username,
      policyID: body.pm_policy_object_id,
      address1: body.address1,
    });

    Logger.log("success", {
      message: "accountController:addAccount:success",
      params: { pm_user_id, account },
    });

    return res.json({
      success: true,
      account,
    });
  } catch (error) {
    Logger.log("error", {
      message: "accountController:addAccount:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
accountController.updateAccount = async (req, res) => {
  try {
    const { pmUser, state, body } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_accounts = state.authorized_accounts;
    Logger.log("info", {
      message: "accountController:updateAccount:params",
      params: { pm_user_id, body },
    });
    if (
      !authorized_accounts ||
      (Array.isArray(authorized_accounts) && authorized_accounts.length == 0)
    ) {
      Logger.log("error", {
        message: "accountController:updateAccount:catch-1",
        params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
      });
      return res.json({
        success: false,
        error: extractError(constants.ERROR_CODES.PERMISSION_DENIED),
      });
    }

    const account = await AccountService.updateAccount({
      pmUserID: body.pm_user_id,
      firstName: body.first_name,
      lastName: body.last_name,
      policyID: body.pm_policy_object_id,
      address1: body.address1,
    });

    Logger.log("success", {
      message: "accountController:updateAccount:success",
      params: { pm_user_id, account },
    });

    return res.json({
      success: true,
      account,
    });
  } catch (error) {
    Logger.log("error", {
      message: "accountController:updateAccount:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
accountController.updatePassword = async (req, res) => {
  try {
    const { pmUser, state, body } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_accounts = state.authorized_accounts;

    Logger.log("info", {
      message: "accountController:updatePassword:params",
      params: { pm_user_id, body },
    });

    if (
      !authorized_accounts ||
      (Array.isArray(authorized_accounts) && authorized_accounts.length == 0)
    ) {
      Logger.log("error", {
        message: "accountController:updatePassword:catch-1",
        params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
      });
      return res.json({
        success: false,
        error: extractError(constants.ERROR_CODES.PERMISSION_DENIED),
      });
    }
    const account = await AccountService.updatePassword({
      pmUserID: body.pm_user_id,
      password: body.password,
    });

    Logger.log("success", {
      message: "accountController:updatePassword:success",
      params: { pm_user_id, account },
    });

    return res.json({
      success: true,
      account,
    });
  } catch (error) {
    Logger.log("error", {
      message: "accountController:updatePassword:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
accountController.deleteAccount = async (req, res) => {
  try {
    const { pmUser, state, params } = req;
    const pm_account_id = parseInt(params.id);
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_accounts = state.authorized_accounts;
    Logger.log("info", {
      message: "accountController:deleteAccount:params",
      params: { pm_user_id, pm_account_id },
    });

    if (
      !authorized_accounts ||
      (Array.isArray(authorized_accounts) && authorized_accounts.length == 0)
    ) {
      Logger.log("error", {
        message: "accountController:deleteAccount:catch-1",
        params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
      });
      return res.json({
        success: false,
        error: extractError(constants.ERROR_CODES.PERMISSION_DENIED),
      });
    }

    await AccountService.deleteAccount({
      pmAccountID: pm_account_id,
    });

    Logger.log("success", {
      message: "accountController:deleteAccount:success",
      params: { pm_user_id, pm_account_id },
    });

    return res.json({
      success: true,
    });
  } catch (error) {
    Logger.log("error", {
      message: "accountController:deleteAccount:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

module.exports = { accountController };
