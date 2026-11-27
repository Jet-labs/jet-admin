import React, { useState } from "react";
import PropTypes from "prop-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Spinner,
  Textarea,
} from "@jet-admin/ui";
import { Link2 } from "lucide-react";
import { updateApplicationEnvironmentBindingsAPI } from "../../../data/apis/application";
import { displayError, displaySuccess } from "../../../utils/notification";

const EXAMPLE = `{
  "11111111-1111-4111-8111-111111111111": "22222222-2222-4222-8222-222222222222"
}`;

export const ApplicationEnvironmentBindingsDialog = ({
  tenantID,
  applicationID,
  environment,
  disabled = false,
}) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [changeNote, setChangeNote] = useState("");
  const [error, setError] = useState("");

  const bindingRevision = environment?.bindingRevision || 0;
  const bindings = environment?.bindings || {};
  const environmentName = environment?.name || "production";

  const mutation = useMutation({
    mutationFn: ({ parsed }) =>
      updateApplicationEnvironmentBindingsAPI({
        tenantID,
        applicationID,
        environment: environmentName,
        data: {
          expectedRevision: bindingRevision,
          bindings: parsed,
          changeNote: changeNote.trim() || undefined,
        },
      }),
    onSuccess: async () => {
      displaySuccess("Environment bindings updated.");
      setOpen(false);
      setText("");
      setChangeNote("");
      await queryClient.invalidateQueries();
    },
    onError: displayError,
  });

  const save = () => {
    let parsed;
    try {
      parsed = JSON.parse(text.trim() || "{}");
    } catch {
      setError("Enter valid JSON.");
      return;
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      setError("Bindings must be a JSON object mapping datasource IDs.");
      return;
    }
    for (const [source, target] of Object.entries(parsed)) {
      if (typeof target !== "string") {
        setError(`Binding "${source}" must map to a datasource ID string.`);
        return;
      }
    }
    mutation.mutate({ parsed });
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => {
          setText(JSON.stringify(bindings, null, 2));
          setChangeNote("");
          setError("");
          setOpen(true);
        }}
        title="Environment datasource bindings"
      >
        <Link2 className="h-3.5 w-3.5" />
        Bindings
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-foreground">
              {environmentName} bindings
            </DialogTitle>
            <DialogDescription>
              Map datasource IDs used by the release to environment-specific
              datasource IDs. Credentials stay live and are never stored in
              releases.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline">Revision {bindingRevision}</Badge>
              <span>{Object.keys(bindings).length} active mappings</span>
            </div>

            <div className="space-y-1">
              <Label htmlFor="environment-bindings-json">Bindings JSON</Label>
              <Textarea
                id="environment-bindings-json"
                value={text}
                onChange={(event) => {
                  setText(event.target.value);
                  setError("");
                }}
                rows={8}
                className="font-mono text-xs"
                placeholder={EXAMPLE}
                disabled={disabled || mutation.isPending}
              />
              <p className="text-[11px] text-muted-foreground">
                Keys are datasource IDs captured by the release; values must be
                enabled datasources of the same type in this tenant.
              </p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="environment-bindings-note">Change note</Label>
              <Input
                id="environment-bindings-note"
                value={changeNote}
                maxLength={2000}
                onChange={(event) => setChangeNote(event.target.value)}
                placeholder="Why are these connections changing?"
                disabled={disabled || mutation.isPending}
              />
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <div className="space-y-1 rounded border border-border/60 bg-muted/20 p-2">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Recent revisions
              </p>
              {(environment?.bindingHistory || []).length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No binding revisions recorded yet.
                </p>
              ) : (
                <ul className="max-h-40 space-y-1 overflow-y-auto">
                  {environment.bindingHistory.map((revision) => (
                    <li
                      key={revision.bindingRevisionID}
                      className="flex flex-wrap items-center gap-2 text-xs"
                    >
                      <Badge variant="outline">r{revision.revision}</Badge>
                      <span className="text-muted-foreground">
                        {Object.keys(revision.bindings || {}).length} mappings
                      </span>
                      {revision.changeNote && (
                        <span className="truncate">{revision.changeNote}</span>
                      )}
                      <span className="ml-auto text-[11px] text-muted-foreground">
                        {new Date(revision.createdAt).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={save}
              disabled={disabled || mutation.isPending}
            >
              {mutation.isPending && <Spinner size={12} />}
              Save bindings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

ApplicationEnvironmentBindingsDialog.propTypes = {
  tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  applicationID: PropTypes.string.isRequired,
  environment: PropTypes.object,
  disabled: PropTypes.bool,
};
