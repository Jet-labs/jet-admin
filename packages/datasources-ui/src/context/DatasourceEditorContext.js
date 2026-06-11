/**
 * DatasourceEditorContext.js
 *
 * Context for dedicated datasource editors (e.g. Google Sheets, Firestore).
 * Provides platform capabilities needed to configure *how to connect* to a datasource.
 *
 * IMPORTANT: The context DEFINITION lives here in the package so editors can
 * import the hook.  The context PROVIDER lives in the frontend app
 * (datasourceEditor.jsx) where the real implementations are available.
 *
 * @typedef {Object} DatasourceEditorContextValue
 *
 * @property {string}   tenantID               — Current tenant ID
 *
 * @property {Object}   oauth                  — OAuth helpers
 * @property {Function}  oauth.startOAuth      — (onSuccess: (credID) => void, onFailure?: (err) => void) => void
 * @property {boolean}   oauth.loading         — Whether an OAuth flow is currently in progress
 *
 * @property {Object}   fileUpload             — File upload helpers
 * @property {Function}  fileUpload.uploadFile — (file: File) => Promise<{ fileUrl, filePath, fileName, fileSize, fileType }>
 */

import React, { createContext, useContext } from "react";

export const DatasourceEditorContext = createContext(null);

/**
 * Consumer hook for dedicated datasource editors.
 * Must be used inside a <DatasourceEditorContext.Provider>.
 *
 * @returns {DatasourceEditorContextValue}
 */
export const useDatasourceEditorContext = () => {
  const ctx = useContext(DatasourceEditorContext);
  if (!ctx) {
    throw new Error(
      "useDatasourceEditorContext() must be used inside a <DatasourceEditorContext.Provider>. " +
        "This provider is wired in the frontend app's DatasourceEditor component."
    );
  }
  return ctx;
};
