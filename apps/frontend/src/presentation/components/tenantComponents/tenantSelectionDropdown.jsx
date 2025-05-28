import { Box, capitalize, Typography } from "@mui/material";
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
  const { saveTenantLocally } = useTenantActions();
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
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center bg-white hover:bg-slate-100 border border-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-100 rounded px-1 py-1 pr-2 text-sm font-medium text-slate-900"
      >
        {/* This div contains the logo/icon and the text section */}
        {/* Add min-w-0 and flex-grow here */}
        <div className="flex items-center min-w-0 flex-grow">
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
          {/* Use Box for the text container - it's a flex item inside the div above */}
          <Box
            sx={{
              ml: 1, // ml-2 -> 8px -> MUI spacing unit 1
              display: "flex",
              flexDirection: "column", // flex-col as per original structure
              minWidth: 0, // **min-w-0 - Still important here for distribution within this Box**
              overflow: "hidden", // Optional, but good practice
              flexGrow: 1, // Allow this Box to take available space *within* its parent flex item
            }}
          >
            {/* Use Typography for the selected tenant name */}
            <Typography
              variant="subtitle2" // text-sm (14px)
              fontWeight="semibold" // font-semibold (600)
              // color="text.secondary" // slate-600
              noWrap // **This is the key prop for truncation**
              className="!text-slate-600"
              sx={{
                // Typography inside a flex item (the Box) with minWidth: 0 and overflow: hidden
                // should automatically truncate when its content exceeds the parent Box's width.
                // width: '100%' on Typography is often not needed if the parent Box's size is correctly managed.
                textAlign: "left", // text-start
                fontWeight: 600,
              }}
            >
              {selectedTenant
                ? StringUtils.truncateName(selectedTenant.tenantTitle, 15)
                : CONSTANTS.STRINGS
                    .TENANT_SELECTION_DROPDOWN_NO_TENANT_SELECTED}
            </Typography>
          </Box>
        </div>
        <FaChevronDown className="text-slate-600" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute left-0 mt-2 w-full bg-white rounded shadow-lg z-10 overflow-hidden p-2 gap-1 flex flex-col justify-start items-stretch"
          style={{ filter: "drop-shadow(0px 2px 2px rgba(0,0,0,0.32))" }}
        >
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
              {/* Use Box for the text container */}
              <Box
                sx={{
                  ml: 1.5, // ml-3 is typically 12px, MUI spacing unit 1.5 * 8px = 12px
                  display: "flex",
                  flexDirection: "column", // flex-col
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                  width: "100%", // w-full
                  minWidth: 0, // **min-w-0 - Crucial for flex truncation**
                  overflow: "hidden", // Optional, but good practice
                }}
              >
                {/* Use Typography for the tenant name */}
                <Typography
                  variant="body2" // Corresponds roughly to text-sm (14px)
                  fontWeight="semibold" // font-semibold
                  color="text.primary" // Use MUI theme color or specify value (e.g. '#334155' for slate-700)
                  textAlign="left" // text-start
                  noWrap // **This is the key prop for truncation**
                  sx={{ width: "100%" }} // Ensure typography takes available width within its parent Box
                >
                  {capitalize(StringUtils.truncateName(tenant.tenantTitle, 16))}
                </Typography>
                {/* Use Typography for the tenant ID */}
                <Typography variant="caption" color="text.secondary">
                  {" "}
                  {/* Corresponds roughly to text-xs */}
                  Tenant ID: {tenant.tenantID}
                </Typography>
              </Box>
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
