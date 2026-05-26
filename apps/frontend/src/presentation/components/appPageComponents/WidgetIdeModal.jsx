import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useFormik } from "formik";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Spinner,
} from "@jet-admin/ui";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { WidgetConfigEditor } from "../widgetComponents/widgetConfigEditor";
import { WidgetPreview } from "../widgetComponents/widgetPreview";
import {
  getWidgetByIDAPI,
  createWidgetAPI,
  updateWidgetByIDAPI,
} from "../../../data/apis/widget";
import { formValidations } from "../../../utils/formValidation";
import { displaySuccess, displayError } from "../../../utils/notification";
import { CONSTANTS } from "../../../constants";
import { WIDGET_TYPES } from "@jet-admin/widget-types";
import { resolveConfig } from "../../../logic/evaluationEngine";
import { useAppPageStateTree } from "../../../logic/appPageRuntime";

const defaultWidgetType = WIDGET_TYPES.VEGA_LITE.value;
const initialValues = {
  widgetTitle: "",
  widgetType: defaultWidgetType,
  widgetConfig: {
    properties: {
      containerCss: {},
      widgetCss: {},
      containerTailwindCss: "",
      widgetTailwindCss: "text-foreground",
      refetchInterval: 0,
      showHeader: true,
    },
    events: {},
  },
};

export const WidgetIdeModal = ({
  isOpen,
  onClose,
  tenantID,
  widgetID = null,
  appPageEditorForm,
  onAddWidget,
}) => {
  const queryClient = useQueryClient();

  // Fetch widget definition if in edit mode
  const { data: widget, isLoading: isLoadingWidget } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.WIDGETS(tenantID), widgetID],
    queryFn: () => getWidgetByIDAPI({ tenantID, widgetID }),
    enabled: !!widgetID && isOpen,
  });

  const widgetForm = useFormik({
    initialValues: initialValues,
    validationSchema: formValidations.addWidgetFormValidationSchema,
    validateOnMount: false,
    validateOnChange: false,
    onSubmit: async (values) => {
      try {
        if (widgetID) {
          await updateWidgetByIDAPI({
            tenantID,
            widgetID,
            widgetData: values,
          });
          displaySuccess("Widget updated successfully.");
          queryClient.invalidateQueries([
            CONSTANTS.REACT_QUERY_KEYS.WIDGETS(tenantID),
          ]);
        } else {
          const newWidget = await createWidgetAPI({
            tenantID,
            widgetData: values,
          });
          displaySuccess("Widget created and added to page canvas.");
          queryClient.invalidateQueries([
            CONSTANTS.REACT_QUERY_KEYS.WIDGETS(tenantID),
          ]);
          if (onAddWidget && newWidget?.widgetID) {
            onAddWidget(newWidget.widgetID);
          }
        }
        onClose();
      } catch (error) {
        displayError(error);
      }
    },
  });

  // Load widget data into Formik when fetched
  useEffect(() => {
    if (isOpen) {
      if (widget && widgetID) {
        widgetForm.setValues({
          widgetTitle: widget.widgetTitle || "",
          widgetType: widget.widgetType || defaultWidgetType,
          widgetConfig: widget.widgetConfig || {
            properties: { showHeader: true },
            events: {},
          },
        });
      } else if (!widgetID) {
        widgetForm.setValues(initialValues);
      }
    }
  }, [widget, widgetID, isOpen]);

  // Construct page state tree preview for resolving expressions in the preview panel
  const previewStateTree = useAppPageStateTree();

  // Evaluate the local widgetConfig template using our resolved state tree preview
  const resolvedWidgetConfig = useMemo(() => {
    if (!widgetForm.values.widgetConfig) return {};
    if (!previewStateTree) return widgetForm.values.widgetConfig;
    return resolveConfig(widgetForm.values.widgetConfig, previewStateTree);
  }, [widgetForm.values.widgetConfig, previewStateTree]);

  const handleSave = () => {
    widgetForm.handleSubmit();
  };

  const isSaving = widgetForm.isSubmitting;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !isSaving) onClose();
    }}>
      <DialogContent className="max-w-7xl w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden bg-background border border-border">
        <DialogHeader className="px-6 py-4 border-b border-border/80 flex flex-row items-center justify-between shrink-0">
          <div>
            <DialogTitle className="text-base font-semibold text-foreground">
              {widgetID ? "Inline Widget Configuration IDE" : "Create New Widget Inline"}
            </DialogTitle>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Design, preview, and map data sources to this widget inline.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSaving}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              disabled={isSaving || (widgetID && isLoadingWidget)}
              onClick={handleSave}
            >
              {isSaving ? <Spinner className="mr-2 h-4 w-4" /> : null}
              {widgetID ? "Save Changes" : "Create & Place"}
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 relative">
          {widgetID && isLoadingWidget ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-50">
              <Spinner size={24} />
            </div>
          ) : null}

          <ResizablePanelGroup
            direction="horizontal"
            autoSaveId={
              CONSTANTS.RESIZABLE_PANEL_KEYS.WIDGET_ADDITION_FORM_RESULT_SEPARATION
            }
            className="w-full h-full"
          >
            {/* Left Panel: Configuration Editors */}
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="h-full overflow-y-auto p-5 pb-16 bg-background">
                <WidgetConfigEditor
                  widgetEditorForm={widgetForm}
                  dataSourceResults={previewStateTree}
                  onDataSourceResults={() => {}}
                  isPageLevelMode={true}
                />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle={true} />

            {/* Right Panel: Live Preview */}
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="h-full bg-muted/20 border-l border-border/40 relative flex flex-col min-h-0">
                <div className="flex-1 min-h-0 relative">
                  <WidgetPreview
                    tenantID={tenantID}
                    widgetID={widgetID || "temp_preview"}
                    widgetTitle={widgetForm.values.widgetTitle}
                    widgetType={widgetForm.values.widgetType}
                    widgetConfig={resolvedWidgetConfig}
                    dataSourceResults={previewStateTree?.queries}
                    isFetchingData={false}
                    isRefreshingData={false}
                    refreshData={() => {}}
                  />
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </DialogContent>
    </Dialog>
  );
};

WidgetIdeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  widgetID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  appPageEditorForm: PropTypes.object.isRequired,
  onAddWidget: PropTypes.func,
};
