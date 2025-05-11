import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import SettingsIcon from "@mui/icons-material/Settings";
import { capitalize } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import React, { useRef, useState } from "react";
import { BiLogoPostgresql } from "react-icons/bi";
import { BsServer } from "react-icons/bs";
import { FaKey, FaUserCog } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import { FiUsers } from "react-icons/fi";
import {
  MdOutlineLockPerson,
  MdOutlineSchema,
  MdWidgets,
} from "react-icons/md";
import { RiCalendarScheduleFill, RiDashboardFill } from "react-icons/ri";
import { SiQuantconnect } from "react-icons/si";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../../constants";
import { getDatabaseMetadataAPI } from "../../../../data/apis/database";
import { useAuthState } from "../../../../logic/contexts/authContext";
import { useTenantState } from "../../../../logic/contexts/tenantContext";
import { TenantSelectionDropdown } from "../../tenantComponents/tenantSelectionDropdown";
import { NoEntityUI } from "../../ui/noEntityUI";
import { useComponentSize } from "../../../../logic/hooks/useComponentSize";

export const MainDrawerList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthState();
  const { isLoadingTenants, tenants } = useTenantState();
  const { tenantID } = useParams();
  const [ref, size] = useComponentSize();

  const [menuItemExpandedState, setMenuItemExpandedState] = useState({
    databaseSchema: false,
    userManagement: false,
  });

  const {
    isLoading: isLoadingDatabaseMetadata,
    isFetching: isFetchingDatabaseMetadata,
    data: databaseMetadata,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.DATABASE_METADATA(tenantID)],
    queryFn: () => getDatabaseMetadataAPI({ tenantID: parseInt(tenantID) }),
    enabled: Boolean(user),
    refetchOnWindowFocus: false,
  });

  const _handleNavigateToEditTenantPage = () => {
    if (tenantID) {
      navigate(CONSTANTS.ROUTES.UPDATE_TENANT.path(tenantID));
    }
  };
  const _handleNavigateToAddTenantPage = () => {
    navigate(CONSTANTS.ROUTES.ADD_TENANT.path());
  };

  const _navigateToAddDatabaseSchema = () => {
    navigate(CONSTANTS.ROUTES.ADD_SCHEMA.path(tenantID));
  };
  

  return (
    <aside
      id="logo-sidebar"
      className=" w-full h-[calc(100vh-50px)] overflow-y-auto transition-transform bg-white  flex flex-col justify-start items-stretch gap-2 "
      aria-label="Sidebar"
      ref={ref}
    >
      <div className="h-full p-2 overflow-y-auto bg-white">
        {isLoadingTenants ? (
          <div
            role="status"
            className=" animate-pulse w-full flex flex-row justify-start items-end"
          >
            <div className="h-10 bg-gray-200 w-10 rounded-md"></div>
            <div className="flex flex-col justify-start items-start flex-grow ms-2">
              <div className="h-2 bg-gray-200 rounded   mb-2 w-16"></div>
              <div className="h-2 bg-gray-200 rounded   mb-2 w-full"></div>
              <div className="h-2 bg-gray-200 rounded   mb-0 w-full"></div>
            </div>
          </div>
        ) : tenants && tenants.length > 0 ? (
          <div className="flex flex-row justify-around items-center w-full">
            <TenantSelectionDropdown />
            {
              <button
                onClick={_handleNavigateToEditTenantPage}
                className="ml-2 text-slate-900 bg-white justify-between hover:bg-slate-100 border border-slate-300 focus:ring-4 focus:outline-none focus:ring-slate-100 font-medium rounded text-sm p-2 text-center inline-flex items-center"
              >
                <SettingsIcon className="!w-6 !h-6 !text-slate-600" />
              </button>
            }
          </div>
        ) : (
          <>
            <button
              onClick={_handleNavigateToAddTenantPage}
              className="w-full py-1 px-2 mt-1 mb-2 text-sm item-center flex flex-row items-center justify-center font-medium text-white focus:outline-none bg-[#646cff] rounded border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 "
            >
              {CONSTANTS.STRINGS.ADD_TENANT_FORM_TITLE}
              <FaPlus className="!w-4 !h-4 !text-white ml-1" />
            </button>
            <NoEntityUI
              message={CONSTANTS.STRINGS.NO_TENANT_CREATED_TILL_NOW}
            />
          </>
        )}

        {tenantID ? (
          <>
            <button
              type="button"
              className={
                "w-full hover:border-none border-none mt-2 text-slate-900 bg-slate-200 justify-between hover:bg-slate-100 focus:outline-none  font-medium rounded text-sm px-1 py-2 text-center inline-flex items-center"
              }
              onClick={() =>
                setMenuItemExpandedState({
                  ...menuItemExpandedState,
                  databaseSchema: !menuItemExpandedState.databaseSchema,
                })
              }
            >
              <BsServer className="!w-5 !h-5 !text-slate-600 ml-1" />
              <span className="flex-1 ms-2 text-left font-semibold rtl:text-right whitespace-nowrap text-slate-700">
                {CONSTANTS.STRINGS.MAIN_DRAWER_DATABASE_TITLE}
              </span>
              {menuItemExpandedState.databaseSchema ? (
                <KeyboardArrowUpIcon fontSize="small" />
              ) : (
                <KeyboardArrowDownIcon fontSize="small" />
              )}
            </button>
            {menuItemExpandedState.databaseSchema && (
              <ul className=" space-y-2 rounded mt-2">
                <li className="">
                  {isLoadingDatabaseMetadata || isFetchingDatabaseMetadata ? (
                    <div role="status" className=" animate-pulse">
                      <div className="h-8 bg-gray-200 rounded   mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded   mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded   mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded   mb-2"></div>
                    </div>
                  ) : (
                    databaseMetadata?.schemas?.map((schema) => {
                      const isActive = decodeURIComponent(location.pathname)
                        .split("/")
                        .includes(schema.databaseSchemaName);
                      return (
                        <>
                          <Link
                            to={CONSTANTS.ROUTES.VIEW_SCHEMA.path(
                              parseInt(tenantID),
                              schema.databaseSchemaName
                            )}
                            key={CONSTANTS.ROUTES.VIEW_SCHEMA.path(
                              parseInt(tenantID),
                              schema.databaseSchemaName
                            )}
                            className={`flex items-center ${
                              isActive ? "bg-[#eaebff]" : "bg-slate-100"
                            } rounded mb-2 w-full p-2 text-slate-700 transition duration-75 group hover:bg-[#eaebff]  flex-row justify-start `}
                          >
                            <MdOutlineSchema
                              fontSize="small"
                              className={`${
                                isActive ? "!text-[#646cff]" : "!text-slate-700"
                              }`}
                            />
                            <span
                              className={` font-semisolid text-sm ml-1 ${
                                isActive ? "!text-[#646cff]" : "!text-slate-700"
                              }`}
                            >
                              {capitalize(schema.databaseSchemaName)}
                            </span>
                          </Link>
                        </>
                      );
                    })
                  )}

                  <button
                    onClick={_navigateToAddDatabaseSchema}
                    className="flex mt-2 flex-row items-center justify-center rounded bg-[#646cff]/10 px-3 py-1.5 text-sm text-[#646cff] hover:bg-[#646cff]/20 focus:ring-2 focus:ring-[#646cff]/50 w-full outline-none focus:outline-none"
                  >
                    <FaPlus className="!w-4 !h-4 !text-[#646cff] mr-1" />
                    {CONSTANTS.STRINGS.MAIN_DRAWER_ADD_DATABASE_SCHEMA_BUTTON}
                  </button>
                </li>
              </ul>
            )}
            <Link
              to={CONSTANTS.ROUTES.VIEW_DATABASE_DASHBOARDS.path(tenantID)}
              key={CONSTANTS.ROUTES.VIEW_DATABASE_DASHBOARDS.path(tenantID)}
              className={`flex items-center ${
                decodeURIComponent(location.pathname).includes(
                  CONSTANTS.ROUTES.VIEW_DATABASE_DASHBOARDS.path(tenantID)
                )
                  ? "bg-[#eaebff]"
                  : "bg-slate-100"
              } rounded mb-2 w-full p-2 text-slate-700 transition duration-75 group bg-slate-200  hover:bg-slate-100  flex-row !justify-start mt-2 `}
            >
              <RiDashboardFill
                className={`!w-5 !h-5 ${
                  decodeURIComponent(location.pathname).includes(
                    CONSTANTS.ROUTES.VIEW_DATABASE_DASHBOARDS.path(tenantID)
                  )
                    ? "!text-[#646cff]"
                    : "!text-slate-700"
                }`}
              />
              <span
                className={`font-semibold text-sm ml-2 ${
                  decodeURIComponent(location.pathname).includes(
                    CONSTANTS.ROUTES.VIEW_DATABASE_DASHBOARDS.path(tenantID)
                  )
                    ? "!text-[#646cff]"
                    : "!text-slate-700"
                }`}
              >
                {capitalize(
                  CONSTANTS.STRINGS.MAIN_DRAWER_DATABASE_DASHBOARDS_TITLE
                )}
              </span>
            </Link>

            <Link
              to={CONSTANTS.ROUTES.VIEW_DATABASE_WIDGETS.path(tenantID)}
              key={CONSTANTS.ROUTES.VIEW_DATABASE_WIDGETS.path(tenantID)}
              className={`flex items-center ${
                decodeURIComponent(location.pathname).includes(
                  CONSTANTS.ROUTES.VIEW_DATABASE_WIDGETS.path(tenantID)
                )
                  ? "bg-[#eaebff]"
                  : "bg-slate-100"
              } rounded mb-2 w-full p-2 text-slate-700 transition duration-75 group bg-slate-200  hover:bg-slate-100  flex-row !justify-start mt-2 `}
            >
              <MdWidgets
                className={`!w-5 !h-5 ${
                  decodeURIComponent(location.pathname).includes(
                    CONSTANTS.ROUTES.VIEW_DATABASE_WIDGETS.path(tenantID)
                  )
                    ? "!text-[#646cff]"
                    : "!text-slate-700"
                }`}
              />
              <span
                className={`font-semibold text-sm ml-2 ${
                  decodeURIComponent(location.pathname).includes(
                    CONSTANTS.ROUTES.VIEW_DATABASE_WIDGETS.path(tenantID)
                  )
                    ? "!text-[#646cff]"
                    : "!text-slate-700"
                }`}
              >
                {capitalize(
                  CONSTANTS.STRINGS.MAIN_DRAWER_DATABASE_WIDGETS_TITLE
                )}
              </span>
            </Link>
            <Link
              to={CONSTANTS.ROUTES.VIEW_DATABASE_QUERIES.path(tenantID)}
              key={CONSTANTS.ROUTES.VIEW_DATABASE_QUERIES.path(tenantID)}
              className={`flex items-center ${
                decodeURIComponent(location.pathname).includes(
                  CONSTANTS.ROUTES.VIEW_DATABASE_QUERIES.path(tenantID)
                )
                  ? "bg-[#eaebff]"
                  : "bg-slate-100"
              } rounded mb-2 w-full p-2 text-slate-700 transition duration-75 group bg-slate-200  hover:bg-slate-100  flex-row !justify-start mt-2 `}
            >
              <SiQuantconnect
                className={`!w-5 !h-5 ${
                  decodeURIComponent(location.pathname).includes(
                    CONSTANTS.ROUTES.VIEW_DATABASE_QUERIES.path(tenantID)
                  )
                    ? "!text-[#646cff]"
                    : "!text-slate-700"
                }`}
              />
              <span
                className={`font-semibold text-sm ml-2 ${
                  decodeURIComponent(location.pathname).includes(
                    CONSTANTS.ROUTES.VIEW_DATABASE_QUERIES.path(tenantID)
                  )
                    ? "!text-[#646cff]"
                    : "!text-slate-700"
                }`}
              >
                {capitalize(
                  CONSTANTS.STRINGS.MAIN_DRAWER_DATABASE_QUERIES_TITLE
                )}
              </span>
            </Link>

            {/* <Link
              to={CONSTANTS.ROUTES.VIEW_DATABASE_NOTIFICATIONS.path(tenantID)}
              key={CONSTANTS.ROUTES.VIEW_DATABASE_NOTIFICATIONS.path(tenantID)}
              className={`flex items-center ${
                decodeURIComponent(location.pathname).includes(
                  CONSTANTS.ROUTES.VIEW_DATABASE_NOTIFICATIONS.path(tenantID)
                )
                  ? "bg-[#eaebff]"
                  : "bg-slate-100"
              } rounded mb-2 w-full p-2 text-slate-700 transition duration-75 group bg-slate-200  hover:bg-slate-100  flex-row !justify-start mt-2 `}
            >
              <MdNotifications className="!w-5 !h-5 !text-slate-600" />
              <span
                className={`font-semibold text-sm ml-2 ${
                  decodeURIComponent(location.pathname).includes(
                    CONSTANTS.ROUTES.VIEW_DATABASE_NOTIFICATIONS.path(tenantID)
                  )
                    ? "!text-[#646cff]"
                    : "!text-slate-700"
                }`}
              >
                {capitalize(
                  CONSTANTS.STRINGS.MAIN_DRAWER_DATABASE_NOTIFICATIONS_TITLE
                )}
              </span>
            </Link> */}

            <Link
              to={CONSTANTS.ROUTES.VIEW_API_KEYS.path(tenantID)}
              key={CONSTANTS.ROUTES.VIEW_API_KEYS.path(tenantID)}
              className={`flex items-center ${
                decodeURIComponent(location.pathname).includes(
                  CONSTANTS.ROUTES.VIEW_API_KEYS.path(tenantID)
                )
                  ? "bg-[#eaebff]"
                  : "bg-slate-100"
              } rounded mb-2 w-full p-2 text-slate-700 transition duration-75 group bg-slate-200  hover:bg-slate-100  flex-row !justify-start mt-2 `}
            >
              <FaKey
                className={`!w-5 !h-5 ${
                  decodeURIComponent(location.pathname).includes(
                    CONSTANTS.ROUTES.VIEW_API_KEYS.path(tenantID)
                  )
                    ? "!text-[#646cff]"
                    : "!text-slate-700"
                }`}
              />
              <span
                className={`font-semibold text-sm ml-2 ${
                  decodeURIComponent(location.pathname).includes(
                    CONSTANTS.ROUTES.VIEW_API_KEYS.path(tenantID)
                  )
                    ? "!text-[#646cff]"
                    : "!text-slate-700"
                }`}
              >
                {capitalize(CONSTANTS.STRINGS.MAIN_DRAWER_API_KEYS_TITLE)}
              </span>
            </Link>

            <Link
              to={CONSTANTS.ROUTES.VIEW_CRON_JOBS.path(tenantID)}
              key={CONSTANTS.ROUTES.VIEW_CRON_JOBS.path(tenantID)}
              className={`flex items-center ${
                decodeURIComponent(location.pathname).includes(
                  CONSTANTS.ROUTES.VIEW_CRON_JOBS.path(tenantID)
                )
                  ? "bg-[#eaebff]"
                  : "bg-slate-100"
              } rounded mb-2 w-full p-2 text-slate-700 transition duration-75 group bg-slate-200  hover:bg-slate-100  flex-row !justify-start mt-2 `}
            >
              <RiCalendarScheduleFill
                className={`!w-5 !h-5 ${
                  decodeURIComponent(location.pathname).includes(
                    CONSTANTS.ROUTES.VIEW_CRON_JOBS.path(tenantID)
                  )
                    ? "!text-[#646cff]"
                    : "!text-slate-700"
                }`}
              />
              <span
                className={`font-semibold text-sm ml-2 ${
                  decodeURIComponent(location.pathname).includes(
                    CONSTANTS.ROUTES.VIEW_CRON_JOBS.path(tenantID)
                  )
                    ? "!text-[#646cff]"
                    : "!text-slate-700"
                }`}
              >
                {capitalize(CONSTANTS.STRINGS.MAIN_DRAWER_CRON_JOBS_TITLE)}
              </span>
            </Link>

            <Link
              to={CONSTANTS.ROUTES.RAW_SQL_QUERY.path(tenantID)}
              key={CONSTANTS.ROUTES.RAW_SQL_QUERY.path(tenantID)}
              className={`flex items-center ${
                decodeURIComponent(location.pathname).includes(
                  CONSTANTS.ROUTES.RAW_SQL_QUERY.path(tenantID)
                )
                  ? "bg-[#eaebff]"
                  : "bg-slate-100"
              } rounded mb-2 w-full p-2 text-slate-700 transition duration-75 group bg-slate-200  hover:bg-slate-100  flex-row !justify-start mt-2 `}
            >
              <BiLogoPostgresql
                className={`!w-5 !h-5 ${
                  decodeURIComponent(location.pathname).includes(
                    CONSTANTS.ROUTES.RAW_SQL_QUERY.path(tenantID)
                  )
                    ? "!text-[#646cff]"
                    : "!text-slate-700"
                }`}
              />
              <span
                className={`font-semibold text-sm ml-2 ${
                  decodeURIComponent(location.pathname).includes(
                    CONSTANTS.ROUTES.RAW_SQL_QUERY.path(tenantID)
                  )
                    ? "!text-[#646cff]"
                    : "!text-slate-700"
                }`}
              >
                {capitalize(CONSTANTS.STRINGS.MAIN_DRAWER_SQL_EDITOR_TITLE)}
              </span>
            </Link>

            <button
              type="button"
              className={
                "w-full text-slate-900 bg-slate-200 hover:border-none border-none justify-between hover:bg-slate-100 focus:outline-none  font-medium rounded text-sm px-1 py-2 text-center inline-flex items-center"
              }
              onClick={() =>
                setMenuItemExpandedState({
                  ...menuItemExpandedState,
                  userManagement: !menuItemExpandedState.userManagement,
                })
              }
            >
              <FaUserCog className="!w-5 !h-5 !text-slate-600 ml-1" />
              <span className="flex-1 ms-2 text-left font-semibold rtl:text-right whitespace-nowrap text-slate-700">
                {CONSTANTS.STRINGS.MAIN_DRAWER_USER_MANAGEMENT_TITLE}
              </span>
              {menuItemExpandedState.userManagement ? (
                <KeyboardArrowUpIcon fontSize="small" />
              ) : (
                <KeyboardArrowDownIcon fontSize="small" />
              )}
            </button>
            {menuItemExpandedState.userManagement && (
              <ul className=" space-y-2 rounded mt-2">
                <li className="">
                  {isLoadingDatabaseMetadata || isFetchingDatabaseMetadata ? (
                    <div role="status" className=" animate-pulse">
                      <div className="h-8 bg-gray-200 rounded   mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded   mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded   mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded   mb-2"></div>
                    </div>
                  ) : (
                    [
                      {
                        name: "Users",
                        path: CONSTANTS.ROUTES.VIEW_TENANT_USERS.path(tenantID),
                        icon: ({ isActive }) => {
                          return (
                            <FiUsers
                              className={`${
                                isActive
                                  ? "!text-lg !text-[#646cff]"
                                  : "!text-lg !text-slate-700"
                              }`}
                            />
                          );
                        },
                      },
                      {
                        name: "Roles and permissions",
                        path: CONSTANTS.ROUTES.VIEW_TENANT_ROLES.path(tenantID),
                        icon: ({ isActive }) => {
                          return (
                            <MdOutlineLockPerson
                              className={`${
                                isActive
                                  ? "!text-lg !text-[#646cff] -ml-0.5"
                                  : "!text-lg !text-slate-700 -ml-0.5"
                              }`}
                            />
                          );
                        },
                      },
                    ]?.map((tab) => {
                      const isActive = decodeURIComponent(
                        location.pathname
                      ).includes(tab.path);
                      return (
                        <>
                          <Link
                            to={tab.path}
                            key={tab.path}
                            className={`flex items-center ${
                              isActive ? "bg-[#eaebff]" : "bg-slate-100"
                            } rounded mb-2 w-full p-2 text-slate-700 transition duration-75 group hover:bg-[#eaebff]  flex-row !justify-start `}
                          >
                            {tab.icon({ isActive })}
                            <span
                              className={` font-semisolid text-sm ml-1 ${
                                isActive ? "!text-[#646cff]" : "!text-slate-700"
                              }`}
                            >
                              {capitalize(tab.name)}
                            </span>
                          </Link>
                        </>
                      );
                    })
                  )}
                </li>
              </ul>
            )}
          </>
        ) : null}
      </div>
    </aside>
  );
};
