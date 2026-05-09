import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React, { useCallback, useState } from "react";
import { CONSTANTS } from "../../../constants";
import {
  createWidgetAPI,
} from "../../../data/apis/widget";
import { formValidations } from "../../../utils/formValidation";
import { displayError, displaySuccess } from "../../../utils/notification";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { WidgetConfigEditor } from "./widgetConfigEditor";
import { WidgetPreview } from "./widgetPreview";
import PropTypes from "prop-types";
import { WIDGET_TYPES } from "@jet-admin/widget-types";

import { Button, Spinner } from "@jet-admin/ui";

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
    },
    events: {},
  },
};

export const WidgetAdditionForm = ({ tenantID }) => {
  WidgetAdditionForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };
  const uniqueKey = `${tenantID}`;
  const queryClient = useQueryClient();

  // Lifted state: data source results shared between config editor and preview
  const [dataSourceResults, setDataSourceResults] = useState(null);

  const { isPending: isAddingWidget, mutate: addWidget } = useMutation({
    mutationFn: (data) => {
      return createWidgetAPI({
        tenantID,
        widgetData: data,
      });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess(CONSTANTS.STRINGS.ADD_WIDGET_FORM_WIDGET_ADDITION_SUCCESS);
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.WIDGETS(tenantID),
      ]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const addWidgetForm = useFormik({
    initialValues: initialValues,
    validationSchema: formValidations.addWidgetFormValidationSchema,
    validateOnMount: false,
    validateOnChange: false,
    onSubmit: (values) => {
      addWidget(values);
    },
  });

  return (
    <div className="flex h-full w-full flex-col items-center bg-brand-dark">
      <div className="flex w-full items-center justify-between border-b border-border bg-brand-dark px-4 py-3">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {CONSTANTS.STRINGS.ADD_WIDGET_FORM_TITLE}
        </h1>
        <Button type="submit" form="widget-addition-form" disabled={isAddingWidget}>
          {isAddingWidget && <Spinner className="mr-2" size={16} />}
          {CONSTANTS.STRINGS.ADD_WIDGET_BUTTON_TEXT}
        </Button>
      </div>

      <ResizablePanelGroup
        direction="horizontal"
        autoSaveId={
          CONSTANTS.RESIZABLE_PANEL_KEYS.WIDGET_ADDITION_FORM_RESULT_SEPARATION
        }
        className={"!w-full !h-full"}
      >
        <ResizablePanel defaultSize={55}>
          <form
            id="widget-addition-form"
            className="flex h-full w-full flex-col items-stretch gap-2 overflow-y-auto bg-brand-dark p-4 pb-10"
            onSubmit={addWidgetForm.handleSubmit}
          >
            {addWidgetForm && (
              <WidgetConfigEditor
                key={`widgetConfigEditor_${uniqueKey}`}
                widgetEditorForm={addWidgetForm}
                dataSourceResults={dataSourceResults}
                onDataSourceResults={setDataSourceResults}
              />
            )}
          </form>
        </ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel defaultSize={45} className="relative flex flex-col min-h-0">
          <div className="flex-1 min-h-0 w-full relative">
            <WidgetPreview
              widgetTitle={addWidgetForm.values.widgetTitle}
              widgetType={addWidgetForm.values.widgetType}
              widgetConfig={addWidgetForm.values.widgetConfig}
              dataSourceResults={dataSourceResults}
              isFetchingData={false}
              isRefreshingData={false}
              refreshData={() => {}}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
