import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, ShieldCheck, ShieldQuestion, Trash2 } from "lucide-react";
import React, { useMemo, useState } from "react";
import { CONSTANTS } from "@/constants";
import {
  addRoleAPI,
  deleteRoleAPI,
  getAllPermissionsAPI,
} from "@/data/apis/platform";
import { displayError, displaySuccess } from "@/utils/notification";

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
  Input,
  Label,
  Spinner,
} from "@jet-admin/ui";

/** Group flat permission titles ("tenant:resource:action") by resource. */
const _groupPermissions = (permissions) => {
  const groups = new Map();
  for (const permission of permissions) {
    const parts = String(permission.permissionTitle || "").split(":");
    const resource = parts[1] || "other";
    if (!groups.has(resource)) groups.set(resource, []);
    groups.get(resource).push(permission);
  }
  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
};

/** Matches a permission against the free-text filter (resource, title or description). */
const _permissionMatches = (permission, resource, needle) => {
  return (
    resource.includes(needle) ||
    String(permission.permissionTitle || "").toLowerCase().includes(needle) ||
    String(permission.permissionDescription || "").toLowerCase().includes(needle)
  );
};

const RoleEditorDialog = ({ onClose }) => {
  const queryClient = useQueryClient();

  const { data: permissions } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.PERMISSIONS],
    queryFn: getAllPermissionsAPI,
  });

  const [roleTitle, setRoleTitle] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedIDs, setSelectedIDs] = useState(new Set());
  const [permFilter, setPermFilter] = useState("");

  const grouped = useMemo(() => _groupPermissions(permissions || []), [permissions]);

  /** Filtered view keeps empty-selected groups visible only when they match. */
  const filteredGroups = useMemo(() => {
    const needle = permFilter.trim().toLowerCase();
    if (!needle) return grouped;
    return grouped.filter(([resource, resourcePermissions]) =>
      resourcePermissions.some((p) => _permissionMatches(p, resource.toLowerCase(), needle))
    );
  }, [grouped, permFilter]);

  const createMutation = useMutation({
    mutationFn: () =>
      addRoleAPI({
        roleTitle: roleTitle.trim(),
        roleDescription: roleDescription.trim() || undefined,
        permissionIDs: Array.from(selectedIDs),
      }),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CONSTANTS.REACT_QUERY_KEYS.ROLES],
      });
      displaySuccess(`Role "${roleTitle.trim()}" created.`);
      onClose();
    },
    onError: (error) => displayError(error?.message || error),
  });

  const _togglePermission = (permissionID) => {
    setSelectedIDs((prev) => {
      const next = new Set(prev);
      if (next.has(permissionID)) next.delete(permissionID);
      else next.add(permissionID);
      return next;
    });
  };

  const _toggleGroup = (resourcePermissions, selectAll) => {
    setSelectedIDs((prev) => {
      const next = new Set(prev);
      for (const permission of resourcePermissions) {
        if (selectAll) next.add(permission.permissionID);
        else next.delete(permission.permissionID);
      }
      return next;
    });
  };

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-foreground">
            Create role
          </DialogTitle>
          <DialogDescription>
            Define a named permission set. Assign the role to users from the main
            app.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div className="mb-3 grid grid-cols-1 gap-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="roleTitle">Role name</Label>
              <Input
                id="roleTitle"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. MarketplaceManager"
                disabled={createMutation.isPending}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="roleDescription">Description</Label>
              <Input
                id="roleDescription"
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                placeholder="Optional"
                disabled={createMutation.isPending}
              />
            </div>
          </div>

          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Permissions ({selectedIDs.size} selected)
            </p>
            <Input
              value={permFilter}
              onChange={(e) => setPermFilter(e.target.value)}
              placeholder="Search permissions..."
              size="sm"
              className="w-52"
            />
          </div>

          <div className="max-h-72 space-y-2 overflow-y-auto rounded border border-border/50 p-2">
            {filteredGroups.map(([resource, resourcePermissions]) => {
              const selectedInGroup = resourcePermissions.filter((p) =>
                selectedIDs.has(p.permissionID)
              ).length;
              const allSelected = selectedInGroup === resourcePermissions.length;
              const needle = permFilter.trim().toLowerCase();
              const visible = needle
                ? resourcePermissions.filter((p) =>
                    _permissionMatches(p, resource.toLowerCase(), needle)
                  )
                : resourcePermissions;

              return (
                <section key={resource} className="rounded border border-border/50">
                  <header className="flex items-center justify-between gap-2 border-b border-border/50 bg-muted/40 px-2 py-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-semibold uppercase tracking-widest text-foreground">
                        {resource}
                      </span>
                      <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                        {selectedInGroup}/{resourcePermissions.length}
                      </Badge>
                    </div>
                    <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                      <Checkbox
                        checked={allSelected ? true : selectedInGroup > 0 ? "indeterminate" : false}
                        onCheckedChange={() => _toggleGroup(resourcePermissions, !allSelected)}
                      />
                      all
                    </label>
                  </header>
                  <div className="grid grid-cols-1 gap-0.5 p-1 sm:grid-cols-2">
                    {visible.map((permission) => (
                      <label
                        key={permission.permissionID}
                        title={permission.permissionTitle}
                        className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-sm hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={selectedIDs.has(permission.permissionID)}
                          onCheckedChange={() => _togglePermission(permission.permissionID)}
                        />
                        <span className="truncate text-muted-foreground">
                          {permission.permissionDescription || permission.permissionTitle}
                        </span>
                      </label>
                    ))}
                  </div>
                </section>
              );
            })}
            {filteredGroups.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No permissions match this filter.
              </p>
            )}
          </div>

          {createMutation.isError && (
            <p className="mt-2 text-xs text-destructive">
              {createMutation.error?.message || "Could not create role."}
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
            disabled={createMutation.isPending || !roleTitle.trim()}
          >
            {createMutation.isPending ? <Spinner size={16} /> : "Create role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DeleteRoleDialog = ({ role, isPending, error, onCancel, onConfirm }) => (
  <Dialog open onOpenChange={(next) => !next && onCancel()}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="text-base font-semibold text-foreground">
          Delete role?
        </DialogTitle>
        <DialogDescription>
          This permanently removes{" "}
          <span className="font-medium text-foreground">{role.roleTitle}</span> and
          its{" "}
          {role.tblRolePermissionMappings?.length ?? 0} permission assignment
          {role.tblRolePermissionMappings?.length === 1 ? "" : "s"}. Members lose
          these access rights immediately. Casbin policies are cleaned up
          automatically.
        </DialogDescription>
      </DialogHeader>
      {error && (
        <p className="text-xs text-destructive">{error?.message || "Delete failed."}</p>
      )}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={(event) => {
            event.stopPropagation();
            onConfirm();
          }}
          disabled={isPending}
        >
          {isPending ? <Spinner size={16} /> : "Delete role"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export const RolesManager = ({ roles, isLoading }) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  /** Role object pending delete confirmation, or null. */
  const [pendingDelete, setPendingDelete] = useState(null);

  const deleteMutation = useMutation({
    mutationFn: ({ roleID }) => deleteRoleAPI({ roleID }),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CONSTANTS.REACT_QUERY_KEYS.ROLES],
      });
      displaySuccess("Role deleted.");
      setPendingDelete(null);
    },
    onError: (error) => displayError(error?.message || error),
  });

  const filteredRoles = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return roles || [];
    return (roles || []).filter(
      (role) =>
        String(role.roleTitle || "").toLowerCase().includes(needle) ||
        String(role.roleDescription || "").toLowerCase().includes(needle)
    );
  }, [roles, search]);

  return (
    <div className="flex flex-col gap-2">
      {/* Toolbar */}
      <div className="flex items-center justify-end gap-2">
        <div className="flex shrink-0 items-center gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles..."
            size="sm"
            className="w-52"
          />
          <Button type="button" onClick={() => setIsEditorOpen(true)} className="w-fit">
            <Plus className="mr-2 h-4 w-4" />
            New role
          </Button>
        </div>
      </div>

      {/* Body */}
      {isLoading ? (
        <div role="status" className="animate-pulse space-y-2 p-2">
          <div className="h-10 w-full rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted" />
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded border border-dashed border-border/60 py-16 text-center">
          <ShieldQuestion className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            {search ? "No roles match this search" : "No roles yet"}
          </p>
          <p className="max-w-sm text-xs text-muted-foreground">
            {search
              ? "Try a different search term."
              : "Create a role to bundle permissions for reusable assignment."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded border border-border/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/40 text-left">
                <th className="px-3 py-2 font-medium text-muted-foreground">Role</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">Permissions</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">Description</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {filteredRoles.map((role, index) => {
                const isGlobal = !role.tenantID;
                const isAdmin = role.roleTitle === "ADMIN";
                const permCount = role.tblRolePermissionMappings?.length ?? 0;
                return (
                  <tr
                    key={role.roleID}
                    title={isGlobal ? "Global role — shared across tenants" : undefined}
                    className={`hover:bg-muted/30 ${index > 0 ? "border-t border-border/30" : ""}`}
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck
                          className={`h-4 w-4 shrink-0 ${
                            isAdmin ? "text-primary" : "text-muted-foreground"
                          }`}
                        />
                        <span className="font-medium text-foreground">{role.roleTitle}</span>
                        {isAdmin && <Badge variant="secondary">system</Badge>}
                        {!isAdmin && isGlobal && <Badge variant="secondary">global</Badge>}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className="font-mono">
                        {permCount}
                      </Badge>
                    </td>
                    <td className="max-w-xs truncate px-3 py-2 text-xs text-muted-foreground">
                      {role.roleDescription || "—"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {!isGlobal && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          square
                          title={`Delete ${role.roleTitle}`}
                          aria-label={`Delete ${role.roleTitle}`}
                          onClick={() => setPendingDelete(role)}
                          className="hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {isEditorOpen && <RoleEditorDialog onClose={() => setIsEditorOpen(false)} />}

      {pendingDelete && (
        <DeleteRoleDialog
          role={pendingDelete}
          isPending={deleteMutation.isPending}
          error={deleteMutation.error}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() =>
            deleteMutation.mutate({
              roleID: pendingDelete.roleID,
            })
          }
        />
      )}
    </div>
  );
};
