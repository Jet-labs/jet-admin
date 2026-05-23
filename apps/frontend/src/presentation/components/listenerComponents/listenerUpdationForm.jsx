import { useFormik } from "formik";
import React from "react";
import {
  updateListenerAPI,
  getListenerByIDAPI,
  deleteListenerAPI,
} from "../../../data/apis/listener";
import { displayError, displaySuccess } from "../../../utils/notification";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CONSTANTS } from "../../../constants";
import PropTypes from "prop-types";
import { ListenerEditor } from "./listenerEditor";
import { ListenerCloneForm } from "./listenerCloneForm";
import { ListenerDeletionForm } from "./listenerDeletionForm";
import { ListenerTestingForm } from "./listenerTestingForm";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";

import { Spinner, Tabs, TabsContent, TabsList, TabsTrigger, PageHeader } from "@jet-admin/ui";
import { useGlobalUI } from "../../../logic/stores/useUIStore";
import { useNavigate } from "react-router-dom";
import { ListenerActionManager } from "./listenerActionManager";

export const ListenerUpdationForm = ({ tenantID, listenerID }) => {
  ListenerUpdationForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    listenerID: PropTypes.string.isRequired,
  };

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { showConfirmation } = useGlobalUI();


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
      status: listener?.status || "inactive",
    },
    enableReinitialize: true,
    onSubmit: (data) => {
      updateListener(data);
    },
  });

  if (isLoadingListener) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <Spinner size={24} />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center bg-background">
      <PageHeader
        title={CONSTANTS.STRINGS.UPDATE_LISTENER_FORM_TITLE}
        parentTitle={CONSTANTS.STRINGS.MAIN_DRAWER_LISTENERS_TITLE}

        id={listenerID}
        onSave={listenerUpdationForm.handleSubmit}
        isSaving={isUpdatingListener}
      >
        <ListenerDeletionForm tenantID={tenantID} listenerID={listenerID} />
        <ListenerCloneForm tenantID={tenantID} listenerID={listenerID} />
      </PageHeader>

      <ResizablePanelGroup
        direction="vertical"
        autoSaveId="listener-updation-panel-layout"
        className="!w-full !h-full"
      >
        <ResizablePanel defaultSize={60} className="!overflow-y-auto h-full p-8"
        >
          <div className="mx-auto w-full max-w-2xl">
            <Tabs defaultValue="config" className="w-full">
              <TabsList className="">
                <TabsTrigger value="config">General Configuration</TabsTrigger>
                <TabsTrigger value="actions">Pipeline Steps ({listener?.actions?.length || 0})</TabsTrigger>
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
