import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useFormik } from "formik";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Spinner,
  DialogDescription,
  DialogBody,
} from "@jet-admin/ui";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../ui/resizable";
import { WidgetConfigEditor } from "../../widgetComponents/widgetConfigEditor";
import { WidgetPreview } from "../../widgetComponents/widgetPreview";
import { ReactQueryLoadingErrorWrapper } from "../../ui/reactQueryLoadingErrorWrapper";
import {
  getWidgetByIDAPI,
  createWidgetAPI,
  updateWidgetByIDAPI,
} from "../../../../data/apis/widget";
import { formValidations } from "../../../../utils/formValidation";
import { displaySuccess, displayError } from "../../../../utils/notification";
import { CONSTANTS } from "../../../../constants";
import { WIDGET_TYPES } from "@jet-admin/widget-types";
import { resolveConfig } from "../../../../logic/evaluationEngine";
import { useAppPageStateTree } from "../../../../logic/appPageRuntime";

const defaultWidgetType = WIDGET_TYPES.VEGA_LITE.value;
const EMPTY_INITIAL_VALUES = {
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
  onAddWidget,
  appPageEditorForm,
}) => {
  const queryClient = useQueryClient();

  const { data: widget, isLoading: isLoadingWidget, error: loadWidgetError } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.WIDGETS(tenantID), widgetID],
    queryFn: () => getWidgetByIDAPI({ tenantID, widgetID }),
    enabled: !!widgetID && isOpen,
  });

  const formInitialValues = useMemo(() => {
    if (!widget || !widgetID) return EMPTY_INITIAL_VALUES;
    return {
      widgetTitle: widget.widgetTitle || "",
      widgetType: widget.widgetType || defaultWidgetType,
      widgetConfig: widget.widgetConfig || {
        properties: { showHeader: true },
        events: {},
      },
    };
  }, [widget, widgetID]);

  const widgetForm = useFormik({
    initialValues: formInitialValues,
    enableReinitialize: true,
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
          queryClient.invalidateQueries({
            queryKey: [CONSTANTS.REACT_QUERY_KEYS.WIDGETS(tenantID)],
          });
        } else {
          const newWidget = await createWidgetAPI({
            tenantID,
            widgetData: values,
          });
          displaySuccess("Widget created and added to page canvas.");
          queryClient.invalidateQueries({
            queryKey: [CONSTANTS.REACT_QUERY_KEYS.WIDGETS(tenantID)],
          });
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

  const previewStateTree = useAppPageStateTree();

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
      <DialogContent hideCloseIcon={true} className="max-w-7xl w-[95vw] ">
        <DialogHeader>
          <DialogTitle>
            {widgetID ? "Widget configuration" : "Create new widget"}
            </DialogTitle>
          <DialogDescription>
              Design, preview, and map data sources to this widget inline.
          </DialogDescription>

        </DialogHeader>
        <DialogBody className="max-h-[70vh] overflow-auto p-0">
          <ReactQueryLoadingErrorWrapper
            isLoading={widgetID ? isLoadingWidget : false}
            error={loadWidgetError}
          >
            <ResizablePanelGroup
              direction="horizontal"
              autoSaveId={
                CONSTANTS.RESIZABLE_PANEL_KEYS.WIDGET_IDE_MODAL_SEPARATION
              }
              className="w-full h-full"
            >
              <ResizablePanel defaultSize={50} minSize={30}>
                <div className="h-full overflow-y-auto p-2 bg-background">
                  <WidgetConfigEditor
                    widgetEditorForm={widgetForm}
                    dataSourceResults={previewStateTree}
                    onDataSourceResults={() => { }}
                    appPageEditorForm={appPageEditorForm}
                  />
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle={true} />

              <ResizablePanel defaultSize={50} minSize={30}>
                <div className="h-full bg-muted/20 relative flex flex-col min-h-0">
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
                      refreshData={() => { }}
                    />
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ReactQueryLoadingErrorWrapper>
        </DialogBody>


        <DialogFooter >
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

WidgetIdeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  widgetID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onAddWidget: PropTypes.func,
  appPageEditorForm: PropTypes.object,
};
