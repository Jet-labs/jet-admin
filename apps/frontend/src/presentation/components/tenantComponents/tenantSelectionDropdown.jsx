import { capitalize } from "@mui/material";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaChevronDown, FaPlus, FaStoreAlt } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import {
  useTenantActions,
  useTenantState,
} from "../../../logic/contexts/tenantContext";
import { StringUtils } from "../../../utils/string";
import { TenantLogo } from "./tenantLogo";

export const TenantSelectionDropdown = () => {
  const { tenants } = useTenantState();
  const { tenantID } = useParams();
  const navigate = useNavigate();
  const { saveTenantLocallyAndReload, saveTenantLocally } = useTenantActions();
  const [isOpen, setIsOpen] = useState(false);

  // Ref for the dropdown container
  const dropdownRef = useRef();

  // Memoized selected tenant
  const selectedTenant = useMemo(() => {
    if (tenantID && tenants) {
      return tenants.find((tenant) => tenant.tenantID === parseInt(tenantID));
    }
  }, [tenants, tenantID]);

  // Handle tenant change
  const handleTenantChange = (tenant) => {
    navigate(CONSTANTS.ROUTES.VIEW_TENANT.path(tenant.tenantID));
    saveTenantLocally(tenant);
    setIsOpen(false); // Close the dropdown after selection
  };

  // Navigate to add tenant page
  const navigateToAddTenantPage = () => {
    setIsOpen(false); // Close the dropdown
    navigate(CONSTANTS.ROUTES.ADD_TENANT.path());
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!tenants || tenants.length === 0) return null;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Dropdown Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)} // Toggle dropdown visibility
        className="w-full flex justify-between items-center bg-white hover:bg-slate-100 border border-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-100 rounded px-1 py-1 pr-2 text-sm font-medium text-slate-900"
      >
        <div className="flex items-center">
          <div className="flex-shrink-0 w-8 h-8 rounded border border-slate-300 bg-slate-100 flex justify-center items-center">
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
          <div className="ml-2 flex flex-col">
            <span className="text-sm font-semibold text-slate-600">
              {selectedTenant
                ? StringUtils.truncateName(selectedTenant.tenantName, 15)
                : CONSTANTS.STRINGS
                    .TENANT_SELECTION_DROPDOWN_NO_TENANT_SELECTED}
            </span>
          </div>
        </div>
        <FaChevronDown className="text-slate-600" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute left-0 mt-2 w-full bg-white rounded shadow-lg z-10 overflow-hidden p-2 gap-1 flex flex-col justify-start items-stretch"
          style={{ filter: "drop-shadow(0px 2px 2px rgba(0,0,0,0.32))" }}
        >
          {/* Tenant List */}
          {tenants.map((tenant) => (
            <button
              key={`tenant_id_${tenant.tenantID}`}
              onClick={() => handleTenantChange(tenant)}
              className="w-full flex items-center rounded p-1 hover:bg-slate-100 bg-white hover:border-0 focus:border-0 border-0"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded border border-slate-300 bg-slate-100 flex justify-center items-center">
                {tenant.tenantLogoURL ? (
                  <TenantLogo
                    src={tenant.tenantLogoURL}
                    alt="Tenant Logo"
                    className="w-full h-full rounded"
                  />
                ) : (
                  <FaStoreAlt className="w-5 h-5 text-slate-500" />
                )}
              </div>
              <div className="ml-3 flex flex-col justify-start items-start">
                <span className="text-sm font-semibold text-slate-700">
                  {capitalize(StringUtils.truncateName(tenant.tenantName, 16))}
                </span>
                <span className="text-xs text-slate-600">
                  Tenant ID: {tenant.tenantID}
                </span>
              </div>
            </button>
          ))}

          {/* Divider */}
          <hr className="border-t border-slate-200 my-1" />

          {/* Add Tenant Option */}
          <button
            onClick={navigateToAddTenantPage}
            className="flex flex-row items-center justify-center rounded bg-[#646cff]/10 px-3 py-1.5 text-sm text-[#646cff] hover:bg-[#646cff]/20 focus:ring-2 focus:ring-[#646cff]/50 w-full outline-none focus:outline-none"
          >
            <FaPlus className="!w-4 !h-4 !text-[#646cff] mr-1" />
            {CONSTANTS.STRINGS.TENANT_SELECTION_DROPDOWN_ADD_TENANT}
          </button>
        </div>
      )}
    </div>
  );
};
