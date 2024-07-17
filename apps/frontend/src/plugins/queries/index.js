import { PGSQLQueryBuilder } from "./postgresql/components/PGSQLQueryBuilder";
import { RESTAPIQueryBuilder } from "./restapi/components/RESTAPIQueryBuilder";
import { TbApi } from "react-icons/tb";
import { SiPostgresql } from "react-icons/si";
import { VariableQueryBuilder } from "./variables/components/VariableQueryBuilder";

export const QUERY_PLUGINS_MAP = {
  REST_API: {
    name: "Rest API",
    value: "REST_API",
    component: ({ pmQueryID, value, handleChange }) => (
      <RESTAPIQueryBuilder
        pmQueryID={pmQueryID}
        value={value}
        handleChange={handleChange}
      />
    ),
    icon: <TbApi />,
  },
  POSTGRE_QUERY: {
    name: "Postgre query",
    value: "POSTGRE_QUERY",
    component: ({ pmQueryID, value, handleChange }) => (
      <PGSQLQueryBuilder
        pmQueryID={pmQueryID}
        value={value}
        handleChange={handleChange}
      />
    ),
    icon: <SiPostgresql />,
  },
  VARIABLES_QUERY: {
    name: "Variables",
    value: "VARIABLES_QUERY",
    component: ({ pmQueryID, value, handleChange }) => (
      <VariableQueryBuilder
        pmQueryID={pmQueryID}
        value={value}
        handleChange={handleChange}
      />
    ),
    icon: <SiPostgresql />,
  },
};
