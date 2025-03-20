import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useCallback, useState } from "react";
import { firebaseStorage } from "../../config/firebase";

/**
 * Custom hook for handling file uploads to Firebase Storage
 * @param {Object} config - Configuration object
 * @param {string} config.directory - Storage directory path
 * @param {string[]} config.allowedTypes - Array of allowed MIME types
 * @param {number} config.maxSizeMB - Maximum file size in megabytes
 * @param {Function} config.onSuccess - Callback function on successful upload
 * @param {Function} config.onError - Callback function on upload error
 * @param {boolean} config.generateUniqueName - Whether to generate a unique name for the file
 * @returns {Object} Upload handlers and state
 */
export const useFirebaseUpload = ({
  directory = "uploads",
  allowedTypes = [],
  maxSizeMB = 5,
  onSuccess = () => {},
  onError = () => {},
  generateUniqueName = true,
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

        // Get storage reference
        const firebaseStorageRef = ref(firebaseStorage, filePath);

        // Create upload task
        const uploadTask = await uploadBytes(firebaseStorageRef, file);

        // Get download URL
        const downloadURL = await getDownloadURL(uploadTask.ref);

        setUploadProgress(100);
        onSuccess({
          url: downloadURL,
          path: filePath,
          fileName,
          fileType: file.type,
          fileSize: file.size,
        });

        return {
          url: downloadURL,
          path: filePath,
          fileName,
          fileType: file.type,
          fileSize: file.size,
        };
      } catch (error) {
        const errorMessage = error.message || "Upload failed";
        setUploadError(errorMessage);
        onError(error);
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [directory, validateFile, generateFileName, onSuccess, onError]
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

  const resetUploadState = useCallback(() => {
    setIsUploading(false);
    setUploadProgress(0);
    setUploadError(null);
  }, []);

  return {
    uploadFile,
    uploadMultipleFiles,
    isUploading,
    uploadProgress,
    uploadError,
    resetUploadState,
  };
};
