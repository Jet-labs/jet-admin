import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import { Plus, ShieldQuestion } from "lucide-react";
import { CONSTANTS } from "@/constants";
import { createPermissionAPI, getAllPermissionsAPI } from "@/data/apis/platform";
import { displayError, displaySuccess } from "@/utils/notification";
import { useAdminStore } from "@/logic/stores/useAdminStore";

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
  Badge,
  PageHeader,
  Spinner,
} from "@jet-admin/ui";

/** Subtle per-action badge tinting so the registry scans quickly. */
const ACTION_BADGE_CLASS = {
  read: "border-sky-500/30 text-sky-600",
  list: "border-sky-500/30 text-sky-600",
  chat: "border-sky-500/30 text-sky-600",
  preview: "border-sky-500/30 text-sky-600",
  create: "border-emerald-500/30 text-emerald-600",
  execute: "border-emerald-500/30 text-emerald-600",
  install: "border-emerald-500/30 text-emerald-600",
  update: "border-amber-500/40 text-amber-600",
  publish: "border-amber-500/40 text-amber-600",
  delete: "border-red-500/30 text-red-600",
  unpublish: "border-red-500/30 text-red-600",
};

const CreatePermissionDialog = ({ onClose }) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mapToAdmin, setMapToAdmin] = useState(true);

  // Live preview: parse "tenant:<resource>:<action>"
  const parsed = useMemo(() => {
    const parts = title.trim().toLowerCase().split(":");
    if (parts.length === 3 && parts[0] === "tenant" && parts[1] && parts[2]) {
      return { valid: true, resource: parts[1], action: parts[2] };
    }
    return { valid: false };
  }, [title]);

  const createMutation = useMutation({
    mutationFn: () =>
      createPermissionAPI({
                permissionTitle: title.trim(),
        permissionDescription: description.trim() || undefined,
        mapToAdmin,
      }),
    retry: false,
    onSuccess: ({ adminMapped }) => {
      queryClient.invalidateQueries({
        queryKey: [CONSTANTS.REACT_QUERY_KEYS.PERMISSIONS],
      });
      displaySuccess(
        adminMapped
          ? "Permission created and granted to the ADMIN role."
          : "Permission created."
      );
      onClose();
    },
    onError: (error) => displayError(error?.message || error),
  });

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-foreground">
            Register a permission
          </DialogTitle>
          <DialogDescription>
            Add an entry to the registry manually â€” for new APIs that were not
            seeded or to recover a corrupted seed. Titles follow the
            tenant:&lt;resource&gt;:&lt;action&gt; convention.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="permTitle">Title</Label>
              <Input
                id="permTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="tenant:customreports:list"
                className="font-mono"
                disabled={createMutation.isPending}
              />
              {parsed.valid ? (
                <p className="text-xs text-muted-foreground">
                  Enforces as{" "}
                  <span className="font-mono text-foreground">
                    {parsed.resource}:*
                  </span>{" "}
                  with action{" "}
                  <span className="font-mono text-foreground">{parsed.action}</span>{" "}
                  once assigned to a role.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Three colon-separated lowercase segments, e.g.{" "}
                  <span className="font-mono">tenant:resource:action</span>.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="permDescription">Description</Label>
              <Input
                id="permDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional â€” what this permission grants"
                disabled={createMutation.isPending}
              />
            </div>
            <label className="mt-1 flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-sm hover:bg-muted/50">
              <Checkbox
                checked={mapToAdmin}
                onCheckedChange={(next) => setMapToAdmin(Boolean(next))}
              />
              <span className="text-muted-foreground">
                Grant to the global ADMIN role and resync Casbin policies now
              </span>
            </label>
          </div>

          {createMutation.isError && (
            <p className="mt-2 text-xs text-destructive">
              {createMutation.error?.message || "Could not create permission."}
            </p>
          )}
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              createMutation.mutate();
            }}
            disabled={createMutation.isPending || !parsed.valid}
          >
            {createMutation.isPending ? <Spinner size={16} /> : "Create permission"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const PermissionsPage = () => {
  const [filter, setFilter] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: permissions, isLoading } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.PERMISSIONS],
    queryFn: getAllPermissionsAPI,
  });

  /** All groups (unfiltered) for the summary line. */
  const totals = useMemo(() => {
    const resources = new Set();
    for (const permission of permissions || []) {
      resources.add(String(permission.permissionTitle || "").split(":")[1] || "other");
    }
    return { count: permissions?.length || 0, resources: resources.size };
  }, [permissions]);

  const grouped = useMemo(() => {
    const groups = new Map();
    for (const permission of permissions || []) {
      const title = String(permission.permissionTitle || "");
      if (filter && !title.toLowerCase().includes(filter.trim().toLowerCase())) continue;
      const resource = title.split(":")[1] || "other";
      if (!groups.has(resource)) groups.set(resource, []);
      groups.get(resource).push(permission);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [permissions, filter]);

  return (
    <div className="flex h-full w-full flex-col">
      <PageHeader
        title="Permissions"
        parentTitle="Platform Admin"
        subTitle={
          isLoading
            ? undefined
            : `${totals.count} permissions across ${totals.resources} resources`
        }
      />

      <div className="flex-1 overflow-y-auto p-2">
        <div className="flex flex-col gap-2">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              Roles reference these titles. Manually registered entries derive
              their Casbin policy from the title itself.
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <Input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search permissionsâ€¦"
                size="sm"
                className="w-52"
              />
              <Button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="w-fit"
              >
                <Plus className="mr-2 h-4 w-4" />
                New permission
              </Button>
            </div>
          </div>

          {/* Body */}
          {isLoading ? (
            <div role="status" className="grid grid-cols-1 gap-2 lg:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse rounded border border-border/50 p-2">
                  <div className="mb-2 h-3 w-20 rounded bg-muted" />
                  {[0, 1, 2].map((j) => (
                    <div key={j} className="mb-1.5 h-4 w-full rounded bg-muted/70" />
                  ))}
                </div>
              ))}
            </div>
          ) : grouped.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded border border-dashed border-border/60 py-16 text-center">
              <ShieldQuestion className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                {filter ? "No permissions match this filter" : "The registry is empty"}
              </p>
              <p className="max-w-sm text-xs text-muted-foreground">
                {filter
                  ? "Try a different search term, or clear it to see everything."
                  : "Register one with â€œNew permissionâ€, or run the backend seed scripts."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 xl:grid-cols-3">
              {grouped.map(([resource, resourcePermissions]) => (
                <section
                  key={resource}
                  className="overflow-hidden rounded border border-border/50 bg-background"
                >
                  <header className="flex items-center justify-between border-b border-border/50 bg-muted/40 px-2.5 py-1.5">
                    <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-foreground">
                      {resource}
                    </h2>
                    <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                      {resourcePermissions.length}
                    </Badge>
                  </header>
                  <ul>
                    {resourcePermissions.map((permission, index) => {
                      const action =
                        String(permission.permissionTitle).split(":")[2] || "â€”";
                      return (
                        <li
                          key={permission.permissionID}
                          title={permission.permissionTitle}
                          className={`flex items-start gap-2 px-2.5 py-1.5 text-sm hover:bg-muted/40 ${
                            index > 0 ? "border-t border-border/30" : ""
                          }`}
                        >
                          <Badge
                            variant="outline"
                            className={`mt-0.5 shrink-0 font-mono lowercase ${
                              ACTION_BADGE_CLASS[action] || ""
                            }`}
                          >
                            {action}
                          </Badge>
                          <span className="min-w-0 flex-1 truncate text-muted-foreground">
                            {permission.permissionDescription || permission.permissionTitle}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>

      {isCreateOpen && (
        <CreatePermissionDialog onClose={() => setIsCreateOpen(false)} />
      )}
    </div>
  );
};

export default PermissionsPage;
