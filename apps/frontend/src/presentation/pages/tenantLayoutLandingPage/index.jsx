import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { FaDatabase, FaStoreAlt } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { getUserTenantByIDAPI } from "../../../data/apis/tenant";
import { TenantLogo } from "../../components/tenantComponents/tenantLogo";

import { CodeBlock } from "../../components/ui/codeBlock";
import { NoEntityUI } from "../../components/ui/noEntityUI";

import rolesLogo from "../../../assets/roles_logo.png";
import schemaLogo from "../../../assets/schema_logo.png";
import tableLogo from "../../../assets/table_logo.png";
import usersLogo from "../../../assets/users_logo.png";
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
      title: "Database Schemas",
      icon: <img src={schemaLogo} alt="Database Schemas" className="w-8 h-8" />,
      count: tenant?.tenantDatabaseSchemasCount || 0,
      description: "View and manage database schemas",
      action: () =>
        navigate(CONSTANTS.ROUTES.VIEW_SCHEMA.path(tenantID, "public")),
    },
    {
      title: "Database Tables",
      icon: <img src={tableLogo} alt="Database Tables" className="w-8 h-8" />,
      count: tenant?.tenantDatabaseTablesCount || 0,
      description: "View and manage database tables",
      action: () =>
        navigate(
          CONSTANTS.ROUTES.VIEW_DATABASE_TABLES.path(tenantID, "public")
        ),
    },
    {
      title: "Roles",
      icon: <img src={rolesLogo} alt="Roles" className="w-8 h-8" />,
      count: tenant?.tenantRolesCount || 0,
      description: "Configure user roles and permissions",
      action: () => navigate(CONSTANTS.ROUTES.VIEW_TENANT_ROLES.path(tenantID)),
    },
  ];

  return (
    <ReactQueryLoadingErrorWrapper
      isLoading={isLoadingTenant}
      error={tenantError}
    >
      {tenant ? (
        <div className="bg-gray-50 h-full w-full p-2">
          <div className="bg-white rounded border border-gray-200 p-4 mb-2">
            <div className="flex items-center mb-4">
              {tenant.tenantLogoURL ? (
                <TenantLogo
                  src={tenant.tenantLogoURL}
                  alt="Tenant Logo"
                  className="w-16 h-16 rounded"
                />
              ) : (
                <FaStoreAlt className="w-12 h-12 text-slate-500" />
              )}
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-slate-700">
                  {tenant.tenantTitle}
                </h1>
                <p className="text-gray-500">
                  Created {moment(tenant.createdAt).format("MMMM D, YYYY")}
                </p>
              </div>
            </div>

            <div className=" pt-2 mt-2">
              <h2 className="text-base font-semibold text-slate-700 mb-2">
                Database Connection
              </h2>
              {tenant.tenantDBURL ? (
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {tenantCards.map((card, index) => (
              <div
                key={index}
                className="bg-white rounded border border-gray-200 p-6 cursor-pointer hover:border-[#646cff]"
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
      ) : (
        <NoEntityUI />
      )}
    </ReactQueryLoadingErrorWrapper>
  );
};

export default TenantLayoutLandingPage;
