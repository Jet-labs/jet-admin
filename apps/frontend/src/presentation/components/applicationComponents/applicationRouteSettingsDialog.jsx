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
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@jet-admin/ui";
import { Settings2 } from "lucide-react";

const NO_PARENT = "__none__";
const NO_REDIRECT = "__none__";

export const ApplicationRouteSettingsDialog = ({ route, routes, onSave, disabled = false }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [parentRouteID, setParentRouteID] = useState(NO_PARENT);
  const [keepAlive, setKeepAlive] = useState(false);
  const [syncAllPageVariables, setSyncAllPageVariables] = useState(false);
  const [guardExpression, setGuardExpression] = useState("");
  const [guardRedirectRouteID, setGuardRedirectRouteID] = useState(NO_REDIRECT);
  const [error, setError] = useState("");

  const openDialog = () => {
    setTitle(route.title || "");
    setParentRouteID(route.parentRouteID || NO_PARENT);
    setKeepAlive(route.keepAlive === true);
    setSyncAllPageVariables(route.syncAllPageVariables === true);
    setGuardExpression(route.guard?.expression || "");
    setGuardRedirectRouteID(route.guard?.redirectRouteID || NO_REDIRECT);
    setError("");
    setOpen(true);
  };

  const save = () => {
    const nextTitle = title.trim();
    if (nextTitle.length > 120) {
      setError("Titles must be 120 characters or fewer.");
      return;
    }
    if (guardExpression.trim() && guardRedirectRouteID === NO_REDIRECT) {
      setError("Choose a redirect route for the guard.");
      return;
    }
    if (!guardExpression.trim() && guardRedirectRouteID !== NO_REDIRECT) {
      setError("Enter a guard expression or remove the redirect.");
      return;
    }
    if (guardRedirectRouteID !== NO_REDIRECT && guardRedirectRouteID === route.id) {
      setError("A guard cannot redirect to its own route.");
      return;
    }
    onSave({
      title: nextTitle || undefined,
      parentRouteID: parentRouteID === NO_PARENT ? undefined : parentRouteID,
      keepAlive,
      syncAllPageVariables,
      guard: guardExpression.trim()
        ? {
            expression: guardExpression.trim(),
            redirectRouteID: guardRedirectRouteID,
          }
        : undefined,
    });
    setOpen(false);
  };

  const parentOptions = routes.filter((candidate) => candidate.id !== route.id);
  const redirectOptions = routes.filter(
    (candidate) =>
      candidate.id !== route.id &&
      !candidate.path.includes(":") &&
      !candidate.guard
  );

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 shrink-0"
        disabled={disabled}
        onClick={openDialog}
        aria-label={`Route settings for ${route.id}`}
        title={`Edit route settings for ${route.id}`}
      >
        <Settings2 className="h-3 w-3" />
        Settings
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-foreground">
              Route settings: {route.id}
            </DialogTitle>
            <DialogDescription>
              Titles, hierarchy, page-state retention, general URL sync, and
              access guards for this route.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor={`route-title-${route.id}`}>Title</Label>
              <Input
                id={`route-title-${route.id}`}
                value={title}
                maxLength={120}
                placeholder={route.id}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setError("");
                }}
                disabled={disabled}
              />
              <p className="text-[11px] text-muted-foreground">
                Used for the browser title and runtime hierarchy.
              </p>
            </div>

            <div className="space-y-1">
              <Label>Parent route</Label>
              <Select
                value={parentRouteID}
                onValueChange={(value) => {
                  setParentRouteID(value);
                  setError("");
                }}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No parent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_PARENT}>No parent</SelectItem>
                  {parentOptions.map((candidate) => (
                    <SelectItem key={candidate.id} value={candidate.id}>
                      {candidate.title || candidate.id} · {candidate.path}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                Child paths must be nested under the parent path.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Checkbox
                  id={`route-keep-alive-${route.id}`}
                  checked={keepAlive}
                  onCheckedChange={(checked) => setKeepAlive(checked === true)}
                  disabled={disabled}
                />
                <div>
                  <Label htmlFor={`route-keep-alive-${route.id}`} className="cursor-pointer text-xs">
                    Keep page state across navigation
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Retains page variables, query results, and widget state in a
                    bounded runtime cache. Path-parameter changes still reset the
                    page.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id={`route-sync-all-${route.id}`}
                  checked={syncAllPageVariables}
                  onCheckedChange={(checked) =>
                    setSyncAllPageVariables(checked === true)
                  }
                  disabled={disabled}
                />
                <div>
                  <Label htmlFor={`route-sync-all-${route.id}`} className="cursor-pointer text-xs">
                    Sync all matching page variables to the URL
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Extends query binding to page variables that are not declared
                    as typed route query parameters.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor={`route-guard-${route.id}`}>Guard expression</Label>
              <Textarea
                id={`route-guard-${route.id}`}
                value={guardExpression}
                onChange={(event) => {
                  setGuardExpression(event.target.value);
                  setError("");
                }}
                rows={3}
                className="font-mono text-xs"
                placeholder="state.application.variables.isAdmin === true"
                disabled={disabled}
              />
              <p className="text-[11px] text-muted-foreground">
                Only a literal boolean true admits the route; invalid or missing
                expressions redirect instead of exposing the page.
              </p>
            </div>

            <div className="space-y-1">
              <Label>Guard redirect</Label>
              <Select
                value={guardRedirectRouteID}
                onValueChange={(value) => {
                  setGuardRedirectRouteID(value);
                  setError("");
                }}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a redirect" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_REDIRECT}>No redirect</SelectItem>
                  {redirectOptions.map((candidate) => (
                    <SelectItem key={candidate.id} value={candidate.id}>
                      {candidate.title || candidate.id} · {candidate.path}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={save} disabled={disabled}>
              Save settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

ApplicationRouteSettingsDialog.propTypes = {
  route: PropTypes.shape({
    id: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    title: PropTypes.string,
    parentRouteID: PropTypes.string,
    keepAlive: PropTypes.bool,
    syncAllPageVariables: PropTypes.bool,
    guard: PropTypes.shape({
      expression: PropTypes.string,
      redirectRouteID: PropTypes.string,
    }),
  }).isRequired,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
  onSave: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};
