import React from "react";
import { CONSTANTS } from "../../../constants";
import { useDataQueriesState } from "../../../logic/contexts/dataQueriesContext";
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

export const SubscriptionEditor = ({ subscriptionEditorForm }) => {
  SubscriptionEditor.propTypes = {
    subscriptionEditorForm: PropTypes.object.isRequired,
  };

  const { datasources } = useDataQueriesState();

  const touched = subscriptionEditorForm.touched ?? {};
  const errors = subscriptionEditorForm.errors ?? {};

  return (
    <div className="w-full space-y-3">

      {/* ── Identity ──────────────────────────────────────────────────────── */}
      <Section title="Identity">
        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="subscriptionTitle">
            {CONSTANTS.STRINGS.SUBSCRIPTION_EDITOR_FORM_TITLE_FIELD_LABEL}
            <span className="ml-0.5 text-destructive">*</span>
          </Label>
          <Input
            type="text"
            name="subscriptionTitle"
            id="subscriptionTitle"
            className="w-full"
            placeholder={
              CONSTANTS.STRINGS.SUBSCRIPTION_EDITOR_FORM_TITLE_FIELD_PLACEHOLDER
            }
            required
            onChange={subscriptionEditorForm.handleChange}
            onBlur={subscriptionEditorForm.handleBlur}
            value={subscriptionEditorForm.values.subscriptionTitle}
          />
          {touched.subscriptionTitle && (
            <FieldError message={errors.subscriptionTitle} />
          )}
        </div>
      </Section>

      {/* ── Data Source ────────────────────────────────────────────────────── */}
      <Section
        title="Data Source"
        description="Select which data source this subscription targets."
      >
        <div className="space-y-1.5">
          <Label htmlFor="datasourceID">
            {CONSTANTS.STRINGS.SUBSCRIPTION_EDITOR_FORM_DATASOURCE_FIELD_LABEL}
            <span className="ml-0.5 text-destructive">*</span>
          </Label>
          <Select
            value={
              subscriptionEditorForm.values.datasourceID
                ? String(subscriptionEditorForm.values.datasourceID)
                : ""
            }
            onValueChange={(val) =>
              subscriptionEditorForm.setFieldValue("datasourceID", val)
            }
          >
            <SelectTrigger id="datasourceID">
              <SelectValue placeholder="Select a data source…" />
            </SelectTrigger>
            <SelectContent>
              {datasources?.map((ds) => (
                <SelectItem
                  key={`datasource_item_${ds.value}`}
                  value={String(ds.value)}
                >
                  {ds.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {touched.datasourceID && (
            <FieldError message={errors.datasourceID} />
          )}
        </div>
      </Section>

      {/* ── Type & Status ─────────────────────────────────────────────────── */}
      <Section title="Configuration">
        <div className="grid grid-cols-2 gap-3">
          {/* Subscription Type */}
          <div className="space-y-1.5">
            <Label htmlFor="subscriptionType">
              {CONSTANTS.STRINGS.SUBSCRIPTION_EDITOR_FORM_TYPE_FIELD_LABEL}
              <span className="ml-0.5 text-destructive">*</span>
            </Label>
            <Select
              value={subscriptionEditorForm.values.subscriptionType || ""}
              onValueChange={(val) =>
                subscriptionEditorForm.setFieldValue("subscriptionType", val)
              }
            >
              <SelectTrigger id="subscriptionType">
                <SelectValue placeholder="Select type…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realtime">Realtime</SelectItem>
                <SelectItem value="event">Event</SelectItem>
              </SelectContent>
            </Select>
            {touched.subscriptionType && (
              <FieldError message={errors.subscriptionType} />
            )}
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label htmlFor="status">
              {CONSTANTS.STRINGS.SUBSCRIPTION_EDITOR_FORM_STATUS_FIELD_LABEL}
            </Label>
            <Select
              value={subscriptionEditorForm.values.status || "active"}
              onValueChange={(val) =>
                subscriptionEditorForm.setFieldValue("status", val)
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

        {/* Config JSON */}
        <div className="space-y-1.5">
          <Label htmlFor="subscriptionConfig">
            {CONSTANTS.STRINGS.SUBSCRIPTION_EDITOR_FORM_CONFIG_FIELD_LABEL}
          </Label>
          <Textarea
            name="subscriptionConfig"
            id="subscriptionConfig"
            className="w-full font-mono text-xs"
            rows={5}
            placeholder={
              CONSTANTS.STRINGS.SUBSCRIPTION_EDITOR_FORM_CONFIG_FIELD_PLACEHOLDER
            }
            onChange={subscriptionEditorForm.handleChange}
            onBlur={subscriptionEditorForm.handleBlur}
            value={subscriptionEditorForm.values.subscriptionConfig}
          />
        </div>
      </Section>
    </div>
  );
};
