import React from "react";
import { useParams } from "react-router-dom";
import { PGSQLQueryExecutor } from "../../components/dataQueryComponents/pgsqlQueryExecutor";

/**
 * Page component for the Raw SQL Query Executor
 * @returns {JSX.Element} The Raw SQL Query Page component
 */
const RawSqlQueryPage = () => {
  const { tenantID } = useParams();

  return (
    <div className="flex w-full h-full flex-col justify-start items-stretch overflow-hidden">
      <PGSQLQueryExecutor tenantID={tenantID} />
    </div>
  );
};

export default RawSqlQueryPage;