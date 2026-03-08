import { CONSTANTS } from "../../../constants";
import { displayError, displaySuccess } from "../../../utils/notification";
import useSupabaseUpload from "../../../logic/hooks/useSupabseUpload";
import { LogoUpload } from "../ui/logoUploadInput";
import { TenantLogo } from "./tenantLogo";
import { testTenantDatabaseConnectionAPI } from "../../../data/apis/tenant";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import PropTypes from "prop-types";
import React from "react";

import { Button, Spinner, Input, Label } from "@jet-admin/ui";
export const TenantEditor = ({ tenantEditorForm }) => {
  TenantEditor.propTypes = {
    tenantEditorForm: PropTypes.object.isRequired,
  };
  const [tenantDatabaseConnectionResult, setTenantDatabaseConnectionResult] =
    useState(null);
  const {
    uploadFile,
    isUploading: isUploadingLogo,
    uploadError: uploadLogoError,
  } = useSupabaseUpload({
    bucket: CONSTANTS.SUPABASE.TENANT_ASSET_DIRECTORY,
    directory: CONSTANTS.SUPABASE.TENANT_LOGO_DIRECTORY,
    allowedTypes: ["image/jpeg", "image/png", "image/gif"],
    maxSizeMB: 2,
    onSuccess: () => {
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
      <div className="flex flex-row justify-start items-stretch mt-3">
        {tenantEditorForm?.values?.tenantLogoURL ? (
          <TenantLogo
            src={tenantEditorForm.values.tenantLogoURL}
            height={100}
            width={100}
            className="!w-10 !h-10 !rounded border !border-slate-300 mr-2"
          />
        ) : null}
        <LogoUpload
          isUploadingLogo={isUploadingLogo}
          uploadError={uploadLogoError}
          onLogoUpload={_handleLogoUpload}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tenantTitle">
          {CONSTANTS.STRINGS.TENANT_EDITOR_FORM_NAME_FIELD_LABEL}
        </Label>
        <Input
          type="text"
          name="tenantTitle"
          id="tenantTitle"
          placeholder={CONSTANTS.STRINGS.TENANT_EDITOR_FORM_NAME_FIELD_PLACEHOLDER}
          required={true}
          onChange={tenantEditorForm.handleChange}
          onBlur={tenantEditorForm.handleBlur}
          value={tenantEditorForm.values.tenantTitle}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex flex-row justify-between items-center w-full mb-1">
          <div className="flex flex-row justify-start items-center">
            <Label htmlFor="tenantDBURL">
              {CONSTANTS.STRINGS.TENANT_EDITOR_FORM_DB_FIELD_LABEL}
            </Label>

            {tenantDatabaseConnectionResult !== null && (
              <>
                {tenantDatabaseConnectionResult ? (
                  <div className="flex flex-row justify-start items-center ml-2 border-green-500/50 rounded-full px-2 py-0.5 border bg-green-500/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    <span className="text-[10px] ml-1.5 text-green-700 dark:text-green-500 font-semibold leading-none">
                      Connected
                    </span>
                  </div>
                ) : (
                    <div className="flex flex-row justify-start items-center ml-2 border-orange-500/50 rounded-full px-2 py-0.5 border bg-orange-500/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                      <span className="text-[10px] ml-1.5 text-orange-700 dark:text-orange-500 font-semibold leading-none">
                      Not connected
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          <Button
            onClick={testTenantDatabaseConnection}
            type="button"
            variant="ghost"
            className="h-auto p-1.5 text-xs text-primary"
          >
            {isTestingTenantDatabaseConnection && (
              <Spinner size={12} className="mr-2" />
            )}
            {CONSTANTS.STRINGS.TENANT_EDITOR_FORM_DB_URL_TEST}
          </Button>
        </div>
        <Input
          type="text"
          name="tenantDBURL"
          id="tenantDBURL"
          placeholder={CONSTANTS.STRINGS.TENANT_EDITOR_FORM_DB_FIELD_PLACEHOLDER}
          required={true}
          onChange={tenantEditorForm.handleChange}
          onBlur={tenantEditorForm.handleBlur}
          value={tenantEditorForm.values.tenantDBURL}
        />
      </div>
    </>
  );
};
