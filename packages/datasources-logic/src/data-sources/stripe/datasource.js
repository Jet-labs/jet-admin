import Stripe from "stripe";
import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

export default class StripeDataSource extends DataSource {
  getStripeClient() {
    const datasourceOptions = this.config.datasourceOptions;
    const config = {};
    if (datasourceOptions?.apiVersion) {
      config.apiVersion = datasourceOptions.apiVersion;
    }
    return new Stripe(datasourceOptions?.secretKey, config);
  }

  async execute(dataQueryOptions, context) {
    Logger.log("info", {
      message: "stripe:StripeDataSource:execute:params",
      params: { dataQueryOptions },
    });

    const {
      resource,
      operation,
      resourceId,
      params,
      limit,
      startingAfter,
      expand,
    } = dataQueryOptions;

    const stripe = this.getStripeClient();

    try {
      let result;
      const parsedParams = params ? (typeof params === "string" ? JSON.parse(params) : params) : {};

      // Map resource names to Stripe API resources
      const resourceMap = {
        customers: stripe.customers,
        charges: stripe.charges,
        paymentIntents: stripe.paymentIntents,
        invoices: stripe.invoices,
        subscriptions: stripe.subscriptions,
        products: stripe.products,
        prices: stripe.prices,
        refunds: stripe.refunds,
        balanceTransactions: stripe.balanceTransactions,
        payouts: stripe.payouts,
      };

      const stripeResource = resourceMap[resource];
      if (!stripeResource) {
        throw new Error(`Unsupported resource: ${resource}`);
      }

      switch (operation) {
        case "list": {
          const listParams = {
            ...parsedParams,
            limit: limit || 10,
          };
          if (startingAfter) {
            listParams.starting_after = startingAfter;
          }
          if (expand && expand.length > 0) {
            listParams.expand = expand;
          }

          const response = await stripeResource.list(listParams);
          result = {
            data: response.data,
            hasMore: response.has_more,
            url: response.url,
          };
          break;
        }

        case "retrieve": {
          const retrieveParams = {};
          if (expand && expand.length > 0) {
            retrieveParams.expand = expand;
          }
          result = await stripeResource.retrieve(resourceId, retrieveParams);
          break;
        }

        case "create": {
          const createParams = { ...parsedParams };
          if (expand && expand.length > 0) {
            createParams.expand = expand;
          }
          result = await stripeResource.create(createParams);
          break;
        }

        case "update": {
          const updateParams = { ...parsedParams };
          if (expand && expand.length > 0) {
            updateParams.expand = expand;
          }
          result = await stripeResource.update(resourceId, updateParams);
          break;
        }

        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }

      Logger.log("info", {
        message: "stripe:StripeDataSource:execute:success",
      });

      return result;
    } catch (error) {
      Logger.log("error", {
        message: "stripe:StripeDataSource:execute:catch",
        params: error.message || error,
      });
      throw new Error(`Stripe operation failed: ${error.message || error}`);
    }
  }
}
