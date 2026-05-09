import DataSource from "../datasource.js";
import { connect, StringCodec } from "nats";
import { Logger } from "../../utils/logger.js";

export default class NatsDataSource extends DataSource {
  async execute(dataQueryOptions, context) {
    throw new Error("NATS is a listener-only datasource.");
  }

  async subscribe(config, onEvent) {
    const datasourceOptions = this.config.datasourceOptions || {};
    const { servers, token, user, pass } = datasourceOptions;
    
    if (!servers) {
      throw new Error("NATS servers are required");
    }

    const subject = config.subject || ">";
    const queue = config.queue;

    Logger.log("info", {
      message: "nats:subscribe:start",
      params: { servers, subject, queue, datasourceID: this.config.datasourceID },
    });

    const options = { servers: servers.split(",") };
    if (token) options.token = token;
    if (user && pass) {
      options.user = user;
      options.pass = pass;
    }

    const nc = await connect(options);
    const sc = StringCodec();

    const subOptions = {};
    if (queue) subOptions.queue = queue;

    const sub = nc.subscribe(subject, subOptions);

    (async () => {
      for await (const msg of sub) {
        let payload = sc.decode(msg.data);
        try {
          payload = JSON.parse(payload);
        } catch (e) {
          // keep as string
        }
        onEvent({ subject: msg.subject, payload });
      }
    })().catch((error) => {
      Logger.log("error", {
        message: "nats:subscribe:error",
        params: { error: error.message },
      });
    });

    return { nc, sub };
  }

  async unsubscribe(handle) {
    if (!handle) return;
    
    Logger.log("info", {
      message: "nats:unsubscribe",
      params: { datasourceID: this.config.datasourceID },
    });

    try {
      if (handle.sub) {
        handle.sub.unsubscribe();
      }
      if (handle.nc) {
        await handle.nc.close();
      }
    } catch (e) {
      Logger.log("error", {
        message: "nats:unsubscribe:error",
        params: { error: e.message },
      });
    }
  }
}
