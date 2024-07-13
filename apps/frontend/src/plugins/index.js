import { PGSQLQueryBuilder } from "./postgresql/components/PGSQLQueryBuilder";
import { RESTAPIQueryBuilder } from "./restapi/components/RESTAPIQueryBuilder";
import { TbApi } from "react-icons/tb";
import { SiPostgresql } from "react-icons/si";

export const PLUGINS_MAP = {
  REST_API: {
    name: "Rest API",
    value: "REST_API",
    component: ({ value, handleChange }) => (
      <RESTAPIQueryBuilder value={value} handleChange={handleChange} />
    ),
    icon: <TbApi />,
  },
  POSTGRE_QUERY: {
    name: "Postgre query",
    value: "POSTGRE_QUERY",
    component: ({ value, handleChange }) => (
      <PGSQLQueryBuilder value={value} handleChange={handleChange} />
    ),
    icon: <SiPostgresql />,
  },
};
