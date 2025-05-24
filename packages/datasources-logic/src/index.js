import { DATASOURCE_TYPES } from "@jet-admin/datasource-types";
import { testConnection as postgresqlTestConnection } from "./components/postgresql/logic/connection";

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
};
