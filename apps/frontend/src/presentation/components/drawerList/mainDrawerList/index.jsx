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
import { useAuthState } from "../../../../logic/hooks/useAuth";
import { useTenantState } from "../../../../logic/hooks/useTenant";
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
        : "text-brand-text-primary hover:bg-brand-border-dark hover:text-brand-text-primary"
        }`}
    >
      <item.icon
        className={`!w-5 !h-5 ${
          isActive ? "!text-primary" : "!text-brand-text-primary"
          } group-hover:text-brand-text-primary`}
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
        : "text-brand-text-primary hover:bg-brand-border-dark hover:text-brand-text-primary"
        }`}
    >
      <subItem.icon
        className={`!w-4 !h-4 ${isActive ? "!text-primary" : "!text-brand-text-primary"
          } group-hover:text-brand-text-primary`}
      />
      <span className="font-medium text-sm ml-3">{capitalize(subItem.name)}</span>
    </Link>
  );
};

const DrawerCollapsibleItem = ({
  item,
  isExpanded,
  setExpanded,
  tenantID,
}) => {
  DrawerCollapsibleItem.propTypes = {
    item: PropTypes.object.isRequired,
    isExpanded: PropTypes.bool.isRequired,
    setExpanded: PropTypes.func.isRequired,
    tenantID: PropTypes.number.isRequired,
  };
  return (
    <AccordionItem value={item.expandedStateKey} className="border-none">
      <AccordionTrigger className="w-full hover:no-underline hover:bg-brand-border-dark rounded-md p-2.5 text-brand-text-primary data-[state=open]:text-brand-text-primary transition-colors">
        <div className="flex items-center">
          <item.icon className="!w-5 !h-5 !text-brand-text-primary" />
          <span className="flex-1 ms-3 text-left font-semibold whitespace-nowrap">
            {item.title}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-0 pt-1">
        <ul className="space-y-1 ml-6 border-l pl-2 border-brand-border">
          <li>
            {item.subItems.map((subItem, subIndex) => (
              <DrawerSubMenuItem
                key={subIndex}
                subItem={subItem}
                tenantID={tenantID}
              />
            ))}
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

  const _handleNavigateToEditTenantPage = () => {
    if (tenantID) {
      navigate(CONSTANTS.ROUTES.UPDATE_TENANT.path(tenantID));
    }
  };
  const _handleNavigateToAddTenantPage = () => {
    navigate(CONSTANTS.ROUTES.ADD_TENANT.path());
  };


  // Define the drawer list items as an array of objects
  const drawerListItems = [
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
      title: CONSTANTS.STRINGS.MAIN_DRAWER_LISTENERS_TITLE,
      icon: TbCloudDataConnection,
      path: CONSTANTS.ROUTES.VIEW_LISTENERS.path(tenantID),
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
      className="w-full h-[calc(100vh-50px)] overflow-hidden transition-transform bg-brand-black flex flex-col justify-start items-stretch"
      aria-label="Sidebar"
      ref={ref}
    >
      <div className="p-3 bg-brand-black flex flex-col justify-start items-stretch z-10 sticky top-0 border-b border-transparent">
        {isLoadingTenants ? (
          <div
            role="status"
            className="animate-pulse w-full flex flex-row justify-start items-end"
          >
            <div className="h-10 bg-brand-black w-10 rounded-md"></div>
            <div className="flex flex-col justify-start items-start flex-grow ms-2">
              <div className="h-2 bg-brand-black rounded-sm mb-2 w-16"></div>
              <div className="h-2 bg-brand-black rounded-sm mb-2 w-full"></div>
              <div className="h-2 bg-brand-black rounded-sm mb-0 w-full"></div>
            </div>
          </div>
        ) : tenants && tenants.length > 0 ? (
            <div className="flex flex-row justify-around items-center w-full gap-2">
            <TenantSelectionDropdown />
              <Button
                onClick={_handleNavigateToEditTenantPage}
                variant="outline"
                className="h-10 w-10 rounded-md flex justify-center items-center hover:bg-brand-border-dark p-2.5"
              >
                <Settings className="w-8 h-8 text-brand-text-primary" />
              </Button>
          </div>
        ) : (
          <>
                <Button
              onClick={_handleNavigateToAddTenantPage}
                  className="w-full"
            >
              {CONSTANTS.STRINGS.ADD_TENANT_FORM_TITLE}
                  <FaPlus className="!w-4 !h-4 !text-brand-text-primary ml-2" />
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
