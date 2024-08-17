const { extractError } = require("../../utils/error.utils");
const Logger = require("../../utils/logger");
const { TriggerService } = require("./trigger.services");

const triggerController = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
triggerController.getAllTriggers = async (req, res) => {
  try {
    const { pmUser, state, params } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    Logger.log("info", {
      message: "triggerController:getAllTriggers:params",
      params: { pm_user_id },
    });
    const triggers = await TriggerService.getAllTriggers();
    Logger.log("success", {
      message: "triggerController:getAllTriggers:success",
      params: { pm_user_id, triggersLength: triggers.rows.length },
    });
    return res.json({
      success: true,
      triggers: triggers.rows,
    });
  } catch (error) {
    Logger.log("error", {
      message: "triggerController:getAllTriggers:catch-1",
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
triggerController.getTriggerByID = async (req, res) => {
  try {
    const { pmUser, state, params } = req;
    const pm_trigger_id = parseInt(params.id);
    const pm_user_id = parseInt(pmUser.pm_user_id);
    Logger.log("info", {
      message: "triggerController:getTriggerByID:params",
      params: { pm_user_id, pm_trigger_id },
    });

    const trigger = await TriggerService.getTriggerByID({
      triggerID: pm_trigger_id,
    });
    Logger.log("success", {
      message: "triggerController:getTriggerByID:success",
      params: { pm_user_id, trigger },
    });
    return res.json({
      success: true,
      trigger: trigger,
    });
  } catch (error) {
    Logger.log("error", {
      message: "triggerController:getTriggerByID:catch-1",
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
triggerController.addTrigger = async (req, res) => {
  try {
    const { pmUser, state, body } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);

    Logger.log("info", {
      message: "triggerController:addTrigger:params",
      params: { pm_user_id, body },
    });

    const trigger = await TriggerService.addTrigger({
      pmTriggerName: body.pm_trigger_name,
      pmTriggerTableName: body.pm_trigger_table_name,
      pmTriggerTiming: body.pm_trigger_timing,
      pmTriggerEvents: body.pm_trigger_events,
      pmTriggerChannelName: body.pm_trigger_channel_name,
      pmTriggerMethod: body.pm_trigger_method,
      pmTriggerCondition: body.pm_trigger_condition,
    });

    Logger.log("success", {
      message: "triggerController:addTrigger:success",
      params: { pm_user_id, trigger },
    });

    return res.json({
      success: true,
      trigger,
    });
  } catch (error) {
    Logger.log("error", {
      message: "triggerController:addTrigger:catch-1",
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
triggerController.deleteTrigger = async (req, res) => {
  try {
    const { pmUser, state, params } = req;
    const pm_trigger_id = parseInt(params.id);
    const pm_user_id = parseInt(pmUser.pm_user_id);
    const authorized_triggers = state.authorized_triggers;

    Logger.log("info", {
      message: "triggerController:deleteTrigger:params",
      params: { pm_user_id, pm_trigger_id },
    });

    await TriggerService.deleteTrigger({
      triggerID: pm_trigger_id,
      authorizedTriggers: authorized_triggers,
    });

    Logger.log("success", {
      message: "triggerController:deleteTrigger:success",
      params: { pm_user_id },
    });

    return res.json({
      success: true,
    });
  } catch (error) {
    Logger.log("error", {
      message: "triggerController:deleteTrigger:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

module.exports = { triggerController };
