/**
 * QueryEditorContext.js
 *
 * Context for dedicated query editors (e.g. Google Sheets query, ExcelCSV query).
 * Provides platform capabilities needed to configure *what data to fetch* from
 * a connected datasource.
 *
 * IMPORTANT: The context DEFINITION lives here in the package so editors can
 * import the hook.  The context PROVIDER lives in the frontend app
 * (dataQueryEditor.jsx) where the real implementations are available.
 *
 * @typedef {Object} QueryEditorContextValue
 *
 * @property {string}   tenantID               — Current tenant ID
 * @property {number}   datasourceID           — The connected datasource instance ID
 * @property {string}   datasourceType         — The datasource type value (e.g. "googlesheets")
 *
 * @property {Object}   apiProxy               — Proxy for making authenticated backend calls
 *                                               through the datasource's credentials
 * @property {Function}  apiProxy.post         — (action: string, params?: object) => Promise<any>
 *                                               Calls POST /datasources/:id/proxy with
 *                                               { action, params }, auto-resolves credentials.
 */

import React, { createContext, useContext } from "react";

export const QueryEditorContext = createContext(null);

/**
 * Consumer hook for dedicated query editors.
 * Must be used inside a <QueryEditorContext.Provider>.
 *
 * @returns {QueryEditorContextValue}
 */
export const useQueryEditorContext = () => {
  const ctx = useContext(QueryEditorContext);
  if (!ctx) {
    throw new Error(
      "useQueryEditorContext() must be used inside a <QueryEditorContext.Provider>. " +
        "This provider is wired in the frontend app's DataQueryEditor component."
    );
  }
  return ctx;
};
