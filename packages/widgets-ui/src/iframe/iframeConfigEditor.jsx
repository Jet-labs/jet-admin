import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Label, Checkbox } from "@jet-admin/ui";
import { TemplateAutocompleteInput } from "@jet-admin/ui";

export const IframeConfigEditor = ({ widgetEditorForm, stateTree }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);

  return (
    <div className="space-y-2">
      {/* URL Embed */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">Embed URL / Target Source</Label>
        <TemplateAutocompleteInput
          value={config.url || ""}
          onChange={(val) => widgetEditorForm.setFieldValue("widgetConfig.url", val)}
          placeholder="e.g. https://example.com"
          liveStateTree={liveStateTree}
        />
        <p className="text-xs text-muted-foreground">
          Make sure the target site supports framing (doesn't send X-Frame-Options: DENY).
        </p>
      </div>

      {/* Sandbox Settings */}
      <div className="space-y-2 border-t pt-2 mt-2">
        <Label className="text-xs font-medium text-foreground">Sandbox Security Options</Label>
        <p className="text-xs text-muted-foreground leading-snug mb-1">
          Toggle capabilities granted to the embedded page. Restricted by default.
        </p>

        {/* Scripts */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="iframe-scripts"
            checked={config.allowScripts ?? true}
            onCheckedChange={(checked) =>
              widgetEditorForm.setFieldValue("widgetConfig.allowScripts", !!checked)
            }
          />
          <Label htmlFor="iframe-scripts" className="text-xs text-muted-foreground cursor-pointer">
            Allow JavaScript execution (allow-scripts)
          </Label>
        </div>

        {/* Forms */}
        <div className="flex items-center gap-2 mt-1">
          <Checkbox
            id="iframe-forms"
            checked={config.allowForms ?? true}
            onCheckedChange={(checked) =>
              widgetEditorForm.setFieldValue("widgetConfig.allowForms", !!checked)
            }
          />
          <Label htmlFor="iframe-forms" className="text-xs text-muted-foreground cursor-pointer">
            Allow form submission (allow-forms)
          </Label>
        </div>

        {/* Popups */}
        <div className="flex items-center gap-2 mt-1">
          <Checkbox
            id="iframe-popups"
            checked={config.allowPopups ?? false}
            onCheckedChange={(checked) =>
              widgetEditorForm.setFieldValue("widgetConfig.allowPopups", !!checked)
            }
          />
          <Label htmlFor="iframe-popups" className="text-xs text-muted-foreground cursor-pointer">
            Allow popups & new windows (allow-popups)
          </Label>
        </div>

        {/* Same Origin */}
        <div className="flex items-center gap-2 mt-1">
          <Checkbox
            id="iframe-origin"
            checked={config.allowSameOrigin ?? false}
            onCheckedChange={(checked) =>
              widgetEditorForm.setFieldValue("widgetConfig.allowSameOrigin", !!checked)
            }
          />
          <Label htmlFor="iframe-origin" className="text-xs text-muted-foreground cursor-pointer">
            Allow sharing local storage/cookies (allow-same-origin)
          </Label>
        </div>
      </div>

      {/* Is Loading Template */}
      <div className="space-y-1 mt-2">
        <Label className="text-xs font-medium text-foreground">Is Loading Template <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <TemplateAutocompleteInput
          value={config.isLoading || ""}
          onChange={(val) => widgetEditorForm.setFieldValue('widgetConfig.isLoading', val)}
          placeholder="e.g. {{ state.queries.myQuery.isLoading }}"
          liveStateTree={liveStateTree}
        />
      </div>
    </div>
  );
};

IframeConfigEditor.propTypes = {
  widgetEditorForm: PropTypes.object.isRequired,
  stateTree: PropTypes.object,
};

export default IframeConfigEditor;
