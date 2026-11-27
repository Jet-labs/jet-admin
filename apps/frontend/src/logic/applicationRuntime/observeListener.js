/** Observe persisted events only; reconnect/poll never starts an integration. */
export function observeApplicationListener({ readEvents, onEvent, onError, pollInterval = 2000 }) {
  let disposed = false, timer = null, cursor;
  let controller = null;
  const disconnect = () => { disposed = true; clearTimeout(timer); controller?.abort(); };
  const poll = async () => {
    if (disposed) return;
    controller = new AbortController();
    let delay = pollInterval;
    try {
      const result = await readEvents({ cursor, signal: controller.signal });
      if (disposed) return;
      for (const event of result.events || []) onEvent?.(event);
      cursor = result.cursor;
      if (result.hasMore) delay = 0;
    } catch (error) {
      if (disposed) return;
      onError?.(error);
      if ([400, 401, 403, 404, 409, 410, 413].includes(error.status)) { disconnect(); return; }
    }
    if (!disposed) timer = setTimeout(poll, delay);
  };
  void poll();
  return { disconnect };
}
