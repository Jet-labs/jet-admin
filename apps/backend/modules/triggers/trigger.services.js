const Logger = require("../../utils/logger");

const {
  generateCreateTriggerQuery,
  getAllTriggersFromDBQuery,
  getTriggerByName,
  deleteTriggerByName,
} = require("../../utils/postgres-utils/triggers-queries");
const { pgPool } = require("../../db/pg");
const {
  parseTriggerDefinition,
} = require("../../utils/postgres-utils/parsers");
// Configure the connection to your PostgreSQL database

class TriggerService {
  constructor() {}

  static registerTriggerNotificationChannel = async ({
    pmTriggerChannelName,
  }) => {
    const client = await pgPool.connect();
    Logger.log("info", {
      message: "TriggerService:registerTriggerNotificationChannel:params",
      params: { pmTriggerChannelName },
    });
    await client.query(`LISTEN ${pmTriggerChannelName}`);
    client.on("notification", async (msg) => {
      const payload = JSON.parse(msg.payload);
      console.log("Received notification:", payload);
      // Execute your Node.js code here based on the notification
      // For example, you might want to trigger an external API call, log data, etc.
    });
    Logger.log("success", {
      message: "TriggerService:registerTriggerNotificationChannel:success",
      params: { pmTriggerChannelName },
    });
  };

  static unregisterTriggerNotificationChannel = async ({
    pmTriggerChannelName,
  }) => {
    const client = await pgPool.connect();
    Logger.log("info", {
      message: "TriggerService:unregisterTriggerNotificationChannel:params",
      params: { pmTriggerChannelName },
    });
    await client.query(`UNLISTEN ${pmTriggerChannelName}`);
    Logger.log("success", {
      message: "TriggerService:unregisterTriggerNotificationChannel:success",
      params: { pmTriggerChannelName },
    });
  };

  static registerAllTriggerNotificationChannelsOnStartup = async () => {
    try {
      Logger.log("info", {
        message:
          "TriggerService:registerAllTriggerNotificationChannelsOnStartup:init",
      });
      const triggers = await this.getAllTriggers();
      const triggerSetupPromises = triggers
        .filter((trigger) => {
          if (
            trigger.pm_trigger_channel_name != undefined ||
            trigger.pm_trigger_channel_name != null
          ) {
            return true;
          }
          return false;
        })
        .map((trigger) => {
          return this.registerTriggerNotificationChannel({
            pmTriggerChannelName: trigger.pm_trigger_channel_name,
          });
        });
      await Promise.all(triggerSetupPromises);
      Logger.log("success", {
        message:
          "TriggerService:registerAllTriggerNotificationChannelsOnStartup:success",
      });
    } catch (error) {
      Logger.log("error", {
        message:
          "TriggerService:registerAllTriggerNotificationChannelsOnStartup:catch-1",
        params: { error },
      });
    }
  };

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
          pmTriggerName,
          newTrigger,
        },
      });
      // setup trigger
      await this.registerTriggerNotificationChannel({
        pmTriggerChannelName: pmTriggerChannelName,
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
          triggersLength: triggers?.rows?.length,
        },
      });
      client.release();
      return triggers.rows.map((trigger) => {
        // Extract channel name and condition from the trigger definition if necessary

        const parsedTriggerDefinition = parseTriggerDefinition(
          trigger.trigger_definition
        );

        return {
          // schemaName: schema_name,
          pm_trigger_table_name: parsedTriggerDefinition.trigger_table_name,
          pm_trigger_name: parsedTriggerDefinition.trigger_name,
          pm_trigger_timing: parsedTriggerDefinition.trigger_timing,
          pm_trigger_events: parsedTriggerDefinition.trigger_events, // Filter out unknown events
          pm_trigger_channel_name: parsedTriggerDefinition.trigger_channel, // Assuming channel name is second argument
          pm_trigger_condition: parsedTriggerDefinition.trigger_condition,
          pm_trigger_function_name:
            parsedTriggerDefinition.trigger_function_name,
          pm_trigger_function_args:
            parsedTriggerDefinition.trigger_function_args,
        };
      });
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
   * @param {String} param0.pmTriggerName
   * @param {String} param0.pmTriggerTableName
   * @returns {any|null}
   */
  static getTriggerByID = async ({ pmTriggerName, pmTriggerTableName }) => {
    Logger.log("info", {
      message: "TriggerService:getTriggerByID:params",
      params: {
        pmTriggerName,
        pmTriggerTableName,
      },
    });
    try {
      const client = await pgPool.connect();
      await client.query("BEGIN");
      const result = await client.query(getTriggerByName(), [
        pmTriggerName,
        pmTriggerTableName,
      ]);
      await client.query("COMMIT");
      client.release();
      const parsedTriggerDefinition = parseTriggerDefinition(
        result.rows[0].trigger_definition
      );

      return {
        // schemaName: schema_name,
        pm_trigger_table_name: parsedTriggerDefinition.trigger_table_name,
        pm_trigger_name: parsedTriggerDefinition.trigger_name,
        pm_trigger_timing: parsedTriggerDefinition.trigger_timing,
        pm_trigger_events: parsedTriggerDefinition.trigger_events, // Filter out unknown events
        pm_trigger_channel_name: parsedTriggerDefinition.trigger_function_name, // Assuming channel name is second argument
        pm_trigger_condition: parsedTriggerDefinition.trigger_condition,
        pm_trigger_function_name: parsedTriggerDefinition.trigger_function_name,
        pm_trigger_function_args: parsedTriggerDefinition.trigger_function_args,
        pm_trigger_channel_name: parsedTriggerDefinition.trigger_channel,
      };
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
   * @param {String} param0.pmTriggerName
   * @param {String} param0.pmTriggerTableName
   * @returns {any|null}
   */
  static deleteTrigger = async ({ pmTriggerName, pmTriggerTableName }) => {
    Logger.log("info", {
      message: "TriggerService:deleteTrigger:params",
      params: {
        pmTriggerName,
        pmTriggerTableName,
      },
    });
    try {
      const client = await pgPool.connect();
      await client.query("BEGIN");
      const result = await client.query(
        deleteTriggerByName({
          triggerName: pmTriggerName,
          tableName: pmTriggerTableName,
        })
      );
      const parsedTriggerDefinition = parseTriggerDefinition(
        result.rows[0].trigger_definition
      );
      console.log({ parsedTriggerDefinition });
      await client.query("COMMIT");
      // unregister trigger
      await this.unregisterTriggerNotificationChannel({
        pmTriggerChannelName: parsedTriggerDefinition.trigger_channel,
      });
      client.release();
      return result;
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
