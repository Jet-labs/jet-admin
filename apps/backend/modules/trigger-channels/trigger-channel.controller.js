const { extractError } = require("../../utils/error");
const Logger = require("../../utils/logger");
const { TriggerChannelService } = require("./trigger-channel.services");

const triggerChannelController = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
triggerChannelController.getAllTriggerChannels = async (req, res) => {
  try {
    const { pmUser, state, params } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);
    Logger.log("info", {
      message: "triggerChannelController:getAllTriggerChannels:params",
      params: { pm_user_id },
    });

    const triggerChannels = await TriggerChannelService.getAllTriggerChannels();
    Logger.log("success", {
      message: "triggerChannelController:getAllTriggerChannels:success",
      params: { pm_user_id, triggerChannels },
    });

    return res.json({
      success: true,
      triggerChannels: triggerChannels,
    });
  } catch (error) {
    Logger.log("error", {
      message: "triggerChannelController:getAllTriggerChannels:catch-1",
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
triggerChannelController.addTriggerChannel = async (req, res) => {
  try {
    const { pmUser, state, body } = req;
    const pm_user_id = parseInt(pmUser.pm_user_id);

    Logger.log("info", {
      message: "triggerChannelController:addTriggerChannel:params",
      params: { pm_user_id, body },
    });

    const triggerChannel = await TriggerChannelService.addTriggerChannel({
      triggerChannelName: body.pm_trigger_channel_name,
    });

    Logger.log("success", {
      message: "triggerChannelController:addTriggerChannel:success",
      params: { pm_user_id, triggerChannel },
    });

    return res.json({
      success: true,
      triggerChannel,
    });
  } catch (error) {
    Logger.log("error", {
      message: "triggerChannelController:addTriggerChannel:catch-1",
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
triggerChannelController.deleteTriggerChannel = async (req, res) => {
  try {
    const { pmUser, state, params } = req;
    const pm_trigger_channel_name = parseInt(params.id);
    const pm_user_id = parseInt(pmUser.pm_user_id);

    Logger.log("info", {
      message: "triggerChannelController:deleteTriggerChannel:params",
      params: { pm_user_id, pm_trigger_channel_name },
    });

    await TriggerChannelService.deleteTriggerChannel({
      triggerChannelName: String(pm_trigger_channel_name),
    });

    Logger.log("success", {
      message: "triggerChannelController:deleteTriggerChannel:success",
      params: { pm_user_id },
    });

    return res.json({
      success: true,
    });
  } catch (error) {
    Logger.log("error", {
      message: "triggerChannelController:deleteTriggerChannel:catch-1",
      params: { error },
    });
    return res.json({ success: false, error: extractError(error) });
  }
};

module.exports = { triggerChannelController };
