import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { CONSTANTS } from "../../../constants";
import { createAppPageAPI } from "../../../data/apis/appPage";
import { displayError, displaySuccess } from "../../../utils/notification";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { AppPageDropzone } from "./appPageDropzone";
import { AppPageEditor } from "./appPageEditor";
import { AppPageConsole } from "./appPageConsole";
import { appendWidgetToAppPageConfig } from "./appPageLayoutUtils";
import { formValidations } from "../../../utils/formValidation";
import PropTypes from "prop-types";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { AppPageRuntimeProvider } from "../../../logic/appPageRuntime/AppPageRuntimeProvider";
import { AppPageDataSourceBootstrapper } from "./appPageDataSourceBootstrapper";

import { PageHeader } from "@jet-admin/ui";

export const AppPageAdditionForm = ({ tenantID }) => {
  AppPageAdditionForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };
  const queryClient = useQueryClient();
  const { isPending: isAddingAppPage, mutate: addAppPage } = useMutation({
    mutationFn: (data) => {
      return createAppPageAPI({
        tenantID,
        appPageData: data,
      });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess(
        CONSTANTS.STRINGS.ADD_APP_PAGE_FORM_APP_PAGE_ADDITION_SUCCESS
      );
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.APP_PAGES(tenantID),
      ]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const appPageAdditionForm = useFormik({
    initialValues: {
      appPageTitle: "",
      appPageDescription: "",
      appPageConfig: {
        widgets: [],
        layouts: {},
        dataSources: [],
        variables: [],
      },
      fetchedDataPreview: {},
    },
    validateOnMount: false,
    validateOnChange: false,
    validationSchema: formValidations.addAppPageFormValidationSchema,
    onSubmit: (values) => {
      addAppPage(values);
    },
  });

  const handleAddWidgetToCanvas = (widgetID) => {
    const nextAppPageConfig = appendWidgetToAppPageConfig(
      appPageAdditionForm.values.appPageConfig,
      widgetID
    );

    appPageAdditionForm.setFieldValue(
      "appPageConfig.widgets",
      nextAppPageConfig.widgets
    );
    appPageAdditionForm.setFieldValue(
      "appPageConfig.layouts",
      nextAppPageConfig.layouts
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-full w-full flex-col items-center bg-background">
        <PageHeader
          title={CONSTANTS.STRINGS.ADD_APP_PAGE_FORM_TITLE}
          parentTitle={CONSTANTS.STRINGS.MAIN_DRAWER_APP_PAGES_TITLE}
          onSave={appPageAdditionForm.handleSubmit}
          isSaving={isAddingAppPage}
          saveText="Save"
        />
        {appPageAdditionForm.values.appPageConfig ? (
          <AppPageRuntimeProvider
            pageID="new"
            tenantID={tenantID}
            pageConfig={appPageAdditionForm.values.appPageConfig}
          >
            <AppPageDataSourceBootstrapper />
            <ResizablePanelGroup direction="vertical" className="!h-full !w-full">
              <ResizablePanel defaultSize={75} className="flex min-h-0 min-w-0">
                <ResizablePanelGroup
                  direction="horizontal"
                  autoSaveId={
                    CONSTANTS.RESIZABLE_PANEL_KEYS
                      .APP_PAGE_ADDITION_FORM_RESULT_SEPARATION
                  }
                  className="!h-full !w-full"
                >
                  <ResizablePanel defaultSize={20} className="overflow-hidden bg-background">
                    <AppPageEditor
                      appPageEditorForm={appPageAdditionForm}
                      tenantID={tenantID}
                      onAddWidget={handleAddWidgetToCanvas}
                    />
                  </ResizablePanel>
                  <ResizableHandle withHandle={true} />
                  <ResizablePanel defaultSize={80} className="overflow-hidden bg-background">
                    <AppPageDropzone
                      tenantID={tenantID}
                      pageConfig={appPageAdditionForm.values.appPageConfig}
                      widgets={appPageAdditionForm.values.appPageConfig.widgets}
                      setWidgets={(value) =>
                        appPageAdditionForm.setFieldValue(
                          "appPageConfig.widgets",
                          value
                        )
                      }
                      layouts={appPageAdditionForm.values.appPageConfig.layouts}
                      setLayouts={(value) => {
                        appPageAdditionForm.setFieldValue(
                          "appPageConfig.layouts",
                          value
                        );
                      }}
                      onChangePageConfig={(newConfig) => {
                        appPageAdditionForm.setFieldValue(
                          "appPageConfig",
                          newConfig
                        );
                      }}
                    />
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>
              <ResizableHandle withHandle={true} />
              <ResizablePanel defaultSize={25} className="overflow-hidden min-h-[40px] flex flex-col">
                <AppPageConsole />
              </ResizablePanel>
            </ResizablePanelGroup>
          </AppPageRuntimeProvider>
        ) : null}
      </div>
    </DndProvider>
  );
};

