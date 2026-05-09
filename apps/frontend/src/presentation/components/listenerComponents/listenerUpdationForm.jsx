import { useFormik } from "formik";
import React from "react";
import {
  updateListenerAPI,
  getListenerByIDAPI,
} from "../../../data/apis/listener";
import { displayError, displaySuccess } from "../../../utils/notification";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CONSTANTS } from "../../../constants";
import PropTypes from "prop-types";
import { ListenerEditor } from "./listenerEditor";
import { ListenerDeletionForm } from "./listenerDeletionForm";
import { ListenerTestingForm } from "./listenerTestingForm";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";

import { Button, Spinner, Tabs, TabsContent, TabsList, TabsTrigger } from "@jet-admin/ui";
import { ListenerActionManager } from "./listenerActionManager";

export const ListenerUpdationForm = ({ tenantID, listenerID }) => {
  ListenerUpdationForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    listenerID: PropTypes.string.isRequired,
  };

  const queryClient = useQueryClient();

  const { data: listener, isLoading: isLoadingListener } = useQuery({
    queryKey: ["LISTENER_DETAIL", tenantID, listenerID],
    queryFn: () => getListenerByIDAPI({ tenantID, listenerID }),
    refetchOnWindowFocus: false,
    enabled: Boolean(tenantID && listenerID),
  });

  const { isPending: isUpdatingListener, mutate: updateListener } =
    useMutation({
      mutationFn: (data) => {
        return updateListenerAPI({
          tenantID,
          listenerID,
          listenerData: data,
        });
      },
      retry: false,
      onSuccess: () => {
        displaySuccess(CONSTANTS.STRINGS.LISTENER_UPDATED_SUCCESS);
        queryClient.invalidateQueries([
          CONSTANTS.REACT_QUERY_KEYS.LISTENERS(tenantID),
        ]);
        queryClient.invalidateQueries([
          "LISTENER_DETAIL",
          tenantID,
          listenerID,
        ]);
      },
      onError: (error) => {
        displayError(error);
      },
    });

  const listenerUpdationForm = useFormik({
    initialValues: {
      listenerTitle: listener?.listenerTitle || "",
      listenerDescription: listener?.listenerDescription || "",
      datasourceID: listener?.datasourceID || "",
      listenerType: listener?.listenerType || "",
      listenerConfig: listener?.listenerConfig || {},
      transformScript: listener?.transformScript || "",
      status: listener?.status || "inactive",
    },
    enableReinitialize: true,
    onSubmit: (data) => {
      updateListener(data);
    },
  });

  if (isLoadingListener) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-brand-dark">
        <Spinner size={24} />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center bg-brand-dark">
      <div className="flex w-full flex-wrap items-center justify-between gap-3 border-b border-border bg-brand-dark px-4 py-3">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            {CONSTANTS.STRINGS.UPDATE_LISTENER_FORM_TITLE}
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {listener?.listenerTitle || "Listener configuration"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ListenerDeletionForm
            tenantID={tenantID}
            listenerID={listenerID}
          />
          <Button
            type="submit"
            form="listener-update-form"
            disabled={isUpdatingListener}
          >
            {isUpdatingListener && <Spinner size={14} />}
            {CONSTANTS.STRINGS.UPDATE_LISTENER_SUBMIT_BUTTON_TEXT}
          </Button>
        </div>
      </div>

      <ResizablePanelGroup
        direction="vertical"
        autoSaveId="listener-updation-panel-layout"
        className="!w-full !h-full"
      >
        <ResizablePanel defaultSize={60} className="!overflow-y-auto h-full p-3 md:p-6">
          <div className="mx-auto w-full max-w-4xl pb-8">
            <Tabs defaultValue="config" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="config">General Configuration</TabsTrigger>
                <TabsTrigger value="actions">Pipeline Actions ({listener?.actions?.length || 0})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="config">
                <form
                  id="listener-update-form"
                  className="space-y-4 w-full"
                  onSubmit={listenerUpdationForm.handleSubmit}
                  noValidate
                >
                  <ListenerEditor listenerEditorForm={listenerUpdationForm} tenantID={tenantID} />
                </form>
              </TabsContent>
              
              <TabsContent value="actions">
                <ListenerActionManager 
                  tenantID={tenantID} 
                  listenerID={listenerID} 
                  actions={listener?.actions || []} 
                />
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel defaultSize={40}>
          <div className="h-full w-full">
            <ListenerTestingForm
              tenantID={tenantID}
              listenerID={listenerID}
              currentStatus={listenerUpdationForm.values.status}
              transformScript={listenerUpdationForm.values.transformScript}
              onStatusChange={(newStatus) =>
                listenerUpdationForm.setFieldValue("status", newStatus)
              }
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
