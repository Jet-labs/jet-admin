import React from "react";
import { DataQueryAdditionForm } from "../../components/dataQueryComponents/dataQueryAdditionForm";
import { useParams } from "react-router-dom";

const AddDataQueryPage = () => {
  const { tenantID } = useParams();

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <DataQueryAdditionForm tenantID={tenantID} />
    </div>
  );
};

export default AddDataQueryPage;
