import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Label, Switch, CodeEditor, TemplateAutocompleteInput } from "@jet-admin/ui";

export const HtmlConfigEditor = ({ widgetEditorForm, stateTree }) => {
  const config = widgetEditorForm.values.widgetConfig || {};
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);

  return (
    <div className="space-y-2">
      {/* HTML Source */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">HTML Markup</Label>
        <p className="text-xs text-muted-foreground leading-snug">
          Supports standard HTML structure, inline styles, and <code className="font-mono bg-muted px-1 py-0.5 rounded text-primary text-[9px]">{"{{expression}}"}</code> templates.
        </p>
        <CodeEditor
          language="html"
          value={config.html || ""}
          onChange={(val) => widgetEditorForm.setFieldValue("widgetConfig.html", val)}
          stateTree={liveStateTree}
          templateMode="js-template"
          height={200}
          showExpandButton={true}
          showFormatButton={false}
          showLineNumbers={true}
          title="HTML Source"
        />
      </div>

      {/* CSS Stylesheet */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">CSS Stylesheet</Label>
        <p className="text-xs text-muted-foreground leading-snug">
          Custom styles scoped to this widget's sandboxed iframe container.
        </p>
        <CodeEditor
          language="css"
          value={config.css || ""}
          onChange={(val) => widgetEditorForm.setFieldValue("widgetConfig.css", val)}
          stateTree={liveStateTree}
          templateMode="js-template"
          height={150}
          showExpandButton={true}
          showFormatButton={false}
          showLineNumbers={true}
          title="CSS Styles"
        />
      </div>

      {/* Is Loading Template */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-foreground">
          Is Loading Template <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <TemplateAutocompleteInput
          value={config.isLoading || ""}
          onChange={(val) => widgetEditorForm.setFieldValue("widgetConfig.isLoading", val)}
          placeholder="e.g. {{ state.queries.myQuery.isLoading }}"
          liveStateTree={liveStateTree}
        />
      </div>

      {/* Sandbox Isolation Flags */}
      <div className="space-y-2 pt-2 mt-2 border-t border-border/60">
        <Label className="text-xs font-semibold text-foreground uppercase tracking-wider">Sandbox Security</Label>
        
        {/* Allow Scripts */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 pr-2">
            <Label className="text-xs font-medium text-foreground">Execute JavaScript</Label>
            <p className="text-xs text-muted-foreground">Allows running &lt;script&gt; tags inside the iframe sandbox.</p>
          </div>
          <Switch
            checked={config.allowScripts === true || config.allowScripts === "true"}
            onCheckedChange={(val) => widgetEditorForm.setFieldValue("widgetConfig.allowScripts", val)}
          />
        </div>

        {/* Allow Forms */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 pr-2">
            <Label className="text-xs font-medium text-foreground">Submit Forms</Label>
            <p className="text-xs text-muted-foreground">Allows form submissions within the sandboxed iframe.</p>
          </div>
          <Switch
            checked={config.allowForms === true || config.allowForms === "true"}
            onCheckedChange={(val) => widgetEditorForm.setFieldValue("widgetConfig.allowForms", val)}
          />
        </div>

        {/* Allow Popups */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 pr-2">
            <Label className="text-xs font-medium text-foreground">Allow Popups</Label>
            <p className="text-xs text-muted-foreground">Allows links opening in new tabs or window popups.</p>
          </div>
          <Switch
            checked={config.allowPopups === true || config.allowPopups === "true"}
            onCheckedChange={(val) => widgetEditorForm.setFieldValue("widgetConfig.allowPopups", val)}
          />
        </div>
      </div>
    </div>
  );
};

HtmlConfigEditor.propTypes = {
  widgetEditorForm: PropTypes.object.isRequired,
  stateTree: PropTypes.object,
};

export default HtmlConfigEditor;
