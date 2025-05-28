import React from "react";
import { useParams } from "react-router-dom";
import { DataQueryUpdationForm } from "../../components/dataQueryComponents/dataQueryUpdationForm";

const UpdateDataQueryPage = () => {
  const { tenantID, databaseSchemaName, dataQueryID } = useParams();
  return (
    <DataQueryUpdationForm
      tenantID={tenantID}
      databaseSchemaName={databaseSchemaName}
      dataQueryID={dataQueryID}
    />
  );
};

export default UpdateDataQueryPage;
