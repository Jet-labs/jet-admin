import React, { useState } from "react";
import PropTypes from "prop-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
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
} from "@jet-admin/ui";
import { useAuthState } from "../../../logic/hooks/useAuth";
import { createApplicationAPI } from "../../../data/apis/application";
import { CONSTANTS } from "../../../constants";

export function ApplicationCreateDialog({
  tenantID,
  open,
  onOpenChange,
  onCreated,
}) {
  const navigate = useNavigate();
  const client = useQueryClient();
  const { firebaseUserState } = useAuthState();
  const principal = firebaseUserState?.user?.uid;
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");

  const create = useMutation({
    mutationFn: () =>
      createApplicationAPI({
        tenantID,
        data: { title: title.trim(), slug: slug.trim() },
      }),
    onSuccess: (result) => {
      client.invalidateQueries({
        queryKey: ["applications", principal, tenantID],
      });
      setTitle("");
      setSlug("");
      setError("");
      onOpenChange(false);
      onCreated?.(result.application);
      navigate(
        CONSTANTS.ROUTES.APPLICATION_STUDIO.path(
          tenantID,
          result.application.applicationID
        )
      );
    },
    onError: (failure) => setError(failure.message || "The application could not be created."),
  });

  const handleOpenChange = (next) => {
    if (create.isPending) return;
    if (!next) {
      setTitle("");
      setSlug("");
      setError("");
      create.reset();
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!title.trim() || !slug.trim()) {
              setError("Application name and URL slug are required.");
              return;
            }
            create.mutate();
          }}
        >
          <DialogHeader>
            <DialogTitle>New application</DialogTitle>
            <DialogDescription>
              Start a draft, then link existing pages and connect them with
              routes.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="application-title">Application name *</Label>
              <Input
                id="application-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Orders and approvals"
                autoFocus
                required
                maxLength={120}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="application-slug">URL slug *</Label>
              <Input
                id="application-slug"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="orders-and-approvals"
                required
                maxLength={80}
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Lowercase letters, numbers, and hyphens.
              </p>
            </div>
            {error && <p className="text-[11px] text-destructive">{error}</p>}
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={create.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? <Spinner size={12} className="mr-1.5" /> : null}
              Create application
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

ApplicationCreateDialog.propTypes = {
  tenantID: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  onCreated: PropTypes.func,
};
