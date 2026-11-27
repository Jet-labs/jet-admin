/**
 * Application event bus.
 *
 * Application state is durable, value-based shared state. The event bus is a
 * transient channel for one-shot commands and broadcasts between pages/widgets
 * (refresh a panel, open a dialog, announce a save) that should not live in
 * application state or survive a reload.
 */
import { createContext, useContext, useEffect, useMemo } from "react";
import { isSafeApplicationJSON } from "@jet-admin/application-contracts";

export const APPLICATION_EVENT_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9_.:-]{0,63}$/;
export const APPLICATION_EVENT_MAX_PAYLOAD_BYTES = 64 * 1024;

export function validateApplicationEvent(name, payload) {
  if (typeof name !== "string" || !APPLICATION_EVENT_NAME_PATTERN.test(name)) {
    throw Object.assign(new Error("Invalid application event name."), {
      code: "INVALID_APPLICATION_EVENT_NAME",
    });
  }
  const value = payload === undefined ? null : payload;
  if (!isSafeApplicationJSON(value)) {
    throw Object.assign(new Error("Application event payload must be safe JSON."), {
      code: "INVALID_APPLICATION_EVENT_PAYLOAD",
    });
  }
  if (
    new TextEncoder().encode(JSON.stringify(value)).length >
    APPLICATION_EVENT_MAX_PAYLOAD_BYTES
  ) {
    throw Object.assign(new Error("Application event payload is too large."), {
      code: "APPLICATION_EVENT_PAYLOAD_TOO_LARGE",
    });
  }
  return value;
}

export function createApplicationEventBus() {
  const listeners = new Map();
  let disposed = false;

  return {
    emit(name, payload) {
      if (disposed) return 0;
      let value;
      try {
        value = validateApplicationEvent(name, payload);
      } catch (error) {
        console.warn("[applicationEvents] ignored invalid event:", error.message);
        return 0;
      }
      const handlers = listeners.get(name);
      if (!handlers || handlers.size === 0) return 0;
      let delivered = 0;
      for (const handler of Array.from(handlers)) {
        try {
          handler(value);
          delivered += 1;
        } catch (error) {
          console.error(`[applicationEvents] handler for "${name}" failed`, error);
        }
      }
      return delivered;
    },
    subscribe(name, handler) {
      if (typeof handler !== "function") return () => {};
      const normalizedName = String(name || "");
      if (!APPLICATION_EVENT_NAME_PATTERN.test(normalizedName)) return () => {};
      let handlers = listeners.get(normalizedName);
      if (!handlers) {
        handlers = new Set();
        listeners.set(normalizedName, handlers);
      }
      handlers.add(handler);
      return () => {
        handlers.delete(handler);
        if (handlers.size === 0) listeners.delete(normalizedName);
      };
    },
    dispose() {
      disposed = true;
      listeners.clear();
    },
  };
}

export const ApplicationEventBusContext = createContext(null);

export function useApplicationEventBus() {
  return useContext(ApplicationEventBusContext);
}

/** Subscribe a component to one application event name. */
export function useApplicationEvent(name, handler) {
  const bus = useApplicationEventBus();
  useEffect(() => {
    if (!bus || !name || typeof handler !== "function") return undefined;
    return bus.subscribe(name, handler);
  }, [bus, name, handler]);
}

/** Stable emit/subscribe facade for widget props. */
export function useApplicationEventFacade() {
  const bus = useApplicationEventBus();
  return useMemo(() => {
    if (!bus) {
      return {
        emitApplicationEvent: () => 0,
        subscribeApplicationEvent: () => () => {},
      };
    }
    return {
      emitApplicationEvent: (name, payload) => bus.emit(name, payload),
      subscribeApplicationEvent: (name, handler) => bus.subscribe(name, handler),
    };
  }, [bus]);
}
