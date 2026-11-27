import React, { useMemo, useState } from "react";
import { useEditor } from "@craftjs/core";
import { useQueryClient } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { LayoutTemplate } from "lucide-react";
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
import { CONSTANTS } from "../../../../../constants";
import { createWidgetAPI } from "../../../../../data/apis/widget";
import { useParams } from "react-router-dom";
import { displayError, displaySuccess } from "../../../../../utils/notification";
import { captureCraftNodeAsLayout } from "./editorSnippets.js";

export default function SaveSnippetButton({ tenantID = null }) {
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
  const canCapture = Boolean(effectiveTenantID) && selectedIds.length === 1 && selectedIds[0] !== "ROOT";

  const openDialog = () => {
    if (!canCapture) return;
    const id = selectedIds[0];
    let label = "Section";
    try {
      const node = query.node(id).get();
      if (node?.data?.displayName === "CanvasWidgetSlot") {
        label = node.data.props?.widgetKey || "Widget section";
      } else {
        label = node?.data?.props?.label || node?.data?.displayName?.replace(/^Canvas/, "") || "Section";
      }
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
      setError("Give the snippet a name.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const layout = captureCraftNodeAsLayout(query, nodeId);
      await createWidgetAPI({
        tenantID: effectiveTenantID,
        widgetData: {
          widgetTitle: trimmed,
          ...(description.trim() ? { widgetDescription: description.trim() } : {}),
          widgetType: "layout-snippet",
          widgetConfig: {
            snippet: {
              schemaVersion: 1,
              layout,
              description: description.trim(),
            },
          },
        },
      });
      queryClient.invalidateQueries({
        queryKey: [CONSTANTS.REACT_QUERY_KEYS.WIDGETS(effectiveTenantID)],
      });
      window.dispatchEvent(new CustomEvent("craft-snippets-updated"));
      displaySuccess("Section saved to Snippets.");
      setOpen(false);
    } catch (saveError) {
      setError(saveError.message || "The snippet could not be saved.");
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
        aria-label="Save selection as snippet"
        title={
          canCapture
            ? "Save the selected section as a reusable snippet"
            : "Select exactly one row/container/stack to save a snippet"
        }
      >
        <LayoutTemplate className="h-3.5 w-3.5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Save section as snippet</DialogTitle>
            <DialogDescription>
              The selected layout becomes a reusable section in the palette.
              Widgets keep their existing definitions.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="snippet-title">Name</Label>
              <Input
                id="snippet-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Customer summary section"
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="snippet-description">Description</Label>
              <Textarea
                id="snippet-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={2}
                placeholder="Optional note for teammates."
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Snippets are tenant-scoped and appear under Section snippets in
              the Widgets palette.
            </p>
            {error && <p className="text-[11px] text-destructive">{error}</p>}
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={save} disabled={saving}>
              {saving ? <Spinner size={12} className="mr-1.5" /> : null}
              Save snippet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

SaveSnippetButton.propTypes = {
  tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
