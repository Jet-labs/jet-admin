import React from "react";
import { useParams } from "react-router-dom";
import { APIKeyAdditionForm } from "../../components/apiKeyComponents/apiKeyAdditionForm";

const AddAPIKeyPage = () => {
  const { tenantID } = useParams();
  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-brand-dark">
      <APIKeyAdditionForm tenantID={tenantID} />
    </div>
  );
};

export default AddAPIKeyPage;
