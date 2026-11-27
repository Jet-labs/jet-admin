import { createApplicationEventBus } from "../src/logic/applicationRuntime/applicationEventBus";

describe("application event bus", () => {
  it("delivers transient events to current subscribers", () => {
    const bus = createApplicationEventBus();
    const received = [];
    const unsubscribe = bus.subscribe("customer:selected", (payload) => {
      received.push(payload);
    });
    expect(bus.emit("customer:selected", { id: "c1" })).toBe(1);
    expect(received).toEqual([{ id: "c1" }]);
    unsubscribe();
    expect(bus.emit("customer:selected", { id: "c2" })).toBe(0);
    bus.dispose();
  });

  it("rejects invalid event names and unsafe payloads", () => {
    const bus = createApplicationEventBus();
    const received = [];
    bus.subscribe("valid", (payload) => received.push(payload));
    expect(bus.emit("invalid event", {})).toBe(0);
    expect(bus.emit("valid", { nested: { ok: true } })).toBe(1);
    expect(received).toHaveLength(1);
    bus.dispose();
  });

  it("does not deliver after disposal", () => {
    const bus = createApplicationEventBus();
    const handler = jest.fn();
    bus.subscribe("test", handler);
    bus.dispose();
    bus.emit("test", {});
    expect(handler).not.toHaveBeenCalled();
  });
});
