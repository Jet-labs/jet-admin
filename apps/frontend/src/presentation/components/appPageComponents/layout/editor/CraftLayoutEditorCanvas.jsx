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
import EditorHeader from "./EditorHeader.jsx";
import CraftSettingsPanel from "./CraftSettingsPanel.jsx";
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
  tenantID,
  widgets,
  setWidgets,
  onEditWidget,
}) {
  const [previewMode, setPreviewMode] = useState(false);

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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      <CraftEditorContext.Provider value={{ renderWidget: stableRenderWidget, previewMode }}>
        <Editor
          resolver={RESOLVER}
          enabled={true}
        >
          <EditorSyncBridge onChangeLayout={stableOnChangeLayout} />
          <EditorHeader previewMode={previewMode} setPreviewMode={setPreviewMode} />

          <div className="craft-editor-workspace">
            <div
              id="craft-canvas-root"
              className="craft-canvas-area scrollbar-thin"
            >
              <Html5DropBridge widgets={widgets} setWidgets={setWidgets} />

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
            </div>

            {!previewMode && (
              <CraftSettingsPanel
                onChangeLayout={stableOnChangeLayout}
                widgets={widgets}
                setWidgets={setWidgets}
                onEditWidget={onEditWidget}
              />
            )}
          </div>
        </Editor>
      </CraftEditorContext.Provider>
    </div>
  );
}
