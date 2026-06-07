import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import PropTypes from "prop-types";
import React, { useEffect, useState, useRef } from "react";
import { Undo } from "lucide-react";
import { CONSTANTS } from "../../../constants";
import {
  getAppPageByIDAPI,
  updateAppPageByIDAPI,
} from "../../../data/apis/appPage";
import { useGlobalUI } from "../../../logic/stores/useUIStore";
import { formValidations } from "../../../utils/formValidation";
import { displayError, displaySuccess } from "../../../utils/notification";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { AppPageCloneForm } from "./appPageCloneForm";
import { AppPageDeletionForm } from "./appPageDeletionForm";
import { AppPageDropzone } from "./appPageDropzone";
import { AppPageEditor } from "./appPageEditor";
import { AppPageConsole } from "./appPageConsole";
import { appendWidgetToAppPageConfig } from "./appPageLayoutUtils";
import { AppPageRuntimeProvider } from "../../../logic/appPageRuntime/AppPageRuntimeProvider";
import { AppPageDataSourceBootstrapper } from "./appPageDataSourceBootstrapper";

import { PageHeader, Button } from "@jet-admin/ui";

const initialValues = {
  appPageTitle: "",
  appPageDescription: "",
  appPageConfig: {
    widgets: [],
    layouts: {},
    dataSources: [],
    variables: [],
  },
  fetchedDataPreview: {},
};

export const AppPageUpdationForm = ({ tenantID, appPageID }) => {
  AppPageUpdationForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    appPageID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };
  const queryClient = useQueryClient();
  const { showConfirmation } = useGlobalUI();

  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoAction = useRef(false);

  const {
    isLoading: isLoadingAppPage,
    data: appPage,
    error: loadAppPageError,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.APP_PAGES(tenantID), appPageID],
    queryFn: () =>
      getAppPageByIDAPI({
        tenantID,
        appPageID,
      }),
    refetchOnWindowFocus: false,
  });

  const { isPending: isUpdatingAppPage, mutate: updateAppPage } =
    useMutation({
      mutationFn: (data) => {
        return updateAppPageByIDAPI({
          tenantID,
          appPageID,
          appPageData: data,
        });
      },
      retry: false,
      onSuccess: () => {
        displaySuccess(
          CONSTANTS.STRINGS.UPDATE_APP_PAGE_FORM_APP_PAGE_UPDATION_SUCCESS
        );
        queryClient.invalidateQueries({
          queryKey:
          CONSTANTS.REACT_QUERY_KEYS.APP_PAGES(tenantID),
        });
      },
      onError: (error) => {
        displayError(error);
      },
    });

  const appPageUpdationForm = useFormik({
    initialValues: appPage && appPage.appPageID ? {
      appPageTitle: appPage.appPageTitle || CONSTANTS.STRINGS.UNTITLED,
      appPageDescription: appPage.appPageDescription || "",
      appPageConfig: appPage.appPageConfig || {
        widgets: [],
        layouts: {},
        dataSources: [],
        variables: [],
      },
      fetchedDataPreview: {},
    } : initialValues,
    enableReinitialize: true,
    validateOnMount: false,
    validateOnChange: false,
    validationSchema: formValidations.updateAppPageFormValidationSchema,
    onSubmit: async (values) => {
      const confirmed = await showConfirmation({
        title: CONSTANTS.STRINGS.UPDATE_APP_PAGE_FORM_UPDATE_DIALOG_TITLE,
        message: CONSTANTS.STRINGS.UPDATE_APP_PAGE_FORM_UPDATE_DIALOG_MESSAGE,
        confirmText: "Update",
        cancelText: "Cancel",
        confirmButtonClass: "",
      });
      if (!confirmed) return;
      updateAppPage(values);
    },
  });

  useEffect(() => {
    if (appPage) {
      setHistory([appPage.appPageConfig || {}]);
      setHistoryIndex(0);
      isUndoAction.current = false;
    }
  }, [appPage]);

  useEffect(() => {
    if (isUndoAction.current) {
      isUndoAction.current = false;
      return;
    }

    if (history.length > 0 && appPageUpdationForm.values.appPageConfig) {
      const currentConfig = appPageUpdationForm.values.appPageConfig;
      const lastConfig = history[historyIndex];

      if (JSON.stringify(currentConfig) !== JSON.stringify(lastConfig)) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(currentConfig);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    }
  }, [appPageUpdationForm.values.appPageConfig]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevConfig = history[historyIndex - 1];
      isUndoAction.current = true;
      appPageUpdationForm.setFieldValue("appPageConfig", prevConfig);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleAddWidgetToCanvas = (widgetID) => {
    const nextAppPageConfig = appendWidgetToAppPageConfig(
      appPageUpdationForm.values.appPageConfig,
      widgetID
    );
    appPageUpdationForm.setFieldValue("appPageConfig", {
      ...appPageUpdationForm.values.appPageConfig,
      ...nextAppPageConfig,
    });
  };

  return (
    <div className="flex h-full w-full flex-col items-center bg-background">
      <PageHeader
        title={CONSTANTS.STRINGS.UPDATE_APP_PAGE_FORM_TITLE}
        parentTitle={CONSTANTS.STRINGS.MAIN_DRAWER_APP_PAGES_TITLE}
        id={appPageID}
        onSave={appPageUpdationForm.handleSubmit}
        isSaving={isUpdatingAppPage}
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
        <AppPageDeletionForm
          key={`appPageDeletionForm_${appPage?.appPageID}`}
          tenantID={tenantID}
          appPageID={appPageID}
        />
        <AppPageCloneForm
          key={`appPageCloneForm_${appPage?.appPageID}`}
          tenantID={tenantID}
          appPageID={appPageID}
        />
      </PageHeader>

      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingAppPage}
        error={loadAppPageError}
      >
        {appPageUpdationForm.values.appPageConfig ? (
          <AppPageRuntimeProvider
            pageID={appPageID}
            tenantID={tenantID}
            pageConfig={appPageUpdationForm.values.appPageConfig}
          >
            <AppPageDataSourceBootstrapper />
            <ResizablePanelGroup direction="vertical" className="!h-full !w-full">
              <ResizablePanel defaultSize={75} className="flex min-h-0 min-w-0">
                <ResizablePanelGroup
                  direction="horizontal"
                  autoSaveId={
                    CONSTANTS.RESIZABLE_PANEL_KEYS
                      .APP_PAGE_UPDATION_FORM_RESULT_SEPARATION
                  }
                  className="!h-full !w-full"
                >
                  <ResizablePanel defaultSize={20} className="overflow-hidden bg-background">
                    <AppPageEditor
                      appPageEditorForm={appPageUpdationForm}
                      tenantID={tenantID}
                      onAddWidget={handleAddWidgetToCanvas}
                    />
                  </ResizablePanel>
                  <ResizableHandle withHandle={true} />
                  <ResizablePanel defaultSize={80} className="overflow-hidden bg-background">
                    <AppPageDropzone
                      tenantID={tenantID}
                      pageID={appPageID}
                      pageConfig={appPageUpdationForm.values.appPageConfig}
                      widgets={appPageUpdationForm.values.appPageConfig.widgets}
                      setWidgets={(value) =>
                        appPageUpdationForm.setFieldValue(
                          "appPageConfig.widgets",
                          value
                        )
                      }
                      layouts={appPageUpdationForm.values.appPageConfig.layouts}
                      setLayouts={(value) => {
                        appPageUpdationForm.setFieldValue(
                          "appPageConfig.layouts",
                          value
                        );
                      }}
                      onChangePageConfig={(newConfig) => {
                        appPageUpdationForm.setFieldValue(
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
      </ReactQueryLoadingErrorWrapper>
    </div>
  );
};


