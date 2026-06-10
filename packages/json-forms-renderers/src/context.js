import React from 'react';

export const FileUploadContext = React.createContext({
  uploadFile: async (file) => {
    console.warn("No FileUploadContext provider. Please wrap your application in a FileUploadProvider.");
    return null;
  }
});
FileUploadContext.displayName = "FileUploadContext";

export const OAuthContext = React.createContext({
  startOAuth: () => {
    console.warn("No OAuthContext provider. Please wrap your application in an OAuthProvider.");
  },
  loading: false
});
OAuthContext.displayName = "OAuthContext";
