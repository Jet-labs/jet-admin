const { prisma } = require("../../config/prisma");
const environment = require("../../environment");
const constants = require("../../constants");
const Logger = require("../../utils/logger");

const {
  generateCreateTriggerQuery,
  getAllTriggersFromDBQuery,
} = require("../../utils/triggers");
const { pgPool } = require("../../config/pg");
// Configure the connection to your PostgreSQL database

class TriggerService {
  constructor() {}

  /**
   *
   * @param {object} param0
   * @param {String} param0.pmTriggerName
   * @param {String} param0.pmTriggerTableName
   * @param {String} param0.pmTriggerTiming
   * @param {Array<String>} param0.pmTriggerEvents
   * @param {String} param0.pmTriggerChannelName
   * @param {String} param0.pmTriggerMethod
   * @param {String} param0.pmTriggerCondition
   * @returns {any|null}
   */
  static addTrigger = async ({
    pmTriggerName,
    pmTriggerTableName,
    pmTriggerTiming,
    pmTriggerEvents,
    pmTriggerChannelName,
    pmTriggerMethod,
    pmTriggerCondition,
  }) => {
    Logger.log("info", {
      message: "TriggerService:addTrigger:params",
      params: {
        pmTriggerName,
        pmTriggerTableName,
        pmTriggerTiming,
        pmTriggerEvents,
        pmTriggerChannelName,
        pmTriggerMethod,
        pmTriggerCondition,
      },
    });
    try {
      const client = await pgPool.connect();
      await client.query("BEGIN");
      const newTrigger = await client.query(
        generateCreateTriggerQuery({
          pmTriggerName,
          pmTriggerTableName,
          pmTriggerTiming,
          pmTriggerEvents,
          pmTriggerChannelName,
          pmTriggerMethod,
          pmTriggerCondition,
        })
      );
      await client.query("COMMIT");
      Logger.log("success", {
        message: "TriggerService:addTrigger:newTrigger",
        params: {
          triggerTitle,
          newTrigger,
        },
      });
      client.release();
      return newTrigger;
    } catch (error) {
      Logger.log("error", {
        message: "TriggerService:addTrigger:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Boolean|Array<Number>} param0.authorizedTriggers
   * @returns {any|null}
   */
  static getAllTriggers = async () => {
    Logger.log("info", {
      message: "TriggerService:getAllTriggers:params",
    });
    try {
      const client = await pgPool.connect();
      await client.query("BEGIN");
      const triggers = await client.query(getAllTriggersFromDBQuery());
      await client.query("COMMIT");
      Logger.log("info", {
        message: "TriggerService:getAllTriggers:trigger",
        params: {
          triggersLength: triggers?.length,
        },
      });
      return triggers;
    } catch (error) {
      Logger.log("error", {
        message: "TriggerService:getAllTriggers:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Number} param0.triggerID
   * @param {Boolean|Array<Number>} param0.authorizedTriggers
   * @returns {any|null}
   */
  static getTriggerByID = async ({ triggerID, authorizedTriggers }) => {
    Logger.log("info", {
      message: "TriggerService:getTriggerByID:params",
      params: {
        triggerID,
        authorizedTriggers,
      },
    });
    try {
      if (
        authorizedTriggers === true ||
        authorizedTriggers.includes(triggerID)
      ) {
        const trigger = await prisma.tbl_pm_triggers.findUnique({
          where: {
            pm_trigger_id: triggerID,
          },
        });
        Logger.log("info", {
          message: "TriggerService:getTriggerByID:trigger",
          params: {
            trigger,
          },
        });
        return trigger;
      } else {
        Logger.log("error", {
          message: "TriggerService:getTriggerByID:catch-2",
          params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
        });
        throw constants.ERROR_CODES.PERMISSION_DENIED;
      }
    } catch (error) {
      Logger.log("error", {
        message: "TriggerService:getTriggerByID:catch-1",
        params: { error },
      });
      throw error;
    }
  };

  /**
   *
   * @param {object} param0
   * @param {Number} param0.triggerID
   * @param {Boolean|Array<Number>} param0.authorizedTriggers
   * @returns {any|null}
   */
  static deleteTrigger = async ({ triggerID, authorizedTriggers }) => {
    Logger.log("info", {
      message: "TriggerService:deleteTrigger:params",
      params: {
        triggerID,
        authorizedTriggers,
      },
    });
    try {
      if (
        authorizedTriggers === true ||
        authorizedTriggers.includes(triggerID)
      ) {
        const trigger = await prisma.tbl_pm_triggers.delete({
          where: {
            pm_trigger_id: triggerID,
          },
        });
        Logger.log("info", {
          message: "TriggerService:deleteTrigger:trigger",
          params: {
            trigger,
          },
        });
        return true;
      } else {
        Logger.log("error", {
          message: "TriggerService:deleteTrigger:catch-2",
          params: { error: constants.ERROR_CODES.PERMISSION_DENIED },
        });
        throw constants.ERROR_CODES.PERMISSION_DENIED;
      }
    } catch (error) {
      Logger.log("error", {
        message: "TriggerService:deleteTrigger:catch-1",
        params: { error },
      });
      throw error;
    }
  };
}

module.exports = { TriggerService };
