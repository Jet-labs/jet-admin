import React from "react";
import { TenantRoleUpdationForm } from "../../components/tenantRolesComponents/tenantRoleUpdationForm";

const UpdateTenantRolePage = () => {
  return (
    <div className="flex h-full w-full flex-col items-center overflow-y-auto bg-background">
      <TenantRoleUpdationForm />
    </div>
  );
};

export default UpdateTenantRolePage;
