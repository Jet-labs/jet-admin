import React, { useMemo, useState } from "react";
import { useEditor } from "@craftjs/core";
import { useQueryClient } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { Boxes } from "lucide-react";
import {
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
import { useParams } from "react-router-dom";
import { CONSTANTS } from "../../../../../constants";
import { createWidgetAPI } from "../../../../../data/apis/widget";
import { displayError, displaySuccess } from "../../../../../utils/notification";
import { captureCompositeLayout } from "./editorSnippets.js";

export default function SaveCompositeButton({ tenantID = null }) {
  const { query, selectedKey } = useEditor((state) => ({
    selectedKey: Array.from(state.events.selected || []).sort().join("|"),
  }));
  const routeParams = useParams();
  const effectiveTenantID = tenantID || routeParams?.tenantID || null;
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [nodeId, setNodeId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedIds = useMemo(
    () => (selectedKey ? selectedKey.split("|").filter(Boolean) : []),
    [selectedKey]
  );
  const canCapture =
    Boolean(effectiveTenantID) && selectedIds.length === 1 && selectedIds[0] !== "ROOT";

  const openDialog = () => {
    if (!canCapture) return;
    const id = selectedIds[0];
    let label = "Composite";
    try {
      const node = query.node(id).get();
      label = node?.data?.props?.label || node?.data?.displayName?.replace(/^Canvas/, "") || "Composite";
    } catch {
      /* keep fallback */
    }
    setNodeId(id);
    setTitle(String(label));
    setDescription("");
    setError("");
    setOpen(true);
  };

  const save = async () => {
    if (!nodeId || !effectiveTenantID) return;
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Give the composite widget a name.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const layout = await captureCompositeLayout({
        query,
        nodeId,
        tenantID: effectiveTenantID,
      });
      await createWidgetAPI({
        tenantID: effectiveTenantID,
        widgetData: {
          widgetTitle: trimmed,
          ...(description.trim() ? { widgetDescription: description.trim() } : {}),
          widgetType: "composite",
          widgetConfig: {
            composite: {
              schemaVersion: 1,
              layout,
              inputs: [],
              outputs: [],
              values: {},
            },
          },
        },
      });
      queryClient.invalidateQueries({
        queryKey: [CONSTANTS.REACT_QUERY_KEYS.WIDGETS(effectiveTenantID)],
      });
      displaySuccess("Composite widget created. Insert it from the Widgets palette.");
      setOpen(false);
    } catch (saveError) {
      setError(saveError.message || "The composite widget could not be created.");
      displayError(saveError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={openDialog}
        disabled={!canCapture}
        aria-label="Create composite widget"
        title={
          canCapture
            ? "Package the selected section as a reusable composite widget"
            : "Select exactly one row/container/stack to create a composite widget"
        }
      >
        <Boxes className="h-3.5 w-3.5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create composite widget</DialogTitle>
            <DialogDescription>
              The selected section becomes a reusable widget containing its child
              widgets. The captured definitions are complete and versioned with the
              composite.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="composite-title">Name</Label>
              <Input
                id="composite-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Customer summary"
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="composite-description">Description</Label>
              <Textarea
                id="composite-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={2}
                placeholder="Optional note for teammates."
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Inputs and outputs can be declared in the composite widget
              configuration after creation. Child widgets read inputs through{" "}
              <code className="font-mono">state.composite.inputs</code>.
            </p>
            {error && <p className="text-[11px] text-destructive">{error}</p>}
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={save} disabled={saving}>
              {saving ? <Spinner size={12} className="mr-1.5" /> : null}
              Create composite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

SaveCompositeButton.propTypes = {
  tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
