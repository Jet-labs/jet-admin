import React, { useMemo } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@jet-admin/ui";
import { useConfigEditorOptional, fieldMatchesQuery } from "./configEditorContext";

export const ConfigSectionContext = React.createContext(null);

/**
 * ConfigSection
 *
 * A collapsible group that routes itself to the shell's active tab and
 * participates in settings search. It stays usable outside a provider so
 * primitive galleries can render it standalone.
 */
export const ConfigSection = ({
  id,
  title,
  description,
  tab,
  collapsible = true,
  defaultOpen = true,
  keywords,
  forceVisible = false,
  actions,
  className,
  children,
}) => {
  const context = useConfigEditorOptional();
  const sectionId = id || title || "section";
  const isOpen = context?.sectionOpen?.[sectionId] ?? defaultOpen;

  const sectionFields = useMemo(
    () => (context?.fields || []).filter((field) => field.section === sectionId),
    [context?.fields, sectionId]
  );

  const query = context?.query || "";
  const matchesSectionText = useMemo(() => {
    if (!query) return true;
    const haystack = [title, description, keywords].filter(Boolean).join(" ").toLowerCase();
    return query
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .every((token) => haystack.includes(token));
  }, [query, title, description, keywords]);

  const visibleFieldCount = useMemo(
    () =>
      sectionFields.filter((field) => {
        if (!fieldMatchesQuery(field, query)) return false;
        if (context?.showChanged && !context.isFieldModified(field)) return false;
        return true;
      }).length,
    [sectionFields, query, context]
  );

  if (!forceVisible) {
    if (query) {
      if (!matchesSectionText && visibleFieldCount === 0) return null;
    } else if (context && tab && context.activeTab !== tab) {
      return null;
    }
  }

  const showBody = !collapsible || isOpen || !!query;

  return (
    <section
      className={cn("config-section rounded-card border border-border bg-card", className)}
      data-config-section={sectionId}
      data-config-tab={tab}
    >
      {(title || description) && (
        <div
          className={cn(
            "flex items-start gap-2 border-b border-border/70 bg-muted/15 px-2.5 py-2",
            !showBody && "border-b-0"
          )}
        >
          <button
            type="button"
            className={cn(
              "flex min-w-0 flex-1 items-start gap-1.5 text-left",
              collapsible ? "cursor-pointer" : "cursor-default"
            )}
            onClick={collapsible ? () => context?.toggleSection(sectionId, !isOpen) : undefined}
            aria-expanded={collapsible ? showBody : undefined}
            aria-controls={collapsible ? `config-section-${sectionId}` : undefined}
            disabled={!collapsible}
          >
            {collapsible && (
              <span className="mt-0.5 text-muted-foreground">
                {showBody ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </span>
            )}
            <span className="min-w-0 flex-1">
              {title && <span className="block text-xs font-semibold text-foreground">{title}</span>}
              {description && (
                <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">{description}</span>
              )}
            </span>
          </button>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}
      {showBody && (
        <div id={`config-section-${sectionId}`} className="animate-in space-y-2 p-2 fade-in-0 slide-in-from-top-1 duration-150 motion-reduce:animate-none">
          <ConfigSectionContext.Provider value={{ section: sectionId, tab }}>
            {children}
          </ConfigSectionContext.Provider>
        </div>
      )}
    </section>
  );
};

export default ConfigSection;
