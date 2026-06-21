import React, { useRef, useState } from "react";
import { CONSTANTS } from "../../../constants";
import { Upload } from "lucide-react";
import PropTypes from "prop-types";
import { uploadTenantLogoAPI } from "../../../data/apis/tenant";
import { displayError, displaySuccess } from "../../../utils/notification";

import { Spinner, Input } from "@jet-admin/ui";
export const LogoUpload = ({ onLogoUpload }) => {
  LogoUpload.propTypes = {
    onLogoUpload: PropTypes.func.isRequired,
  };
  
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsUploadingLogo(true);
      setUploadError(null);
      const result = await uploadTenantLogoAPI({ file });
      displaySuccess(CONSTANTS.STRINGS.TENANT_EDITOR_LOGO_UPLOAD_SUCCESS_TOAST);
      onLogoUpload(result.url);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(error);
      displayError(CONSTANTS.STRINGS.TENANT_EDITOR_LOGO_UPLOAD_ERROR_TOAST);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative flex flex-row justify-start items-center">
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
            flex items-center justify-center cursor-pointer  !h-12 !w-12
            ${
              uploadError
                ? "border-red-400 bg-red-950/40 hover:bg-red-950/40"
                : "border-border bg-muted hover:bg-foreground/10"
            }
                rounded
            transition-colors duration-150
            ${isUploadingLogo ? "opacity-50 cursor-not-allowed" : ""}
          `}
          onClick={!isUploadingLogo ? handleButtonClick : undefined}
        >
          {isUploadingLogo ? (
            <Spinner size={16} className="text-primary" />
          ) : (
              <Upload className="w-5 h-5 text-foreground" />
          )}

          {/* Show selected file name */}
        </div>
        {fileInputRef.current?.files?.[0] && (
          <span className="ml-2 text-sm text-foreground">
            {fileInputRef.current.files[0].name}
          </span>
        )}
      </div>

      {uploadError && (
        <p className="mt-1 text-sm font-medium text-red-600">
          {String(uploadError) ||
            CONSTANTS.STRINGS.ADD_TENANT_LOGO_UPLOAD_ERROR_MESSAGE}
        </p>
      )}
    </div>
  );
};
