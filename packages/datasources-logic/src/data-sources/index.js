import PostgreSQLDataSource from "./postgresql/datasource";
import RestAPIDataSource from "./restapi/datasource";


const dataSources = {
  postgresql: PostgreSQLDataSource,
  restapi: RestAPIDataSource,
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
