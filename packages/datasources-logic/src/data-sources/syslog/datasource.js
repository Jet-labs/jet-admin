import DataSource from "../datasource.js";
import dgram from "dgram";
import { Logger } from "../../utils/logger.js";

export default class SyslogDataSource extends DataSource {
  async execute(dataQueryOptions, context) {
    throw new Error("Syslog is a listener-only datasource.");
  }

  async subscribe(config, onEvent) {
    const dsOptions = this.config.datasourceOptions || {};
    const port = dsOptions.port || config.port || 514;
    const address = dsOptions.address || config.address || "0.0.0.0";

    Logger.log("info", {
      message: "syslog:subscribe:start",
      params: { port, address, datasourceID: this.config.datasourceID },
    });

    const server = dgram.createSocket("udp4");

    server.on("message", (msg, rinfo) => {
      const messageStr = msg.toString();
      onEvent({ source: `${rinfo.address}:${rinfo.port}`, payload: messageStr });
    });

    server.on("error", (error) => {
      Logger.log("error", {
        message: "syslog:subscribe:error",
        params: { error: error.message },
      });
      server.close();
    });

    return new Promise((resolve, reject) => {
      server.bind(port, address, () => {
        resolve({ server });
      });
    });
  }

  async unsubscribe(handle) {
    if (!handle || !handle.server) return;
    
    Logger.log("info", {
      message: "syslog:unsubscribe",
      params: { datasourceID: this.config.datasourceID },
    });

    try {
      handle.server.close();
    } catch (e) {
      Logger.log("error", {
        message: "syslog:unsubscribe:error",
        params: { error: e.message },
      });
    }
  }
}
