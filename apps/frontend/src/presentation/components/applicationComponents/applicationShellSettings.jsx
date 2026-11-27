import React, { useMemo } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Input,
  Label,
  SearchSelect,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@jet-admin/ui";
import {
  ChevronDown,
  ChevronUp,
  Menu,
  PanelBottom,
  PanelLeft,
  PanelTop,
  Plus,
  Trash2,
} from "lucide-react";
import {
  APPLICATION_NAVIGATION_ICONS,
  ApplicationNavigationIcon,
} from "./applicationNavigationIcons";
import {
  normalizeApplicationNavigationItem as normalizeItem,
  normalizeApplicationShell,
} from "./applicationShellModel";

const NO_ROUTE = "__none__";
const NAV_ICON_OPTIONS = APPLICATION_NAVIGATION_ICONS.map(({ value }) => ({
  value,
  label: value,
}));

const PRESETS = [
  {
    id: "sidebar",
    title: "Sidebar",
    description: "Collapsible rail with grouped items and branding.",
    icon: PanelLeft,
    appearance: {
      variant: "pills",
      size: "md",
      position: "start",
      align: "start",
      width: 220,
      collapsedWidth: 64,
      collapsible: true,
      defaultCollapsed: false,
      sticky: true,
      showLabels: true,
      showIcons: true,
      showBranding: true,
    },
  },
  {
    id: "topbar",
    title: "Top bar",
    description: "Horizontal navigation above the page surface.",
    icon: PanelTop,
    appearance: {
      variant: "underline",
      size: "md",
      position: "start",
      align: "start",
      collapsible: true,
      defaultCollapsed: false,
      sticky: true,
      showLabels: true,
      showIcons: true,
      showBranding: true,
    },
  },
  {
    id: "bottom-bar",
    title: "Bottom bar",
    description: "App-style tab bar anchored below the content.",
    icon: PanelBottom,
    appearance: {
      variant: "pills",
      size: "sm",
      position: "start",
      align: "center",
      collapsible: true,
      defaultCollapsed: false,
      sticky: true,
      showLabels: true,
      showIcons: true,
      showBranding: false,
    },
  },
  {
    id: "hamburger",
    title: "Hamburger",
    description: "Compact header with a slide-over navigation drawer.",
    icon: Menu,
    appearance: {
      variant: "minimal",
      size: "md",
      position: "start",
      align: "start",
      width: 260,
      collapsible: true,
      defaultCollapsed: false,
      sticky: true,
      showLabels: true,
      showIcons: true,
      showBranding: true,
    },
  },
];

function Toggle({ id, label, checked, onChange, disabled }) {
  return (
    <label
      htmlFor={id}
      className={`flex items-center justify-between gap-2 rounded border border-border/60 bg-background px-2 py-1.5 text-[11px] ${
        disabled ? "opacity-60" : "cursor-pointer"
      }`}
    >
      <span className="text-muted-foreground">{label}</span>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
        className="h-3.5 w-3.5 accent-primary"
      />
    </label>
  );
}

Toggle.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export const ApplicationShellSettings = ({
  definition,
  edit,
  disabled = false,
}) => {
  const shell = useMemo(
    () => normalizeApplicationShell(definition?.shell),
    [definition?.shell]
  );
  const routes = Array.isArray(definition?.routes) ? definition.routes : [];
  const candidates = routes.filter((route) => !route.path.includes(":"));
  const appearance = shell.appearance;
  const navigation = shell.navigation.map(normalizeItem);
  const availableNavigationRoutes = candidates.filter(
    (route) => !navigation.some((item) => item.routeID === route.id)
  );

  if (!definition || !definition.shell || !Array.isArray(definition.routes)) {
    return null;
  }

  const updateDefinition = (mutator) => {
    if (!definition) return;
    const next = structuredClone(definition);
    const normalized = normalizeApplicationShell(next.shell);
    next.shell = {
      ...normalized,
      navigation: normalized.navigation.map(normalizeItem),
    };
    mutator(next);
    next.shell.navigation = next.shell.navigation.map(normalizeItem);
    edit(JSON.stringify(next, null, 2));
  };

  const updateAppearance = (patch) => {
    updateDefinition((next) => {
      next.shell.appearance = { ...next.shell.appearance, ...patch };
    });
  };

  const updateBranding = (patch) => {
    updateDefinition((next) => {
      next.shell.branding = { ...next.shell.branding, ...patch };
    });
  };

  const applyPreset = (preset) => {
    updateDefinition((next) => {
      next.shell.kind = preset.id;
      next.shell.appearance = {
        ...next.shell.appearance,
        ...preset.appearance,
      };
    });
  };

  const updateNavigationItem = (index, patch) => {
    updateDefinition((next) => {
      const target = next.shell.navigation[index];
      if (!target) return;
      next.shell.navigation[index] = { ...normalizeItem(target, index), ...patch };
    });
  };

  const removeNavigationItem = (index) => {
    updateDefinition((next) => {
      next.shell.navigation.splice(index, 1);
    });
  };

  const moveNavigationItem = (index, offset) => {
    updateDefinition((next) => {
      const target = next.shell.navigation[index];
      const destination = index + offset;
      if (!target || destination < 0 || destination >= next.shell.navigation.length) {
        return;
      }
      next.shell.navigation.splice(index, 1);
      next.shell.navigation.splice(destination, 0, target);
    });
  };

  const addNavigationItem = (routeID, label, icon) => {
    updateDefinition((next) => {
      if (next.shell.navigation.some((item) => item.routeID === routeID)) return;
      next.shell.navigation.push(
        normalizeItem({
          routeID,
          label,
          icon,
          group: "",
          badge: "",
          hidden: false,
        })
      );
      if (!next.shell.homeRouteID) next.shell.homeRouteID = routeID;
    });
  };

  const availableRouteOptions = availableNavigationRoutes.map((route) => ({
    value: route.id,
    label: `${route.title || route.id} · ${route.path}`,
  }));

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Navigation preset
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {PRESETS.map((preset) => {
            const Icon = preset.icon;
            const active = shell.kind === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                disabled={disabled}
                aria-pressed={active}
                className={`flex min-w-0 items-start gap-2 rounded border p-2 text-left transition-colors ${
                  active
                    ? "border-primary/60 bg-primary/5"
                    : "border-border/60 bg-background hover:border-border hover:bg-muted/20"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded ${
                    active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium text-foreground">
                    {preset.title}
                  </span>
                  <span className="line-clamp-2 text-[10px] leading-tight text-muted-foreground">
                    {preset.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Appearance
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Item style</Label>
            <Select
              value={appearance.variant}
              onValueChange={(value) => updateAppearance({ variant: value })}
              disabled={disabled}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pills">Pills</SelectItem>
                <SelectItem value="underline">Underline</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="solid">Solid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Size</Label>
            <Select
              value={appearance.size}
              onValueChange={(value) => updateAppearance({ size: value })}
              disabled={disabled}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="md">Medium</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(shell.kind === "sidebar" || shell.kind === "hamburger") && (
            <div className="space-y-1">
              <Label>Position</Label>
              <Select
                value={appearance.position}
                onValueChange={(value) => updateAppearance({ position: value })}
                disabled={disabled}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="start">Start</SelectItem>
                  <SelectItem value="end">End</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {(shell.kind === "topbar" || shell.kind === "bottom-bar") && (
            <div className="space-y-1">
              <Label>Horizontal alignment</Label>
              <Select
                value={appearance.align}
                onValueChange={(value) => updateAppearance({ align: value })}
                disabled={disabled}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="start">Start</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="end">End</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {(shell.kind === "sidebar" || shell.kind === "hamburger") && (
            <>
              <div className="space-y-1">
                <Label htmlFor="application-nav-width">Expanded width (px)</Label>
                <Input
                  id="application-nav-width"
                  type="number"
                  min={160}
                  max={400}
                  value={appearance.width}
                  onChange={(event) =>
                    updateAppearance({ width: Number(event.target.value) || 220 })
                  }
                  disabled={disabled}
                  className="h-8 font-mono text-xs"
                />
              </div>
              {shell.kind === "sidebar" && (
                <div className="space-y-1">
                  <Label htmlFor="application-nav-collapsed-width">
                    Collapsed width (px)
                  </Label>
                  <Input
                    id="application-nav-collapsed-width"
                    type="number"
                    min={48}
                    max={120}
                    value={appearance.collapsedWidth}
                    onChange={(event) =>
                      updateAppearance({
                        collapsedWidth: Number(event.target.value) || 64,
                      })
                    }
                    disabled={disabled}
                    className="h-8 font-mono text-xs"
                  />
                </div>
              )}
            </>
          )}
        </div>
        <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
          <Toggle
            id="application-nav-collapsible"
            label="Collapsible"
            checked={appearance.collapsible}
            onChange={(value) => updateAppearance({ collapsible: value })}
            disabled={disabled}
          />
          <Toggle
            id="application-nav-default-collapsed"
            label="Start collapsed"
            checked={appearance.defaultCollapsed}
            onChange={(value) => updateAppearance({ defaultCollapsed: value })}
            disabled={disabled || !appearance.collapsible}
          />
          <Toggle
            id="application-nav-sticky"
            label="Sticky"
            checked={appearance.sticky}
            onChange={(value) => updateAppearance({ sticky: value })}
            disabled={disabled}
          />
          <Toggle
            id="application-nav-labels"
            label="Show labels"
            checked={appearance.showLabels}
            onChange={(value) => updateAppearance({ showLabels: value })}
            disabled={disabled}
          />
          <Toggle
            id="application-nav-icons"
            label="Show icons"
            checked={appearance.showIcons}
            onChange={(value) => updateAppearance({ showIcons: value })}
            disabled={disabled}
          />
          <Toggle
            id="application-nav-branding"
            label="Show branding"
            checked={appearance.showBranding}
            onChange={(value) => updateAppearance({ showBranding: value })}
            disabled={disabled}
          />
        </div>
      </div>

      <div>
        <p className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Branding
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="application-shell-title">Title</Label>
            <Input
              id="application-shell-title"
              value={shell.branding.title}
              onChange={(event) => updateBranding({ title: event.target.value })}
              placeholder="Application title"
              disabled={disabled}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="application-shell-subtitle">Subtitle</Label>
            <Input
              id="application-shell-subtitle"
              value={shell.branding.subtitle}
              onChange={(event) => updateBranding({ subtitle: event.target.value })}
              placeholder="Optional workspace label"
              disabled={disabled}
              className="h-8 text-xs"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="space-y-1">
          <Label>Home route</Label>
          <Select
            value={shell.homeRouteID || NO_ROUTE}
            onValueChange={(value) =>
              updateDefinition((next) => {
                next.shell.homeRouteID = value === NO_ROUTE ? null : value;
              })
            }
            disabled={disabled}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Choose a home route" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_ROUTE}>None</SelectItem>
              {candidates.map((route) => (
                <SelectItem key={route.id} value={route.id}>
                  {route.title || route.id} · {route.path}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Not-found route</Label>
          <Select
            value={shell.notFoundRouteID || NO_ROUTE}
            onValueChange={(value) =>
              updateDefinition((next) => {
                next.shell.notFoundRouteID = value === NO_ROUTE ? null : value;
              })
            }
            disabled={disabled}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Default empty state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_ROUTE}>Default empty state</SelectItem>
              {candidates.map((route) => (
                <SelectItem key={route.id} value={route.id}>
                  {route.title || route.id} · {route.path}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Expression mode</Label>
          <Select
            value={definition.expressionMode || "trusted-js"}
            onValueChange={(value) =>
              updateDefinition((next) => {
                next.expressionMode = value;
              })
            }
            disabled={disabled}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trusted-js">Trusted JS template</SelectItem>
              <SelectItem value="safe-path">Strict path-only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Navigation items
          </p>
          <span className="text-[10px] text-muted-foreground">
            {navigation.length} item{navigation.length === 1 ? "" : "s"}
          </span>
        </div>
        {navigation.length === 0 ? (
          <p className="rounded border border-dashed border-border/70 bg-muted/30 p-2 text-[11px] text-muted-foreground">
            No navigation items yet. Add a non-parameterized route below.
          </p>
        ) : (
          <div className="space-y-1.5">
            {navigation.map((item, index) => (
              <div
                key={`${item.routeID}-${index}`}
                className="rounded border border-border/60 bg-background p-1.5"
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                    <ApplicationNavigationIcon name={item.icon} className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-[120px] flex-1">
                    <Input
                      value={item.label}
                      onChange={(event) =>
                        updateNavigationItem(index, { label: event.target.value })
                      }
                      disabled={disabled}
                      maxLength={120}
                      className="h-7 text-xs"
                      aria-label={`Label for ${item.routeID}`}
                    />
                  </div>
                  <span className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
                    {item.routeID}
                  </span>
                  <div className="ml-auto flex items-center gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      square
                      className="h-6 w-6"
                      onClick={() => moveNavigationItem(index, -1)}
                      disabled={disabled || index === 0}
                      aria-label={`Move ${item.label} up`}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      square
                      className="h-6 w-6"
                      onClick={() => moveNavigationItem(index, 1)}
                      disabled={disabled || index === navigation.length - 1}
                      aria-label={`Move ${item.label} down`}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="destructive-ghost"
                      size="icon"
                      square
                      className="h-6 w-6"
                      onClick={() => removeNavigationItem(index)}
                      disabled={disabled}
                      aria-label={`Remove ${item.label} from navigation`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="mt-1 grid gap-1 sm:grid-cols-[120px_minmax(0,1fr)_110px_72px]">
                  <SearchSelect
                    value={item.icon}
                    onChange={(value) => updateNavigationItem(index, { icon: value })}
                    options={NAV_ICON_OPTIONS}
                    size="sm"
                    className="text-[11px]"
                    disabled={disabled}
                  />
                  <Input
                    value={item.group}
                    onChange={(event) =>
                      updateNavigationItem(index, { group: event.target.value })
                    }
                    placeholder="Group (optional)"
                    maxLength={80}
                    disabled={disabled}
                    className="h-7 text-[11px]"
                    aria-label={`Group for ${item.label}`}
                  />
                  <Input
                    value={item.badge}
                    onChange={(event) =>
                      updateNavigationItem(index, { badge: event.target.value })
                    }
                    placeholder="Badge"
                    maxLength={24}
                    disabled={disabled}
                    className="h-7 font-mono text-[11px]"
                    aria-label={`Badge for ${item.label}`}
                  />
                    <label className="flex items-center gap-1.5 px-1 text-[10px] text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={item.hidden}
                      onChange={(event) =>
                        updateNavigationItem(index, { hidden: event.target.checked })
                      }
                      disabled={disabled}
                      className="h-3 w-3 accent-primary"
                    />
                    Hidden
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <div className="min-w-[180px] flex-1">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Add route
            </Label>
            <SearchSelect
              value=""
              onChange={(routeID) => {
                const route = availableNavigationRoutes.find(
                  (candidate) => candidate.id === routeID
                );
                if (!route) return;
                addNavigationItem(
                  route.id,
                  route.title || route.id.replace(/[-_]/g, " "),
                  "file"
                );
              }}
              options={availableRouteOptions}
              placeholder={
                availableRouteOptions.length
                  ? "Choose a route"
                  : "All navigable routes are already listed"
              }
              size="sm"
              className="text-xs"
              disabled={disabled || availableRouteOptions.length === 0}
            />
          </div>
          <p className="flex items-center gap-1 pb-1 text-[10px] text-muted-foreground">
            <Plus className="h-3 w-3" /> Choose an icon, group and badge per item.
          </p>
        </div>
      </div>
    </div>
  );
};

ApplicationShellSettings.propTypes = {
  definition: PropTypes.object,
  edit: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};
