import React from "react";
import { TenantRoleUpdationForm } from "../../components/tenantRolesComponents/tenantRoleUpdationForm";

const UpdateTenantRolePage = () => {
  return (
    <div className="flex h-full w-full flex-col items-center overflow-y-auto bg-brand-dark p-4 md:p-8">
      <TenantRoleUpdationForm />
    </div>
  );
};

export default UpdateTenantRolePage;
