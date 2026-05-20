import React from "react";
import { useParams } from "react-router-dom";
import { DatasourceUpdationForm } from "../../components/datasourceComponents/datasourceUpdationForm";



const UpdateDatasourcePage = () => {
  const { tenantID, datasourceID } = useParams();

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <DatasourceUpdationForm tenantID={tenantID} datasourceID={datasourceID} />
    </div>
  );
};

export default UpdateDatasourcePage;
