import React from "react";
import { TenantRoleAdditionForm } from "../../components/tenantRolesComponents/tenantRoleAdditionForm";

const AddTenantRolePage = () => {
  return (
    <div className="flex w-full h-full flex-col justify-start items-center overflow-y-auto">
      <TenantRoleAdditionForm />
    </div>
  );
};

export default AddTenantRolePage;
