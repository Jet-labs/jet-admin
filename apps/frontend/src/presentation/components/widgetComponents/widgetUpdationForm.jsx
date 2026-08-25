import { WIDGETS_MAP } from "@jet-admin/widgets-ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CONSTANTS } from "../../../constants";
import {
  getWidgetByIDAPI,
  updateWidgetByIDAPI,
} from "../../../data/apis/widget";
import { formValidations } from "../../../utils/formValidation";
import { displayError, displaySuccess } from "../../../utils/notification";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { WidgetCloneForm } from "./widgetCloneForm";
import { WidgetDeletionForm } from "./widgetDeletionForm";
import { WidgetConfigEditor } from "./widgetConfigEditor";
import { WidgetPreview } from "./widgetPreview";

import { PageHeader } from "@jet-admin/ui";
import { BundleExportButton } from "../bundleComponents/bundleExportButton";
import { PublishToLibraryButton } from "../widgetLibraryComponents/publishToLibraryButton";

const EMPTY_INITIAL_VALUES = {
  widgetTitle: "",
  widgetType: "vega-lite",
  widgetConfig: {
    properties: {
      containerCss: {},
      widgetCss: {},
      containerTailwindCss: "",
      widgetTailwindCss: "text-foreground",
      refetchInterval: 0,
    },
    events: {},
  },
};

export const WidgetUpdationForm = ({ tenantID, widgetID }) => {
  WidgetUpdationForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    widgetID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };

  const queryClient = useQueryClient();

  // Lifted state: data source results shared between config editor and preview
  const [dataSourceResults, setDataSourceResults] = useState(null);

  const {
    isLoading: isLoadingWidget,
    data: widget,
    error: loadWidgetError,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.WIDGETS(tenantID), widgetID],
    queryFn: () =>
      getWidgetByIDAPI({
        tenantID,
        widgetID,
      }),
    refetchOnWindowFocus: false,
  });

  const { isPending: isUpdatingWidget, mutate: updateWidget } = useMutation({
    mutationFn: (data) => {
      return updateWidgetByIDAPI({
        tenantID,
        widgetID,
        widgetData: data,
      });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess(
        CONSTANTS.STRINGS.UPDATE_WIDGET_FORM_WIDGET_UPDATION_SUCCESS
      );
      queryClient.invalidateQueries({
        queryKey:
        [CONSTANTS.REACT_QUERY_KEYS.WIDGETS(tenantID)],
      });
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const formInitialValues = useMemo(() => {
    if (!widget || !widget.widgetID) return EMPTY_INITIAL_VALUES;
    return {
      widgetTitle: widget.widgetTitle || CONSTANTS.STRINGS.UNTITLED,
      widgetType: widget.widgetType || WIDGETS_MAP.text.value,
      widgetDescription: widget.widgetDescription || "",
      widgetConfig: widget.widgetConfig || { properties: {}, events: {} },
    };
  }, [widget]);

  const updateWidgetForm = useFormik({
    initialValues: formInitialValues,
    enableReinitialize: true,
    validationSchema: formValidations.updateWidgetFormValidationSchema,
    validateOnMount: false,
    validateOnChange: false,
    onSubmit: (values) => {
      updateWidget(values);
    },
  });



  return (
    <div className="flex h-full w-full flex-col items-center bg-background">
      <PageHeader
        title={CONSTANTS.STRINGS.UPDATE_WIDGET_FORM_TITLE}
        parentTitle={CONSTANTS.STRINGS.MAIN_DRAWER_WIDGETS_TITLE}
        id={widgetID}
        onSave={updateWidgetForm.handleSubmit}
        isSaving={isUpdatingWidget}
      >
        <WidgetDeletionForm
          key={`widgetDeletionForm_${widgetID}`}
          tenantID={tenantID}
          widgetID={widgetID}
        />
        <WidgetCloneForm
          key={`widgetCloneForm_${widgetID}`}
          tenantID={tenantID}
          widgetID={widgetID}
        />
        <BundleExportButton
          tenantID={tenantID}
          entityType="widget"
          entityID={widgetID}
        />
        <PublishToLibraryButton tenantID={tenantID} widgetID={widgetID} />

      </PageHeader>

      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingWidget}
        error={loadWidgetError}
      >
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId={
            CONSTANTS.RESIZABLE_PANEL_KEYS
              .WIDGET_UPDATION_FORM_RESULT_SEPARATION
          }
          className={"!w-full !h-full"}
        >
          <ResizablePanel id={CONSTANTS.RESIZABLE_PANEL_IDS.WIDGET_EDITOR_SIDEBAR} defaultSize={35} className="!overflow-y-auto !pb-10">
            <form
              className="flex w-full flex-col items-stretch gap-2 bg-background p-2"
              onSubmit={updateWidgetForm.handleSubmit}
            >
              {updateWidgetForm && (
                <WidgetConfigEditor
                  key={`widgetConfigEditor_${widgetID}`}
                  widgetEditorForm={updateWidgetForm}
                  dataSourceResults={dataSourceResults}
                  onDataSourceResults={setDataSourceResults}
                />
              )}
            </form>
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel id={CONSTANTS.RESIZABLE_PANEL_IDS.WIDGET_PREVIEW_PANEL} defaultSize={65} className="relative flex flex-col min-h-0">
            <div className="flex-1 min-h-0 w-full relative">
              <WidgetPreview
                key={`{widgetPreview_${widgetID}}`}
                widgetID={widgetID}
                tenantID={tenantID}
                widgetTitle={updateWidgetForm.values.widgetTitle}
                widgetType={updateWidgetForm.values.widgetType}
                widgetConfig={updateWidgetForm.values.widgetConfig}
                dataSourceResults={dataSourceResults}
                isFetchingData={false}
                isRefreshingData={false}
                refreshData={() => {}}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ReactQueryLoadingErrorWrapper>
    </div>
  );
};
