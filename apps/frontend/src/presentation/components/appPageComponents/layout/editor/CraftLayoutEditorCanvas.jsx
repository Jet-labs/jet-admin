/**
 * CraftLayoutEditorCanvas.jsx
 *
 * Full-featured page editor powered by @craftjs/core.
 * Uses a workspace split layout:
 *  - Left/Center: rendering canvas
 *  - Right: sidebar with Settings/Properties and Layers tree
 *  - Top Bar: Undo/Redo + Design/Preview mode toggle
 *
 * Fixes applied:
 *  - Extracted Html5DropBridge, EditorSyncBridge, EditorHeader into separate modules.
 *  - No feature flag — this is the only editor.
 *  - craftInitialState computed once on mount (no external sync to avoid
 *    feedback loops). The Craft editor has its own undo/redo (Ctrl+Z/Y).
 */
import React, { useEffect, useCallback, useRef, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Editor, Frame, Element } from "@craftjs/core";
import { treeToCraft } from "../engine/craftAdapter.js";
import { CanvasColumn } from "../components/CanvasColumn.jsx";
import { CanvasRow } from "../components/CanvasRow.jsx";
import { CanvasContainer } from "../components/CanvasContainer.jsx";
import { CanvasStack } from "../components/CanvasStack.jsx";
import { CanvasZStack } from "../components/CanvasZStack.jsx";
import { CanvasWidgetSlot } from "../components/CanvasWidgetSlot.jsx";
import { CraftEditorContext } from "../components/CraftEditorContext.js";
import Html5DropBridge from "./Html5DropBridge.jsx";
import EditorSyncBridge from "./EditorSyncBridge.jsx";
import EditorClipboardBridge from "./EditorClipboardBridge.jsx";
import EditorGroupingBridge from "./EditorGroupingBridge.jsx";
import EditorHeader from "./EditorHeader.jsx";
import CraftSettingsPanel from "./CraftSettingsPanel.jsx";
import CanvasViewport from "./CanvasViewport.jsx";
import CanvasShortcuts from "./CanvasShortcuts.jsx";
import CanvasSelectionLayer from "./CanvasSelectionLayer.jsx";
import CanvasContextMenu from "./CanvasContextMenu.jsx";
import CanvasBreadcrumb from "./CanvasBreadcrumb.jsx";
import { LayoutViewportProvider } from "../engine/LayoutViewportContext.jsx";
import "../renderer/layout.css";

const RESOLVER = {
  CanvasColumn,
  CanvasRow,
  CanvasContainer,
  CanvasStack,
  CanvasZStack,
  CanvasWidgetSlot,
};

export default function CraftLayoutEditorCanvas({
  layout,
  onChangeLayout,
  renderWidget,
  widgets,
  setWidgets,
  onEditWidget,
  editorLiveStateTree,
  saveState = null,
  tenantID = null,
}) {
  const [previewMode, setPreviewMode] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(1120);

  // Convert current layout tree → Craft JSON string for seeding frame.
  // Computed ONCE on mount. The editor does not pick up external layout
  // changes after mount — this prevents feedback loops where syncing out
  // triggers a re-sync. The Craft editor has its own undo/redo instead.
  const craftInitialState = useMemo(() => {
    if (!layout) return null;
    try {
      return treeToCraft(layout);
    } catch (err) {
      console.error("[CraftEditor] Failed to convert layout to Craft format:", err);
      return null;
    }
  }, []);

  const renderWidgetRef = useRef(renderWidget);
  useEffect(() => { renderWidgetRef.current = renderWidget; }, [renderWidget]);

  const stableRenderWidget = useCallback((...args) => renderWidgetRef.current?.(...args), []);

  // Store onChangeLayout in a ref so EditorSyncBridge's sync callback
  // doesn't change identity on every parent re-render (which would
  // retrigger the debounced sync effect and cause infinite loops).
  const onChangeLayoutRef = useRef(onChangeLayout);
  useEffect(() => { onChangeLayoutRef.current = onChangeLayout; }, [onChangeLayout]);

  const stableOnChangeLayout = useCallback((treeRoot) => {
    onChangeLayoutRef.current?.(treeRoot);
  }, []);

  return (
    <div className="craft-editor-root">
      <CraftEditorContext.Provider value={{ renderWidget: stableRenderWidget, previewMode, editorLiveStateTree }}>
        <Editor
          resolver={RESOLVER}
          enabled={true}
        >
          <EditorSyncBridge onChangeLayout={stableOnChangeLayout} />
          <EditorClipboardBridge />
          <EditorGroupingBridge />
          <CanvasShortcuts setWidgets={setWidgets} />
          <EditorHeader
            previewMode={previewMode}
            setPreviewMode={setPreviewMode}
            saveState={saveState}
            tenantID={tenantID}
          />

          <LayoutViewportProvider width={canvasWidth}>
          <div className="craft-editor-workspace">
            <CanvasViewport
              canvasWidth={canvasWidth}
              onCanvasWidthChange={setCanvasWidth}
              overlay={
                <>
                  <Html5DropBridge widgets={widgets} setWidgets={setWidgets} />
                  <CanvasBreadcrumb />
                  <CanvasSelectionLayer setWidgets={setWidgets} />
                </>
              }
            >
              {craftInitialState ? (
                <Frame data={craftInitialState}>
                  <Element is={CanvasColumn} canvas />
                </Frame>
              ) : (
                <Frame>
                  <Element is={CanvasColumn} canvas>
                    <Element is={CanvasRow} canvas sizing="auto" />
                  </Element>
                </Frame>
              )}
            </CanvasViewport>

            {!previewMode && (
              <CraftSettingsPanel
                onChangeLayout={stableOnChangeLayout}
                widgets={widgets}
                setWidgets={setWidgets}
                onEditWidget={onEditWidget}
                editorLiveStateTree={editorLiveStateTree}
              />
            )}
          </div>
          </LayoutViewportProvider>
          <CanvasContextMenu setWidgets={setWidgets} />
        </Editor>
      </CraftEditorContext.Provider>
    </div>
  );
}

CraftLayoutEditorCanvas.propTypes = {
  layout: PropTypes.object,
  onChangeLayout: PropTypes.func,
  renderWidget: PropTypes.func,
  widgets: PropTypes.array,
  setWidgets: PropTypes.func,
  onEditWidget: PropTypes.func,
  editorLiveStateTree: PropTypes.object,
  tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  saveState: PropTypes.shape({
    isDirty: PropTypes.bool,
    changeCount: PropTypes.number,
    isSaving: PropTypes.bool,
    onSave: PropTypes.func,
  }),
};
