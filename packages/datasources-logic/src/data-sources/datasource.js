export default class DataSource {
    constructor(config, helpers) {
      this.datasourceID = config?.datasourceID;
      this.datasourceType = config?.datasourceType;
      this.config = config;
      this.helpers = helpers;
    }

    /**
     * Who owns reconnection after a transport drop?
     *   'plugin' — the connection object reconnects internally (MQTT/SSE/WS).
     *   'engine' — the plugin reports a hard disconnect and the listener engine
     *              restarts the subscription with backoff.
     * Exactly one owner; never both. Disabling a listener remains the engine's
     * decision regardless of observed transport state.
     */
    get recoveryMode() {
      return "engine";
    }
  
    async execute(query, context, helpers) {
      throw new Error("execute() method must be implemented");
    }

    async subscribe(config, onEvent) {
      throw new Error("subscribe() not supported by this datasource type");
    }

    async unsubscribe(handle) {
      throw new Error("unsubscribe() not supported by this datasource type");
    }
  }
  