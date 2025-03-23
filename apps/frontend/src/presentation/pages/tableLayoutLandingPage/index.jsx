import React from "react";
import { useDatabaseTablesState } from "../../../logic/contexts/databaseTablesContext";
import { DatabaseTableStats } from "../../components/databaseTableComponents/databaseTablesStats";

const TableLayoutLandingPage = ({}) => {
  const { databaseTables } = useDatabaseTablesState();
  return (
    <div className=" bg-gray-50 h-full w-full">
      {databaseTables && <DatabaseTableStats databaseTables={databaseTables} />}
    </div>
  );
};

export default TableLayoutLandingPage;
