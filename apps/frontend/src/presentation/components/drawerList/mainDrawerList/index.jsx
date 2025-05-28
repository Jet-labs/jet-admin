// DrawerLinkItem.jsx
import { capitalize } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
// MainDrawerList.jsx (Updated)
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import SettingsIcon from "@mui/icons-material/Settings";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
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
import { TbCloudDataConnection } from "react-icons/tb";
import { useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../../constants";
import { getDatabaseMetadataAPI } from "../../../../data/apis/database";
import { useAuthState } from "../../../../logic/contexts/authContext";
import { useTenantState } from "../../../../logic/contexts/tenantContext";
import { useComponentSize } from "../../../../logic/hooks/useComponentSize";
import { TenantSelectionDropdown } from "../../tenantComponents/tenantSelectionDropdown";
import { NoEntityUI } from "../../ui/noEntityUI";
import PropTypes from "prop-types";

// eslint-disable-next-line no-unused-vars
const DrawerLinkItem = ({ item, tenantID }) => {
  DrawerLinkItem.propTypes = {
    item: PropTypes.object.isRequired,
    tenantID: PropTypes.number.isRequired,
  };
  const location = useLocation();
  const isActive = decodeURIComponent(location.pathname).includes(item.path);

  return (
    <Link
      to={item.path}
      className={`flex items-center ${
        isActive ? "bg-[#eaebff]" : "bg-slate-100"
      } rounded w-full p-2 text-slate-700 transition duration-75 group bg-slate-200  hover:bg-slate-100  flex-row !justify-start`}
    >
      <item.icon
        className={`!w-5 !h-5 ${
          isActive ? "!text-[#646cff]" : "!text-slate-700"
        }`}
      />
      <span
        className={`font-semibold text-sm ml-2 ${
          isActive ? "!text-[#646cff]" : "!text-slate-700"
        }`}
      >
        {capitalize(item.title)}
      </span>
    </Link>
  );
};
// eslint-disable-next-line no-unused-vars
const DrawerSubMenuItem = ({ subItem, tenantID }) => {
  DrawerSubMenuItem.propTypes = {
    subItem: PropTypes.object.isRequired,
    tenantID: PropTypes.number.isRequired,
  };
  const location = useLocation();
  const isActive = decodeURIComponent(location.pathname).includes(subItem.path);

  return (
    <Link
      to={subItem.path}
      className={`flex items-center ${
        isActive ? "bg-[#eaebff]" : "bg-slate-100"
      } rounded mb-2 w-full p-2 text-slate-700 transition duration-75 group hover:bg-[#eaebff]  flex-row justify-start `}
    >
      <subItem.icon
        fontSize="small"
        className={`${isActive ? "!text-[#646cff]" : "!text-slate-700"}`}
      />
      <span
        className={` font-semisolid text-sm ml-1 ${
          isActive ? "!text-[#646cff]" : "!text-slate-700"
        }`}
      >
        {capitalize(subItem.name)}
      </span>
    </Link>
  );
};

const DrawerCollapsibleItem = ({
  item,
  isExpanded,
  setExpanded,
  isLoadingMetadata,
  isFetchingMetadata,
  tenantID,
}) => {
  DrawerCollapsibleItem.propTypes = {
    item: PropTypes.object.isRequired,
    isExpanded: PropTypes.bool.isRequired,
    setExpanded: PropTypes.func.isRequired,
    isLoadingMetadata: PropTypes.bool.isRequired,
    isFetchingMetadata: PropTypes.bool.isRequired,
    tenantID: PropTypes.number.isRequired,
  };
  return (
    <div>
      <button
        type="button"
        className="w-full hover:border-none border-none text-slate-900 bg-slate-200 justify-between hover:bg-slate-100 focus:outline-none  font-medium rounded text-sm px-1 py-2 text-center inline-flex items-center"
        onClick={() => setExpanded()}
      >
        <item.icon className="!w-5 !h-5 !text-slate-600 ml-1" />
        <span className="flex-1 ms-2 text-left font-semibold rtl:text-right whitespace-nowrap text-slate-700">
          {item.title}
        </span>
        {isExpanded ? (
          <KeyboardArrowUpIcon fontSize="small" />
        ) : (
          <KeyboardArrowDownIcon fontSize="small" />
        )}
      </button>
      {isExpanded && (
        <ul className=" space-y-2 rounded mt-2">
          <li>
            {isLoadingMetadata || isFetchingMetadata ? (
              <div role="status" className=" animate-pulse">
                <div className="h-8 bg-gray-200 rounded    mb-2"></div>
                <div className="h-8 bg-gray-200 rounded    mb-2"></div>
                <div className="h-8 bg-gray-200 rounded    mb-2"></div>
                <div className="h-8 bg-gray-200 rounded    mb-2"></div>
              </div>
            ) : (
              item.subItems.map((subItem, subIndex) => (
                <DrawerSubMenuItem
                  key={subIndex}
                  subItem={subItem}
                  tenantID={tenantID}
                />
              ))
            )}
            {item.addButton && (
              <button
                onClick={item.addButton.onClick}
                className="flex mt-2 flex-row items-center justify-center rounded bg-[#646cff]/10 px-3 py-1.5 text-sm text-[#646cff] hover:bg-[#646cff]/20 focus:ring-2 focus:ring-[#646cff]/50 w-full outline-none focus:outline-none"
              >
                <item.addButton.icon className="!w-4 !h-4 !text-[#646cff] mr-1" />
                {item.addButton.text}
              </button>
            )}
          </li>
        </ul>
      )}
    </div>
  );
};

export const MainDrawerList = () => {
  const navigate = useNavigate();
  const { user } = useAuthState();
  const { isLoadingTenants, tenants } = useTenantState();
  const { tenantID } = useParams();
  const [ref] = useComponentSize();

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

  // Define the drawer list items as an array of objects
  const drawerListItems = [
    {
      type: "collapsible",
      title: CONSTANTS.STRINGS.MAIN_DRAWER_DATABASE_TITLE,
      icon: BsServer,
      expandedStateKey: "databaseSchema",
      subItems:
        databaseMetadata?.schemas?.map((schema) => ({
          name: capitalize(schema.databaseSchemaName),
          path: CONSTANTS.ROUTES.VIEW_SCHEMA.path(
            parseInt(tenantID),
            schema.databaseSchemaName
          ),
          icon: MdOutlineSchema,
        })) || [],
      addButton: {
        text: CONSTANTS.STRINGS.MAIN_DRAWER_ADD_DATABASE_SCHEMA_BUTTON,
        onClick: _navigateToAddDatabaseSchema,
        icon: FaPlus,
      },
    },
    {
      type: "link",
      title: CONSTANTS.STRINGS.MAIN_DRAWER_DATASOURCE_TITLE,
      icon: TbCloudDataConnection,
      path: CONSTANTS.ROUTES.VIEW_DATASOURCES.path(tenantID),
    },
    {
      type: "link",
      title: CONSTANTS.STRINGS.MAIN_DRAWER_QUERIES_TITLE,
      icon: SiQuantconnect,
      path: CONSTANTS.ROUTES.VIEW_QUERIES.path(tenantID),
    },

    {
      type: "link",
      title: CONSTANTS.STRINGS.MAIN_DRAWER_WIDGETS_TITLE,
      icon: MdWidgets,
      path: CONSTANTS.ROUTES.VIEW_WIDGETS.path(tenantID),
    },
    {
      type: "link",
      title: CONSTANTS.STRINGS.MAIN_DRAWER_DATABASE_DASHBOARDS_TITLE,
      icon: RiDashboardFill,
      path: CONSTANTS.ROUTES.VIEW_DATABASE_DASHBOARDS.path(tenantID),
    },
    {
      type: "link",
      title: CONSTANTS.STRINGS.MAIN_DRAWER_API_KEYS_TITLE,
      icon: FaKey,
      path: CONSTANTS.ROUTES.VIEW_API_KEYS.path(tenantID),
    },
    {
      type: "link",
      title: CONSTANTS.STRINGS.MAIN_DRAWER_CRON_JOBS_TITLE,
      icon: RiCalendarScheduleFill,
      path: CONSTANTS.ROUTES.VIEW_CRON_JOBS.path(tenantID),
    },
    {
      type: "link",
      title: CONSTANTS.STRINGS.MAIN_DRAWER_SQL_EDITOR_TITLE,
      icon: BiLogoPostgresql,
      path: CONSTANTS.ROUTES.RAW_SQL_QUERY.path(tenantID),
    },
    {
      type: "collapsible",
      title: CONSTANTS.STRINGS.MAIN_DRAWER_USER_MANAGEMENT_TITLE,
      icon: FaUserCog,
      expandedStateKey: "userManagement",
      subItems: [
        {
          name: "Users",
          path: CONSTANTS.ROUTES.VIEW_TENANT_USERS.path(tenantID),
          icon: FiUsers,
        },
        {
          name: "Roles and permissions",
          path: CONSTANTS.ROUTES.VIEW_TENANT_ROLES.path(tenantID),
          icon: MdOutlineLockPerson,
        },
      ],
    },
  ];

  return (
    <aside
      id="logo-sidebar"
      className=" w-full h-[calc(100vh-50px)] overflow-y-auto transition-transform bg-white  flex flex-col justify-start items-stretch gap-2 "
      aria-label="Sidebar"
      ref={ref}
    >
      <div className="h-full p-2 overflow-y-auto bg-white flex flex-col justify-start items-stretch gap-2">
        {isLoadingTenants ? (
          <div
            role="status"
            className=" animate-pulse w-full flex flex-row justify-start items-end"
          >
            <div className="h-10 bg-gray-200 w-10 rounded-md"></div>
            <div className="flex flex-col justify-start items-start flex-grow ms-2">
              <div className="h-2 bg-gray-200 rounded    mb-2 w-16"></div>
              <div className="h-2 bg-gray-200 rounded    mb-2 w-full"></div>
              <div className="h-2 bg-gray-200 rounded    mb-0 w-full"></div>
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
            {drawerListItems.map((item, index) => {
              if (item.type === "collapsible") {
                return (
                  <DrawerCollapsibleItem
                    key={index}
                    item={item}
                    isExpanded={menuItemExpandedState[item.expandedStateKey]}
                    setExpanded={() =>
                      setMenuItemExpandedState((prevState) => ({
                        ...prevState,
                        [item.expandedStateKey]:
                          !prevState[item.expandedStateKey],
                      }))
                    }
                    isLoadingMetadata={isLoadingDatabaseMetadata}
                    isFetchingMetadata={isFetchingDatabaseMetadata}
                    tenantID={tenantID}
                  />
                );
              } else if (item.type === "link") {
                return (
                  <DrawerLinkItem key={index} item={item} tenantID={tenantID} />
                );
              }
              return null;
            })}
          </>
        ) : null}
      </div>
    </aside>
  );
};
