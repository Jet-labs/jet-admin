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
import React, { useState, useRef, useEffect } from "react";
import { Undo } from "lucide-react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { AppPageRuntimeProvider } from "../../../logic/appPageRuntime/AppPageRuntimeProvider";
import { AppPageDataSourceBootstrapper } from "./appPageDataSourceBootstrapper";

import { PageHeader, Button } from "@jet-admin/ui";

const initialAppPageConfig = {
  widgets: [],
  layouts: {},
  dataSources: [],
  variables: [],
};

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
      queryClient.invalidateQueries({
        queryKey:
        [CONSTANTS.REACT_QUERY_KEYS.APP_PAGES(tenantID)],
      });
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const [history, setHistory] = useState([initialAppPageConfig]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoAction = useRef(false);

  const appPageAdditionForm = useFormik({
    initialValues: {
      appPageTitle: "",
      appPageDescription: "",
      appPageConfig: initialAppPageConfig,
      fetchedDataPreview: {},
    },
    validateOnMount: false,
    validateOnChange: false,
    validationSchema: formValidations.addAppPageFormValidationSchema,
    onSubmit: (values) => {
      addAppPage(values);
    },
  });

  useEffect(() => {
    if (isUndoAction.current) {
      isUndoAction.current = false;
      return;
    }

    if (history.length > 0 && appPageAdditionForm.values.appPageConfig) {
      const currentConfig = appPageAdditionForm.values.appPageConfig;
      const lastConfig = history[historyIndex];

      if (JSON.stringify(currentConfig) !== JSON.stringify(lastConfig)) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(currentConfig);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    }
  }, [appPageAdditionForm.values.appPageConfig]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevConfig = history[historyIndex - 1];
      isUndoAction.current = true;
      appPageAdditionForm.setFieldValue("appPageConfig", prevConfig);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleAddWidgetToCanvas = (widgetID) => {
    const nextAppPageConfig = appendWidgetToAppPageConfig(
      appPageAdditionForm.values.appPageConfig,
      widgetID
    );
    appPageAdditionForm.setFieldValue("appPageConfig", {
      ...appPageAdditionForm.values.appPageConfig,
      ...nextAppPageConfig,
    });
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
        >
          {historyIndex > 0 && (
            <div className="flex items-center gap-2 mr-2">
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
                {historyIndex} unsaved change{historyIndex > 1 ? "s" : ""}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUndo}
                title="Undo Last Change"
              >
                <Undo className="h-4 w-4 mr-1.5" />
                Undo
              </Button>
            </div>
          )}
        </PageHeader>
        {appPageAdditionForm.values.appPageConfig ? (
          <AppPageRuntimeProvider
            pageID="new"
            tenantID={tenantID}
            pageConfig={appPageAdditionForm.values.appPageConfig}
          >
            <AppPageDataSourceBootstrapper />
            <ResizablePanelGroup direction="vertical" className="!h-full !w-full">
              <ResizablePanel id={CONSTANTS.RESIZABLE_PANEL_IDS.APP_PAGE_ADD_TOP_PANEL} defaultSize={75} className="flex min-h-0 min-w-0">
                <ResizablePanelGroup
                  direction="horizontal"
                  autoSaveId={
                    CONSTANTS.RESIZABLE_PANEL_KEYS
                      .APP_PAGE_ADDITION_FORM_RESULT_SEPARATION
                  }
                  className="!h-full !w-full"
                >
                  <ResizablePanel id={CONSTANTS.RESIZABLE_PANEL_IDS.APP_PAGE_ADD_EDITOR_PANEL} defaultSize={20} className="overflow-hidden bg-background">
                    <AppPageEditor
                      appPageEditorForm={appPageAdditionForm}
                      tenantID={tenantID}
                      onAddWidget={handleAddWidgetToCanvas}
                    />
                  </ResizablePanel>
                  <ResizableHandle withHandle={true} />
                  <ResizablePanel id={CONSTANTS.RESIZABLE_PANEL_IDS.APP_PAGE_ADD_DROPZONE_PANEL} defaultSize={80} className="overflow-hidden bg-background">
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
              <ResizablePanel id={CONSTANTS.RESIZABLE_PANEL_IDS.APP_PAGE_ADD_CONSOLE_PANEL} defaultSize={25} className="overflow-hidden min-h-[40px] flex flex-col">
                <AppPageConsole />
              </ResizablePanel>
            </ResizablePanelGroup>
          </AppPageRuntimeProvider>
        ) : null}
      </div>
    </DndProvider>
  );
};

