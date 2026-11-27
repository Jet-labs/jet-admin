import React, { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { ApplicationNavigationIcon } from "./applicationNavigationIcons";
import {
  normalizeApplicationShell,
} from "./applicationShellModel";

export { normalizeApplicationShell };

const SIZE_CLASSES = {
  sm: {
    item: "gap-1.5 px-2 py-1 text-xs",
    icon: "h-3.5 w-3.5",
    nav: "gap-1 p-1.5",
    brand: "px-2 py-1.5",
    brandTitle: "text-xs",
    brandSubtitle: "text-[10px]",
  },
  md: {
    item: "gap-2 px-2.5 py-1.5 text-sm",
    icon: "h-4 w-4",
    nav: "gap-1 p-2",
    brand: "px-2.5 py-2",
    brandTitle: "text-sm",
    brandSubtitle: "text-[11px]",
  },
  lg: {
    item: "gap-2.5 px-3 py-2 text-base",
    icon: "h-5 w-5",
    nav: "gap-1.5 p-2.5",
    brand: "px-3 py-2.5",
    brandTitle: "text-base",
    brandSubtitle: "text-xs",
  },
};

function itemVariantClasses(variant, active) {
  if (variant === "solid") {
    return active
      ? "bg-primary text-primary-foreground shadow-sm"
      : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground";
  }
  if (variant === "underline") {
    return active
      ? "rounded-none border-b-2 border-primary text-primary"
      : "rounded-none border-b-2 border-transparent text-muted-foreground hover:text-foreground";
  }
  if (variant === "minimal") {
    return active
      ? "bg-primary/5 text-primary font-semibold"
      : "text-muted-foreground hover:bg-muted/40 hover:text-foreground";
  }
  return active
    ? "bg-primary/10 text-primary"
    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground";
}

function alignClasses(align) {
  if (align === "center") return "justify-center";
  if (align === "end") return "justify-end";
  return "justify-start";
}

function BrandingBlock({ shell, appearance, collapsed, size, compact = false }) {
  if (!appearance.showBranding) return null;
  const title = shell.branding.title || "Application";
  const hideText = collapsed;
  return (
    <div
      className={`flex min-w-0 items-center gap-2 border-border/50 ${size.brand} ${
        compact ? "" : "border-b"
      }`}
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
        <ApplicationNavigationIcon name="grid" className="h-4 w-4" />
      </div>
      {!hideText && (
        <div className="min-w-0">
          <p className={`truncate font-semibold text-foreground ${size.brandTitle}`}>
            {title}
          </p>
          {shell.branding.subtitle && (
            <p className={`truncate text-muted-foreground ${size.brandSubtitle}`}>
              {shell.branding.subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

BrandingBlock.propTypes = {
  shell: PropTypes.object.isRequired,
  appearance: PropTypes.object.isRequired,
  collapsed: PropTypes.bool.isRequired,
  size: PropTypes.object.isRequired,
  compact: PropTypes.bool,
};

function NavigationLink({
  item,
  route,
  active,
  basePath,
  appearance,
  size,
  collapsed,
  onNavigate,
  onSelect,
}) {
  const showLabels =
    appearance.showLabels && !(collapsed && appearance.collapsible);
  const showIcons = appearance.showIcons || !showLabels;
  const variantClasses = itemVariantClasses(appearance.variant, active);
  const baseClasses = `group flex min-w-0 items-center rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${size.item} ${variantClasses} ${
    showLabels ? "" : "justify-center"
  }`;
  const content = (
    <>
      {showIcons && (
        <ApplicationNavigationIcon
          name={item.icon}
          className={`${size.icon} shrink-0`}
        />
      )}
      {showLabels && <span className="truncate">{item.label}</span>}
      {item.badge && showLabels && (
        <span className="ml-auto shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-primary">
          {item.badge}
        </span>
      )}
    </>
  );
  const title = !showLabels ? item.label : undefined;
  const commonProps = {
    title,
    "aria-current": active ? "page" : undefined,
    className: baseClasses,
    "data-application-nav-item": item.routeID,
  };
  const handleClick = (event) => {
    if (!onNavigate) return;
    event.preventDefault();
    onNavigate(route);
    onSelect?.();
  };
  if (onNavigate) {
    return (
      <button type="button" onClick={handleClick} {...commonProps}>
        {content}
      </button>
    );
  }
  return (
    <Link to={`${basePath}${route.path}`} {...commonProps}>
      {content}
    </Link>
  );
}

NavigationLink.propTypes = {
  item: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
  active: PropTypes.bool.isRequired,
  basePath: PropTypes.string.isRequired,
  appearance: PropTypes.object.isRequired,
  size: PropTypes.object.isRequired,
  collapsed: PropTypes.bool.isRequired,
  onNavigate: PropTypes.func,
  onSelect: PropTypes.func,
};

function NavigationItems({
  shell,
  routes,
  activeRouteID,
  basePath,
  appearance,
  size,
  collapsed,
  onNavigate,
  onSelect,
  layout = "column",
}) {
  const routeByID = useMemo(
    () => new Map(routes.map((route) => [route.id, route])),
    [routes]
  );
  const items = shell.navigation.filter((item) => !item.hidden);
  const layoutClasses =
    layout === "row"
      ? `flex-row flex-wrap items-center overflow-x-auto ${alignClasses(appearance.align)}`
      : layout === "sidebar"
        ? "flex-row flex-wrap items-center overflow-x-auto md:flex-col md:flex-nowrap md:items-stretch md:overflow-y-auto"
        : "flex-col overflow-y-auto";
  return (
    <div
      className={`flex min-h-0 ${size.nav} ${layoutClasses}`}
      data-application-navigation
    >
      {items.map((item, index) => {
        const route = routeByID.get(item.routeID);
        if (!route || route.path.includes(":")) return null;
        const active = activeRouteID === item.routeID;
        const group = item.group?.trim();
        const previousGroup = items[index - 1]?.group?.trim();
        const showGroupHeading =
          group && group !== previousGroup && !collapsed && appearance.showLabels;
        return (
          <React.Fragment key={item.routeID}>
            {showGroupHeading &&
              (layout === "row" ? (
                <span className="mx-1 h-4 w-px bg-border" aria-hidden="true" />
              ) : (
                <p
                  className={`px-2 pb-0.5 pt-2 font-mono text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60 ${
                    layout === "sidebar" ? "hidden md:block" : ""
                  }`}
                >
                  {group}
                </p>
              ))}
            <NavigationLink
              item={item}
              route={route}
              active={active}
              basePath={basePath}
              appearance={appearance}
              size={size}
              collapsed={collapsed}
              onNavigate={onNavigate}
              onSelect={onSelect}
            />
          </React.Fragment>
        );
      })}
      {items.length === 0 && (
        <p className="px-2 py-1 text-xs text-muted-foreground">No navigation items.</p>
      )}
    </div>
  );
}

NavigationItems.propTypes = {
  shell: PropTypes.object.isRequired,
  routes: PropTypes.array.isRequired,
  activeRouteID: PropTypes.string,
  basePath: PropTypes.string.isRequired,
  appearance: PropTypes.object.isRequired,
  size: PropTypes.object.isRequired,
  collapsed: PropTypes.bool.isRequired,
  onNavigate: PropTypes.func,
  onSelect: PropTypes.func,
  layout: PropTypes.oneOf(["row", "column", "sidebar"]),
};

function CollapseButton({ kind, appearance, collapsed, onToggle, position = "start" }) {
  if (!appearance.collapsible) return null;
  const Icon =
    kind === "topbar" || kind === "bottom-bar"
      ? collapsed
        ? ChevronRight
        : ChevronLeft
      : collapsed
        ? PanelLeftOpen
        : PanelLeftClose;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
      aria-expanded={!collapsed}
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded border border-border/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${
        position === "end" ? "ml-auto" : ""
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

CollapseButton.propTypes = {
  kind: PropTypes.string,
  appearance: PropTypes.object.isRequired,
  collapsed: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  position: PropTypes.oneOf(["start", "end"]),
};

/**
 * Shared application shell used by the deployed runtime, composition preview
 * and Application Studio's live layout preview. Keeping one renderer means
 * navigation presets and appearance settings stay identical everywhere.
 */
export function ApplicationShellFrame({
  definition,
  routes,
  activeRouteID,
  basePath,
  appTitle = "",
  onNavigate = null,
  children,
}) {
  const shell = useMemo(
    () => normalizeApplicationShell(definition?.shell, appTitle),
    [definition?.shell, appTitle]
  );
  const appearance = shell.appearance;
  const size = SIZE_CLASSES[appearance.size] || SIZE_CLASSES.md;
  const [collapsed, setCollapsed] = useState(
    Boolean(appearance.defaultCollapsed && appearance.collapsible)
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setCollapsed(Boolean(appearance.defaultCollapsed && appearance.collapsible));
  }, [appearance.defaultCollapsed, appearance.collapsible, appearance.kind]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [activeRouteID]);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen]);

  const toggleCollapsed = useCallback(() => setCollapsed((value) => !value), []);
  const navWidth = collapsed ? appearance.collapsedWidth : appearance.width;

  if (shell.kind === "topbar") {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <header
          className={`flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-card px-2 py-1.5 ${
            appearance.sticky ? "sticky top-0 z-20" : ""
          }`}
        >
          <BrandingBlock
            shell={shell}
            appearance={appearance}
            collapsed={false}
            size={size}
            compact
          />
          <div className="min-w-0 flex-1">
            <NavigationItems
              shell={shell}
              routes={routes}
              activeRouteID={activeRouteID}
              basePath={basePath}
              appearance={appearance}
              size={size}
              collapsed={collapsed}
              onNavigate={onNavigate}
              layout="row"
            />
          </div>
          <CollapseButton
            kind={shell.kind}
            appearance={appearance}
            collapsed={collapsed}
            onToggle={toggleCollapsed}
            position="end"
          />
        </header>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
      </div>
    );
  }

  if (shell.kind === "bottom-bar") {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
        <nav
          aria-label="Application navigation"
          className={`flex shrink-0 flex-wrap items-center gap-2 border-t border-border bg-card px-2 py-1.5 ${
            appearance.sticky ? "sticky bottom-0 z-20" : ""
          }`}
        >
          <div className="min-w-0 flex-1">
            <NavigationItems
              shell={shell}
              routes={routes}
              activeRouteID={activeRouteID}
              basePath={basePath}
              appearance={appearance}
              size={size}
              collapsed={collapsed}
              onNavigate={onNavigate}
              layout="row"
            />
          </div>
          <CollapseButton
            kind={shell.kind}
            appearance={appearance}
            collapsed={collapsed}
            onToggle={toggleCollapsed}
            position="end"
          />
        </nav>
      </div>
    );
  }

  if (shell.kind === "hamburger") {
    const drawerSide = appearance.position === "end" ? "right-0" : "left-0";
    return (
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center gap-2 border-b border-border bg-card px-2 py-1.5">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open application navigation"
            aria-expanded={drawerOpen}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Menu className="h-4 w-4" />
          </button>
          <BrandingBlock
            shell={shell}
            appearance={appearance}
            collapsed={false}
            size={size}
            compact
          />
          <div className="min-w-0 flex-1" />
        </header>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
        {drawerOpen && (
          <div className="absolute inset-0 z-40" role="dialog" aria-modal="true" aria-label="Application navigation">
            <button
              type="button"
              aria-label="Close application navigation"
              className="absolute inset-0 bg-background/70 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
            <aside
              className={`absolute inset-y-0 ${drawerSide} flex w-full flex-col border-border bg-card shadow-xl`}
              style={{ maxWidth: `${Math.max(appearance.width, 240)}px` }}
            >
              <div className="flex items-center justify-between border-b border-border px-2 py-1.5">
                <BrandingBlock
                  shell={shell}
                  appearance={appearance}
                  collapsed={false}
                  size={size}
                  compact
                />
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close application navigation"
                  className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <NavigationItems
                shell={shell}
                routes={routes}
                activeRouteID={activeRouteID}
                basePath={basePath}
                appearance={appearance}
                size={size}
                collapsed={false}
                onNavigate={onNavigate}
                onSelect={() => setDrawerOpen(false)}
                layout="column"
              />
            </aside>
          </div>
        )}
      </div>
    );
  }

  const borderSide = appearance.position === "end" ? "md:border-l" : "md:border-r";
  return (
    <div
      className={`flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row ${
        appearance.position === "end" ? "md:flex-row-reverse" : ""
      }`}
    >
      <nav
        aria-label="Application navigation"
        style={{ "--app-nav-width": `${navWidth}px` }}
        className={`flex w-full shrink-0 flex-wrap border-b border-border bg-card md:h-full md:flex-col md:flex-nowrap md:overflow-hidden md:border-b-0 ${borderSide} md:w-[var(--app-nav-width)] ${
          appearance.position === "end" ? "md:items-stretch" : ""
        } ${appearance.sticky ? "md:sticky md:top-0 md:self-start" : ""}`}
      >
        <BrandingBlock
          shell={shell}
          appearance={appearance}
          collapsed={collapsed}
          size={size}
        />
        <div className="min-h-0 min-w-0 flex-1">
          <NavigationItems
            shell={shell}
            routes={routes}
            activeRouteID={activeRouteID}
            basePath={basePath}
            appearance={appearance}
            size={size}
            collapsed={collapsed}
            onNavigate={onNavigate}
            layout="sidebar"
          />
        </div>
        <div className="flex shrink-0 items-center justify-end border-t border-border/50 p-1.5 md:border-t">
          <CollapseButton
            kind={shell.kind}
            appearance={appearance}
            collapsed={collapsed}
            onToggle={toggleCollapsed}
            position="end"
          />
        </div>
      </nav>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}

ApplicationShellFrame.propTypes = {
  definition: PropTypes.object,
  routes: PropTypes.array.isRequired,
  activeRouteID: PropTypes.string,
  basePath: PropTypes.string.isRequired,
  appTitle: PropTypes.string,
  onNavigate: PropTypes.func,
  children: PropTypes.node,
};
