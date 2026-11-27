import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { useNavigate, useSearchParams } from "react-router-dom";
import PropTypes from "prop-types";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { CONSTANTS } from "../../../../constants";
import {
  getAppPageByIDAPI,
  updateAppPageByIDAPI,
} from "../../../../data/apis/appPage";
import { getApplicationAPI } from "../../../../data/apis/application";
import { useGlobalUI } from "../../../../logic/stores/useUIStore";
import { useUnsavedChangesGuard } from "../../../../logic/hooks/useUnsavedChangesGuard";
import { formValidations } from "../../../../utils/formValidation";
import { displayError, displaySuccess } from "../../../../utils/notification";
import { ReactQueryLoadingErrorWrapper } from "../../ui/reactQueryLoadingErrorWrapper";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../ui/resizable";
import { AppPageCloneForm } from "./appPageCloneForm";
import { AppPageDeletionForm } from "./appPageDeletionForm";
import { AppPageVersionHistory } from "./appPageVersionHistory";
import { AppPageDropzone } from "../editor/appPageDropzone";
import { AppPageEditor } from "../editor/appPageEditor";
import { AppPageConsole } from "../editor/appPageConsole";
import { appendWidgetToAppPageConfig } from "../editor/appPageLayoutUtils";
import { AppPageRuntimeProvider } from "../../../../logic/appPageRuntime/AppPageRuntimeProvider";
import { AppPageDataSourceBootstrapper } from "../editor/appPageDataSourceBootstrapper";
import { AppPageWorkflowInputHost } from '../appPageWorkflowInputHost';

import { Button } from "@jet-admin/ui";
import { BundleExportButton } from "../../bundleComponents/bundleExportButton";
import { AssetVersionsButton } from "../../assetVersionComponents/assetVersionsButton";
import { EditorTopBar } from "../../editorShell/editorTopBar";
import { useEditorFocusMode } from "../../editorShell/useEditorFocusMode";

const EMPTY_INITIAL_VALUES = {
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

// Maximum number of undo snapshots kept in memory. Canvas syncs are
// debounced but continuous dragging still produces many entries; without a
// cap the history grows without bound over long editing sessions.
const MAX_HISTORY_ENTRIES = 50;

// JSON.stringify is key-order sensitive; server/runtime normalization can
// otherwise look like a user edit and show a false "1 unsaved change".
// appPageConfigSignature() migrates V1 layouts and ignores editor-only node
// IDs/legacy containers so reopening a saved page is not treated as dirty.
import { appPageConfigSignature } from "../layout/engine/configSignature.js";

export const AppPageUpdationForm = ({ tenantID, appPageID }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [focusMode, setFocusMode] = useEditorFocusMode();
  const consolePanelRef = useRef(null);
  const [consoleCollapsed, setConsoleCollapsed] = useState(true);
  const toggleConsole = () => {
    const nextCollapsed = !consoleCollapsed;
    setConsoleCollapsed(nextCollapsed);
    if (nextCollapsed) {
      consolePanelRef.current?.collapse();
    } else {
      consolePanelRef.current?.expand();
      consolePanelRef.current?.resize(18);
    }
  };
  const { showConfirmation } = useGlobalUI();
  const [searchParams] = useSearchParams();
  const linkedApplicationID = searchParams.get("applicationId");

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

  // When the page is opened from Application Studio, the application
  // definition supplies declared state variables for the reactive refreshOn
  // picker. A standalone page edit simply has no application context.
  const { data: linkedApplicationResponse } = useQuery({
    queryKey: ["application-page-context", tenantID, linkedApplicationID],
    queryFn: () =>
      getApplicationAPI({
        tenantID,
        applicationID: linkedApplicationID,
      }),
    enabled: Boolean(linkedApplicationID),
    retry: false,
    refetchOnWindowFocus: false,
  });
  const linkedApplication = linkedApplicationResponse?.application || null;
  const applicationVariables =
    linkedApplication?.draft?.definition?.state?.application || null;

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
          [CONSTANTS.REACT_QUERY_KEYS.APP_PAGES(tenantID)],
        });
      },
      onError: (error) => {
        displayError(error);
      },
    });

  const formInitialValues = useMemo(() => {
    if (!appPage || !appPage.appPageID) return EMPTY_INITIAL_VALUES;
    return {
      appPageTitle: appPage.appPageTitle || CONSTANTS.STRINGS.UNTITLED,
      appPageDescription: appPage.appPageDescription || "",
      appPageConfig: appPage.appPageConfig || {
        widgets: [],
        layouts: {},
        dataSources: [],
        variables: [],
      },
      fetchedDataPreview: {},
    };
  }, [appPage]);

  const appPageUpdationForm = useFormik({
    initialValues: formInitialValues,
    enableReinitialize: true,
    validateOnMount: false,
    validateOnChange: false,
    validationSchema: formValidations.updateAppPageFormValidationSchema,
    onSubmit: async () => {
      window.dispatchEvent(new CustomEvent("flush-editor-sync"));

      const confirmed = await showConfirmation({
        title: CONSTANTS.STRINGS.UPDATE_APP_PAGE_FORM_UPDATE_DIALOG_TITLE,
        message: CONSTANTS.STRINGS.UPDATE_APP_PAGE_FORM_UPDATE_DIALOG_MESSAGE,
        confirmText: "Update",
        cancelText: "Cancel",
        confirmButtonClass: "",
      });
      if (!confirmed) return;
      updateAppPage({
        ...appPageUpdationForm.values,
        // Optimistic concurrency: the server rejects a save if this page was
        // changed after it was loaded.
        expectedUpdatedAt: appPage?.updatedAt || undefined,
      });
    },
  });

  const [hasInitialized, setHasInitialized] = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  useEffect(() => {
    setHasInitialized(false);
    setEditorKey(0);
  }, [appPageID]);

  useEffect(() => {
    if (appPage && !isLoadingAppPage && appPage.appPageID === appPageID) {
      setHasInitialized(true);
    }
  }, [appPage, isLoadingAppPage, appPageID]);

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
    if (!hasInitialized || !appPage) return;

    if (appPageUpdationForm.values.appPageConfig) {
      const currentConfig = appPageUpdationForm.values.appPageConfig;
      const currentSignature = appPageConfigSignature(currentConfig);
      const loadedSignature = appPageConfigSignature(appPage.appPageConfig || {});

      // The form/runtime may normalize or reorder the config after load. If
      // it is still equivalent to what the server returned, it is not a user
      // edit and must not create an undo entry or an unsaved-change prompt.
      if (currentSignature === loadedSignature) {
        if (historyIndex !== 0 || history.length !== 1) {
          setHistory([currentConfig]);
          setHistoryIndex(0);
        }
        return;
      }

      if (history.length > 0 && history[historyIndex] !== undefined) {
        const lastConfig = history[historyIndex];
        if (appPageConfigSignature(currentConfig) !== appPageConfigSignature(lastConfig)) {
          const branched = [...history.slice(0, historyIndex + 1), currentConfig];
          const newHistory =
            branched.length > MAX_HISTORY_ENTRIES
              ? branched.slice(branched.length - MAX_HISTORY_ENTRIES)
              : branched;
          setHistory(newHistory);
          setHistoryIndex(newHistory.length - 1);
        }
      }
    }
  }, [appPageUpdationForm.values.appPageConfig, appPage, hasInitialized, history, historyIndex]);

  useUnsavedChangesGuard({
    isDirty: historyIndex > 0,
    title: CONSTANTS.STRINGS.UPDATE_APP_PAGE_FORM_TITLE,
  });

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevConfig = history[historyIndex - 1];
      isUndoAction.current = true;
      appPageUpdationForm.setFieldValue("appPageConfig", prevConfig);
      setHistoryIndex(historyIndex - 1);
      setEditorKey((prev) => prev + 1);
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
    // Re-seed the canvas explicitly so the new placement cannot be lost to a
    // late onChangeLayout emission from the previous tree.
    setEditorKey((prev) => prev + 1);
  };

  return (
    <div className="flex h-full w-full flex-col items-center bg-background">
      <EditorTopBar
        title={appPageUpdationForm.values.appPageTitle || appPage?.appPageTitle || "App page"}
        subtitle={`Page Builder · ID ${String(appPageID).slice(0, 8)}`}
        badge={
          <span
            className={`inline-flex h-5 items-center gap-1 rounded-full border px-1.5 text-[10px] font-medium ${
              historyIndex > 0
                ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
            }`}
            title="Saving this page updates the working page and its editor history only. Deployed Applications keep their captured page and data-source versions until you publish a new release."
          >
            <span className={`h-1.5 w-1.5 rounded-full ${historyIndex > 0 ? "bg-amber-400" : "bg-emerald-400"}`} />
            {historyIndex > 0 ? `${historyIndex} unsaved` : "Saved"}
          </span>
        }
        onBack={() => navigate(CONSTANTS.ROUTES.VIEW_APP_PAGES.path(tenantID))}
        backLabel="Back to App Pages"
        backText="Pages"
        focusMode={focusMode}
        onToggleFocus={() => setFocusMode((value) => !value)}
        actions={
          <>
            {historyIndex > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1 px-2 text-xs"
                onClick={handleUndo}
                title="Undo last change"
              >
                Undo
              </Button>
            )}
            <div className="hidden items-center gap-0.5 sm:flex">
            <AppPageVersionHistory
              key={`appPageVersionHistory_${appPage?.appPageID}`}
              tenantID={tenantID}
              appPageID={appPageID}
            />
            <AssetVersionsButton
              tenantID={tenantID}
              assetType="appPage"
              assetID={appPageID}
            />
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
            <BundleExportButton
              tenantID={tenantID}
              entityType="appPage"
              entityID={appPageID}
            />
            </div>
            <Button
              type="button"
              size="sm"
              className="ml-1 h-8"
              onClick={appPageUpdationForm.handleSubmit}
              disabled={isUpdatingAppPage}
              title="Save page (updates the working page, not deployed releases)"
            >
              {isUpdatingAppPage ? "Saving…" : "Update"}
            </Button>
          </>
        }
      />

      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingAppPage || !hasInitialized}
        error={loadAppPageError}
      >
        {appPageUpdationForm.values.appPageConfig ? (
          <AppPageRuntimeProvider
            pageID={appPageID}
            tenantID={tenantID}
            pageConfig={appPageUpdationForm.values.appPageConfig}
          >
            <AppPageDataSourceBootstrapper />
            <AppPageWorkflowInputHost />
            <ResizablePanelGroup direction="vertical" className="!h-full !w-full">
              <ResizablePanel id={CONSTANTS.RESIZABLE_PANEL_IDS.APP_PAGE_UPDATE_TOP_PANEL} defaultSize={82} className="flex min-h-0 min-w-0">
                <ResizablePanelGroup
                  direction="horizontal"
                  autoSaveId={
                    CONSTANTS.RESIZABLE_PANEL_KEYS
                      .APP_PAGE_UPDATION_FORM_RESULT_SEPARATION
                  }
                  className="!h-full !w-full"
                >
                  <ResizablePanel id={CONSTANTS.RESIZABLE_PANEL_IDS.APP_PAGE_UPDATE_EDITOR_PANEL} defaultSize={20} className="overflow-hidden bg-background">
                    <AppPageEditor
                      appPageEditorForm={appPageUpdationForm}
                      tenantID={tenantID}
                      onAddWidget={handleAddWidgetToCanvas}
                      applicationVariables={applicationVariables}
                      applicationTitle={linkedApplication?.title || null}
                    />
                  </ResizablePanel>
                  <ResizableHandle withHandle={true} />
                  <ResizablePanel id={CONSTANTS.RESIZABLE_PANEL_IDS.APP_PAGE_UPDATE_DROPZONE_PANEL} defaultSize={80} className="overflow-hidden bg-background">
                    <AppPageDropzone
                      key={`dropzone_${appPageID}_${editorKey}`}
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
                      appPageEditorForm={appPageUpdationForm}
                      onAddWidget={handleAddWidgetToCanvas}
                      saveState={{
                        isDirty: historyIndex > 0,
                        changeCount: historyIndex,
                        isSaving: isUpdatingAppPage,
                        onSave: appPageUpdationForm.handleSubmit,
                      }}
                    />
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>
              <ResizableHandle withHandle={true} />
              <ResizablePanel
                ref={consolePanelRef}
                id={CONSTANTS.RESIZABLE_PANEL_IDS.APP_PAGE_UPDATE_CONSOLE_PANEL}
                defaultSize={6}
                minSize={6}
                collapsedSize={6}
                onCollapse={() => setConsoleCollapsed(true)}
                onExpand={() => setConsoleCollapsed(false)}
                className="overflow-hidden min-h-[40px] flex flex-col"
              >
                <AppPageConsole
                  isCollapsed={consoleCollapsed}
                  onToggleCollapse={toggleConsole}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          </AppPageRuntimeProvider>
        ) : null}
      </ReactQueryLoadingErrorWrapper>
    </div>
  );
};

AppPageUpdationForm.propTypes = {
  tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  appPageID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};
