import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Checkbox,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Textarea,
} from "@jet-admin/ui";
import { SlidersHorizontal } from "lucide-react";
import {
  ROUTE_QUERY_TYPES,
  matchesRouteQueryType,
} from "@jet-admin/application-contracts";

const EXAMPLE = `{
  "tab": { "type": "string", "default": "overview" },
  "page": { "type": "integer", "default": 1 },
  "archived": { "type": "boolean", "default": false }
}`;

export const ApplicationRouteQueryDialog = ({
  route,
  onSave,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [syncPageVariables, setSyncPageVariables] = useState(false);
  const [error, setError] = useState("");

  const openDialog = () => {
    setText(JSON.stringify(route.query || {}, null, 2));
    setSyncPageVariables(route.syncPageVariables === true);
    setError("");
    setOpen(true);
  };

  const save = () => {
    let parsed;
    try {
      parsed = JSON.parse(text.trim() || "{}");
    } catch {
      setError("Enter valid JSON.");
      return;
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      setError("Query declarations must be a JSON object.");
      return;
    }
    for (const [key, declaration] of Object.entries(parsed)) {
      if (
        !declaration ||
        typeof declaration !== "object" ||
        Array.isArray(declaration)
      ) {
        setError(`"${key}" must be a declaration object.`);
        return;
      }
      if (!ROUTE_QUERY_TYPES.includes(declaration.type || "string")) {
        setError(`"${key}" uses an unsupported query type.`);
        return;
      }
      if (
        declaration.default !== undefined &&
        !matchesRouteQueryType(
          declaration.default,
          declaration.type || "string"
        )
      ) {
        setError(`"${key}" has a default that does not match its type.`);
        return;
      }
    }
    if (syncPageVariables && Object.keys(parsed).length === 0) {
      setError(
        "Declare at least one query parameter before enabling page-variable sync."
      );
      return;
    }
    onSave(parsed, syncPageVariables);
    setOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 shrink-0"
        disabled={disabled}
        onClick={openDialog}
        aria-label={`Query parameters for ${route.id}`}
        title={`Edit query parameters for ${route.id}`}
      >
        <SlidersHorizontal className="h-3 w-3" />
        Query
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-foreground">
              Route query: {route.id}
            </DialogTitle>
            <DialogDescription>
              Declared query parameters are typed, validated, and exposed as{" "}
              <span className="font-mono">state.route.query</span>. Undeclared
              parameters remain raw strings.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Textarea
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                setError("");
              }}
              rows={12}
              className="font-mono text-xs"
              placeholder={EXAMPLE}
              disabled={disabled}
              aria-label={`Query declarations for ${route.id}`}
            />
            <p className="text-[11px] text-muted-foreground">
              Supported types: {ROUTE_QUERY_TYPES.join(", ")}. A default is
              optional; missing values use it when present.
            </p>
            <div className="flex items-start gap-2">
              <Checkbox
                id={`sync-page-variables-${route.id}`}
                checked={syncPageVariables}
                onCheckedChange={(checked) =>
                  setSyncPageVariables(checked === true)
                }
              />
              <div className="space-y-0.5">
                <Label
                  htmlFor={`sync-page-variables-${route.id}`}
                  className="text-xs cursor-pointer"
                >
                  Sync page variables with matching query keys
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Page variables named like declared query parameters initialize
                  from the URL and write non-default values back. Other page
                  variables stay out of the URL.
                </p>
              </div>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={save} disabled={disabled}>
              Save query
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

ApplicationRouteQueryDialog.propTypes = {
  route: PropTypes.shape({
    id: PropTypes.string.isRequired,
    query: PropTypes.object,
    syncPageVariables: PropTypes.bool,
  }).isRequired,
  onSave: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};
