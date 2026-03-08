import React from "react";
import { useNavigate } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { FaCog, FaPlus, FaStoreAlt } from "react-icons/fa";
import { TenantLogo } from "./tenantLogo";
import moment from "moment";
import PropTypes from "prop-types";

import { Button, Spinner } from "@jet-admin/ui";
export const TenantStats = ({ tenants }) => {
  TenantStats.propTypes = {
    tenants: PropTypes.array.isRequired,
  };
  const navigate = useNavigate();

  if (!tenants) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner size={16} className="text-primary" />
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
        <Button
          onClick={handleAddTenant}
          variant="primary-ghost" className="w-fit"
        >
          <FaPlus className="mr-2" />
          {CONSTANTS.STRINGS.TENANTS_STATS_ADD_TENANT_BUTTON}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 p-3">
        {tenants.map((tenant) => (
          <div
            key={tenant.tenantID}
            className="bg-card rounded border border-border p-3 cursor-pointer hover:border-primary "
            onClick={() => handleTenantClick(tenant.tenantID)}
          >
            <div className="flex justify-between items-center mb-3">
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
                <h2 className="text-base font-semibold text-slate-700 ml-2 hover:text-primary">
                  {tenant.tenantTitle}
                </h2>
              </div>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(
                    CONSTANTS.ROUTES.UPDATE_TENANT.path(tenant.tenantID)
                  );
                }}
                variant="ghost" size="icon" className="text-gray-500 hover:text-primary"
              >
                <FaCog />
              </Button>
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