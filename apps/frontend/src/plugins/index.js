import { PGSQLQueryBuilder } from "./postgresql/components/PGSQLQueryBuilder";
import { RESTAPIQueryBuilder } from "./restapi/components/RESTAPIQueryBuilder";

export const PLUGINS_MAP = {
  REST_API: {
    name: "Rest API",
    value: "REST_API",
    component: ({ value, handleChange }) => (
      <RESTAPIQueryBuilder value={value} handleChange={handleChange} />
    ),
  },
  POSTGRE_QUERY: {
    name: "Postgre query",
    value: "POSTGRE_QUERY",
    component: ({ value, handleChange }) => (
      <PGSQLQueryBuilder value={value} handleChange={handleChange} />
    ),
  },
};
