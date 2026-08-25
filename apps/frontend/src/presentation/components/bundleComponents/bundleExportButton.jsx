import { useMutation } from "@tanstack/react-query";
import { Download } from "lucide-react";
import PropTypes from "prop-types";
import React from "react";
import { exportEntityBundleAPI } from "../../../data/apis/bundle";
import { displayError } from "../../../utils/notification";

import { Button, Spinner } from "@jet-admin/ui";

const TITLE_FIELD_BY_TYPE = {
  appPage: "appPageTitle",
  widget: "widgetTitle",
  workflow: "title",
  dataQuery: "dataQueryTitle",
  datasource: "datasourceTitle",
  listener: "listenerTitle",
};

const FILE_PREFIX_BY_TYPE = {
  appPage: "app-page",
  widget: "widget",
  workflow: "workflow",
  dataQuery: "query",
  datasource: "datasource",
  listener: "listener",
};

const _slugify = (value) =>
  String(value || "bundle")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

export const _downloadBundleJSON = (bundle) => {
  // Items are ordered dependencies-first, so the root is the last item.
  const items = Array.isArray(bundle?.items) ? bundle.items : [];
  const rootItem = items[items.length - 1];
  const titleField = rootItem ? TITLE_FIELD_BY_TYPE[rootItem.type] : null;
  const title = titleField ? rootItem?.payload?.[titleField] : null;
  const filename = `${_slugify(title)}-${FILE_PREFIX_BY_TYPE[rootItem?.type] || "bundle"}-bundle.json`;
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

export const BundleExportButton = ({ tenantID, entityType, entityID }) => {
  BundleExportButton.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    entityType: PropTypes.oneOf(["appPage", "widget", "workflow", "dataQuery", "datasource", "listener"])
      .isRequired,
    entityID: PropTypes.string.isRequired,
  };

  const { isPending: isExporting, mutate: exportBundle } = useMutation({
    mutationFn: () => exportEntityBundleAPI({ tenantID, entityType, entityID }),
    retry: false,
    onSuccess: (bundle) => {
      _downloadBundleJSON(bundle);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      square
      onClick={() => exportBundle()}
      disabled={isExporting}
      aria-label="Export bundle"
      title="Export bundle"
    >
      {isExporting ? <Spinner size={14} /> : <Download className="h-3 w-3" />}
    </Button>
  );
};
