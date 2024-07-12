const { extractError } = require("../../utils/error.utils");
const Logger = require("../../utils/logger");
const { AccountService } = require("./account.services");

const accountController = {};

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

module.exports = { accountController };
