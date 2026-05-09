import React from "react";
import { useParams } from "react-router-dom";
import { DataQueryUpdationForm } from "../../components/dataQueryComponents/dataQueryUpdationForm";

const UpdateDataQueryPage = () => {
  const { tenantID, dataQueryID } = useParams();

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-brand-dark">
      <DataQueryUpdationForm tenantID={tenantID} dataQueryID={dataQueryID} />
    </div>
  );
};

export default UpdateDataQueryPage;
