export default class DataSource {
    constructor(config) {
      this.datasourceID = config?.datasourceID;
      this.datasourceType = config?.datasourceType;
      this.config = config;
    }
  
    async execute(query, context) {
      throw new Error("execute() method must be implemented");
    }
  }
  