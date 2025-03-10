import { useState, useCallback } from "react";
import { supabase } from "../../config/supabase";

/**
 * Custom hook for handling file uploads to Supabase Storage
 * @param {Object} config - Configuration object
 * @param {string} config.bucket - Storage bucket name (defaults to 'public')
 * @param {string} config.directory - Storage directory path within the bucket
 * @param {string[]} config.allowedTypes - Array of allowed MIME types
 * @param {number} config.maxSizeMB - Maximum file size in megabytes
 * @param {Function} config.onSuccess - Callback function on successful upload
 * @param {Function} config.onError - Callback function on upload error
 * @param {boolean} config.generateUniqueName - Whether to generate a unique name for the file
 * @param {boolean} config.upsert - Whether to overwrite existing files with the same name
 * @returns {Object} Upload handlers and state
 */
const useSupabaseUpload = ({
  bucket = "public",
  directory = "uploads",
  allowedTypes = [],
  maxSizeMB = 5,
  onSuccess = () => {},
  onError = () => {},
  generateUniqueName = true,
  upsert = false,
} = {}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);

  const validateFile = useCallback(
    (file) => {
      // Check if file exists
      if (!file) {
        throw new Error("No file provided");
      }

      // Check file type if allowedTypes is specified
      if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        throw new Error(
          `Invalid file type. Allowed types are: ${allowedTypes.join(", ")}`
        );
      }

      // Check file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
      }
    },
    [allowedTypes, maxSizeMB]
  );

  const generateFileName = useCallback(
    (file) => {
      if (!generateUniqueName) {
        return file.name;
      }

      const extension = file.name.split(".").pop();
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      return `${timestamp}-${randomString}.${extension}`;
    },
    [generateUniqueName]
  );

  const getPublicUrl = useCallback(
    (filePath) => {
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

      return data.publicUrl;
    },
    [bucket]
  );

  const uploadFile = useCallback(
    async (file, customFileName = null) => {
      try {
        setIsUploading(true);
        setUploadProgress(0);
        setUploadError(null);

        // Validate file
        validateFile(file);

        // Generate file path
        const fileName = customFileName || generateFileName(file);
        const filePath = `${directory.replace(/^\/+|\/+$/g, "")}/${fileName}`;

        // Upload file to Supabase
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            upsert,
            contentType: file.type,
            cacheControl: "3600",
          });

        if (error) {
          throw error;
        }

        // Get public URL
        const publicUrl = getPublicUrl(filePath);

        const result = {
          url: publicUrl,
          path: filePath,
          fileName,
          fileType: file.type,
          fileSize: file.size,
          bucket,
          fullPath: `${bucket}/${filePath}`,
        };

        setUploadProgress(100);
        onSuccess(result);

        return result;
      } catch (error) {
        const errorMessage = error.message || "Upload failed";
        setUploadError(errorMessage);
        onError(error);
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [
      bucket,
      directory,
      validateFile,
      generateFileName,
      getPublicUrl,
      upsert,
      onSuccess,
      onError,
    ]
  );

  const uploadMultipleFiles = useCallback(
    async (files) => {
      try {
        const uploadPromises = Array.from(files).map((file) =>
          uploadFile(file)
        );
        return await Promise.all(uploadPromises);
      } catch (error) {
        setUploadError(error.message);
        onError(error);
        throw error;
      }
    },
    [uploadFile, onError]
  );

  const deleteFile = useCallback(
    async (filePath) => {
      try {
        const { error } = await supabase.storage
          .from(bucket)
          .remove([filePath]);

        if (error) {
          throw error;
        }

        return true;
      } catch (error) {
        onError(error);
        throw error;
      }
    },
    [bucket, onError]
  );

  const resetUploadState = useCallback(() => {
    setIsUploading(false);
    setUploadProgress(0);
    setUploadError(null);
  }, []);

  return {
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
    isUploading,
    uploadProgress,
    uploadError,
    resetUploadState,
    getPublicUrl,
  };
};

export default useSupabaseUpload;
