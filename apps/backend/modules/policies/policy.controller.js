const constants = require("../../constants");
const { extractError } = require("../../utils/error.util");
const Logger = require("../../utils/logger");
const { PolicyService } = require("./policy.service");

const policyController = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
policyController.getAllPolicies = async (req, res) => {
  try {
    const { pmUser, state, params } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_policies = state.authorized_policies;
    Logger.log("info", {
      message: "policyController:getAllPolicies:params",
      params: { pm_user_id },
    });
    if (
      !authorized_policies ||
      (Array.isArray(authorized_policies) && authorized_policies.length == 0)
    ) {
      Logger.log("error", {
        message: "policyController:getAllPolicies:catch-1",
        params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
      });
      return res.json({
        success: false,
        error: extractError(constants.ERROR_CODES.PERMISSION_DENIED),
      });
    }
    const policies = await PolicyService.getAllPolicies();
    Logger.log("success", {
      message: "policyController:getAllPolicies:success",
      params: { pm_user_id, policies },
    });

    return res.json({
      success: true,
      policies: policies,
    });
  } catch (error) {
    Logger.log("error", {
      message: "policyController:getAllPolicies:catch-1",
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
policyController.getPolicyByID = async (req, res) => {
  try {
    const { pmUser, state, params } = req;
    const pm_policy_object_id = parseInt(params.id);
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_policies = state.authorized_policies;
    Logger.log("info", {
      message: "policyController:getPolicyByID:params",
      params: { pm_user_id, pm_policy_object_id },
    });
    if (
      !authorized_policies ||
      (Array.isArray(authorized_policies) && authorized_policies.length == 0)
    ) {
      Logger.log("error", {
        message: "policyController:getPolicyByID:catch-1",
        params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
      });
      return res.json({
        success: false,
        error: extractError(constants.ERROR_CODES.PERMISSION_DENIED),
      });
    }
    const policy = await PolicyService.getPolicyByID({
      pmPolicyObjectID: pm_policy_object_id,
    });

    Logger.log("success", {
      message: "policyController:getPolicyByID:success",
      params: { pm_user_id, policy },
    });

    return res.json({
      success: true,
      policy: policy,
    });
  } catch (error) {
    Logger.log("error", {
      message: "policyController:getPolicyByID:catch-1",
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
policyController.duplicatePolicy = async (req, res) => {
  try {
    const { pmUser, state, body } = req;
    const pm_policy_object_id = parseInt(body.pm_policy_object_id);
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_policies = state.authorized_policies;
    Logger.log("info", {
      message: "policyController:duplicatePolicy:params",
      params: { pm_user_id, pm_policy_object_id },
    });
    
    const newPolicy = await PolicyService.duplicatePolicy({
      pmPolicyObjectID: pm_policy_object_id,
    });

    Logger.log("success", {
      message: "policyController:duplicatePolicy:success",
      params: { pm_user_id, newPolicy },
    });

    return res.json({
      success: true,
      policy: newPolicy,
    });
  } catch (error) {
    Logger.log("error", {
      message: "policyController:duplicatePolicy:catch-1",
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
policyController.addPolicy = async (req, res) => {
  try {
    const { pmUser, state, body } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_policies = state.authorized_policies;
    Logger.log("info", {
      message: "policyController:addPolicy:params",
      params: { pm_user_id, body },
    });

    const newPolicy = await PolicyService.addPolicy({
      pmPolicyObjectTitle: body.pm_policy_object_title,
      pmPolcyObject: body.pm_policy_object,
    });

    Logger.log("success", {
      message: "policyController:addPolicy:success",
      params: { pm_user_id, newPolicy },
    });

    return res.json({
      success: true,
      policy: newPolicy,
    });
  } catch (error) {
    Logger.log("error", {
      message: "policyController:addPolicy:catch-1",
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
policyController.updatePolicy = async (req, res) => {
  try {
    const { pmUser, state, body } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_policies = state.authorized_policies;
    Logger.log("info", {
      message: "policyController:updatePolicy:params",
      params: { pm_user_id, body },
    });
    if (
      !authorized_policies ||
      (Array.isArray(authorized_policies) && authorized_policies.length == 0)
    ) {
      Logger.log("error", {
        message: "policyController:updatePolicy:catch-1",
        params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
      });
      return res.json({
        success: false,
        error: extractError(constants.ERROR_CODES.PERMISSION_DENIED),
      });
    }
    const updatedPolicy = await PolicyService.updatePolicy({
      pmPolicyObjectID: parseInt(body.pm_policy_object_id),
      pmPolicyObjectTitle: body.pm_policy_object_title,
      pmPolcyObject: body.pm_policy_object,
      isDisabled: body.is_disabled,
      disableReason: body.disable_reason,
    });

    Logger.log("success", {
      message: "policyController:updatePolicy:success",
      params: { pm_user_id, updatedPolicy },
    });

    return res.json({
      success: true,
      policy: updatedPolicy,
    });
  } catch (error) {
    Logger.log("error", {
      message: "policyController:updatePolicy:catch-1",
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
policyController.deletePolicy = async (req, res) => {
  try {
    const { pmUser, state, params } = req;
    const pm_policy_object_id = parseInt(params.id);
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_policies = state.authorized_policies;
    Logger.log("info", {
      message: "policyController:deletePolicy:params",
      params: { pm_user_id, pm_policy_object_id },
    });
    if (
      !authorized_policies ||
      (Array.isArray(authorized_policies) && authorized_policies.length == 0)
    ) {
      Logger.log("error", {
        message: "policyController:deletePolicy:catch-1",
        params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
      });
      return res.json({
        success: false,
        error: extractError(constants.ERROR_CODES.PERMISSION_DENIED),
      });
    }
    await PolicyService.deletePolicy({
      pmPolicyObjectID: pm_policy_object_id,
    });

    Logger.log("success", {
      message: "policyController:deletePolicy:success",
      params: { pm_user_id },
    });

    return res.json({
      success: true,
    });
  } catch (error) {
    Logger.log("error", {
      message: "policyController:deletePolicy:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

module.exports = { policyController };
