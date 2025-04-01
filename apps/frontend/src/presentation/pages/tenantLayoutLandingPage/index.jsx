import { CircularProgress } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import React from "react";
import { BsServer } from "react-icons/bs";
import {
  FaChartPie,
  FaDatabase,
  FaKey,
  FaStoreAlt,
  FaUsers,
  FaUsersCog,
} from "react-icons/fa";
import { MdSchema } from "react-icons/md";
import { RiDashboardFill } from "react-icons/ri";
import { SiQuantconnect } from "react-icons/si";
import { useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { getUserTenantByIDAPI } from "../../../data/apis/tenant";
import { TenantLogo } from "../../components/tenantComponents/tenantLogo";
import CodeBlock from "../../components/ui/codeBlock";
import { NoEntityUI } from "../../components/ui/noEntityUI";

const TenantLayoutLandingPage = () => {
  const { tenantID } = useParams();
  const navigate = useNavigate();

  const {
    isLoading: isLoadingTenant,
    isFetching: isFetchingTenant,
    data: tenant,
    error: tenantError,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.TENANTS, tenantID],
    queryFn: () => getUserTenantByIDAPI({ tenantID }),
    retry: 0,
  });

  if (isLoadingTenant) {
    return (
      <div className="flex justify-center items-center h-full">
        <CircularProgress />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="bg-gray-50 h-full w-full p-6">
        <NoEntityUI message={CONSTANTS.ERROR_CODES.INVALID_REQUEST.message} />
      </div>
    );
  }

  const tenantCards = [
    {
      title: "Users",
      icon: <FaUsers className="text-[#646cff] text-2xl" />,
      count: tenant?.relationships?.length || 0,
      description: "Manage tenant users and permissions",
      action: () => navigate(CONSTANTS.ROUTES.VIEW_TENANT_USERS.path(tenantID)),
    },
    {
      title: "Database Schemas",
      icon: <MdSchema className="text-[#646cff] text-2xl" />,
      count: tenant?.tenantDatabaseSchemasCount || 0,
      description: "View and manage database schemas",
      action: () =>
        navigate(CONSTANTS.ROUTES.VIEW_SCHEMA.path(tenantID, "public")),
    },
    {
      title: "Database Tables",
      icon: <BsServer className="text-[#646cff] text-2xl" />,
      count: tenant?.tenantDatabaseTablesCount || 0,
      description: "View and manage database tables",
      action: () =>
        navigate(
          CONSTANTS.ROUTES.VIEW_DATABASE_TABLES.path(tenantID, "public")
        ),
    },
    {
      title: "Database saved queries",
      icon: <SiQuantconnect className="text-[#646cff] text-2xl" />,
      count: tenant?.tenantDatabaseQueryCount || 0,
      description: "View and manage database saved queries",
      action: () =>
        navigate(CONSTANTS.ROUTES.VIEW_DATABASE_QUERIES.path(tenantID)),
    },
    {
      title: "Charts",
      icon: <FaChartPie className="text-[#646cff] text-2xl" />,
      count: tenant?.tenantChartCount || 0,
      description: "View and manage charts",
      action: () =>
        navigate(CONSTANTS.ROUTES.VIEW_DATABASE_CHARTS.path(tenantID)),
    },
    {
      title: "Dashboards",
      icon: <RiDashboardFill className="text-[#646cff] text-2xl" />,
      count: tenant?.tenantDashboardCount || 0,
      description: "View and manage dashboards",
      action: () =>
        navigate(CONSTANTS.ROUTES.VIEW_DATABASE_DASHBOARDS.path(tenantID)),
    },
    {
      title: "Roles",
      icon: <FaUsersCog className="text-[#646cff] text-2xl" />,
      count: tenant?.tenantRolesCount || 0,
      description: "Configure user roles and permissions",
      action: () => navigate(CONSTANTS.ROUTES.VIEW_TENANT_ROLES.path(tenantID)),
    },
    {
      title: "API Keys",
      icon: <FaKey className="text-[#646cff] text-2xl" />,
      
      description: "Create and manage API keys",
      action: () => navigate(CONSTANTS.ROUTES.VIEW_API_KEYS.path(tenantID)),
    },
  ];

  return (
    <div className="bg-gray-50 h-full w-full p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center mb-4">
          {tenant.tenantLogoURL ? (
            <TenantLogo
              src={tenant.tenantLogoURL}
              alt="Tenant Logo"
              className="w-16 h-16 rounded"
            />
          ) : (
            <FaStoreAlt className="w-5 h-5 text-slate-500" />
          )}
          <div className="ml-3">
            <h1 className="text-2xl font-bold text-slate-700">
              {tenant.tenantName}
            </h1>
            <p className="text-gray-500">
              Created {moment(tenant.createdAt).format("MMMM D, YYYY")}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4 mt-4">
          <h2 className="text-base font-semibold text-slate-700 mb-2">
            Database Connection
          </h2>
          {tenant.tenantDBURL  ? (
            <CodeBlock code={tenant.tenantDBURL} />
          ) : (
            <div className="flex items-center mb-2">
              <FaDatabase className="text-slate-400 mr-2 text-xs" />
              <span className="text-slate-400 text-xs">
                {CONSTANTS.STRINGS.NO_DATABASE_URL}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tenantCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={card.action}
          >
            <div className="flex justify-between items-center mb-4">
              {card.icon}
              <span className="text-2xl font-bold text-slate-700">
                {card.count}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              {card.title}
            </h3>
            <p className="text-gray-600">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TenantLayoutLandingPage;

