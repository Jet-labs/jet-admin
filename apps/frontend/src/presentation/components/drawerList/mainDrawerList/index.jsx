import React, { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Plus, Settings } from "lucide-react";
import PropTypes from "prop-types";
import { CONSTANTS } from "../../../../constants";
import { useAuthState } from "../../../../logic/hooks/useAuth";
import { useComponentSize } from "../../../../logic/hooks/useComponentSize";
import { useTenantState } from "../../../../logic/hooks/useTenant";
import { TenantSelectionDropdown } from "../../tenantComponents/tenantSelectionDropdown";
import { NoEntityUI } from "../../ui/noEntityUI";

const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

const normalizePath = (path) => {
  const stripped = decodeURIComponent(path ?? "").replace(/\/+$/, "");
  return stripped === "" ? "/" : stripped;
};

import {
  Clock,
  Database,
  FileCode2,
  KeyRound,
  LayoutDashboard,
  LayoutGrid,
  PanelTop,
  Radio,
  ShieldCheck,
  Store,
  UserCog,
  Users,
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
const DrawerLinkItem = ({ item, isActive }) => {
  DrawerLinkItem.propTypes = {
    item: PropTypes.object.isRequired,
    isActive: PropTypes.bool.isRequired,
  };

  return (
    <Link
      to={item.path}
      aria-current={isActive ? "page" : undefined}
      className={`flex items-center gap-2 w-full rounded px-2 py-2 text-sm font-medium transition-colors duration-75 group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40 ${
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <item.icon
        className={`size-5 shrink-0 transition-colors ${
          isActive
            ? "text-primary"
            : "text-muted-foreground group-hover:text-foreground"
        }`}
      />
      <span className="truncate">{capitalize(item.title)}</span>
    </Link>
  );
};

const DrawerSubMenuItem = ({ subItem, isActive }) => {
  DrawerSubMenuItem.propTypes = {
    subItem: PropTypes.object.isRequired,
    isActive: PropTypes.bool.isRequired,
  };

  return (
    <li>
      <Link
        to={subItem.path}
        aria-current={isActive ? "page" : undefined}
        className={`flex items-center gap-2 w-full rounded px-2 py-1.5 text-sm transition-colors duration-75 group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40 ${
          isActive
            ? "bg-primary/10 font-semibold text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <subItem.icon
          className={`size-4 shrink-0 transition-colors ${
            isActive
              ? "text-primary"
              : "text-muted-foreground group-hover:text-foreground"
          }`}
        />
        <span className="truncate">{capitalize(subItem.name)}</span>
      </Link>
    </li>
  );
};

const DrawerCollapsibleItem = ({ item, hasActiveChild, activeSubItemKey }) => {
  DrawerCollapsibleItem.propTypes = {
    item: PropTypes.object.isRequired,
    hasActiveChild: PropTypes.bool.isRequired,
    activeSubItemKey: PropTypes.string,
  };
  return (
    <AccordionItem value={item.expandedStateKey} className="border-none">
      <AccordionTrigger
        className={`w-full gap-2 rounded px-2 py-2 text-sm font-medium hover:no-underline hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-muted-foreground ${
          hasActiveChild ? "text-primary" : "text-muted-foreground data-[state=open]:text-foreground"
        }`}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <item.icon
            className={`size-5 shrink-0 transition-colors ${
              hasActiveChild
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          />
          <span className="truncate text-left">{capitalize(item.title)}</span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="p-0">
        <div className="ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-border/60 pl-2">
          <ul className="flex flex-col gap-0.5">
            {item.subItems.map((subItem, subIndex) => (
              <DrawerSubMenuItem
                key={subIndex}
                subItem={subItem}
                isActive={activeSubItemKey === subItem.activeKey}
              />
            ))}
          </ul>
          {item.addButton && (
            <Button
              onClick={item.addButton.onClick}
              variant="outline"
              size="sm"
              className="w-full justify-start mt-1"
            >
              <item.addButton.icon className="size-4 mr-2" />
              {item.addButton.text}
            </Button>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export const MainDrawerList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  useAuthState();
  const { isLoadingTenants, tenants } = useTenantState();
  const { tenantID } = useParams();
  const [ref] = useComponentSize();

  const _handleNavigateToAddTenantPage = () => {
    navigate(CONSTANTS.ROUTES.ADD_TENANT.path());
  };


  const drawerListItems = [
    {
      type: "link",
      activeKey: "dashboard",
      title: CONSTANTS.STRINGS.MAIN_DRAWER_DASHBOARD_TITLE,
      icon: LayoutGrid,
      path: CONSTANTS.ROUTES.VIEW_TENANT.path(tenantID),
    },
    {
      type: "link",
      activeKey: "datasources",
      title: CONSTANTS.STRINGS.MAIN_DRAWER_DATASOURCE_TITLE,
      icon: Database,
      path: CONSTANTS.ROUTES.VIEW_DATASOURCES.path(tenantID),
    },
    {
      type: "link",
      activeKey: "queries",
      title: CONSTANTS.STRINGS.MAIN_DRAWER_QUERIES_TITLE,
      icon: FileCode2,
      path: CONSTANTS.ROUTES.VIEW_QUERIES.path(tenantID),
    },
    {
      type: "link",
      activeKey: "listeners",
      title: CONSTANTS.STRINGS.MAIN_DRAWER_LISTENERS_TITLE,
      icon: Radio,
      path: CONSTANTS.ROUTES.VIEW_LISTENERS.path(tenantID),
    },
    {
      type: "link",
      activeKey: "workflows",
      title: CONSTANTS.STRINGS.MAIN_DRAWER_WORKFLOWS_TITLE,
      icon: Workflow,
      path: CONSTANTS.ROUTES.VIEW_WORKFLOWS.path(tenantID),
    },
    {
      type: "link",
      activeKey: "widgets",
      title: CONSTANTS.STRINGS.MAIN_DRAWER_WIDGETS_TITLE,
      icon: PanelTop,
      path: CONSTANTS.ROUTES.VIEW_WIDGETS.path(tenantID),
    },
    {
      type: "link",
      activeKey: "app-pages",
      title: CONSTANTS.STRINGS.MAIN_DRAWER_APP_PAGES_TITLE,
      icon: LayoutDashboard,
      path: CONSTANTS.ROUTES.VIEW_APP_PAGES.path(tenantID),
    },
    {
      type: "link",
      activeKey: "marketplace",
      title: CONSTANTS.STRINGS.MAIN_DRAWER_MARKETPLACE_TITLE,
      icon: Store,
      path: CONSTANTS.ROUTES.VIEW_MARKETPLACE.path(tenantID),
    },
    {
      type: "link",
      activeKey: "api-keys",
      title: CONSTANTS.STRINGS.MAIN_DRAWER_API_KEYS_TITLE,
      icon: KeyRound,
      path: CONSTANTS.ROUTES.VIEW_API_KEYS.path(tenantID),
    },
    {
      type: "link",
      activeKey: "cron-jobs",
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
          activeKey: "users",
          path: CONSTANTS.ROUTES.VIEW_TENANT_USERS.path(tenantID),
          icon: Users,
        },
        {
          name: "Roles and permissions",
          activeKey: "roles",
          path: CONSTANTS.ROUTES.VIEW_TENANT_ROLES.path(tenantID),
          icon: ShieldCheck,
        },
      ],
    },
    {
      type: "link",
      activeKey: "tenant-settings",
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

  // Resolve the single active entry: the candidate whose path is the longest
  // segment-boundary prefix of the current pathname wins. This keeps the
  // Dashboard (tenant root) from matching every tenant sub-route, and makes
  // deep routes (e.g. /datasources/:id) highlight their owning section.
  const normalizedPathname = normalizePath(location.pathname);
  let bestMatch = null;
  drawerListItems.forEach((item) => {
    const candidates =
      item.type === "link"
        ? [{ activeKey: item.activeKey, path: item.path }]
        : item.subItems;
    candidates.forEach(({ activeKey, path }) => {
      const target = normalizePath(path);
      const isMatch =
        normalizedPathname === target ||
        normalizedPathname.startsWith(`${target}/`);
      if (isMatch && (!bestMatch || target.length > bestMatch.targetLength)) {
        bestMatch = { activeKey, targetLength: target.length };
      }
    });
  });
  const activeItemKey = bestMatch ? bestMatch.activeKey : null;

  return (
    <aside
      id="logo-sidebar"
      className="w-full h-[calc(100vh-50px)] overflow-hidden transition-transform bg-background flex flex-col justify-start items-stretch"
      aria-label="Sidebar"
      ref={ref}
    >
      <div className="p-2 bg-background flex flex-col justify-start items-stretch z-10 sticky top-0 border-b border-border/50">
        {isLoadingTenants ? (
          <div
            role="status"
            className="animate-pulse w-full h-10 flex flex-row justify-start items-center gap-2"
            aria-label="Loading tenants"
          >
            <div className="h-10 w-10 bg-muted rounded shrink-0"></div>
            <div className="flex-1 space-y-1.5">
              <div className="h-2 bg-muted/70 rounded w-16"></div>
              <div className="h-2 bg-muted/50 rounded w-full"></div>
            </div>
          </div>
        ) : tenants && tenants.length > 0 ? (
          <div className="w-full">
            <TenantSelectionDropdown />
          </div>
        ) : (
          <>
            <Button onClick={_handleNavigateToAddTenantPage} className="w-full">
              {CONSTANTS.STRINGS.ADD_TENANT_FORM_TITLE}
              <Plus className="size-4 ml-2" />
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
            className="w-full flex flex-col gap-1 pt-2"
          >
            {drawerListItems.map((item, index) => {
              if (item.type === "collapsible") {
                const hasActiveChild = item.subItems.some(
                  (subItem) => subItem.activeKey === activeItemKey
                );
                return (
                  <DrawerCollapsibleItem
                    key={index}
                    item={item}
                    hasActiveChild={hasActiveChild}
                    activeSubItemKey={activeItemKey}
                  />
                );
              } else if (item.type === "link") {
                return (
                  <DrawerLinkItem
                    key={index}
                    item={item}
                    isActive={item.activeKey === activeItemKey}
                  />
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
