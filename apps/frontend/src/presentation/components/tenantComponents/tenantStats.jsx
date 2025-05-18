import React from "react";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { FaCog, FaPlus, FaStoreAlt } from "react-icons/fa";
import { CircularProgress } from "@mui/material";
import { TenantLogo } from "./tenantLogo";
import moment from "moment";
import PropTypes from "prop-types";

export const TenantStats = ({ tenants }) => {
  TenantStats.propTypes = {
    tenants: PropTypes.array.isRequired,
  };
  const navigate = useNavigate();

  if (!tenants) {
    return (
      <div className="flex justify-center items-center h-full">
        <CircularProgress size={16} className="!text-[#646cff]" />
      </div>
    );
  }

  const handleTenantClick = (tenantID) => {
    navigate(CONSTANTS.ROUTES.VIEW_TENANT.path(tenantID));
  };

  const handleAddTenant = () => {
    navigate(CONSTANTS.ROUTES.ADD_TENANT.path());
  };

  return (
    <div className="w-full h-full">
      <div className="flex justify-between items-center w-full p-3 border-b border-slate-200 ">
        <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-700 md:text-2xl ">
          {CONSTANTS.STRINGS.TENANTS_STATS_TITLE}
        </h1>
        <button
          onClick={handleAddTenant}
          className="flex flex-row items-center justify-center rounded bg-[#646cff]/10 px-3 py-1.5 text-sm text-[#646cff] hover:bg-[#646cff]/20 focus:ring-2 focus:ring-[#646cff]/50 w-fit outline-none focus:outline-none"
        >
          <FaPlus className="mr-2" />
          {CONSTANTS.STRINGS.TENANTS_STATS_ADD_TENANT_BUTTON}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-3">
        {tenants.map((tenant) => (
          <div
            key={tenant.tenantID}
            className="bg-white  rounded border border-slate-200 p-4 cursor-pointer hover:border-[#646cff] "
            onClick={() => handleTenantClick(tenant.tenantID)}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
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
                <h2 className="text-base font-semibold text-slate-700 ml-2 hover:text-[#646cff]">
                  {tenant.tenantName}
                </h2>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(
                    CONSTANTS.ROUTES.UPDATE_TENANT.path(tenant.tenantID)
                  );
                }}
                className="text-gray-500 hover:text-[#646cff] p-1 rounded-md bg-transparent"
              >
                <FaCog />
              </button>
            </div>

            <div className="flex justify-between text-xs text-gray-500">
              <span>
                Created:{" "}
                {moment(tenant.createdAt).format("MMM Do YY").toLocaleString()}
              </span>
              <span>{tenant.isDisabled ? "Disabled" : "Active"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};