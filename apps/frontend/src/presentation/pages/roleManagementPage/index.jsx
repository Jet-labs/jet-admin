import { UserPlus } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { TenantRolesList } from "../../components/tenantRolesComponents/tenantRolesList";
import { Button, PageHeader } from "@jet-admin/ui";
import React from "react";

const RoleManagementPage = () => {
  const { tenantID } = useParams();

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <PageHeader
        title={CONSTANTS.STRINGS.TENANT_ROLE_MANAGEMENT_TITLE}
      >
        <Button size="sm" variant="secondary" asChild>
          <Link to={CONSTANTS.ROUTES.ADD_TENANT_ROLE.path(tenantID)}>
            <UserPlus className="mr-1 h-3 w-3" />
            {CONSTANTS.STRINGS.TENANT_ROLE_MANAGEMENT_ADD_ROLE_BUTTON}
          </Link>
        </Button>
      </PageHeader>

      <TenantRolesList />
    </div>
  );
};

export default RoleManagementPage;
