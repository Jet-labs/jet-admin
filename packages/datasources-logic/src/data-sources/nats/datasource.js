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

    const rawSubject = config.subject || config.subjects || ">";
    const subjects = String(rawSubject).split(",").map((s) => s.trim()).filter(Boolean);
    const subject = subjects[0] || ">";
    const queue = config.queue || config.queueGroup || undefined;

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

    const subs = [];
    for (const subj of subjects.length ? subjects : [subject]) {
      subs.push(nc.subscribe(subj, subOptions));
    }
    const sub = subs[0];

    for (const activeSub of subs) {
      (async (iterSub) => {
        for await (const msg of iterSub) {
          let payload = sc.decode(msg.data);
          try {
            payload = JSON.parse(payload);
          } catch (e) {
            // keep as string
          }
          onEvent({ subject: msg.subject, payload });
        }
      })(activeSub).catch((error) => {
        Logger.log("error", {
          message: "nats:subscribe:error",
          params: { error: error.message },
        });
      });
    }

    return { nc, sub, subs };
  }

  async unsubscribe(handle) {
    if (!handle) return;
    
    Logger.log("info", {
      message: "nats:unsubscribe",
      params: { datasourceID: this.config.datasourceID },
    });

    try {
      const allSubs = handle.subs && handle.subs.length ? handle.subs : [handle.sub].filter(Boolean);
      for (const s of allSubs) {
        try { s.unsubscribe(); } catch { /* ignore per-sub errors */ }
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
