import React from "react";
import { TenantRoleAdditionForm } from "../../components/tenantRolesComponents/tenantRoleAdditionForm";

const AddTenantRolePage = () => {
  return (
    <div className="flex h-full w-full flex-col items-center overflow-y-auto bg-background">
      <TenantRoleAdditionForm />
    </div>
  );
};

export default AddTenantRolePage;
