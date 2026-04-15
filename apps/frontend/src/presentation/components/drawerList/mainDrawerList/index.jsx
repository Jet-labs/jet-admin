// DrawerLinkItem.jsx
import { Link, useLocation } from "react-router-dom";
// MainDrawerList.jsx (Updated)
import { ChevronDown, ChevronUp, Settings } from "lucide-react";

const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
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
import { GoWorkflow } from "react-icons/go";
import { LuWorkflow } from "react-icons/lu";

import {
  Button,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  ScrollArea,
} from "@jet-admin/ui";
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
      className={`flex items-center rounded-md w-full p-2.5 transition duration-75 group flex-row !justify-start ${isActive
        ? "bg-primary/10 text-primary"
        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
        }`}
    >
      <item.icon
        className={`!w-5 !h-5 ${
          isActive ? "!text-primary" : "!text-slate-600"
          } group-hover:text-slate-900`}
      />
      <span className="font-semibold text-sm ml-3">{capitalize(item.title)}</span>
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
      className={`flex items-center rounded-md mb-1 w-full p-2 transition duration-75 flex-row justify-start group ${isActive
        ? "bg-primary/10 text-primary"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
    >
      <subItem.icon
        className={`!w-4 !h-4 ${isActive ? "!text-primary" : "!text-slate-500"
          } group-hover:text-slate-900`}
      />
      <span className="font-medium text-sm ml-3">{capitalize(subItem.name)}</span>
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
    <AccordionItem value={item.expandedStateKey} className="border-none">
      <AccordionTrigger className="w-full hover:no-underline hover:bg-slate-100 rounded-md p-2.5 text-slate-700 data-[state=open]:text-slate-900 transition-colors">
        <div className="flex items-center">
          <item.icon className="!w-5 !h-5 !text-slate-600" />
          <span className="flex-1 ms-3 text-left font-semibold whitespace-nowrap">
            {item.title}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-0 pt-1">
        <ul className="space-y-1 ml-6 border-l pl-2 border-slate-200">
          <li>
            {isLoadingMetadata || isFetchingMetadata ? (
              <div role="status" className="animate-pulse">
                <div className="h-8 bg-slate-200 rounded mb-2 w-full"></div>
                <div className="h-8 bg-slate-200 rounded mb-2 w-full"></div>
                <div className="h-8 bg-slate-200 rounded w-[80%]"></div>
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
              <Button
                onClick={item.addButton.onClick}
                variant="primary-ghost"
                className="w-full mt-2 justify-start px-2 py-1.5 h-auto text-sm"
              >
                <item.addButton.icon className="!w-3.5 !h-3.5 mr-2" />
                {item.addButton.text}
              </Button>
            )}
          </li>
        </ul>
      </AccordionContent>
    </AccordionItem>
  );
};

export const MainDrawerList = () => {
  const navigate = useNavigate();
  const { user } = useAuthState();
  const { isLoadingTenants, tenants } = useTenantState();
  const { tenantID } = useParams();
  const [ref] = useComponentSize();

  const {
    isLoading: isLoadingDatabaseMetadata,
    isFetching: isFetchingDatabaseMetadata,
    data: databaseMetadata,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.DATABASE_METADATA(tenantID)],
    queryFn: () => getDatabaseMetadataAPI({ tenantID: tenantID }),
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
      isExpanded: false,
      subItems:
        databaseMetadata?.schemas?.map((schema) => ({
          name: capitalize(schema.databaseSchemaName),
          path: CONSTANTS.ROUTES.VIEW_SCHEMA.path(
            tenantID,
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
      title: CONSTANTS.STRINGS.MAIN_DRAWER_WORKFLOWS_TITLE,
      icon: LuWorkflow,
      path: CONSTANTS.ROUTES.VIEW_WORKFLOWS.path(tenantID),
    },
    {
      type: "link",
      title: CONSTANTS.STRINGS.MAIN_DRAWER_WIDGETS_TITLE,
      icon: MdWidgets,
      path: CONSTANTS.ROUTES.VIEW_WIDGETS.path(tenantID),
    },
    {
      type: "link",
      title: CONSTANTS.STRINGS.MAIN_DRAWER_DASHBOARDS_TITLE,
      icon: RiDashboardFill,
      path: CONSTANTS.ROUTES.VIEW_DASHBOARDS.path(tenantID),
    },
    {
      type: "link",
      title: "Subscriptions", // We should add to constants, but inline for now
      icon: TbCloudDataConnection, // Or another icon
      path: CONSTANTS.ROUTES.VIEW_SUBSCRIPTIONS.path(tenantID),
    },
    {
      type: "link",
      title: "Webhooks",
      icon: TbCloudDataConnection,
      path: CONSTANTS.ROUTES.VIEW_WEBHOOKS.path(tenantID),
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

    // {
    //   type: "link",
    //   title: CONSTANTS.STRINGS.MAIN_DRAWER_SQL_EDITOR_TITLE,
    //   icon: BiLogoPostgresql,
    //   path: CONSTANTS.ROUTES.RAW_SQL_QUERY.path(tenantID),
    // },
    {
      type: "collapsible",
      title: CONSTANTS.STRINGS.MAIN_DRAWER_USER_MANAGEMENT_TITLE,
      icon: FaUserCog,
      expandedStateKey: "userManagement",
      isExpanded: true,
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

  const [menuItemExpandedState, setMenuItemExpandedState] = useState(() =>
    drawerListItems
      .filter((item) => item.type === "collapsible" && item.isExpanded)
      .map((item) => item.expandedStateKey)
  );

  return (
    <aside
      id="logo-sidebar"
      className="w-full h-[calc(100vh-50px)] overflow-hidden transition-transform bg-white flex flex-col justify-start items-stretch"
      aria-label="Sidebar"
      ref={ref}
    >
      <div className="p-3 bg-white flex flex-col justify-start items-stretch z-10 sticky top-0 border-b border-transparent">
        {isLoadingTenants ? (
          <div
            role="status"
            className="animate-pulse w-full flex flex-row justify-start items-end"
          >
            <div className="h-10 bg-slate-200 w-10 rounded-md"></div>
            <div className="flex flex-col justify-start items-start flex-grow ms-2">
              <div className="h-2 bg-slate-200 rounded mb-2 w-16"></div>
              <div className="h-2 bg-slate-200 rounded mb-2 w-full"></div>
              <div className="h-2 bg-slate-200 rounded mb-0 w-full"></div>
            </div>
          </div>
        ) : tenants && tenants.length > 0 ? (
            <div className="flex flex-row justify-around items-center w-full gap-2">
            <TenantSelectionDropdown />
              <Button
                onClick={_handleNavigateToEditTenantPage}
                variant="outline"
                className="h-10 w-10 rounded-md flex justify-center items-center hover:bg-slate-100 p-2.5"
              >
                <Settings className="w-8 h-8 text-slate-600" />
              </Button>
          </div>
        ) : (
          <>
                <Button
              onClick={_handleNavigateToAddTenantPage}
                  className="w-full"
            >
              {CONSTANTS.STRINGS.ADD_TENANT_FORM_TITLE}
                  <FaPlus className="!w-4 !h-4 !text-white ml-2" />
                </Button>
            <NoEntityUI
              message={CONSTANTS.STRINGS.NO_TENANT_CREATED_TILL_NOW}
            />
          </>
        )}
      </div>

      <ScrollArea className="flex-1 w-full p-3 pt-1">
        {tenantID ? (
          <Accordion
            type="multiple"
            value={menuItemExpandedState}
            onValueChange={setMenuItemExpandedState}
            className="w-full flex flex-col space-y-1"
          >
            {drawerListItems.map((item, index) => {
              if (item.type === "collapsible") {
                return (
                  <DrawerCollapsibleItem
                    key={index}
                    item={item}
                    isExpanded={menuItemExpandedState.includes(item.expandedStateKey)}
                    setExpanded={() => { }}
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
          </Accordion>
        ) : null}
      </ScrollArea>
    </aside>
  );
};
