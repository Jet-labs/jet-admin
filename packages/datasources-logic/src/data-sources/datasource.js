export default class DataSource {
    constructor(config, helpers) {
      this.datasourceID = config?.datasourceID;
      this.datasourceType = config?.datasourceType;
      this.config = config;
      this.helpers = helpers;
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
  