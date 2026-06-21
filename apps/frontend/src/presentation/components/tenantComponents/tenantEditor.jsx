import { CONSTANTS } from "../../../constants";

import { LogoUpload } from "../ui/logoUploadInput";
import { TenantLogo } from "./tenantLogo";

import PropTypes from "prop-types";
import React from "react";

import { Button, Spinner, Input, Label, Section } from "@jet-admin/ui";



function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-xs text-red-500">{message}</p>;
}
export const TenantEditor = ({ tenantEditorForm }) => {
  TenantEditor.propTypes = {
    tenantEditorForm: PropTypes.object.isRequired,
  };


  const _handleLogoUpload = (url) => {
    tenantEditorForm.setFieldValue("tenantLogoURL", url);
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


    </div>
  );
};
