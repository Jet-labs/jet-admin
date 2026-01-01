import twilio from "twilio";
import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

export default class TwilioDataSource extends DataSource {
  async execute(dataQueryOptions, context) {
    Logger.log("info", {
      message: "twilio:TwilioDataSource:execute:params",
      params: { dataQueryOptions },
    });

    const { resource, operation, resourceSid, params, limit } = dataQueryOptions;
    const datasourceOptions = this.config.datasourceOptions;

    const client = twilio(datasourceOptions?.accountSid, datasourceOptions?.authToken);
    const parsedParams = params ? (typeof params === "string" ? JSON.parse(params) : params) : {};

    try {
      let result;

      switch (resource) {
        case "messages":
          if (operation === "list") {
            result = await client.messages.list({ limit: limit || 20, ...parsedParams });
          } else if (operation === "fetch") {
            result = await client.messages(resourceSid).fetch();
          } else if (operation === "create") {
            result = await client.messages.create(parsedParams);
          }
          break;

        case "calls":
          if (operation === "list") {
            result = await client.calls.list({ limit: limit || 20, ...parsedParams });
          } else if (operation === "fetch") {
            result = await client.calls(resourceSid).fetch();
          } else if (operation === "create") {
            result = await client.calls.create(parsedParams);
          }
          break;

        case "accounts":
          if (operation === "list") {
            result = await client.api.accounts.list({ limit: limit || 20 });
          } else if (operation === "fetch") {
            result = await client.api.accounts(resourceSid || datasourceOptions?.accountSid).fetch();
          }
          break;

        case "phonenumbers":
          if (operation === "list") {
            result = await client.incomingPhoneNumbers.list({ limit: limit || 20 });
          }
          break;

        default:
          throw new Error(`Unsupported resource: ${resource}`);
      }

      return result;
    } catch (error) {
      Logger.log("error", {
        message: "twilio:TwilioDataSource:execute:catch",
        params: error.message || error,
      });
      throw new Error(`Twilio operation failed: ${error.message || error}`);
    }
  }
}
