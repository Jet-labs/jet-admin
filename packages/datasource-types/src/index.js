import postgresqlFormConfig from "./postgresql/formConfig.json";
import postgresqlQueryConfigForm from "./postgresql/queryConfig.json";

import restAPIFormConfig from "./restapi/formConfig.json";
import restAPIQueryConfigForm from "./restapi/queryConfig.json";

import webURLFormConfig from "./weburl/formConfig.json";
import webURLQueryConfigForm from "./weburl/queryConfig.json";

export const DATASOURCE_TYPES = {
  POSTGRESQL: {
    name: "PostgreSQL",
    value: "postgresql",
    formConfig: postgresqlFormConfig,
    queryConfigForm: postgresqlQueryConfigForm,
  },
  MYSQL: {
    name: "MySQL",
    value: "mysql",
  },
  MSSQL: {
    name: "MSSQL",
    value: "mssql",
  },
  RESTAPI: {
    name: "REST API",
    value: "restapi",
    formConfig: restAPIFormConfig,
    queryConfigForm: restAPIQueryConfigForm,
  },
  WEB_URL: {
    name: "Web URL",
    value: "weburl",
    formConfig: webURLFormConfig,
    queryConfigForm: webURLQueryConfigForm,
  },
};
