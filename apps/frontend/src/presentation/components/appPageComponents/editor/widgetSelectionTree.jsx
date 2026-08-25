import React, { useState } from "react";
import { ChevronDown, ChevronRight, Folder as FolderIcon } from "lucide-react";
import PropTypes from "prop-types";
import { useFolders } from "../../../../logic/hooks/useFolders";

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

/**
 * Folder-aware selection tree for pickers/palettes (used by the app page
 * editor's widget list). Unlike EntityFolderTree this is read-style: folders
 * organize the items, but there is no create/rename/delete/move chrome —
 * the only interactions are expand/collapse and dragging items out via
 * onItemDragStart.
 *
 * When the tenant has no folders at all, the tree renders as a flat list so
 * small setups don't pay for the extra chrome.
 */
export const WidgetSelectionTree = ({
  tenantID,
  entityType = "widget",
  items = [],
  renderItemRow,
  onItemDragStart,
}) => {
  WidgetSelectionTree.propTypes = {
    tenantID: PropTypes.string.isRequired,
    entityType: PropTypes.oneOf([
      "widget",
      "workflow",
      "dataQuery",
      "cronJob",
      "appPage",
      "listener",
    ]),
    items: PropTypes.array,
    renderItemRow: PropTypes.func.isRequired,
    onItemDragStart: PropTypes.func,
  };

  const idField = ID_FIELD_BY_TYPE[entityType];
  const titleField = TITLE_FIELD_BY_TYPE[entityType];

  const { folders = [] } = useFolders(tenantID, entityType);
  const [collapsedIDs, setCollapsedIDs] = useState(() => new Set());

  const _toggleCollapse = (folderID) =>
    setCollapsedIDs((prev) => {
      const next = new Set(prev);
      if (next.has(folderID)) next.delete(folderID);
      else next.add(folderID);
      return next;
    });

  const childrenOf = (parentFolderID) =>
    folders.filter((f) => (f.parentFolderID || null) === parentFolderID);

  const itemsIn = (folderID) =>
    items
      .filter((item) => (item.folderID || null) === folderID)
      .sort((a, b) =>
        String(a[titleField] || "").localeCompare(String(b[titleField] || ""))
      );

  const sortedFolders = (parentFolderID) =>
    childrenOf(parentFolderID).sort((a, b) =>
      String(a.folderTitle || "").localeCompare(String(b.folderTitle || ""))
    );

  const _renderItemLeaf = (item) => (
    <div
      key={item[idField]}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData(
          "application/x-jet-entity-item",
          JSON.stringify({
            kind: "item",
            entityType,
            id: item[idField],
            currentFolderID: item.folderID || null,
          })
        );
        event.dataTransfer.effectAllowed = "move";
        if (onItemDragStart) onItemDragStart(event, item);
      }}
    >
      {renderItemRow(item)}
    </div>
  );

  const _renderFolder = (folder) => {
    const folderItems = itemsIn(folder.folderID);
    const childFolders = sortedFolders(folder.folderID);
    const hasChildren = childFolders.length > 0 || folderItems.length > 0;
    const isExpanded = !collapsedIDs.has(folder.folderID);

    return (
      <div key={folder.folderID}>
        <div
          role="treeitem"
          aria-expanded={hasChildren ? isExpanded : undefined}
          tabIndex={0}
          onClick={() => hasChildren && _toggleCollapse(folder.folderID)}
          onKeyDown={(e) => e.key === "Enter" && hasChildren && _toggleCollapse(folder.folderID)}
          className={`flex w-full select-none items-center gap-1.5 rounded px-1 py-1.5 text-sm transition-colors ${
            hasChildren ? "cursor-pointer hover:bg-muted" : ""
          }`}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            )
          ) : (
            <span className="h-3.5 w-3.5 shrink-0" />
          )}
          <FolderIcon className="h-4 w-4 shrink-0 text-muted-foreground/80" />
          <span className="min-w-0 flex-1 truncate font-medium text-foreground">
            {folder.folderTitle}
          </span>
          {folderItems.length > 0 && (
            <span className="shrink-0 rounded-full bg-muted px-1.5 py-px text-[10px] font-medium text-muted-foreground">
              {folderItems.length}
            </span>
          )}
        </div>

        {isExpanded && (childFolders.length > 0 || folderItems.length > 0) && (
          <div className="ml-3 flex flex-col gap-2 border-l border-border/50 py-1 pl-1">
            {childFolders.map(_renderFolder)}
            {folderItems.map(_renderItemLeaf)}
          </div>
        )}
      </div>
    );
  };

  const rootFolders = sortedFolders(null);
  const unfiledItems = itemsIn(null);

  if (rootFolders.length === 0 && unfiledItems.length === 0) return null;

  // No folder organization yet → flat list, no chrome.
  if (rootFolders.length === 0) {
    return <div className="flex flex-col gap-2">{unfiledItems.map(_renderItemLeaf)}</div>;
  }

  return (
    <div role="tree" aria-label={`${entityType} folders`} className="flex flex-col gap-2">
      {rootFolders.map(_renderFolder)}
      {unfiledItems.map(_renderItemLeaf)}
    </div>
  );
};
