/* eslint-disable react/prop-types */
import React, { useMemo } from "react";
import { WIDGETS_MAP } from "@jet-admin/widgets-ui";
import { resolveWidgetData } from "@jet-admin/widgets-logic";
import { ErrorBoundary } from "@jet-admin/ui";
import LayoutRenderer from "../renderer/LayoutRenderer.jsx";
import {
  useAppPageStateTree,
  useWidgetEventHandlers,
  useWidgetState,
} from "../../../../../logic/appPageRuntime";
import { resolveConfig, resolveValue } from "../../../../../logic/evaluationEngine";
import { useApplicationEventFacade } from "../../../../../logic/applicationRuntime/applicationEventBus";

const resolveCompositeInputs = (composite) => {
  const values = composite?.values || {};
  const inputs = {};
  for (const input of composite?.inputs || []) {
    if (!input?.key) continue;
    const raw = Object.prototype.hasOwnProperty.call(values, input.key)
      ? values[input.key]
      : input.default;
    if (raw === undefined) {
      inputs[input.key] = null;
      continue;
    }
    if (input.type === "number") {
      const number = Number(raw);
      inputs[input.key] = Number.isFinite(number) ? number : null;
    } else if (input.type === "boolean") {
      inputs[input.key] =
        raw === true || raw === "true" ? true : raw === false || raw === "false" ? false : null;
    } else if (input.type === "object" || input.type === "array") {
      if (typeof raw === "object") {
        inputs[input.key] = raw;
      } else {
        try {
          inputs[input.key] = JSON.parse(raw);
        } catch {
          inputs[input.key] = input.type === "array" ? [] : {};
        }
      }
    } else {
      inputs[input.key] = raw == null ? "" : String(raw);
    }
  }
  return inputs;
};

const InlineWidget = ({
  node,
  isInRow,
  stateTree,
  compositeInputs,
  emitApplicationEvent,
  subscribeApplicationEvent,
}) => {
  const widget = node.inlineWidget || {};
  const instanceID = `composite:${node.id}`;
  const { widgetState, setWidgetState } = useWidgetState(instanceID);
  const { fireWidgetEvent } = useWidgetEventHandlers(instanceID, widget.widgetConfig);
  const resolvedConfig = useMemo(
    () => resolveConfig(widget.widgetConfig || {}, stateTree),
    [widget.widgetConfig, stateTree]
  );
  const widgetType = widget.widgetType || "text";
  const WidgetComponent = WIDGETS_MAP[widgetType]?.component;
  const data = useMemo(
    () =>
      resolveWidgetData({
        widgetType,
        widgetConfig: resolvedConfig,
        dataSourceResults: stateTree.queries || {},
      }),
    [widgetType, resolvedConfig, stateTree.queries]
  );
  const runtimeEventHandlers = useMemo(() => {
    const events = widget.widgetConfig?.events;
    if (!events || typeof events !== "object") return {};
    const handlers = {};
    for (const eventType of Object.keys(events)) {
      handlers[eventType] = (...inputs) => fireWidgetEvent(eventType, { inputs });
    }
    return handlers;
  }, [widget.widgetConfig?.events, fireWidgetEvent]);

  const style = {
    ...(node.style || {}),
    minWidth: 0,
  };
  if (isInRow) {
    const span = node.span || 12;
    style.gridColumn = `span ${span} / span ${span}`;
  }
  if (node.sizing === "fixed" && node.fixedHeight) {
    style.height = `${node.fixedHeight}px`;
  } else if (node.sizing === "fill") {
    style.height = "100%";
  }

  return (
    <div
      className="flex min-h-0 min-w-0 flex-col overflow-hidden"
      style={style}
      data-composite-inline-widget={widgetType}
    >
      {WidgetComponent ? (
        <ErrorBoundary title="Composite child widget error">
          <WidgetComponent
            widgetID={instanceID}
            instanceID={instanceID}
            widgetTitle={widget.widgetTitle || widgetType}
            widgetType={widgetType}
            widgetConfig={resolvedConfig}
            data={data}
            compositeInputs={compositeInputs}
            fireWidgetEvent={fireWidgetEvent}
            widgetState={widgetState}
            setWidgetState={setWidgetState}
            emitApplicationEvent={emitApplicationEvent}
            subscribeApplicationEvent={subscribeApplicationEvent}
            onWidgetInit={() => {}}
            {...runtimeEventHandlers}
          />
        </ErrorBoundary>
      ) : (
        <div className="flex h-full items-center justify-center rounded border border-dashed border-border p-2 text-[11px] text-muted-foreground">
          Unsupported composite child: {widgetType}
        </div>
      )}
    </div>
  );
};

export default function CompositeWidgetBody({ composite, title = "Composite widget" }) {
  const pageStateTree = useAppPageStateTree();
  const { emitApplicationEvent, subscribeApplicationEvent } = useApplicationEventFacade();
  const compositeInputs = useMemo(
    () => resolveCompositeInputs(composite),
    [composite]
  );
  const stateTree = useMemo(
    () => ({
      ...pageStateTree,
      composite: {
        inputs: compositeInputs,
        outputs: composite?.outputs || [],
      },
    }),
    [pageStateTree, compositeInputs, composite?.outputs]
  );

  if (!composite?.layout) {
    return (
      <div className="flex h-full min-h-[80px] items-center justify-center rounded border border-dashed border-border bg-muted/20 p-3 text-center text-[11px] text-muted-foreground">
        This composite has no captured layout yet. Create it from a canvas
        selection or edit its definition in the widget config.
      </div>
    );
  }

  return (
    <div
      className="flex h-full min-h-0 w-full flex-col overflow-auto"
      aria-label={title}
      data-composite-widget
    >
      <LayoutRenderer
        node={composite.layout}
        mode="view"
        stateTree={stateTree}
        resolveValue={resolveValue}
        renderInlineWidget={(node, meta) => (
          <InlineWidget
            key={node.id}
            node={node}
            isInRow={meta.isInRow}
            stateTree={stateTree}
            compositeInputs={compositeInputs}
            emitApplicationEvent={emitApplicationEvent}
            subscribeApplicationEvent={subscribeApplicationEvent}
          />
        )}
      />
    </div>
  );
}
