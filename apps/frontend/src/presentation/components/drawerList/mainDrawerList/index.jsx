// DrawerLinkItem.jsx
import { Link, useLocation } from "react-router-dom";
import { Plus } from 'lucide-react';
// MainDrawerList.jsx (Updated)
import { Settings } from "lucide-react";
import PropTypes from "prop-types";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../../constants";
import { useAuthState } from "../../../../logic/hooks/useAuth";
import { useComponentSize } from "../../../../logic/hooks/useComponentSize";
import { useTenantState } from "../../../../logic/hooks/useTenant";
import { TenantSelectionDropdown } from "../../tenantComponents/tenantSelectionDropdown";
import { NoEntityUI } from "../../ui/noEntityUI";

const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

import {
  Clock,
  Database,
  FileCode2,
  GitBranch,
  KeyRound,
  LayoutDashboard,
  PanelTop,
  Radio,
  ShieldCheck,
  UserCog,
  Users,
  Activity,
  Workflow
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
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
      className={`flex items-center rounded w-full p-1.5 px-2 transition duration-75 group flex-row !justify-start ${isActive
        ? "bg-primary/5 text-primary"
        : "text-foreground hover:bg-muted hover:text-foreground"
        }`}
    >
      <item.icon
        className={`!w-5 !h-5 ${
          isActive ? "!text-primary" : "!text-foreground"
          } group-hover:text-foreground`}
      />
      <span className="text-sm ml-3">{capitalize(item.title)}</span>
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
      className={`flex items-center rounded mb-1 w-full p-1.5 px-2 transition duration-75 flex-row justify-start group ${isActive
        ? "bg-primary/5 text-primary"
        : "text-foreground hover:bg-muted hover:text-foreground"
        }`}
    >
      <subItem.icon
        className={`!w-4 !h-4 ${isActive ? "!text-primary" : "!text-foreground"
          } group-hover:text-foreground`}
      />
      <span className="font-light text-sm ml-3">{capitalize(subItem.name)}</span>
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
      <AccordionTrigger className="w-full hover:no-underline hover:bg-muted rounded p-2.5 text-foreground data-[state=open]:text-foreground transition-colors">
        <div className="flex items-center">
          <item.icon className="!w-5 !h-5 !text-foreground" />
          <span className="flex-1 ms-3 text-left whitespace-nowrap">
            {item.title}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-0">
        <ul className="space-y-2 ml-6 border-l pl-2 border-border">

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
                variant="outline"
                className="w-full mt-2 justify-start px-2 py-1.5 h-auto text-sm"
              >
                <item.addButton.icon className="!w-3.5 !h-3.5 mr-2" />
                {item.addButton.text}
              </Button>
            )}

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


  const drawerListItems = [
    {
      type: "link",
      title: CONSTANTS.STRINGS.MAIN_DRAWER_DATASOURCE_TITLE,
      icon: Database,
      path: CONSTANTS.ROUTES.VIEW_DATASOURCES.path(tenantID),
    },
    {
      type: "link",
      title: CONSTANTS.STRINGS.MAIN_DRAWER_QUERIES_TITLE,
      icon: FileCode2,
      path: CONSTANTS.ROUTES.VIEW_QUERIES.path(tenantID),
    },
    {
      type: "link",
      title: CONSTANTS.STRINGS.MAIN_DRAWER_LISTENERS_TITLE,
      icon: Radio,
      path: CONSTANTS.ROUTES.VIEW_LISTENERS.path(tenantID),
    },
    {
      type: "link",
      title: CONSTANTS.STRINGS.MAIN_DRAWER_WORKFLOWS_TITLE,
      icon: Workflow,
      path: CONSTANTS.ROUTES.VIEW_WORKFLOWS.path(tenantID),
    },
    {
      type: "link",
      title: CONSTANTS.STRINGS.MAIN_DRAWER_WIDGETS_TITLE,
      icon: PanelTop,
      path: CONSTANTS.ROUTES.VIEW_WIDGETS.path(tenantID),
    },
    {
      type: "link",
      title: CONSTANTS.STRINGS.MAIN_DRAWER_APP_PAGES_TITLE,
      icon: LayoutDashboard,
      path: CONSTANTS.ROUTES.VIEW_APP_PAGES.path(tenantID),
    },
    {
      type: "link",
      title: CONSTANTS.STRINGS.MAIN_DRAWER_API_KEYS_TITLE,
      icon: KeyRound,
      path: CONSTANTS.ROUTES.VIEW_API_KEYS.path(tenantID),
    },
    {
      type: "link",
      title: CONSTANTS.STRINGS.MAIN_DRAWER_CRON_JOBS_TITLE,
      icon: Clock,
      path: CONSTANTS.ROUTES.VIEW_CRON_JOBS.path(tenantID),
    },
    // {
    //   type: "link",
    //   title: CONSTANTS.STRINGS.MAIN_DRAWER_ENGINES_TITLE,
    //   icon: Activity,
    //   path: CONSTANTS.ROUTES.VIEW_ENGINES.path(tenantID),
    // },
    {
      type: "collapsible",
      title: CONSTANTS.STRINGS.MAIN_DRAWER_USER_MANAGEMENT_TITLE,
      icon: UserCog,
      expandedStateKey: "userManagement",
      isExpanded: true,
      subItems: [
        {
          name: "Users",
          path: CONSTANTS.ROUTES.VIEW_TENANT_USERS.path(tenantID),
          icon: Users,
        },
        {
          name: "Roles and permissions",
          path: CONSTANTS.ROUTES.VIEW_TENANT_ROLES.path(tenantID),
          icon: ShieldCheck,
        },
      ],
    },
    {
      type: "link",
      title: "Tenant Settings",
      icon: Settings,
      path: CONSTANTS.ROUTES.UPDATE_TENANT.path(tenantID),
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
      className="w-full h-[calc(100vh-50px)] overflow-hidden transition-transform bg-background flex flex-col justify-start items-stretch"
      aria-label="Sidebar"
      ref={ref}
    >
      <div className="p-2 bg-background flex flex-col justify-start items-stretch z-10 sticky top-0 border-b border-transparent">
        {isLoadingTenants ? (
          <div
            role="status"
            className="animate-pulse w-full flex flex-row justify-start items-end"
          >
            <div className="h-10 bg-background w-10 rounded"></div>
            <div className="flex flex-col justify-start items-start flex-grow ms-2">
              <div className="h-2 bg-background rounded mb-2 w-16"></div>
              <div className="h-2 bg-background rounded mb-2 w-full"></div>
              <div className="h-2 bg-background rounded mb-0 w-full"></div>
            </div>
          </div>
        ) : tenants && tenants.length > 0 ? (
            <div className="w-full">
              <TenantSelectionDropdown />
            </div>
        ) : (
          <>
                <Button
              onClick={_handleNavigateToAddTenantPage}
                  className="w-full"
            >
              {CONSTANTS.STRINGS.ADD_TENANT_FORM_TITLE}
                  <Plus className="!w-4 !h-4 !text-foreground ml-2" />
                </Button>
            <NoEntityUI
              message={CONSTANTS.STRINGS.NO_TENANT_CREATED_TILL_NOW}
            />
          </>
        )}
      </div>

      <ScrollArea className="flex-1 w-full p-2 pt-0">
        {tenantID ? (
          <Accordion
            type="multiple"
            value={menuItemExpandedState}
            onValueChange={setMenuItemExpandedState}
            className="w-full flex flex-col space-y-2"
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
