import { Client } from "@notionhq/client";
import { Logger } from "../../utils/logger.js";

export const notionTestConnection = async ({ datasourceOptions }) => {
  try {
    Logger.log("info", {
      message: "notion:notionTestConnection:params",
    });

    const notion = new Client({ auth: datasourceOptions.apiToken });
    await notion.users.me({});

    return {
      ok: true,
      status: 200,
      statusText: "Connected",
    };
  } catch (error) {
    Logger.log("error", {
      message: "notion:notionTestConnection:catch",
      params: { error: error.message || error },
    });
    return {
      ok: false,
      error: error.message || error,
    };
  }
};
