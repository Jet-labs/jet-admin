import { UserPlus } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { TenantRolesList } from "../../components/tenantRolesComponents/tenantRolesList";
import { Button } from "@jet-admin/ui";
import React from "react";

const RoleManagementPage = () => {
  const { tenantID } = useParams();

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-brand-dark">
      <div className="flex items-center justify-between gap-2 border-b border-border p-3">
        <h1 className="text-xl font-bold text-foreground md:text-2xl">
          {CONSTANTS.STRINGS.TENANT_ROLE_MANAGEMENT_TITLE}
        </h1>
        <Button size="sm" variant="primary-ghost" asChild>
          <Link to={CONSTANTS.ROUTES.ADD_TENANT_ROLE.path(tenantID)}>
            <UserPlus className="mr-2 h-4 w-4" />
            {CONSTANTS.STRINGS.TENANT_ROLE_MANAGEMENT_ADD_ROLE_BUTTON}
          </Link>
        </Button>
      </div>

      <TenantRolesList />
    </div>
  );
};

export default RoleManagementPage;
