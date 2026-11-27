import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch } from "@jet-admin/ui";
import {
  ConfigSection,
  ConfigField,
  BindableInput,
  useConfigValue,
} from "../config";

export const CodeBlockConfigEditor = ({ stateTree }) => {
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  const [code, setCode] = useConfigValue("code", "");
  const [language, setLanguage] = useConfigValue("language", "sql");
  const [filename, setFilename] = useConfigValue("filename", "");
  const [showCopy, setShowCopy] = useConfigValue("showCopy", true);
  const [showLineNumbers, setShowLineNumbers] = useConfigValue("showLineNumbers", true);
  const [wrap, setWrap] = useConfigValue("wrap", false);
  const [maxHeight, setMaxHeight] = useConfigValue("maxHeight", "");
  const [isLoading, setIsLoading] = useConfigValue("isLoading", "");

  return (
    <>
      <ConfigSection id="code-content" title="Code" tab="content">
        <ConfigField label="Code" path="code" helper="Supports template expressions.">
          <BindableInput value={code} onChange={setCode} liveStateTree={liveStateTree} multiline rows={8} placeholder="SELECT * FROM orders LIMIT 10;" />
        </ConfigField>
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Language" path="language" defaultValue="sql">
            <Select value={language || "sql"} onValueChange={setLanguage}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sql">SQL</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="bash">Bash</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="css">CSS</SelectItem>
                <SelectItem value="text">Plain text</SelectItem>
              </SelectContent>
            </Select>
          </ConfigField>
          <ConfigField label="Filename" path="filename" htmlFor="code-filename">
            <Input id="code-filename" value={filename ?? ""} onChange={(event) => setFilename(event.target.value)} placeholder="query.sql" className="h-8 font-mono text-xs" />
          </ConfigField>
        </div>
        <ConfigField label="Max height (px)" path="maxHeight" htmlFor="code-max-height">
          <Input
            id="code-max-height"
            type="number"
            min={0}
            value={maxHeight ?? ""}
            onChange={(event) => setMaxHeight(event.target.value === "" ? "" : Number(event.target.value))}
            placeholder="Auto"
            className="h-8 text-xs"
          />
        </ConfigField>
      </ConfigSection>

      <ConfigSection id="code-style" title="Viewer" tab="style">
        <div className="grid grid-cols-3 gap-3">
          <ConfigField label="Copy button" path="showCopy" defaultValue={true} inline>
            <Switch checked={showCopy !== false} onCheckedChange={setShowCopy} aria-label="Copy button" />
          </ConfigField>
          <ConfigField label="Line numbers" path="showLineNumbers" defaultValue={true} inline>
            <Switch checked={showLineNumbers !== false} onCheckedChange={setShowLineNumbers} aria-label="Line numbers" />
          </ConfigField>
          <ConfigField label="Wrap lines" path="wrap" defaultValue={false} inline>
            <Switch checked={!!wrap} onCheckedChange={setWrap} aria-label="Wrap lines" />
          </ConfigField>
        </div>
      </ConfigSection>

      <ConfigSection id="code-behavior" title="State" tab="behavior">
        <ConfigField label="Loading template" path="isLoading">
          <BindableInput value={isLoading} onChange={setIsLoading} liveStateTree={liveStateTree} placeholder="e.g. {{ state.queries.q.isLoading }}" />
        </ConfigField>
      </ConfigSection>
    </>
  );
};

CodeBlockConfigEditor.propTypes = { widgetEditorForm: PropTypes.object, stateTree: PropTypes.object };
CodeBlockConfigEditor.usesConfigKit = true;
export default CodeBlockConfigEditor;
