import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import React from "react";
import { FaDatabase, FaStoreAlt } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { getUserTenantByIDAPI } from "../../../data/apis/tenant";
import { TenantLogo } from "../../components/tenantComponents/tenantLogo";

import { CodeBlock } from "../../components/ui/codeBlock";
import { NoEntityUI } from "../../components/ui/noEntityUI";

import apiKeyLogo from "../../../assets/api_key_logo.png";
import dashboardLogo from "../../../assets/dashboard_logo.png";
import queryLogo from "../../../assets/query_logo.png";
import rolesLogo from "../../../assets/roles_logo.png";
import schemaLogo from "../../../assets/schema_logo.png";
import tableLogo from "../../../assets/table_logo.png";
import usersLogo from "../../../assets/users_logo.png";
import cronjobLogo from "../../../assets/cronjob_logo.png";
import widgetLogo from "../../../assets/widget_logo.png";
import { ReactQueryLoadingErrorWrapper } from "../../components/ui/reactQueryLoadingErrorWrapper";

const TenantLayoutLandingPage = () => {
  const { tenantID } = useParams();
  const navigate = useNavigate();

  const {
    isLoading: isLoadingTenant,
    data: tenant,
    error: tenantError,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.TENANTS, tenantID],
    queryFn: () => getUserTenantByIDAPI({ tenantID }),
    retry: 0,
  });

  const tenantCards = [
    {
      title: "Users",
      icon: <img src={usersLogo} alt="Users" className="w-8 h-8" />,
      count: tenant?.relationships?.length || 0,
      description: "Manage tenant users and permissions",
      action: () => navigate(CONSTANTS.ROUTES.VIEW_TENANT_USERS.path(tenantID)),
    },

    {
      title: "Database saved queries",
      icon: <img src={queryLogo} alt="Database Queries" className="w-8 h-8" />,
      count: tenant?.tenantDataQueryCount || 0,
      description: "View and manage database saved queries",
      action: () => navigate(CONSTANTS.ROUTES.VIEW_QUERIES.path(tenantID)),
    },
    {
      title: "Database Widgets",
      icon: <img src={widgetLogo} alt="Database Widgets" className="w-8 h-8" />,
      count: tenant?.tenantWidgetCount || 0,
      description: "View and manage database widgets",
      action: () => navigate(CONSTANTS.ROUTES.VIEW_WIDGETS.path(tenantID)),
    },
    {
      title: "Dashboards",
      icon: <img src={dashboardLogo} alt="Dashboards" className="w-8 h-8" />,
      count: tenant?.tenantDashboardCount || 0,
      description: "View and manage dashboards",
      action: () => navigate(CONSTANTS.ROUTES.VIEW_DASHBOARDS.path(tenantID)),
    },
    {
      title: "Roles",
      icon: <img src={rolesLogo} alt="Roles" className="w-8 h-8" />,
      count: tenant?.tenantRolesCount || 0,
      description: "Configure user roles and permissions",
      action: () => navigate(CONSTANTS.ROUTES.VIEW_TENANT_ROLES.path(tenantID)),
    },
    {
      title: "API Keys",
      icon: <img src={apiKeyLogo} alt="API Keys" className="w-8 h-8" />,
      count: tenant?.tenantAPIKeyCount || 0,
      description: "Create and manage API keys",
      action: () => navigate(CONSTANTS.ROUTES.VIEW_API_KEYS.path(tenantID)),
    },
    {
      title: "Cron Jobs",
      icon: <img src={cronjobLogo} alt="Cron Jobs" className="w-8 h-8" />,
      count: tenant?.tenantCronJobCount || 0,
      description: "Create and manage scheduled jobs",
      action: () => navigate(CONSTANTS.ROUTES.VIEW_CRON_JOBS.path(tenantID)),
    },
  ];

  return (
    <ReactQueryLoadingErrorWrapper
      isLoading={isLoadingTenant}
      error={tenantError}
    >
      {tenant ? (
        <div className="bg-brand-dark h-full w-full p-2">
          <div className="bg-brand-black rounded-sm border border-brand-border p-4 mb-2">
            <div className="flex items-center mb-4">
              {tenant.tenantLogoURL ? (
                <TenantLogo
                  src={tenant.tenantLogoURL}
                  alt="Tenant Logo"
                  className="w-16 h-16 rounded-sm"
                />
              ) : (
                <FaStoreAlt className="w-12 h-12 text-brand-text-primary" />
              )}
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-brand-text-primary">
                  {tenant.tenantTitle}
                </h1>
                <p className="text-brand-light-gray">
                  Created {moment(tenant.createdAt).format("MMMM D, YYYY")}
                </p>
              </div>
            </div>


          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {tenantCards.map((card, index) => (
              <div
                key={index}
                className="bg-brand-black rounded-sm border border-brand-border p-6 cursor-pointer hover:border-primary"
                onClick={card.action}
              >
                <div className="flex justify-between items-center mb-4">
                  {card.icon}
                  <span className="text-2xl font-bold text-brand-text-primary">
                    {card.count}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-brand-text-primary mb-2">
                  {card.title}
                </h3>
                <p className="text-brand-light-gray">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <NoEntityUI />
      )}
    </ReactQueryLoadingErrorWrapper>
  );
};

export default TenantLayoutLandingPage;
