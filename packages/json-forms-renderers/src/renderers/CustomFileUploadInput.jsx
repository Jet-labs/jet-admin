import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { CloudUpload, FileSpreadsheet, Trash2, AlertCircle } from 'lucide-react';
import { Button, Label } from '@jet-admin/ui';
import { FileUploadContext } from '../context.js';

export const CustomFileUploadInput = (props) => {
  const { data, path, handleChange, label, description, errors, uischema, enabled } = props;
  const { uploadFile } = useContext(FileUploadContext);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isDisabled = enabled === false;
  const hasErrors = (errors && errors.length > 0) || !!errorMsg;

  const fileOptions = data || {};
  const { fileUrl, fileName, fileSize, fileType } = fileOptions;

  const handleUpload = async (file) => {
    if (!file) return;
    setErrorMsg('');

    // Validate size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("File size exceeds 10MB limit.");
      return;
    }

    const fileExt = file.name.split(".").pop().toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(fileExt)) {
      setErrorMsg("Invalid file type. Please upload a CSV, XLSX, or XLS file.");
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadFile(file);
      handleChange(path, {
        fileUrl: response.url,
        filePath: response.filePath,
        fileName: response.fileName,
        fileSize: response.fileSize,
        fileType: response.fileType,
      });
    } catch (err) {
      setErrorMsg(err.message || err || "Failed to upload file.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChangeInput = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    handleChange(path, {
      fileUrl: "",
      filePath: "",
      fileName: "",
      fileSize: 0,
      fileType: "",
    });
  };

  const formatBytes = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const dm = 2;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  return (
    <div className="space-y-2">
      <Label
        htmlFor={path}
        className={`block ${hasErrors ? "text-destructive" : ""}`}
      >
        {label || description || "Upload File"} <span className="text-destructive">*</span>
      </Label>

      {fileUrl ? (
        <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-primary/10 rounded text-primary">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-foreground truncate max-w-sm">
                {fileName || "Uploaded File"}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatBytes(fileSize)} • {fileType || "Spreadsheet"}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemove}
            disabled={isDisabled}
            className="flex items-center gap-1.5 shrink-0"
          >
            <Trash2 className="h-3 w-3" />
            Remove
          </Button>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center p-6 border border-dashed rounded transition-colors ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-border bg-background hover:border-muted-foreground/50 hover:bg-muted/50"
          }`}
        >
          <input
            type="file"
            id={`file-upload-${path}`}
            className="hidden"
            accept=".csv, .xlsx, .xls"
            onChange={handleChangeInput}
            disabled={isUploading || isDisabled}
          />
          <label
            htmlFor={`file-upload-${path}`}
            className="flex flex-col items-center justify-center cursor-pointer space-y-3 w-full h-full"
          >
            {isUploading ? (
              <div className="flex flex-col items-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                <p className="text-sm font-medium text-muted-foreground">Uploading file…</p>
              </div>
            ) : (
              <>
                    <div className="p-3 bg-primary/10 text-primary rounded">
                  <CloudUpload className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    Click to upload or drag & drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Excel (.xlsx, .xls) or CSV up to 10MB
                  </p>
                </div>
              </>
            )}
          </label>
        </div>
      )}

      {(errors?.length > 0 || errorMsg) && (
        <p className="text-xs text-destructive mt-1 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {errorMsg || errors}
        </p>
      )}
    </div>
  );
};

CustomFileUploadInput.propTypes = {
  data: PropTypes.object,
  path: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  description: PropTypes.string,
  errors: PropTypes.arrayOf(PropTypes.string),
  uischema: PropTypes.object.isRequired,
  enabled: PropTypes.bool,
};

