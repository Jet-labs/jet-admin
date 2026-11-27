import React, { useEffect, useMemo } from "react";
import { RotateCcw } from "lucide-react";
import { cn } from "@jet-admin/ui";
import { useConfigEditorOptional } from "./configEditorContext";
import { ConfigSectionContext } from "./ConfigSection";

/**
 * ConfigField
 *
 * Label + helper + error + modified-from-default affordances. When a `path`
 * is provided it registers with the shell so search, "changed only", and
 * section reset work without extra wiring.
 */
export const ConfigField = ({
  id,
  label,
  helper,
  error,
  required = false,
  path,
  tab,
  section,
  defaultValue,
  keywords,
  htmlFor,
  inline = false,
  className,
  labelClassName,
  children,
}) => {
  const context = useConfigEditorOptional();
  const sectionContext = React.useContext(ConfigSectionContext);
  const resolvedSection = section || sectionContext?.section;
  const resolvedTab = tab || sectionContext?.tab;
  const generatedId = React.useId();
  const fieldId = id || generatedId;
  const helperId = helper ? `${fieldId}-help` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  const keywordString = useMemo(() => {
    if (!keywords) return "";
    return Array.isArray(keywords) ? keywords.join(" ") : String(keywords);
  }, [keywords]);

  const meta = useMemo(
    () => ({
      id: fieldId,
      label: label || "",
      helper: helper || "",
      path,
      tab: resolvedTab,
      section: resolvedSection,
      defaultValue,
      keywords: keywordString,
    }),
    [fieldId, label, helper, path, resolvedTab, resolvedSection, defaultValue, keywordString]
  );

  const registerField = context?.registerField;
  useEffect(() => {
    if (!registerField || !path) return undefined;
    return registerField(meta);
  }, [registerField, meta, path]);

  const modified = context && path ? context.isFieldModified(meta) : false;
  const visible =
    !context ||
    (context.fieldMatches(meta) && (!context.showChanged || modified));

  if (!visible) return null;

  const hasDefault = !!(context && path);
  const LabelTag = htmlFor ? "label" : "span";
  const describedBy = [helperId, errorId].filter(Boolean).join(" ") || undefined;

  const labelNode = label ? (
    <div className={cn("flex min-w-0 items-center gap-1.5", inline && "flex-1")}>
      {modified && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />}
      <LabelTag
        htmlFor={htmlFor}
        className={cn(
          "min-w-0 text-xs font-medium text-foreground",
          !inline && "truncate",
          inline && "leading-snug",
          inline && "cursor-pointer",
          labelClassName
        )}
      >
        {label}
        {required && (
          <span className="ml-0.5 text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </LabelTag>
      {modified && hasDefault && (
        <button
          type="button"
          onClick={() => context.resetField(meta)}
          className="ml-auto inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-control text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 group-hover/config-field:opacity-100"
          title="Reset to default"
          aria-label={`Reset ${label || "setting"} to default`}
        >
          <RotateCcw className="h-3 w-3" />
        </button>
      )}
    </div>
  ) : null;

  const control = <div className={cn(inline ? "shrink-0" : "min-w-0")} data-describedby={describedBy}>{children}</div>;

  return (
    <div
      className={cn("group/config-field space-y-1", className)}
      data-config-field={fieldId}
      data-config-path={path || undefined}
    >
      {inline ? (
        <div className="flex items-center justify-between gap-2">
          {labelNode}
          {control}
        </div>
      ) : (
        <>
          {labelNode}
          {control}
        </>
      )}

      {helper && !error && (
        <p id={helperId} className="text-[11px] leading-snug text-muted-foreground">
          {helper}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-[11px] leading-snug text-destructive">
          {error}
        </p>
      )}
    </div>
  );
};

export default ConfigField;
