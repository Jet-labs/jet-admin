import React, { useRef } from "react";
import { CONSTANTS } from "../../../constants";
import { Upload } from "lucide-react";
import PropTypes from "prop-types";

import { Spinner, Input } from "@jet-admin/ui";
export const LogoUpload = ({ isUploadingLogo, uploadError, onLogoUpload }) => {
  LogoUpload.propTypes = {
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
  console.log({ uploadError: uploadError });

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
                : "border-brand-border bg-brand-border-dark hover:bg-brand-black"
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
              <Upload className="w-5 h-5 text-brand-text-primary" />
          )}

          {/* Show selected file name */}
        </div>
        {fileInputRef.current?.files?.[0] && (
          <span className="ml-2 text-sm text-brand-text-primary">
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
