import React, { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Folder as FolderIcon,
  FolderPlus,
  FolderTree as FolderTreeIcon,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import PropTypes from "prop-types";
import { useFolders, useFolderActions } from "../../../logic/hooks/useFolders";
import { useGlobalUI } from "../../../logic/stores/useUIStore";
import { displayError } from "../../../utils/notification";

import { Button, Input } from "@jet-admin/ui";

const ID_FIELD_BY_TYPE = {
  widget: "widgetID",
  workflow: "workflowID",
  dataQuery: "dataQueryID",
  cronJob: "cronJobID",
  appPage: "appPageID",
  listener: "listenerID",
};

const TITLE_FIELD_BY_TYPE = {
  widget: "widgetTitle",
  workflow: "title",
  dataQuery: "dataQueryTitle",
  cronJob: "cronJobTitle",
  appPage: "appPageTitle",
  listener: "listenerTitle",
};

const DND_ITEM_MIME = "application/x-jet-entity-item";
const DND_FOLDER_MIME = "application/x-jet-folder";

/**
 * Explorer-style tree: real folder structure with items nested inside their
 * folders and unfiled items at the root. Items AND folders are drag sources;
 * folders and the root are drop targets (native HTML5 drag & drop).
 *
 * renderItemRow(item) lets each drawer keep its own row visuals (icon,
 * active highlight, Link) — this component only supplies the tree chrome
 * and the drag & drop behaviour.
 */
export const EntityFolderTree = ({
  tenantID,
  entityType,
  items = [],
  isLoadingItems = false,
  renderItemRow,
  onItemDragStart,
}) => {
  EntityFolderTree.propTypes = {
    tenantID: PropTypes.string.isRequired,
    entityType: PropTypes.oneOf(["widget", "workflow", "dataQuery", "cronJob", "appPage", "listener"])
      .isRequired,
    items: PropTypes.array,
    isLoadingItems: PropTypes.bool,
    renderItemRow: PropTypes.func.isRequired,
    onItemDragStart: PropTypes.func,
  };

  const { folders } = useFolders(tenantID, entityType);
  const { moveEntities, moveFolder, createFolder, renameFolder, deleteFolder } = useFolderActions({
    tenantID,
    entityType,
  });
  const { showConfirmation } = useGlobalUI();

  const [expandedIDs, setExpandedIDs] = useState(null); // null => expand everything
  const [dropTargetID, setDropTargetID] = useState(undefined); // folderID or "__root__"
  const [creatingParentID, setCreatingParentID] = useState(undefined);
  const [newTitle, setNewTitle] = useState("");
  const [renamingID, setRenamingID] = useState(null);
  const [renameTitle, setRenameTitle] = useState("");

  const idField = ID_FIELD_BY_TYPE[entityType];

  const childrenByParent = useMemo(() => {
    const map = new Map();
    for (const folder of folders) {
      const key = folder.parentFolderID || null;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(folder);
    }
    return map;
  }, [folders]);

  const itemsByFolder = useMemo(() => {
    const map = new Map();
    for (const item of items) {
      const key = item.folderID || null;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    }
    return map;
  }, [items]);

  const _itemsIn = (folderID) =>
    (itemsByFolder?.get(folderID) || []).slice().sort((a, b) =>
      String(a[TITLE_FIELD_BY_TYPE[entityType]] || "").localeCompare(
        String(b[TITLE_FIELD_BY_TYPE[entityType]] || "")
      )
    );

  const _isExpanded = (folderID) =>
    expandedIDs === null ? true : expandedIDs.has(folderID);

  const _toggleExpand = (folderID) => {
    setExpandedIDs((prev) => {
      const base = prev === null ? new Set(folders.map((f) => f.folderID)) : new Set(prev);
      if (base.has(folderID)) base.delete(folderID);
      else base.add(folderID);
      return base;
    });
  };

  // ─── Drag & drop ────────────────────────────────────────────────────────

  const _descendantIDs = (folderID) => {
    const result = new Set([folderID]);
    const stack = [folderID];
    while (stack.length) {
      const current = stack.pop();
      for (const child of childrenByParent.get(current) || []) {
        result.add(child.folderID);
        stack.push(child.folderID);
      }
    }
    return result;
  };

  const _onDragOverFolder = (event, folder) => {
    let payloadKind = null;
    try {
      if (event.dataTransfer.types.includes(DND_ITEM_MIME)) payloadKind = "item";
      if (event.dataTransfer.types.includes(DND_FOLDER_MIME)) payloadKind = "folder";
    } catch {
      return;
    }
    if (!payloadKind) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "move";
    setDropTargetID(folder.folderID);
  };

  const _onDropFolder = (event, folder) => {
    event.preventDefault();
    event.stopPropagation();
    setDropTargetID(undefined);

    const rawItem = event.dataTransfer.getData(DND_ITEM_MIME);
    const rawFolder = event.dataTransfer.getData(DND_FOLDER_MIME);

    if (rawItem) {
      const payload = JSON.parse(rawItem);
      if (payload.entityType !== entityType) return;
      if (payload.currentFolderID === folder.folderID) return;
      moveEntities.mutate(
        { entityIDs: [payload.id], folderID: folder.folderID },
        { onError: (error) => displayError(error) }
      );
    } else if (rawFolder) {
      const payload = JSON.parse(rawFolder);
      if (payload.id === folder.folderID) return;
      if (_descendantIDs(payload.id).has(folder.folderID)) {
        displayError("Cannot move a folder into itself or one of its subfolders.");
        return;
      }
      moveFolder.mutate(
        { folderID: payload.id, parentFolderID: folder.folderID },
        { onError: (error) => displayError(error) }
      );
    }
  };

  const _onDropRoot = (event) => {
    event.preventDefault();
    setDropTargetID(undefined);

    const rawItem = event.dataTransfer.getData(DND_ITEM_MIME);
    const rawFolder = event.dataTransfer.getData(DND_FOLDER_MIME);

    if (rawItem) {
      const payload = JSON.parse(rawItem);
      if (payload.entityType !== entityType) return;
      if (!payload.currentFolderID) return;
      moveEntities.mutate(
        { entityIDs: [payload.id], folderID: null },
        { onError: (error) => displayError(error) }
      );
    } else if (rawFolder) {
      const payload = JSON.parse(rawFolder);
      if (!payload.parentFolderID) return;
      moveFolder.mutate(
        { folderID: payload.id, parentFolderID: null },
        { onError: (error) => displayError(error) }
      );
    }
  };

  // ─── Folder CRUD ────────────────────────────────────────────────────────

  const _submitNewFolder = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const title = newTitle.trim();
    if (!title) return;
    createFolder.mutate(
      { folderTitle: title, parentFolderID: creatingParentID },
      {
        onSuccess: () => {
          setCreatingParentID(undefined);
          setNewTitle("");
          if (creatingParentID) setExpandedIDs((prev) => {
            const base = prev === null ? new Set(folders.map((f) => f.folderID)) : new Set(prev);
            base.add(creatingParentID);
            return base;
          });
        },
        onError: (error) => displayError(error),
      }
    );
  };

  const _submitRename = (event, folderID) => {
    event.preventDefault();
    event.stopPropagation();
    const title = renameTitle.trim();
    if (!title) return;
    renameFolder.mutate(
      { folderID, folderTitle: title },
      {
        onSuccess: () => setRenamingID(null),
        onError: (error) => displayError(error),
      }
    );
  };

  const _handleDelete = async (folder) => {
    const confirmed = await showConfirmation({
      title: "Delete folder",
      message: `"${folder.folderTitle}" will be deleted. Items inside stay available and subfolders move up one level.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });
    if (!confirmed) return;
    deleteFolder.mutate(
      { folderID: folder.folderID },
      { onError: (error) => displayError(error) }
    );
  };

  // ─── Render helpers ─────────────────────────────────────────────────────

  const _renderCreateInput = (indent) => (
    <form onSubmit={_submitNewFolder} className="py-0.5 pr-2" style={{ paddingLeft: `${indent}px` }}>
      <Input
        autoFocus
        size="sm"
        placeholder="Folder name…"
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
        onBlur={() => {
          if (!newTitle.trim()) setCreatingParentID(undefined);
        }}
      />
    </form>
  );

  const _renderItemLeaf = (item, depth) => (
    <div
      key={item[idField]}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData(
          DND_ITEM_MIME,
          JSON.stringify({ kind: "item", entityType, id: item[idField], currentFolderID: item.folderID || null })
        );
        event.dataTransfer.effectAllowed = "move";
        // Consumers (e.g. the app page editor) can attach extra drag
        // payloads to the same gesture without a second draggable surface.
        if (onItemDragStart) onItemDragStart(event, item);
      }}
      style={{ paddingLeft: `${depth * 14 + 22}px` }}
      className="pr-1"
    >
      {renderItemRow(item)}
    </div>
  );

  const _renderFolder = (folder, depth) => {
    const hasChildren =
      (childrenByParent.get(folder.folderID) || []).length > 0 ||
      _itemsIn(folder.folderID).length > 0;
    const isExpanded = _isExpanded(folder.folderID);
    const isRenaming = renamingID === folder.folderID;
    const isDropTarget = dropTargetID === folder.folderID;

    return (
      <div key={folder.folderID}>
        <div
          role="treeitem"
          aria-expanded={hasChildren ? isExpanded : undefined}
          draggable={!isRenaming}
          onDragStart={(event) => {
            event.dataTransfer.setData(
              DND_FOLDER_MIME,
              JSON.stringify({ kind: "folder", id: folder.folderID, parentFolderID: folder.parentFolderID || null })
            );
            event.dataTransfer.effectAllowed = "move";
          }}
          onDragOver={(event) => _onDragOverFolder(event, folder)}
          onDragLeave={() => setDropTargetID((prev) => (prev === folder.folderID ? undefined : prev))}
          onDrop={(event) => _onDropFolder(event, folder)}
          onClick={() => hasChildren && _toggleExpand(folder.folderID)}
          onKeyDown={(e) => e.key === "Enter" && hasChildren && _toggleExpand(folder.folderID)}
          tabIndex={0}
          className={`group flex w-full cursor-pointer items-center gap-1 rounded px-1 py-1 text-sm transition-colors ${
            isDropTarget
              ? "bg-primary/10 ring-1 ring-primary/40"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
          style={{ paddingLeft: `${depth * 14 + 4}px` }}
        >
          <button
            type="button"
            className={`flex h-4 w-4 shrink-0 items-center justify-center ${hasChildren ? "" : "invisible"}`}
            onClick={(e) => {
              e.stopPropagation();
              _toggleExpand(folder.folderID);
            }}
            aria-label={isExpanded ? "Collapse folder" : "Expand folder"}
          >
            {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
          <FolderIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />

          {isRenaming ? (
            <form onSubmit={(e) => _submitRename(e, folder.folderID)} className="flex-1">
              <Input
                autoFocus
                size="sm"
                value={renameTitle}
                onChange={(e) => setRenameTitle(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </form>
          ) : (
            <span className="flex-1 truncate font-medium">{folder.folderTitle}</span>
          )}

          {!isRenaming && (
            <div className="hidden shrink-0 items-center gap-0.5 group-hover:flex">
              <button
                type="button"
                className="rounded p-0.5 hover:bg-background"
                title="Add subfolder"
                aria-label={`Add subfolder to ${folder.folderTitle}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCreatingParentID(folder.folderID);
                  setNewTitle("");
                  setExpandedIDs((prev) => {
                    const base = prev === null ? new Set(folders.map((f) => f.folderID)) : new Set(prev);
                    base.add(folder.folderID);
                    return base;
                  });
                }}
              >
                <FolderPlus className="h-3 w-3" />
              </button>
              <button
                type="button"
                className="rounded p-0.5 hover:bg-background"
                title="Rename folder"
                aria-label={`Rename ${folder.folderTitle}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setRenamingID(folder.folderID);
                  setRenameTitle(folder.folderTitle);
                }}
              >
                <Pencil className="h-3 w-3" />
              </button>
              <button
                type="button"
                className="rounded p-0.5 hover:bg-background hover:text-destructive"
                title="Delete folder"
                aria-label={`Delete ${folder.folderTitle}`}
                onClick={(e) => {
                  e.stopPropagation();
                  _handleDelete(folder);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        {isExpanded && (
          <>
            {(childrenByParent.get(folder.folderID) || []).map((child) => _renderFolder(child, depth + 1))}
            {_itemsIn(folder.folderID).map((item) => _renderItemLeaf(item, depth + 1))}
            {creatingParentID === folder.folderID && _renderCreateInput((depth + 1) * 14 + 22)}
          </>
        )}
      </div>
    );
  };

  const unfiledItems = _itemsIn(null);
  const rootFolders = childrenByParent.get(null) || [];
  const isEmpty = !isLoadingItems && folders.length === 0 && items.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col gap-1 border-b border-border/50 p-2">
        <div className="flex items-center gap-1.5 py-1">
          <FolderTreeIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Folders
          </p>
        </div>
        <p className="px-1 py-2 text-xs text-muted-foreground">
          Nothing here yet — create a folder to organize your items.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-0 flex-1 flex-col overflow-y-auto pb-10 ${
        dropTargetID === "__root__" ? "bg-primary/5 ring-1 ring-inset ring-primary/40" : ""
      }`}
      onDragOver={(event) => {
        try {
          const types = event.dataTransfer.types;
          if (!types.includes(DND_ITEM_MIME) && !types.includes(DND_FOLDER_MIME)) return;
        } catch {
          return;
        }
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        setDropTargetID("__root__");
      }}
      onDragLeave={() => setDropTargetID((prev) => (prev === "__root__" ? undefined : prev))}
      onDrop={_onDropRoot}
    >
      <div
        className="sticky top-0 z-10 flex items-center justify-between border-b border-border/50 bg-background px-2 py-1.5"
      >
        <div className="flex items-center gap-1.5">
          <FolderTreeIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Folders
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          square
          className="h-6 w-6"
          title="New folder"
          aria-label="New folder"
          onClick={() => {
            setCreatingParentID(null);
            setNewTitle("");
          }}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {rootFolders.map((folder) => _renderFolder(folder, 0))}
      {unfiledItems.map((item) => _renderItemLeaf(item, 0))}
      {creatingParentID === null && _renderCreateInput(4)}

      {isLoadingItems && (
        <div role="status" className="animate-pulse space-y-2 p-2">
          <div className="h-6 w-full rounded bg-muted" />
          <div className="h-6 w-full rounded bg-muted" />
          <div className="h-6 w-full rounded bg-muted" />
        </div>
      )}
    </div>
  );
};
