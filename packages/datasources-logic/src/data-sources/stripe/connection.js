import Stripe from "stripe";
import { Logger } from "../../utils/logger.js";

export const stripeTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "stripe:stripeTestConnection:params",
    });

    const stripeConfig = {};
    if (datasourceOptions.apiVersion) {
      stripeConfig.apiVersion = datasourceOptions.apiVersion;
    }

    const stripe = new Stripe(datasourceOptions.secretKey, stripeConfig);
    
    // Test connection by retrieving account info
    const account = await stripe.accounts.retrieve();

    Logger.log("info", {
      message: "stripe:stripeTestConnection:connected",
      params: { accountId: account.id },
    });

    return {
      ok: true,
      status: 200,
      statusText: "Connected",
    };
  } catch (error) {
    Logger.log("error", {
      message: "stripe:stripeTestConnection:catch",
      params: { error: error.message || error },
    });
    return {
      ok: false,
      error: error.message || error,
    };
  }
};
