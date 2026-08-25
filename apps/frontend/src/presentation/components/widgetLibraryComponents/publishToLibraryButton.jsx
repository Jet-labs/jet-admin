import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LibraryBig } from "lucide-react";
import PropTypes from "prop-types";
import React from "react";
import { CONSTANTS } from "../../../constants";
import { publishWidgetToLibraryAPI } from "../../../data/apis/widgetLibrary";
import { exportEntityBundleAPI } from "../../../data/apis/bundle";
import { useGlobalUI } from "../../../logic/stores/useUIStore";
import { displayError, displaySuccess } from "../../../utils/notification";

import { Button, Spinner } from "@jet-admin/ui";

/**
 * Publishes this widget (with its dependency bundle) to the shared library.
 * Rendered in the widget editor PageHeader.
 */
export const PublishToLibraryButton = ({ tenantID, widgetID }) => {
  PublishToLibraryButton.propTypes = {
    tenantID: PropTypes.string.isRequired,
    widgetID: PropTypes.string.isRequired,
  };

  const { showConfirmation } = useGlobalUI();
  const queryClient = useQueryClient();

  const publishMutation = useMutation({
    mutationFn: async () => {
      const bundle = await exportEntityBundleAPI({
        tenantID,
        entityType: "widget",
        entityID: widgetID,
      });
      return publishWidgetToLibraryAPI({ tenantID, bundle });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess("Published to the shared widget library.");
      queryClient.invalidateQueries({
        queryKey: [CONSTANTS.REACT_QUERY_KEYS.WIDGET_LIBRARY],
      });
    },
    onError: (error) => displayError(error),
  });

  const _handlePublish = async () => {
    const confirmed = await showConfirmation({
      title: "Publish to library",
      message:
        "The widget and its dependency bundle will be available to every tenant on this deployment. Continue?",
      confirmText: "Publish",
      cancelText: "Cancel",
    });
    if (!confirmed) return;
    publishMutation.mutate();
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      square
      onClick={_handlePublish}
      disabled={publishMutation.isPending}
      aria-label="Publish to library"
      title="Publish to library"
    >
      {publishMutation.isPending ? <Spinner size={14} /> : <LibraryBig className="h-3 w-3" />}
    </Button>
  );
};
