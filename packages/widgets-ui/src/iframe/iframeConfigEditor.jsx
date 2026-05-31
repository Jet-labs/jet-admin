import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Label, Checkbox } from "@jet-admin/ui";
import TemplateAutocompleteInput from "../_shared/TemplateAutocompleteInput";
import { getSuggestionsFromStateTree } from "../intellisense/suggestionEngine";

export const IframeConfigEditor = ({ widgetEditorForm, stateTree }) => {
  const config = widgetEditorForm.values.widgetConfig || {};

  const suggestions = useMemo(() => {
    if (!stateTree) return [];
    const rawSuggestions = getSuggestionsFromStateTree(stateTree);
    return rawSuggestions.map((s) => ({
      label: `{{${s.value}}}`,
      value: `{{${s.value}}}`,
      detail: s.detail,
    }));
  }, [stateTree]);

  return (
    <div className="space-y-4">
      {/* URL Embed */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-foreground">Embed URL / Target Source</Label>
        <TemplateAutocompleteInput
          value={config.url || ""}
          onChange={(val) => widgetEditorForm.setFieldValue("widgetConfig.url", val)}
          placeholder="e.g. https://example.com"
          suggestions={suggestions}
        />
        <p className="text-[10px] text-muted-foreground">
          Make sure the target site supports framing (doesn't send X-Frame-Options: DENY).
        </p>
      </div>

      {/* Sandbox Settings */}
      <div className="space-y-2 border-t pt-3">
        <Label className="text-xs font-medium text-foreground">Sandbox Security Options</Label>
        <p className="text-[10px] text-muted-foreground leading-snug mb-2">
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
        <div className="flex items-center gap-2 mt-1.5">
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
        <div className="flex items-center gap-2 mt-1.5">
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
        <div className="flex items-center gap-2 mt-1.5">
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
    </div>
  );
};

IframeConfigEditor.propTypes = {
  widgetEditorForm: PropTypes.object.isRequired,
  stateTree: PropTypes.object,
};

export default IframeConfigEditor;
