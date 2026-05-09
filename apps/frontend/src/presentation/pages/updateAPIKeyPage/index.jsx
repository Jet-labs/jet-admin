import React from "react";
import { useParams } from "react-router-dom";
import { APIKeyUpdationForm } from "../../components/apiKeyComponents/apiKeyUpdationForm";
const UpdateAPIKeyPage = () => {
  const { tenantID, apiKeyID } = useParams();
  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-brand-dark">
      <APIKeyUpdationForm tenantID={tenantID} apiKeyID={apiKeyID} />
    </div>
  );
};

export default UpdateAPIKeyPage;
