import React from 'react';

export const FileUploadContext = React.createContext({
  uploadFile: async (file) => {
    throw new Error("No upload handler provided");
  }
});
