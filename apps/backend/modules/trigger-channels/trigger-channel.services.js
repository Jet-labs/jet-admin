const { prisma } = require("../../db/prisma");
const constants = require("../../constants");
const Logger = require("../../utils/logger");

class TriggerChannelService {
  constructor() {}

  /**
   *
   * @param {object} param0
   * @param {String} param0.triggerChannelName
   * @returns {any|null}
   */
  static addTriggerChannel = async ({ triggerChannelName }) => {
    Logger.log("info", {
      message: "TriggerChannelService:addTriggerChannel:params",
      params: {
        triggerChannelName,
      },
    });
    try {
      const newTriggerChannel = await prisma.tbl_pm_trigger_channels.create({
        data: {
          pm_trigger_channel_name: String(triggerChannelName),
        },
      });
      Logger.log("success", {
        message: "TriggerChannelService:addTriggerChannel:newTriggerChannel",
        params: {
          newTriggerChannel,
        },
      });
      return newTriggerChannel;
    } catch (error) {
      Logger.log("error", {
        message: "TriggerChannelService:addTriggerChannel:catch-1",
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
  static getAllTriggerChannels = async () => {
    Logger.log("info", {
      message: "TriggerChannelService:getAllTriggerChannels:params",
    });
    try {
      const triggerChannels = await prisma.tbl_pm_trigger_channels.findMany();
      Logger.log("info", {
        message: "TriggerChannelService:getAllTriggerChannels:trigger",
        params: {
          triggerChannelsLength: triggerChannels?.length,
        },
      });
      return triggerChannels;
    } catch (error) {
      Logger.log("error", {
        message: "TriggerChannelService:getAllTriggerChannels:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {String} param0.triggerChannelName
   * @returns {any|null}
   */
  static deleteTriggerChannel = async ({ triggerChannelName }) => {
    Logger.log("info", {
      message: "TriggerChannelService:deleteTriggerChannel:params",
      params: {
        triggerChannelName,
      },
    });
    try {
      const triggerChannel = await prisma.tbl_pm_trigger_channels.delete({
        where: {
          pm_trigger_channel_name: String(triggerChannelName),
        },
      });
      Logger.log("info", {
        message: "TriggerChannelService:deleteTriggerChannel:triggerChannel",
        params: {
          triggerChannel,
        },
      });
      return true;
    } catch (error) {
      Logger.log("error", {
        message: "TriggerChannelService:deleteTriggerChannel:catch-1",
        params: { error },
      });
      throw error;
    }
  };
}

module.exports = { TriggerChannelService };
