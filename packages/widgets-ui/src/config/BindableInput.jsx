import React, { useEffect, useMemo, useState } from "react";
import { Input, TemplateAutocompleteInput, Textarea, cn } from "@jet-admin/ui";
import { AlertCircle, Braces } from "lucide-react";
import { validateTemplate } from "@jet-admin/expression-engine";

/**
 * BindableInput
 *
 * One control that makes the static-vs-expression contract explicit:
 * - static mode uses a normal input/textarea and preserves the caller's type;
 * - expression mode uses the existing CodeMirror autocomplete input;
 * - typing `{{` automatically switches to expression mode;
 * - malformed braces surface an inline, actionable error.
 *
 * The stored value stays a string, so existing saved configs keep working.
 */
export const hasBinding = (value) => /\{\{[\s\S]*?\}\}/.test(String(value ?? ""));

export const BindableInput = ({
  id,
  value,
  onChange,
  onBlur,
  placeholder,
  liveStateTree,
  multiline = false,
  rows = 3,
  type = "text",
  size = "default",
  disabled = false,
  readOnly = false,
  ariaDescribedBy,
  className,
  inputClassName,
  toggleTitle = "Toggle expression mode",
}) => {
  const bound = hasBinding(value);
  const hasTemplateSyntax = String(value ?? "").includes("{{") || String(value ?? "").includes("}}");
  const [expressionMode, setExpressionMode] = useState(bound);

  useEffect(() => {
    if (hasTemplateSyntax) setExpressionMode(true);
  }, [hasTemplateSyntax]);

  const effectiveMode = hasTemplateSyntax || expressionMode ? "expression" : "static";

  const validation = useMemo(() => {
    if (effectiveMode !== "expression") return { valid: true, errors: [] };
    return validateTemplate(String(value ?? ""), "js-template");
  }, [effectiveMode, value]);

  const errorMessage = validation.valid
    ? ""
    : validation.errors?.[0]?.message || "This expression has invalid template syntax.";

  const handleToggle = () => {
    if (readOnly || disabled) return;
    // A value that already contains {{ }} is an expression regardless of the
    // button state; removing the braces is the explicit way back to static.
    if (bound) return;
    setExpressionMode((prev) => !prev);
  };

  return (
    <div className={cn("min-w-0", className)} data-binding-mode={effectiveMode}>
      <div className="flex min-w-0 items-start gap-1">
        <div className="min-w-0 flex-1">
          {effectiveMode === "expression" ? (
            <TemplateAutocompleteInput
              value={value ?? ""}
              onChange={onChange}
              placeholder={placeholder}
              liveStateTree={liveStateTree}
              isTextArea={multiline}
              rows={rows}
              readOnly={disabled || readOnly}
              size={size}
            />
          ) : multiline ? (
            <Textarea
              id={id}
              value={value ?? ""}
              onChange={(event) => onChange?.(event.target.value)}
              onBlur={onBlur}
              placeholder={placeholder}
              rows={rows}
              disabled={disabled}
              readOnly={readOnly}
              aria-describedby={ariaDescribedBy}
              className={cn("min-h-[72px] bg-input-custom text-sm", inputClassName)}
            />
          ) : (
            <Input
              id={id}
              type={type}
              value={value ?? ""}
              onChange={(event) => onChange?.(event.target.value)}
              onBlur={onBlur}
              placeholder={placeholder}
              disabled={disabled}
              readOnly={readOnly}
              aria-describedby={ariaDescribedBy}
              aria-invalid={!validation.valid || undefined}
              size={size}
              className={cn("font-mono text-xs", inputClassName)}
            />
          )}
        </div>

        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled || readOnly}
          aria-pressed={effectiveMode === "expression"}
          aria-label={toggleTitle}
          title={
            bound
              ? "Remove the {{ }} braces to return to a literal value"
              : effectiveMode === "expression"
                ? "Expression mode — click to switch back to literal text"
                : "Use {{binding}} or JS expression"
          }
          className={cn(
            "inline-flex h-8 w-7 shrink-0 items-center justify-center rounded-control border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50",
            effectiveMode === "expression"
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border bg-background/40 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Braces className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      {errorMessage && (
        <p role="alert" className="mt-1 flex items-start gap-1 text-[11px] leading-snug text-destructive">
          <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </p>
      )}
      {effectiveMode === "expression" && !errorMessage && (
        <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
          Expression · <span className="font-mono">{"{{ state.… }}"}</span>
        </p>
      )}
    </div>
  );
};

export default BindableInput;
