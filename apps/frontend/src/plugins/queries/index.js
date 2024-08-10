import { PGSQLQueryBuilder } from "./postgresql/components/PGSQLQueryBuilder";
import { SiPostgresql } from "react-icons/si";
export const QUERY_PLUGINS_MAP = {
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
    icon: <SiPostgresql className="!text-lg" />,
    iconLarge: <SiPostgresql className="!text-4xl" />,
  },
};
