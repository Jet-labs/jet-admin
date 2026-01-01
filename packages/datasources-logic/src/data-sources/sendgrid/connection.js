import sgMail from "@sendgrid/mail";
import sgClient from "@sendgrid/client";
import { Logger } from "../../utils/logger.js";

export const sendgridTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "sendgrid:sendgridTestConnection:params",
    });

    sgClient.setApiKey(datasourceOptions.apiKey);
    const [response] = await sgClient.request({ method: "GET", url: "/v3/user/profile" });

    if (response.statusCode === 200) {
      return {
        ok: true,
        status: 200,
        statusText: "Connected",
      };
    }

    throw new Error("Failed to authenticate");
  } catch (error) {
    Logger.log("error", {
      message: "sendgrid:sendgridTestConnection:catch",
      params: { error: error.message || error },
    });
    return {
      ok: false,
      error: error.message || error,
    };
  }
};
