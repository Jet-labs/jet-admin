import React, { useRef } from "react";
import { CONSTANTS } from "../../../constants";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { CircularProgress } from "@mui/material";
import PropTypes from "prop-types";

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
        <input
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
                ? "border-red-400 bg-red-50 hover:bg-red-100"
                : "border-slate-300 bg-slate-100 hover:bg-slate-200"
            }
                rounded
            transition-colors duration-150
            ${isUploadingLogo ? "opacity-50 cursor-not-allowed" : ""}
          `}
          onClick={!isUploadingLogo ? handleButtonClick : undefined}
        >
          {isUploadingLogo ? (
            <CircularProgress size={16} className="!text-[#646cff]" />
          ) : (
            <FileUploadIcon className="w-5 h-5 text-slate-500" />
          )}

          {/* Show selected file name */}
        </div>
        {fileInputRef.current?.files?.[0] && (
          <span className="ml-2 text-sm text-slate-500">
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
