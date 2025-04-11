import { CONSTANTS } from "../../../constants";
import { displayError, displaySuccess } from "../../../utils/notification";
import useSupabaseUpload from "../../../logic/hooks/useSupabseUpload";
import { LogoUpload } from "../ui/logoUploadInput";
import { TenantLogo } from "./tenantLogo";
import { testTenantDatabaseConnectionAPI } from "../../../data/apis/tenant";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { CircularProgress } from "@mui/material";
export const TenantEditor = ({ tenantEditorForm }) => {
  const [tenantDatabaseConnectionResult, setTenantDatabaseConnectionResult] =
    useState(null);
  const {
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
    isUploading: isUploadingLogo,
    uploadProgress,
    uploadError: uploadLogoError,
    resetUploadState,
  } = useSupabaseUpload({
    bucket: CONSTANTS.SUPABASE.TENANT_ASSET_DIRECTORY,
    directory: CONSTANTS.SUPABASE.TENANT_LOGO_DIRECTORY,
    allowedTypes: ["image/jpeg", "image/png", "image/gif"],
    maxSizeMB: 2,
    onSuccess: (fileData) => {
      displaySuccess(CONSTANTS.STRINGS.TENANT_EDITOR_LOGO_UPLOAD_SUCCESS_TOAST);
    },
    onError: (error) => {
      displayError(JSON.stringify(error));
      console.error("Upload failed:", error);
    },
    generateUniqueName: true,
    upsert: true,
  });

  const {
    isPending: isTestingTenantDatabaseConnection,
    isSuccess: isTestingTenantDatabaseConnectionSuccess,
    isError: isTestingTenantDatabaseConnectionError,
    error: testTenantDatabaseConnectionError,
    mutate: testTenantDatabaseConnection,
  } = useMutation({
    mutationFn: () =>
      testTenantDatabaseConnectionAPI({
        tenantDBURL: tenantEditorForm?.values?.tenantDBURL,
      }),
    retry: false,
    onSuccess: (success) => {
      setTenantDatabaseConnectionResult(success);
      if (success) {
        displaySuccess(
          CONSTANTS.STRINGS.TENANT_EDITOR_DB_URL_TEST_SUCCESS_TOAST
        );
      } else {
        displayError(CONSTANTS.STRINGS.TENANT_EDITOR_DB_URL_TEST_FAILED_TOAST);
      }
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const result = await uploadFile(file);
      console.log("Upload result:", result);
      tenantEditorForm.setFieldValue("tenantLogoURL", result.url);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  return (
    <>
      <div className="flex flex-row justify-start items-stretch mt-4">
        {tenantEditorForm?.values?.tenantLogoURL ? (
          <TenantLogo
            src={tenantEditorForm.values.tenantLogoURL}
            height={100}
            width={100}
            className="!w-12 !h-12 !rounded !border-slate-300 !border mr-3"
          />
        ) : null}
        <LogoUpload
          isUploadingLogo={isUploadingLogo}
          uploadError={uploadLogoError}
          onLogoUpload={_handleLogoUpload}
        />
      </div>

      <div>
        <label
          for="tenantName"
          class="block mb-1 text-sm font-medium text-slate-500"
        >
          {CONSTANTS.STRINGS.TENANT_EDITOR_FORM_NAME_FIELD_LABEL}
        </label>
        <input
          type="tenantName"
          name="tenantName"
          id="tenantName"
          className=" placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:outline-none focus:border-slate-400 block w-full px-1.5 py-1"
          placeholder={
            CONSTANTS.STRINGS.TENANT_EDITOR_FORM_NAME_FIELD_PLACEHOLDER
          }
          required={true}
          onChange={tenantEditorForm.handleChange}
          onBlur={tenantEditorForm.handleBlur}
          value={tenantEditorForm.values.tenantName}
        />
      </div>
      <div>
        <label
          for="tenantDBType"
          class="block mb-1 text-sm font-medium text-slate-500"
        >
          {CONSTANTS.STRINGS.TENANT_EDITOR_FORM_DB_TYPE_FIELD_LABEL}
        </label>
        <select
          name="tenantDBType"
          value={tenantEditorForm.values.tenantDBType}
          onChange={tenantEditorForm.handleChange}
          onBlur={tenantEditorForm.handleBlur}
          className="placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:outline-none focus:border-slate-400 block w-full px-1.5 py-1"
        >
          {Object.keys(CONSTANTS.SUPPORTED_DATABASES).map((dbType) => (
            <option
              key={CONSTANTS.SUPPORTED_DATABASES[dbType].value}
              value={CONSTANTS.SUPPORTED_DATABASES[dbType].value}
              className="text-xs text-slate-700"
            >
              {CONSTANTS.SUPPORTED_DATABASES[dbType].name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <div className="flex flex-row justify-between items-center w-full mb-1 ">
          <div className="flex flex-row justify-start items-center">
            <label
              for="tenantDBURL"
              class="block text-sm font-medium text-slate-500"
            >
              {CONSTANTS.STRINGS.TENANT_EDITOR_FORM_DB_FIELD_LABEL}
            </label>

            {tenantDatabaseConnectionResult !== null && (
              <>
                {tenantDatabaseConnectionResult ? (
                  <div className="flex flex-row justify-start items-center  border-green-500 rounded-full px-1 border ml-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-[10px] ml-1 text-green-500 font-semibold">
                      Connected
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-row justify-start items-center  border-orange-500 rounded-full px-1 border ml-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span className="text-[10px] ml-1 text-orange-500 font-semibold">
                      Not connected
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          <button
            onClick={testTenantDatabaseConnection}
            type="button"
            className="p-0 m-0 text-xs text-[#646cff] inline-flex items-center bg-transparent focus:outline-none hover:outline-none border-none focus:border-none hover:border-none"
          >
            {isTestingTenantDatabaseConnection && (
              <CircularProgress size={12} className="!text-[#646cff] mr-2" />
            )}
            {CONSTANTS.STRINGS.TENANT_EDITOR_FORM_DB_URL_TEST}
          </button>
        </div>
        <input
          type="tenantDBURL"
          name="tenantDBURL"
          id="tenantDBURL"
          className=" placeholder:text-slate-400 text-sm bg-slate-50 border border-slate-300 text-slate-700 rounded  focus:outline-none focus:border-slate-400 block w-full px-1.5 py-1"
          placeholder={
            CONSTANTS.STRINGS.TENANT_EDITOR_FORM_DB_FIELD_PLACEHOLDER
          }
          required={true}
          onChange={tenantEditorForm.handleChange}
          onBlur={tenantEditorForm.handleBlur}
          value={tenantEditorForm.values.tenantDBURL}
        />
      </div>
    </>
  );
};
