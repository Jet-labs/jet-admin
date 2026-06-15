import { createContext } from "react";

export const WidgetEditorContext = createContext({
  tenantID: null,
  fileUpload: {
    uploadFile: async (file) => {
      throw new Error("uploadFile is not implemented");
    },
  },
  apiProxy: {
    post: async (action, params) => {
      throw new Error("apiProxy.post is not implemented");
    },
  },
});
