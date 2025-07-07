import PostgreSQLDataSource from "./postgresql/datasource";
import RestAPIDataSource from "./restapi/datasource";
import WebURLDataSource from "./weburl/datasource";

const dataSources = {
  postgresql: PostgreSQLDataSource,
  restapi: RestAPIDataSource,
  weburl: WebURLDataSource,
};

export default {
  getDataSource(type) {
    const DataSource = dataSources[type.toLowerCase()];
    if (!DataSource) throw new Error(`Unsupported data source: ${type}`);
    return DataSource;
  },

  registerDataSource(type, implementation) {
    dataSources[type.toLowerCase()] = implementation;
  },
};
