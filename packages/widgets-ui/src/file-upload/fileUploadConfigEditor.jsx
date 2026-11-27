import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Switch, Textarea } from "@jet-admin/ui";
import {
  ConfigSection,
  ConfigField,
  BindableInput,
  BindableSwitch,
  SegmentedControl,
  useConfigValue,
} from "../config";

export const FileUploadConfigEditor = ({ stateTree }) => {
  const liveStateTree = useMemo(() => ({ state: stateTree }), [stateTree]);
  const [label, setLabel] = useConfigValue("label", "Upload file");
  const [buttonLabel, setButtonLabel] = useConfigValue("buttonLabel", "Choose file");
  const [accept, setAccept] = useConfigValue("accept", "");
  const [maxSizeMB, setMaxSizeMB] = useConfigValue("maxSizeMB", "");
  const [multiple, setMultiple] = useConfigValue("multiple", false);
  const [maxFiles, setMaxFiles] = useConfigValue("maxFiles", "");
  const [help, setHelp] = useConfigValue("help", "");
  const [uploadUrl, setUploadUrl] = useConfigValue("uploadUrl", "");
  const [uploadFieldName, setUploadFieldName] = useConfigValue("uploadFieldName", "file");
  const [uploadMethod, setUploadMethod] = useConfigValue("uploadMethod", "POST");
  const [responseUrlKey, setResponseUrlKey] = useConfigValue("responseUrlKey", "url");
  const [uploadHeaders, setUploadHeaders] = useConfigValue("uploadHeaders", "");
  const [uploadWithCredentials, setUploadWithCredentials] = useConfigValue("uploadWithCredentials", false);
  const [autoUpload, setAutoUpload] = useConfigValue("autoUpload", true);
  const [showDropzone, setShowDropzone] = useConfigValue("showDropzone", false);
  const [previewImages, setPreviewImages] = useConfigValue("previewImages", true);
  const [size, setSize] = useConfigValue("size", "default");
  const [disabled, setDisabled] = useConfigValue("disabled", false);
  const [readOnly, setReadOnly] = useConfigValue("readOnly", false);
  const [isLoading, setIsLoading] = useConfigValue("isLoading", "");

  return (
    <>
      <ConfigSection id="file-upload-content" title="Upload" tab="content">
        <ConfigField label="Label" path="label" htmlFor="file-label">
          <BindableInput id="file-label" value={label} onChange={setLabel} liveStateTree={liveStateTree} placeholder="e.g. Upload CSV" />
        </ConfigField>
        <ConfigField label="Button label" path="buttonLabel" defaultValue="Choose file" htmlFor="file-button-label">
          <Input id="file-button-label" value={buttonLabel ?? ""} onChange={(event) => setButtonLabel(event.target.value)} className="h-8 text-xs" />
        </ConfigField>
        <ConfigField label="Accepted types" path="accept" htmlFor="file-accept" helper="Examples: .csv,.json,image/*">
          <Input id="file-accept" value={accept ?? ""} onChange={(event) => setAccept(event.target.value)} placeholder=".csv,image/*" className="h-8 font-mono text-xs" />
        </ConfigField>
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Max size (MB)" path="maxSizeMB" htmlFor="file-max-size">
            <Input
              id="file-max-size"
              type="number"
              min={0}
              value={maxSizeMB ?? ""}
              onChange={(event) => setMaxSizeMB(event.target.value === "" ? "" : Number(event.target.value))}
              placeholder="No limit"
              className="h-8 text-xs"
            />
          </ConfigField>
          <ConfigField label="Max files" path="maxFiles" htmlFor="file-max-files">
            <Input
              id="file-max-files"
              type="number"
              min={1}
              value={maxFiles ?? ""}
              onChange={(event) => setMaxFiles(event.target.value === "" ? "" : Number(event.target.value))}
              placeholder="No limit"
              className="h-8 text-xs"
              disabled={!multiple}
            />
          </ConfigField>
        </div>
        <ConfigField label="Help text" path="help">
          <BindableInput value={help} onChange={setHelp} liveStateTree={liveStateTree} placeholder="Shown under the upload control" />
        </ConfigField>
      </ConfigSection>

      <ConfigSection id="file-upload-endpoint" title="Upload endpoint" description="Optional upload contract. Without a URL, files stay metadata-only." tab="content" defaultOpen={false}>
        <ConfigField label="Upload URL" path="uploadUrl" helper="POST/PUT FormData here. Response should include a file URL.">
          <BindableInput value={uploadUrl} onChange={setUploadUrl} liveStateTree={liveStateTree} placeholder="https://api.example.com/uploads" />
        </ConfigField>
        <div className="grid grid-cols-2 gap-2">
          <ConfigField label="Field name" path="uploadFieldName" defaultValue="file" htmlFor="file-upload-field">
            <Input id="file-upload-field" value={uploadFieldName ?? "file"} onChange={(event) => setUploadFieldName(event.target.value)} className="h-8 font-mono text-xs" />
          </ConfigField>
          <ConfigField label="Method" path="uploadMethod" defaultValue="POST">
            <SegmentedControl
              ariaLabel="Upload method"
              value={uploadMethod || "POST"}
              onChange={setUploadMethod}
              options={[
                { value: "POST", label: "POST" },
                { value: "PUT", label: "PUT" },
              ]}
            />
          </ConfigField>
        </div>
        <ConfigField label="Response URL key" path="responseUrlKey" defaultValue="url" htmlFor="file-response-key" helper="Dot path into the JSON response, e.g. data.url.">
          <Input id="file-response-key" value={responseUrlKey ?? "url"} onChange={(event) => setResponseUrlKey(event.target.value)} className="h-8 font-mono text-xs" />
        </ConfigField>
        <ConfigField label="Headers" path="uploadHeaders" helper="JSON object of request headers. Auth tokens belong in a binding or page-level proxy.">
          <Textarea
            value={typeof uploadHeaders === "string" ? uploadHeaders : JSON.stringify(uploadHeaders || {}, null, 2)}
            onChange={(event) => setUploadHeaders(event.target.value)}
            rows={3}
            placeholder={'{"Authorization":"Bearer …"}'}
            className="font-mono text-[11px]"
          />
        </ConfigField>
        <div className="grid grid-cols-2 gap-3">
          <ConfigField label="Auto upload" path="autoUpload" defaultValue={true} inline helper="Start immediately after selection.">
            <Switch checked={autoUpload !== false} onCheckedChange={setAutoUpload} aria-label="Auto upload" />
          </ConfigField>
          <ConfigField label="Send credentials" path="uploadWithCredentials" defaultValue={false} inline helper="Include cookies on cross-origin requests.">
            <Switch checked={!!uploadWithCredentials} onCheckedChange={setUploadWithCredentials} aria-label="Send credentials" />
          </ConfigField>
        </div>
      </ConfigSection>

      <ConfigSection id="file-upload-style" title="Presentation" tab="style">
        <ConfigField label="Dropzone" path="showDropzone" defaultValue={false} inline helper="Drag-and-drop area instead of a plain button.">
          <Switch checked={!!showDropzone} onCheckedChange={setShowDropzone} aria-label="Show dropzone" />
        </ConfigField>
        <ConfigField label="Image previews" path="previewImages" defaultValue={true} inline>
          <Switch checked={previewImages !== false} onCheckedChange={setPreviewImages} aria-label="Show image previews" />
        </ConfigField>
        <ConfigField label="Size" path="size" defaultValue="default">
          <SegmentedControl
            ariaLabel="Upload size"
            value={size || "default"}
            onChange={setSize}
            options={[
              { value: "sm", label: "S" },
              { value: "default", label: "M" },
              { value: "lg", label: "L" },
            ]}
          />
        </ConfigField>
      </ConfigSection>

      <ConfigSection id="file-upload-behavior" title="State" tab="behavior">
        <ConfigField label="Allow multiple files" path="multiple" defaultValue={false} inline>
          <Switch checked={!!multiple} onCheckedChange={setMultiple} aria-label="Allow multiple files" />
        </ConfigField>
        <div className="grid grid-cols-2 gap-3">
          <ConfigField label="Disabled" path="disabled" defaultValue={false} inline>
            <BindableSwitch value={disabled} onChange={setDisabled} liveStateTree={liveStateTree} ariaLabel="Disabled" />
          </ConfigField>
          <ConfigField label="Read-only" path="readOnly" defaultValue={false} inline>
            <BindableSwitch value={readOnly} onChange={setReadOnly} liveStateTree={liveStateTree} ariaLabel="Read-only" />
          </ConfigField>
        </div>
        <ConfigField label="Loading template" path="isLoading">
          <BindableInput value={isLoading} onChange={setIsLoading} liveStateTree={liveStateTree} placeholder="e.g. {{ state.queries.q.isLoading }}" />
        </ConfigField>
      </ConfigSection>
    </>
  );
};

FileUploadConfigEditor.propTypes = { widgetEditorForm: PropTypes.object, stateTree: PropTypes.object };
FileUploadConfigEditor.usesConfigKit = true;
export default FileUploadConfigEditor;
