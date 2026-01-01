import sgMail from "@sendgrid/mail";
import sgClient from "@sendgrid/client";
import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

export default class SendGridDataSource extends DataSource {
  async execute(dataQueryOptions, context) {
    Logger.log("info", {
      message: "sendgrid:SendGridDataSource:execute:params",
      params: { dataQueryOptions },
    });

    const { resource, operation, params, startDate, endDate } = dataQueryOptions;
    const datasourceOptions = this.config.datasourceOptions;

    sgClient.setApiKey(datasourceOptions?.apiKey);
    sgMail.setApiKey(datasourceOptions?.apiKey);

    const parsedParams = params ? (typeof params === "string" ? JSON.parse(params) : params) : {};

    try {
      let result;

      switch (resource) {
        case "stats":
          if (operation === "list") {
            const queryParams = { start_date: startDate || "2024-01-01" };
            if (endDate) queryParams.end_date = endDate;
            const [response] = await sgClient.request({
              method: "GET",
              url: "/v3/stats",
              qs: queryParams,
            });
            result = response.body;
          }
          break;

        case "messages":
          if (operation === "send") {
            result = await sgMail.send(parsedParams);
          }
          break;

        case "contacts":
          if (operation === "list") {
            const [response] = await sgClient.request({
              method: "GET",
              url: "/v3/marketing/contacts",
            });
            result = response.body;
          }
          break;

        case "templates":
          if (operation === "list") {
            const [response] = await sgClient.request({
              method: "GET",
              url: "/v3/templates",
              qs: { generations: "dynamic" },
            });
            result = response.body;
          }
          break;

        case "suppressions":
          if (operation === "list") {
            const [response] = await sgClient.request({
              method: "GET",
              url: "/v3/suppression/bounces",
            });
            result = response.body;
          }
          break;

        default:
          throw new Error(`Unsupported resource: ${resource}`);
      }

      return result;
    } catch (error) {
      Logger.log("error", {
        message: "sendgrid:SendGridDataSource:execute:catch",
        params: error.message || error,
      });
      throw new Error(`SendGrid operation failed: ${error.message || error}`);
    }
  }
}
