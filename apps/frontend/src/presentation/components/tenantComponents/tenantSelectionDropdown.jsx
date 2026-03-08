
import React, { useMemo } from "react";
import { FaChevronDown, FaPlus, FaStoreAlt } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import {
  useTenantActions,
  useTenantState,
} from "../../../logic/contexts/tenantContext";
import { StringUtils } from "../../../utils/string";
import { TenantLogo } from "./tenantLogo";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@jet-admin/ui";

export const TenantSelectionDropdown = () => {
  const { tenants } = useTenantState();
  const { tenantID } = useParams();
  const navigate = useNavigate();
  const { saveTenantLocally } = useTenantActions();

  // Memoized selected tenant
  const selectedTenant = useMemo(() => {
    if (tenantID && tenants) {
      return tenants.find((tenant) => tenant.tenantID === tenantID);
    }
  }, [tenants, tenantID]);

  // Handle tenant change
  const handleTenantChange = (tenant) => {
    navigate(CONSTANTS.ROUTES.VIEW_TENANT.path(tenant.tenantID));
    saveTenantLocally(tenant);
  };

  // Navigate to add tenant page
  const navigateToAddTenantPage = () => {
    navigate(CONSTANTS.ROUTES.ADD_TENANT.path());
  };

  if (!tenants || tenants.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full flex justify-between items-center bg-white hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-slate-100 h-10 p-2"
        >
          <div className="flex items-center min-w-0 flex-grow">
            <div className="flex-shrink-0 w-7 h-7 rounded border border-slate-300 bg-slate-100 flex justify-center items-center">
              {selectedTenant?.tenantLogoURL ? (
                <TenantLogo
                  src={selectedTenant.tenantLogoURL}
                  alt="Tenant Logo"
                  className="w-full h-full rounded"
                />
              ) : (
                <FaStoreAlt className="w-5 h-5 text-slate-500" />
              )}
            </div>
            <div className="ml-2 flex flex-col min-w-0 overflow-hidden flex-1">
              <span className="text-sm font-semibold text-slate-600 text-left truncate">
                {selectedTenant
                  ? StringUtils.truncateName(selectedTenant.tenantTitle, 15)
                  : CONSTANTS.STRINGS
                    .TENANT_SELECTION_DROPDOWN_NO_TENANT_SELECTED}
              </span>
            </div>
          </div>
          <FaChevronDown className="text-slate-600 ml-2" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-[var(--radix-dropdown-menu-trigger-width)]"
        sideOffset={4}
      >
        {tenants.map((tenant) => (
          <DropdownMenuItem
            key={`tenant_id_${tenant.tenantID}`}
            onClick={() => handleTenantChange(tenant)}
            className="flex items-center cursor-pointer p-1.5"
          >
            <div className="flex-shrink-0 w-7 h-7 rounded border border-slate-300 bg-slate-100 flex justify-center items-center overflow-hidden">
              {tenant.tenantLogoURL ? (
                <TenantLogo
                  src={tenant.tenantLogoURL}
                  alt="Tenant Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaStoreAlt className="w-5 h-5 text-slate-500" />
              )}
            </div>
            <div className="ml-3 flex flex-col justify-start items-start min-w-0 overflow-hidden w-full">
              <span className="text-sm font-semibold text-slate-700 text-left truncate w-full">
                {StringUtils.truncateName(tenant.tenantTitle, 16).replace(/^./, (c) =>
                  c.toUpperCase()
                )}
              </span>
            </div>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuItem
          onClick={navigateToAddTenantPage}
          className="flex items-center cursor-pointer text-primary p-1.5 justify-center"
        >
          <FaPlus className="w-4 h-4 mr-2" />
          <span className="font-medium">
            {CONSTANTS.STRINGS.TENANT_SELECTION_DROPDOWN_ADD_TENANT}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
