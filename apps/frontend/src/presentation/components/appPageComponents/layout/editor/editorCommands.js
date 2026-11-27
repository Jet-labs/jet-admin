/**
 * editorCommands
 *
 * Tiny command bus so UI surfaces (context menu, toolbars) can trigger
 * editor behaviors owned by other bridges without duplicating logic.
 */
const handlers = new Map();

export const registerEditorCommand = (name, handler) => {
  handlers.set(name, handler);
  return () => {
    if (handlers.get(name) === handler) handlers.delete(name);
  };
};

export const runEditorCommand = (name, ...args) => {
  const handler = handlers.get(name);
  if (!handler) return false;
  try {
    handler(...args);
    return true;
  } catch (error) {
    console.error(`[editorCommands] ${name} failed`, error);
    return false;
  }
};
