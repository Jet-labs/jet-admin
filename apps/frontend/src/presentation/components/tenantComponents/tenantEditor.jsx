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

function Section({ title, description, children }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      {(title || description) && (
        <div className="mb-2">
          {title && (
            <p className="mb-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {title}
            </p>
          )}
          {description && (
            <p className="text-[11px] text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-xs text-red-500">{message}</p>;
}
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
    <div className="space-y-4">
      <Section title="Identity" description="General information about your tenant.">
        <div className="flex flex-row justify-start items-center gap-3">
          {tenantEditorForm?.values?.tenantLogoURL && (
            <TenantLogo
              src={tenantEditorForm.values.tenantLogoURL}
              height={100}
              width={100}
              className="!w-10 !h-10 !rounded border !border-border shrink-0"
            />
          )}
          <LogoUpload
            isUploadingLogo={isUploadingLogo}
            uploadError={uploadLogoError}
            onLogoUpload={_handleLogoUpload}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tenantTitle">
            {CONSTANTS.STRINGS.TENANT_EDITOR_FORM_NAME_FIELD_LABEL}{" "}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            type="text"
            name="tenantTitle"
            id="tenantTitle"
            placeholder={CONSTANTS.STRINGS.TENANT_EDITOR_FORM_NAME_FIELD_PLACEHOLDER}
            required
            onChange={tenantEditorForm.handleChange}
            onBlur={tenantEditorForm.handleBlur}
            value={tenantEditorForm.values.tenantTitle}
          />
          <FieldError message={tenantEditorForm.touched.tenantTitle && tenantEditorForm.errors.tenantTitle} />
        </div>
      </Section>

      <Section title="Database" description="Configuration for your tenant's dedicated database.">
        <div className="space-y-1.5">
          <div className="flex flex-row justify-between items-center w-full">
            <div className="flex flex-row justify-start items-center gap-2">
              <Label htmlFor="tenantDBURL">
                {CONSTANTS.STRINGS.TENANT_EDITOR_FORM_DB_FIELD_LABEL}{" "}
                <span className="text-destructive">*</span>
              </Label>

              {tenantDatabaseConnectionResult !== null && (
                <div className={`flex flex-row justify-start items-center rounded-full px-2 py-0.5 border text-[10px] font-semibold leading-none ${
                    tenantDatabaseConnectionResult
                      ? "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-500"
                      : "border-orange-500/50 bg-orange-500/10 text-orange-700 dark:text-orange-500"
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${tenantDatabaseConnectionResult ? "bg-green-500" : "bg-orange-500"}`} />
                  {tenantDatabaseConnectionResult ? "Connected" : "Not connected"}
                </div>
              )}
            </div>

            <Button
              onClick={testTenantDatabaseConnection}
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-xs text-primary hover:bg-primary/5"
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
            required
            className="font-mono text-xs"
            onChange={tenantEditorForm.handleChange}
            onBlur={tenantEditorForm.handleBlur}
            value={tenantEditorForm.values.tenantDBURL}
          />
          <FieldError message={tenantEditorForm.touched.tenantDBURL && tenantEditorForm.errors.tenantDBURL} />
        </div>
      </Section>
    </div>
  );
};
