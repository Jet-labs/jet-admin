import React from "react";
import { useParams } from "react-router-dom";
import { DatasourceUpdationForm } from "../../components/datasourceComponents/datasourceUpdationForm";



const UpdateDatasourcePage = () => {
    const { tenantID, datasourceID } = useParams();
  return (
    <DatasourceUpdationForm
      tenantID={tenantID}
      datasourceID={datasourceID}
    />
  );
};

export default UpdateDatasourcePage;
