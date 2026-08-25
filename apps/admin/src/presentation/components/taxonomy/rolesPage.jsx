import { useQuery } from "@tanstack/react-query";
import React from "react";
import { CONSTANTS } from "@/constants";
import { getAllRolesAPI } from "@/data/apis/platform";
import { PageHeader } from "@jet-admin/ui";
import { RolesManager } from "./rolesManager";

export const RolesPage = () => {
  const { data: roles, isLoading } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.ROLES],
    queryFn: getAllRolesAPI,
  });

  const count = roles?.length ?? 0;
  const globalCount = (roles || []).filter((r) => !r.tenantID).length;

  return (
    <div className="flex h-full w-full flex-col">
      <PageHeader
        title="Roles"
        parentTitle="Platform Admin"
        subTitle={
          isLoading
            ? undefined
            : `${count} role${count === 1 ? "" : "s"} · ${globalCount} global`
        }
      />
      <div className="flex-1 overflow-y-auto p-2">
        <RolesManager roles={roles} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default RolesPage;
