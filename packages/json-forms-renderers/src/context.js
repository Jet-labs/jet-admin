import React from 'react';

export const FileUploadContext = React.createContext({
  uploadFile: async (file) => {
    throw new Error("No upload handler provided");
  }
});

export const OAuthContext = React.createContext({
  startOAuth: () => {
    throw new Error("No OAuth handler provided");
  },
  loading: false
});
