import React, { useState } from "react";
import PropTypes from "prop-types";
import { Badge, Button, Input, SearchSelect, Textarea } from "@jet-admin/ui";
import { Plus, Trash2 } from "lucide-react";
import { applicationKeySchema } from "@jet-admin/application-contracts";
import {
  APPLICATION_STATE_TYPES,
  formatApplicationStateDefault,
  parseApplicationStateDefault,
} from "../../../logic/applicationRuntime/applicationState";
import { clearAllPersistedApplicationState } from "../../../logic/applicationRuntime/applicationStatePersistence";

const typeOptions = APPLICATION_STATE_TYPES.map((type) => ({
  value: type,
  label: type,
}));

const defaultForType = (type) =>
  ({
    string: "",
    number: "0",
    boolean: "false",
    object: "{}",
    array: "[]",
    null: "null",
  })[type] ?? "";

function StateVariableRow({ name, declaration, disabled, onUpdate, onRemove }) {
  const unionType = Array.isArray(declaration.type);
  const type = unionType ? declaration.type.join(" | ") : declaration.type;
  const [text, setText] = useState(() =>
    formatApplicationStateDefault(declaration.default)
  );
  const [error, setError] = useState("");

  const commit = () => {
    if (unionType || disabled) return;
    const parsed = parseApplicationStateDefault(declaration.type, text);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    setError("");
    onUpdate(name, parsed.value);
  };

  return (
    <div className="space-y-1.5 bg-background px-2 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs font-medium text-foreground">
          {name}
        </span>
        <Badge variant="outline">{type}</Badge>
        <span className="text-[11px] text-muted-foreground">
          state.application.variables.{name}
        </span>
        <Button
          type="button"
          variant="destructive-ghost"
          size="icon"
          square
          className="ml-auto h-7 w-7 shrink-0"
          onClick={() => onRemove(name)}
          disabled={disabled}
          aria-label={`Remove application variable ${name}`}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      {declaration.type === "object" || declaration.type === "array" ? (
        <Textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          onBlur={commit}
          rows={2}
          className="font-mono text-xs"
          disabled={disabled || unionType}
          aria-label={`Default value for ${name}`}
        />
      ) : (
        <Input
          value={text}
          onChange={(event) => setText(event.target.value)}
          onBlur={commit}
          className="h-8 font-mono text-xs"
          disabled={disabled || unionType || declaration.type === "null"}
          aria-label={`Default value for ${name}`}
        />
      )}
      {unionType && (
        <p className="text-[11px] text-muted-foreground">
          Union-typed variables are preserved here. Edit their default in the
          definition JSON.
        </p>
      )}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

StateVariableRow.propTypes = {
  name: PropTypes.string.isRequired,
  declaration: PropTypes.shape({
    type: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    default: PropTypes.any,
  }).isRequired,
  disabled: PropTypes.bool,
  onUpdate: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

const PERSISTENCE_OPTIONS = [
  { value: "none", label: "None — reset on reload" },
  { value: "session", label: "Session tab — survives reload" },
  { value: "local", label: "Local browser — survives restarts" },
];

export const ApplicationStateEditor = ({
  definition,
  onChange,
  disabled = false,
  tenantID = null,
  applicationID = null,
}) => {
  const [key, setKey] = useState("");
  const [type, setType] = useState("string");
  const [defaultText, setDefaultText] = useState(defaultForType("string"));
  const [error, setError] = useState("");
  const [persistenceNotice, setPersistenceNotice] = useState("");

  const variables = definition?.state?.application || {};
  const names = Object.keys(variables);
  const persistence = {
    mode: definition?.state?.persistence?.mode || "none",
    resetOnRelease: definition?.state?.persistence?.resetOnRelease !== false,
  };

  const updatePersistence = (patch) => {
    if (!definition) return;
    const next = structuredClone(definition);
    next.state.persistence = {
      ...persistence,
      ...(next.state.persistence || {}),
      ...patch,
    };
    onChange(next);
    setPersistenceNotice("");
  };

  const clearSavedState = () => {
    if (!tenantID || !applicationID) return;
    const removed = clearAllPersistedApplicationState({
      tenantID,
      applicationID,
    });
    setPersistenceNotice(
      removed > 0
        ? `Cleared ${removed} saved snapshot${removed === 1 ? "" : "s"}.`
        : "No saved snapshots were found."
    );
  };

  const updateVariable = (name, value) => {
    if (!definition) return;
    const next = structuredClone(definition);
    next.state.application[name] = {
      ...next.state.application[name],
      default: value,
    };
    onChange(next);
  };

  const removeVariable = (name) => {
    if (!definition) return;
    const next = structuredClone(definition);
    delete next.state.application[name];
    onChange(next);
  };

  const addVariable = (event) => {
    event.preventDefault();
    if (!definition) return;
    const parsedKey = applicationKeySchema.safeParse(key.trim());
    if (!parsedKey.success) {
      setError("Use a letter first, then letters, numbers, _ or - (max 64).");
      return;
    }
    if (Object.prototype.hasOwnProperty.call(variables, parsedKey.data)) {
      setError("That application variable already exists.");
      return;
    }
    if (names.length >= 100) {
      setError("An application can declare at most 100 state variables.");
      return;
    }
    const parsedDefault = parseApplicationStateDefault(type, defaultText);
    if (!parsedDefault.ok) {
      setError(parsedDefault.error);
      return;
    }
    const next = structuredClone(definition);
    next.state.application[parsedKey.data] = {
      type,
      default: parsedDefault.value,
    };
    onChange(next);
    setKey("");
    setError("");
  };

  return (
    <div className="space-y-2">
      {names.length === 0 ? (
        <p className="rounded border border-dashed border-border/70 bg-muted/30 p-2 text-xs text-muted-foreground">
          No application state yet. Declare a variable to share state across
          routes within this release.
        </p>
      ) : (
        <div className="divide-y divide-border/60 overflow-hidden rounded border border-border/60">
          {names.map((name) => (
            <StateVariableRow
              key={`${name}:${JSON.stringify([
                variables[name].type,
                variables[name].default,
              ])}`}
              name={name}
              declaration={variables[name]}
              disabled={disabled}
              onUpdate={updateVariable}
              onRemove={removeVariable}
            />
          ))}
        </div>
      )}

      <div className="space-y-2 rounded border border-border/60 bg-muted/20 p-2">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Persistence
        </p>
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">
              Store application state in
            </span>
            <SearchSelect
              value={persistence.mode}
              onChange={(value) => updatePersistence({ mode: value })}
              options={PERSISTENCE_OPTIONS}
              size="sm"
              className="text-xs"
              disabled={disabled}
            />
          </div>
          <div className="flex items-end gap-2 pb-1.5">
            <input
              id="application-state-reset-on-release"
              type="checkbox"
              checked={persistence.resetOnRelease}
              onChange={(event) =>
                updatePersistence({ resetOnRelease: event.target.checked })
              }
              disabled={disabled || persistence.mode === "none"}
              className="h-3.5 w-3.5 accent-primary"
            />
            <label
              htmlFor="application-state-reset-on-release"
              className="text-[11px] text-muted-foreground"
            >
              Reset on new release
            </label>
          </div>
        </div>
        <p className="text-[11px] leading-normal text-muted-foreground">
          `None` keeps state for the current runtime session only. `Session` survives
          reloads in this tab. `Local` survives browser restarts on this device.
          Persisted values are type-checked against the declarations above. With
          “Reset on new release” enabled, deploying a new release starts from the
          declared defaults.
        </p>
        {persistence.mode !== "none" && tenantID && applicationID && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearSavedState}
              disabled={disabled}
            >
              Clear saved state
            </Button>
            {persistenceNotice && (
              <span className="text-[11px] text-muted-foreground">
                {persistenceNotice}
              </span>
            )}
          </div>
        )}
      </div>

      <form
        className="space-y-2 rounded border border-border/60 bg-muted/20 p-2"
        onSubmit={addVariable}
      >
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Add variable
        </p>
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_140px]">
          <div className="space-y-1">
            <label
              htmlFor="application-state-key"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Key
            </label>
            <Input
              id="application-state-key"
              value={key}
              onChange={(event) => setKey(event.target.value)}
              placeholder="selectedCustomerID"
              className="h-8 font-mono text-xs"
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">
              Type
            </span>
            <SearchSelect
              value={type}
              onChange={(value) => {
                setType(value);
                setDefaultText(defaultForType(value));
                setError("");
              }}
              options={typeOptions}
              size="sm"
              className="text-xs"
              disabled={disabled}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label
            htmlFor="application-state-default"
            className="text-[11px] font-medium text-muted-foreground"
          >
            Default value
          </label>
          {type === "object" || type === "array" ? (
            <Textarea
              id="application-state-default"
              value={defaultText}
              onChange={(event) => setDefaultText(event.target.value)}
              rows={2}
              className="font-mono text-xs"
              disabled={disabled || type === "null"}
            />
          ) : (
            <Input
              id="application-state-default"
              value={defaultText}
              onChange={(event) => setDefaultText(event.target.value)}
              className="h-8 font-mono text-xs"
              disabled={disabled || type === "null"}
            />
          )}
        </div>
        {error && <p className="text-[11px] text-destructive">{error}</p>}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-muted-foreground">
            State is memory-scoped to the deployed release. Pages read it as{" "}
            <span className="font-mono">state.application.variables</span>.
          </p>
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            disabled={disabled || !key.trim()}
          >
            <Plus className="h-3.5 w-3.5" />
            Add variable
          </Button>
        </div>
      </form>
    </div>
  );
};

ApplicationStateEditor.propTypes = {
  definition: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  tenantID: PropTypes.string,
  applicationID: PropTypes.string,
};
