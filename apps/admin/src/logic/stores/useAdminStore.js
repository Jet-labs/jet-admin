import { create } from "zustand";

/**
 * Operator session state for the admin console.
 *
 * The operator lives in tblOperators — a separate identity realm from
 * end-user Firebase auth. Roles, permissions and the widget library are
 * deployment-global, so there is no tenant context in this console.
 *
 * Persisted to localStorage under the "jet-admin.*" namespace.
 */

const TOKEN_KEY = "jet-admin.operatorToken";
const OPERATOR_KEY = "jet-admin.operator";

const readStorage = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (key, value) => {
  try {
    if (value === null || value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* storage unavailable — session-only */
  }
};

const readStoredOperator = () => {
  const raw = readStorage(OPERATOR_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const useAdminStore = create((set) => ({
  operatorToken: readStorage(TOKEN_KEY),
  operator: readStoredOperator(),

  setSession: ({ token, operator }) => {
    writeStorage(TOKEN_KEY, token);
    writeStorage(OPERATOR_KEY, operator ? JSON.stringify(operator) : null);
    set({ operatorToken: token || null, operator: operator || null });
  },

  clearSession: () => {
    writeStorage(TOKEN_KEY, null);
    writeStorage(OPERATOR_KEY, null);
    set({ operatorToken: null, operator: null });
  },
}));
