/**
 * Vega drill-down listener wiring (F02/B04 single dispatch route).
 *
 * Pure helper (no React/DOM): given a Vega view, registers mark-click and
 * brush-signal listeners that notify ONLY the direct callbacks. The page
 * slot shapes those callbacks into exactly one fireWidgetEvent call each —
 * this module never dispatches page actions itself, so one gesture can never
 * execute an action chain twice.
 */

/**
 * @param {object} view - Vega view with addEventListener/addSignalListener
 * @param {object} data - Resolved spec (uses data.params for signal wiring)
 * @param {{ onMarkClick?: Function, onBrush?: Function, onSignal?: Function }} callbacks
 */
export const attachVegaDrillListeners = (view, data, callbacks = {}) => {
  if (!view) return;
  const { onMarkClick, onBrush, onSignal } = callbacks;

  try {
    view.addEventListener("click", (event, item) => {
      const datum = item?.datum;
      if (datum) {
        onMarkClick?.({ datum });
      }
    });
  } catch {
    // Older Vega versions may not support addEventListener.
  }

  const params = data?.params;
  if (Array.isArray(params)) {
    for (const param of params) {
      if (param && param.name && typeof view.addSignalListener === "function") {
        view.addSignalListener(param.name, (name, value) => {
          onSignal?.(name, value);
          // Interval brush selection → onBrush for drill/filter chains.
          if (name === "brush") {
            onBrush?.({ value });
          }
        });
      }
    }
  }
};
