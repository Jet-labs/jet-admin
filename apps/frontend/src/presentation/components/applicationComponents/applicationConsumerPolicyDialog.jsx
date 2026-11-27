import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
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
  Spinner,
  Textarea,
} from "@jet-admin/ui";
import { ShieldCheck } from "lucide-react";
import {
  getApplicationConsumerPolicyAPI,
  updateApplicationConsumerPolicyAPI,
} from "../../../data/apis/application";
import { displayError, displaySuccess } from "../../../utils/notification";

const EXAMPLE = `[
  {
    "subjectType": "role",
    "subjectID": "00000000-0000-4000-8000-000000000000",
    "routeID": "risk",
    "actionKey": null,
    "allow": true
  }
]`;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const ApplicationConsumerPolicyDialog = ({
  tenantID,
  applicationID,
  disabled = false,
}) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [text, setText] = useState("[]");
  const [error, setError] = useState("");

  const policyQuery = useQuery({
    queryKey: ["application-consumer-policy", tenantID, applicationID],
    queryFn: () => getApplicationConsumerPolicyAPI({ tenantID, applicationID }),
    enabled: open,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: "always",
  });

  useEffect(() => {
    if (!open || !policyQuery.data) return;
    setEnabled(policyQuery.data.enabled === true);
    setText(
      JSON.stringify(
        (policyQuery.data.entries || []).map((row) => {
          const entry = { ...row };
          delete entry.policyID;
          delete entry.createdAt;
          return entry;
        }),
        null,
        2
      )
    );
  }, [open, policyQuery.data]);

  const mutation = useMutation({
    mutationFn: ({ entries }) =>
      updateApplicationConsumerPolicyAPI({
        tenantID,
        applicationID,
        data: {
          expectedRevision: policyQuery.data?.revision || 0,
          enabled,
          entries,
        },
      }),
    onSuccess: async () => {
      displaySuccess("Consumer access policy updated.");
      setOpen(false);
      await queryClient.invalidateQueries();
    },
    onError: displayError,
  });

  const save = () => {
    let parsed;
    try {
      parsed = JSON.parse(text.trim() || "[]");
    } catch {
      setError("Enter valid JSON.");
      return;
    }
    if (!Array.isArray(parsed)) {
      setError("Policy entries must be a JSON array.");
      return;
    }
    for (const entry of parsed) {
      if (
        !entry ||
        typeof entry !== "object" ||
        !["user", "role", "apiKey"].includes(entry.subjectType) ||
        typeof entry.subjectID !== "string" ||
        !UUID_PATTERN.test(entry.subjectID)
      ) {
        setError(
          "Each entry needs a valid subjectType and a UUID subjectID."
        );
        return;
      }
    }
    mutation.mutate({
      entries: parsed.map((row) => {
        const entry = { ...row };
        delete entry.policyID;
        delete entry.createdAt;
        return entry;
      }),
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => setOpen(true)}
        title="Application consumer route/action policy"
      >
        <ShieldCheck className="h-3.5 w-3.5" />
        Consumer access
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-foreground">
              Consumer access policy
            </DialogTitle>
            <DialogDescription>
              When enabled, runtime routes and actions are default-deny except
              for explicit grants to users, roles, or API keys. Deny entries take
              precedence.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-3">
            {policyQuery.isPending ? (
              <div className="flex h-20 items-center justify-center">
                <Spinner size={16} className="text-primary" />
              </div>
            ) : policyQuery.error ? (
              <p className="rounded border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
                {policyQuery.error.message || "Consumer policy is unavailable."}
              </p>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    Revision {policyQuery.data?.revision || 0}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="consumer-policy-enabled"
                      checked={enabled}
                      onCheckedChange={(checked) =>
                        setEnabled(checked === true)
                      }
                    />
                    <Label
                      htmlFor="consumer-policy-enabled"
                      className="cursor-pointer text-xs"
                    >
                      Enforce consumer policy
                    </Label>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="consumer-policy-json">Policy entries</Label>
                  <Textarea
                    id="consumer-policy-json"
                    value={text}
                    onChange={(event) => {
                      setText(event.target.value);
                      setError("");
                    }}
                    rows={12}
                    className="font-mono text-xs"
                    placeholder={EXAMPLE}
                    disabled={mutation.isPending}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Each entry: subjectType, subjectID, optional routeID and
                    actionKey, allow. Omit routeID/actionKey for a wildcard
                    scope. Routes must exist in the draft; action keys refer to
                    page data-source aliases.
                  </p>
                </div>
              </>
            )}

            {error && <p className="text-xs text-destructive">{error}</p>}
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={save}
              disabled={
                mutation.isPending || policyQuery.isPending || !!policyQuery.error
              }
            >
              {mutation.isPending && <Spinner size={12} />}
              Save policy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

ApplicationConsumerPolicyDialog.propTypes = {
  tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  applicationID: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
};
