import React from "react";
import { useParams } from "react-router-dom";
import { APIKeyUpdationForm } from "../../components/apiKeyComponents/apiKeyUpdationForm";



const UpdateAPIKeyPage = () => {
    const { tenantID,apiKeyID } = useParams();
  return (
    <div className="flex w-full h-full overflow-y-auto flex-col justify-start items-center">
      <APIKeyUpdationForm
        tenantID={tenantID}
        apiKeyID={apiKeyID}
      />
    </div>
  );
};

export default UpdateAPIKeyPage;
