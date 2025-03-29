import React from "react";
import { useParams } from "react-router-dom";
import { APIKeyAdditionForm } from "../../components/apiKeyComponents/apiKeyAdditionForm";

const AddAPIKeyPage = () => {
  const { tenantID} = useParams();
  console.log({tenantID:tenantID})
  return (
    <div className="flex w-full h-full overflow-y-auto flex-col justify-start items-center">
      <APIKeyAdditionForm
        tenantID={tenantID}
      />
    </div>
  );
};

export default AddAPIKeyPage;
