import React from "react";
import "react-data-grid/lib/styles.css";
import { SimpleTableComponent } from "../../../../../components/DataGridComponents/SimpleTableComponent";
export const PGSQLQueryResponseTableTab = ({ data }) => {
  return <SimpleTableComponent data={data} />;
};
