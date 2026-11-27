/**
 * canvasDragStore
 *
 * Small external store for pointer-driven drags that start in the widget
 * palette and end on the Craft canvas. Keeping the transient drag state
 * outside React means pointer moves do not re-render the page tree.
 */

let dragState = null;
let ghostEl = null;
let listeners = new Set();
let cleanup = null;
let dragStart = null;

const notify = (phase, event) => {
  for (const listener of listeners) {
    try {
      listener({ phase, event, state: dragState });
    } catch (error) {
      // A broken drop handler must not leave the document stuck in drag mode.
      console.error("[canvasDragStore] listener failed", error);
    }
  }
};

const positionGhost = (x, y) => {
  if (!ghostEl) return;
  ghostEl.style.transform = `translate3d(${x + 14}px, ${y + 14}px, 0)`;
};

const ensureGhost = (label) => {
  if (ghostEl) return;
  ghostEl = document.createElement("div");
  ghostEl.className = "canvas-drag-ghost";
  ghostEl.setAttribute("aria-hidden", "true");
  ghostEl.textContent = label || "Move";
  document.body.appendChild(ghostEl);
};

const removeGhost = () => {
  if (!ghostEl) return;
  ghostEl.remove();
  ghostEl = null;
};

const finish = (phase, event) => {
  if (!dragState) return;
  const state = { ...dragState, active: false };
  dragState = state;
  notify(phase, event);
  cleanup?.();
  cleanup = null;
  dragState = null;
  dragStart = null;
  removeGhost();
  document.body.classList.remove("canvas-dragging");
};

const installListeners = () => {
  const onMove = (event) => {
    if (!dragState) return;
    dragState = { ...dragState, x: event.clientX, y: event.clientY };
    positionGhost(event.clientX, event.clientY);
    notify("move", event);
  };

  const onUp = (event) => {
    if (!dragState) return;
    finish("end", event);
  };

  const onCancel = (event) => {
    finish("cancel", event);
  };

  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      finish("cancel", event);
    }
  };

  window.addEventListener("pointermove", onMove, true);
  window.addEventListener("pointerup", onUp, true);
  window.addEventListener("pointercancel", onCancel, true);
  window.addEventListener("keydown", onKeyDown, true);

  cleanup = () => {
    window.removeEventListener("pointermove", onMove, true);
    window.removeEventListener("pointerup", onUp, true);
    window.removeEventListener("pointercancel", onCancel, true);
    window.removeEventListener("keydown", onKeyDown, true);
  };
};

export const subscribeCanvasDrag = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getCanvasDragState = () => dragState;

export const beginCanvasDrag = ({ payload, label, event }) => {
  if (!payload || dragState) return false;
  if (event.button !== 0 && event.pointerType !== "touch") return false;
  event.preventDefault();
  event.stopPropagation();

  dragStart = { x: event.clientX, y: event.clientY };
  dragState = {
    payload,
    label: label || "Move",
    x: event.clientX,
    y: event.clientY,
    active: true,
    pointerType: event.pointerType || "mouse",
  };

  try {
    event.currentTarget?.setPointerCapture?.(event.pointerId);
  } catch {
    /* pointer capture may be unavailable */
  }

  ensureGhost(dragState.label);
  positionGhost(dragState.x, dragState.y);
  document.body.classList.add("canvas-dragging");
  installListeners();
  notify("start", event);
  return true;
};

export const cancelCanvasDrag = () => {
  if (!dragState) return;
  finish("cancel", null);
};

export const hasCanvasDragMoved = (threshold = 4) => {
  if (!dragState || !dragStart) return false;
  return Math.hypot(dragState.x - dragStart.x, dragState.y - dragStart.y) >= threshold;
};
