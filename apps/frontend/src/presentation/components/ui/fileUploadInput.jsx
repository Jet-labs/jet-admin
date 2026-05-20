import React, { useRef } from "react";
import { CONSTANTS } from "../../../constants";
import { Upload } from "lucide-react";
import PropTypes from "prop-types";
import { Input } from "@jet-admin/ui";


export const FileUpload = ({
  title,
  isUploadingLogo,
  uploadError,
  onLogoUpload,
}) => {
  FileUpload.propTypes = {
    title: PropTypes.string.isRequired,
    isUploadingLogo: PropTypes.bool.isRequired,
    uploadError: PropTypes.bool.isRequired,
    onLogoUpload: PropTypes.func.isRequired,
  };
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    onLogoUpload(event);
  };

  return (
    <div className="space-y-2">
      <label
        htmlFor="logo"
        className="block text-sm font-medium text-foreground"
      >
        {title}
      </label>

      <div className="relative">
        {/* Hidden file input */}
        <Input
          ref={fileInputRef}
          type="file"
          id="logo"
          name="logo"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploadingLogo}
          className="hidden"
        />

        {/* Custom button */}
        <div
          className={`
            flex items-center gap-2 w-full cursor-pointer
            ${
              uploadError
                ? "border-red-400 bg-red-950/40 hover:bg-red-950/40"
                : "border-border bg-background hover:bg-muted"
            }
            border rounded-sm px-2 py-2 transition-colors duration-150
            ${isUploadingLogo ? "opacity-50 cursor-not-allowed" : ""}
          `}
          onClick={!isUploadingLogo ? handleButtonClick : undefined}
        >
          <Upload className="w-5 h-5 text-foreground" />
          <span className="text-sm text-foreground font-medium">
            {isUploadingLogo ? "Uploading..." : "Choose File"}
          </span>

          {/* Show selected file name */}
          {fileInputRef.current?.files?.[0] && (
            <span className="ml-2 text-sm text-foreground">
              {fileInputRef.current.files[0].name}
            </span>
          )}
        </div>
      </div>

      {uploadError && (
        <p className="mt-1 text-sm font-medium text-red-600">
          {CONSTANTS.STRINGS.ADD_TENANT_LOGO_UPLOAD_ERROR_MESSAGE}
        </p>
      )}
    </div>
  );
};
