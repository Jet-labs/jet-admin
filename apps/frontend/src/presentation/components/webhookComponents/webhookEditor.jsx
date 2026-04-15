import React from "react";
import { CONSTANTS } from "../../../constants";
import PropTypes from "prop-types";
import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@jet-admin/ui";

// ─── Small helper components ─────────────────────────────────────────────────

/** Wraps a form section with a consistent heading + card look. */
function Section({ title, description, children }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      {(title || description) && (
        <div>
          {title && (
            <p className="text-xs font-mono font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
              {title}
            </p>
          )}
          {description && (
            <p className="text-[11px] text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-[11px] text-destructive">{message}</p>;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export const WebhookEditor = ({ webhookEditorForm }) => {
  WebhookEditor.propTypes = {
    webhookEditorForm: PropTypes.object.isRequired,
  };

  const touched = webhookEditorForm.touched ?? {};
  const errors = webhookEditorForm.errors ?? {};

  return (
    <div className="w-full space-y-3">

      {/* ── Identity ──────────────────────────────────────────────────────── */}
      <Section title="Identity">
        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="webhookTitle">
            {CONSTANTS.STRINGS.WEBHOOK_EDITOR_FORM_TITLE_FIELD_LABEL}
            <span className="ml-0.5 text-destructive">*</span>
          </Label>
          <Input
            type="text"
            name="webhookTitle"
            id="webhookTitle"
            className="w-full"
            placeholder={
              CONSTANTS.STRINGS.WEBHOOK_EDITOR_FORM_TITLE_FIELD_PLACEHOLDER
            }
            required
            onChange={webhookEditorForm.handleChange}
            onBlur={webhookEditorForm.handleBlur}
            value={webhookEditorForm.values.webhookTitle}
          />
          {touched.webhookTitle && (
            <FieldError message={errors.webhookTitle} />
          )}
        </div>

        {/* Path */}
        <div className="space-y-1.5">
          <Label htmlFor="webhookPath">
            {CONSTANTS.STRINGS.WEBHOOK_EDITOR_FORM_PATH_FIELD_LABEL}
            <span className="ml-0.5 text-destructive">*</span>
          </Label>
          <Input
            type="text"
            name="webhookPath"
            id="webhookPath"
            className="w-full font-mono"
            placeholder={
              CONSTANTS.STRINGS.WEBHOOK_EDITOR_FORM_PATH_FIELD_PLACEHOLDER
            }
            required
            onChange={webhookEditorForm.handleChange}
            onBlur={webhookEditorForm.handleBlur}
            value={webhookEditorForm.values.webhookPath}
          />
          {touched.webhookPath && (
            <FieldError message={errors.webhookPath} />
          )}
        </div>
      </Section>

      {/* ── Authentication ────────────────────────────────────────────────── */}
      <Section
        title="Authentication"
        description="Configure how incoming requests are authenticated."
      >
        <div className="grid grid-cols-2 gap-3">
          {/* Auth Type */}
          <div className="space-y-1.5">
            <Label htmlFor="authType">
              {CONSTANTS.STRINGS.WEBHOOK_EDITOR_FORM_AUTH_TYPE_FIELD_LABEL}
              <span className="ml-0.5 text-destructive">*</span>
            </Label>
            <Select
              value={webhookEditorForm.values.authType || ""}
              onValueChange={(val) =>
                webhookEditorForm.setFieldValue("authType", val)
              }
            >
              <SelectTrigger id="authType">
                <SelectValue placeholder="Select auth type…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="bearer">Bearer</SelectItem>
                <SelectItem value="custom_header">Custom Header</SelectItem>
              </SelectContent>
            </Select>
            {touched.authType && <FieldError message={errors.authType} />}
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label htmlFor="status">
              {CONSTANTS.STRINGS.WEBHOOK_EDITOR_FORM_STATUS_FIELD_LABEL}
            </Label>
            <Select
              value={webhookEditorForm.values.status || "active"}
              onValueChange={(val) =>
                webhookEditorForm.setFieldValue("status", val)
              }
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Auth Config JSON */}
        <div className="space-y-1.5">
          <Label htmlFor="authConfig">
            {CONSTANTS.STRINGS.WEBHOOK_EDITOR_FORM_AUTH_CONFIG_FIELD_LABEL}
          </Label>
          <Textarea
            name="authConfig"
            id="authConfig"
            className="w-full font-mono text-xs"
            rows={5}
            placeholder={
              CONSTANTS.STRINGS.WEBHOOK_EDITOR_FORM_AUTH_CONFIG_FIELD_PLACEHOLDER
            }
            onChange={webhookEditorForm.handleChange}
            onBlur={webhookEditorForm.handleBlur}
            value={webhookEditorForm.values.authConfig}
          />
        </div>
      </Section>
    </div>
  );
};
