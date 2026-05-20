import React from "react";
import { useParams } from "react-router-dom";
import { TenantUserUpdationForm } from "../../components/tenantUsersComponents/tenantUserUpdationForm";

const UpdateTenantUserByIDPage = () => {
  const { tenantID, tenantUserID } = useParams();

  return (
    <div className="flex h-full w-full flex-col items-center overflow-y-auto bg-background">
      <TenantUserUpdationForm tenantID={tenantID} tenantUserID={tenantUserID} />
    </div>
  );
};

export default UpdateTenantUserByIDPage;