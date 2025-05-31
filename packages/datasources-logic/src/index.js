import { DATASOURCE_TYPES } from "@jet-admin/datasource-types";
import { postgresqlTestConnection } from "./data-sources/postgresql/connection";
import { restAPITestConnection } from "./data-sources/restapi/connection";
import dataSourceRegistry from "./data-sources/index.js";
import QueryRunner from "./core/queryRunner.js";

export { QueryRunner, dataSourceRegistry };

export const DATASOURCE_LOGIC_COMPONENTS = {
  [DATASOURCE_TYPES.POSTGRESQL.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await postgresqlTestConnection({
        connectionString: datasourceOptions.connectionString,
        connectionData: {
          host: datasourceOptions.host,
          port: datasourceOptions.port,
          database: datasourceOptions.database,
          user: datasourceOptions.user,
          password: datasourceOptions.password,
        },
      });
    },
  },
  [DATASOURCE_TYPES.RESTAPI.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await restAPITestConnection({
        datasourceOptions,
      });
    },
  },
};
