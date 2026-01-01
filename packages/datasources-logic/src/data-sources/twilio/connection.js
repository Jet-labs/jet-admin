import twilio from "twilio";
import { Logger } from "../../utils/logger.js";

export const twilioTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "twilio:twilioTestConnection:params",
    });

    const client = twilio(datasourceOptions.accountSid, datasourceOptions.authToken);
    await client.api.accounts(datasourceOptions.accountSid).fetch();

    return {
      ok: true,
      status: 200,
      statusText: "Connected",
    };
  } catch (error) {
    Logger.log("error", {
      message: "twilio:twilioTestConnection:catch",
      params: { error: error.message || error },
    });
    return {
      ok: false,
      error: error.message || error,
    };
  }
};
