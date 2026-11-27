import React, { useState } from "react";
import { AlertTriangle, CheckCircle, Info, Palette, Sun, Moon } from "lucide-react";
import {
  Badge,
  Button,
  Skeleton,
  SkeletonTable,
  Switch,
  WidgetBusy,
  WidgetEmpty,
  WidgetError,
  WidgetSurface,
} from "@jet-admin/ui";
import {
  BindableInput,
  BindableSwitch,
  ColorField,
  ConditionBuilder,
  ConfigField,
  ConfigSection,
  IconPicker,
  OptionListEditor,
  SegmentedControl,
  SizeField,
  SpacingField,
  StylePresetMenu,
} from "@jet-admin/widgets-ui";

const statuses = [
  { key: "info", icon: Info, className: "status-info", label: "Info" },
  { key: "success", icon: CheckCircle, className: "status-success", label: "Success" },
  { key: "warning", icon: AlertTriangle, className: "status-warning", label: "Warning" },
  { key: "danger", icon: AlertTriangle, className: "status-danger", label: "Danger" },
];

/**
 * Dev-only primitive gallery. Route: /dev/widget-kit
 * Shows every configurator primitive in light/dark and all densities.
 */
export const WidgetKitGalleryPage = () => {
  const [theme, setTheme] = useState("dark");
  const [density, setDensity] = useState("comfortable");
  const [bindable, setBindable] = useState("{{ state.queries.orders.data[0].status }}");
  const [flag, setFlag] = useState(false);
  const [color, setColor] = useState("hsl(var(--primary))");
  const [spacing, setSpacing] = useState("8px 12px");
  const [icon, setIcon] = useState("play");
  const [size, setSize] = useState("default");
  const [segment, setSegment] = useState("content");
  const [options, setOptions] = useState([
    { label: "Active", value: "active" },
    { label: "Archived", value: "archived", disabled: true },
  ]);
  const [conditions, setConditions] = useState({
    logic: "and",
    rules: [{ field: "row.status", operator: "equals", value: "failed" }],
  });
  const [stylePresets, setStylePresets] = useState({});

  return (
    <div className={`min-h-screen bg-background text-foreground ${theme === "light" ? "theme-light" : ""}`}>
      <div className="mx-auto max-w-5xl space-y-3 p-4">
        <header className="flex flex-wrap items-center justify-between gap-2 rounded-card border border-border bg-card p-3">
          <div>
            <h1 className="text-lg font-medium text-foreground">Widget kit gallery</h1>
            <p className="text-xs text-muted-foreground">Dev-only surface for tokens, states and configurator primitives.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" className="h-7 gap-1 text-[11px]" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              {theme === "dark" ? "Light" : "Dark"}
            </Button>
            <SegmentedControl
              ariaLabel="Density"
              value={density}
              onChange={setDensity}
              options={[
                { value: "compact", label: "Compact" },
                { value: "comfortable", label: "Comfortable" },
                { value: "spacious", label: "Spacious" },
              ]}
              className="max-w-[260px]"
            />
          </div>
        </header>

        <div className={`${theme === "light" ? "theme-light" : ""} ${`widget-density-${density}`} space-y-3`}>
          <section className="rounded-card border border-border bg-card p-3">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status & surfaces</h2>
            <div className="flex flex-wrap gap-2">
              {statuses.map(({ key, icon: Icon, className, label }) => (
                <div key={key} className={`flex items-center gap-2 rounded-control border px-2 py-1 text-xs ${className}`}>
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </div>
              ))}
              <Badge variant="secondary">Neutral badge</Badge>
              <Badge>Primary badge</Badge>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              <div className="rounded-card border border-border bg-surface-subtle p-2 text-xs">surface-subtle</div>
              <div className="rounded-card border border-border bg-card p-2 text-xs">card</div>
              <div className="rounded-card border border-border bg-surface-raised p-2 text-xs">surface-raised</div>
            </div>
          </section>

          <section className="rounded-card border border-border bg-card p-3">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Config primitives</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <ConfigField label="Bindable input" helper="Static value, or an expression with inline validation.">
                <BindableInput value={bindable} onChange={setBindable} placeholder="Type or use {{ binding }}" />
              </ConfigField>
              <ConfigField label="Bindable flag" inline>
                <BindableSwitch value={flag} onChange={setFlag} ariaLabel="Bindable flag" />
              </ConfigField>
              <ConfigField label="Segmented control" defaultValue="content">
                <SegmentedControl
                  ariaLabel="Example tabs"
                  value={segment}
                  onChange={setSegment}
                  options={[
                    { value: "content", label: "Content" },
                    { value: "style", label: "Style" },
                    { value: "behavior", label: "Behavior" },
                    { value: "advanced", label: "Advanced" },
                  ]}
                />
              </ConfigField>
              <ConfigField label="Size">
                <SizeField value={size} onChange={setSize} />
              </ConfigField>
              <ConfigField label="Color">
                <ColorField value={color} onChange={setColor} label="Color" />
              </ConfigField>
              <ConfigField label="Spacing">
                <SpacingField value={spacing} onChange={setSpacing} />
              </ConfigField>
              <ConfigField label="Icon">
                <IconPicker value={icon} onChange={setIcon} />
              </ConfigField>
              <ConfigField label="Style presets">
                <StylePresetMenu currentStyle={stylePresets} onApply={(next) => setStylePresets(next)} />
              </ConfigField>
            </div>
          </section>

          <section className="rounded-card border border-border bg-card p-3">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">List editors</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <ConfigField label="Options">
                <OptionListEditor value={options} onChange={setOptions} allowDescription allowGroup allowDisabled itemLabel="Option" />
              </ConfigField>
              <ConfigField label="Condition builder">
                <ConditionBuilder value={conditions} onChange={setConditions} fields={["row.status", "row.amount", "state.variables.role"]} />
              </ConfigField>
            </div>
          </section>

          <section className="rounded-card border border-border bg-card p-3">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Widget states</h2>
            <div className="grid gap-2 md:grid-cols-3">
              <div className="relative h-32 rounded-card border border-border bg-background">
                <WidgetBusy label="Refreshing scores…" />
              </div>
              <div className="h-32 rounded-card border border-border bg-background">
                <WidgetEmpty title="Nothing here yet" description="Connect a data source to see rows." action={<Button size="sm" className="h-7 text-[11px]">Add data</Button>} />
              </div>
              <div className="h-32 rounded-card border border-border bg-background">
                <WidgetError title="Could not load" message="The query timed out." onRetry={() => {}} />
              </div>
            </div>
            <div className="mt-2 space-y-1.5">
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
              <SkeletonTable rows={2} columns={4} />
            </div>
          </section>

          <section className="rounded-card border border-border bg-card p-3">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Config section</h2>
            <ConfigSection id="gallery-section" title="Collapsible section" description="Sections remember open state per widget type." tab="content">
              <ConfigField label="Example field" helper="Labels, helper text and errors share one rhythm.">
                <BindableInput value={bindable} onChange={setBindable} />
              </ConfigField>
              <ConfigField label="Inline switch" inline>
                <Switch checked={flag} onCheckedChange={setFlag} aria-label="Example switch" />
              </ConfigField>
            </ConfigSection>
          </section>

          <section className="rounded-card border border-border bg-card p-3">
            <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Palette className="h-3.5 w-3.5" /> Widget surface densities
            </h2>
            <WidgetSurface density={density} className="rounded-card border border-border bg-background">
              <p className="text-sm text-foreground">This surface uses the {density} density tokens.</p>
              <p className="text-[11px] text-muted-foreground">Padding, gap, row height and font size come from CSS variables, not per-widget values.</p>
            </WidgetSurface>
          </section>
        </div>
      </div>
    </div>
  );
};

export default WidgetKitGalleryPage;
