import { WIDGETS_MAP } from "@jet-admin/widgets-ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useState } from "react";
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

const initialValues = {
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

  const updateWidgetForm = useFormik({
    initialValues: initialValues,
    validationSchema: formValidations.updateWidgetFormValidationSchema,
    validateOnMount: false,
    validateOnChange: false,
    onSubmit: (values) => {
      updateWidget(values);
    },
  });

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
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.WIDGETS(tenantID),
      ]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  useEffect(() => {
    if (widget && widget.widgetID) {
      updateWidgetForm.setValues({
        widgetTitle: widget.widgetTitle || CONSTANTS.STRINGS.UNTITLED,
        widgetType: widget.widgetType || WIDGETS_MAP.text.value,
        widgetDescription: widget.widgetDescription || "",
        widgetConfig: widget.widgetConfig || { properties: {}, events: {} },
      });
    }
  }, [widget]);

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
          <ResizablePanel defaultSize={35} className="!overflow-y-auto !pb-10">
            <form
              className="flex w-full flex-col items-stretch gap-2 bg-background p-4"
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
          <ResizablePanel defaultSize={65} className="relative flex flex-col min-h-0">
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
