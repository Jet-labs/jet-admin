import { useFormik } from "formik";
import React, { useState } from "react";
import { createListenerAPI } from "../../../data/apis/listener";
import { displayError, displaySuccess } from "../../../utils/notification";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CONSTANTS } from "../../../constants";
import PropTypes from "prop-types";
import { ListenerEditor } from "./listenerEditor";
import { ListenerTestingForm } from "./listenerTestingForm";
import { useNavigate } from "react-router-dom";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";

import { Button, Spinner } from "@jet-admin/ui";

export const ListenerAdditionForm = ({ tenantID }) => {
  ListenerAdditionForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [createdListener, setCreatedListener] = useState(null);

  const { isPending: isAddingListener, mutate: addListener } = useMutation({
    mutationFn: (data) => {
      return createListenerAPI({
        tenantID,
        listenerData: data,
      });
    },
    retry: false,
    onSuccess: (newListener) => {
      displaySuccess(CONSTANTS.STRINGS.LISTENER_ADDED_SUCCESS);
      queryClient.invalidateQueries([
        CONSTANTS.REACT_QUERY_KEYS.LISTENERS(tenantID),
      ]);
      // Stay on page and show testing panel
      setCreatedListener(newListener);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const listenerAdditionForm = useFormik({
    initialValues: {
      listenerTitle: "",
      listenerDescription: "",
      datasourceID: "",
      listenerType: "",
      listenerConfig: {},
      transformScript: "",
      status: "inactive",
    },
    onSubmit: (data) => {
      addListener(data);
    },
  });

  const _navigateToUpdate = () => {
    if (createdListener?.listenerID) {
      navigate(
        CONSTANTS.ROUTES.UPDATE_LISTENER_BY_ID.path(
          tenantID,
          createdListener.listenerID
        )
      );
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-center bg-brand-dark">
      <div className="flex w-full flex-wrap items-center justify-between gap-3 border-b border-border bg-brand-dark px-4 py-3">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            {CONSTANTS.STRINGS.ADD_LISTENER_FORM_TITLE}
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Configure a new real-time event listener.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {createdListener && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={_navigateToUpdate}
            >
              Open listener
            </Button>
          )}
          <Button
            type="submit"
            form="listener-addition-form"
            disabled={isAddingListener || !!createdListener}
          >
            {isAddingListener && <Spinner size={14} />}
            {createdListener
              ? "✓ Listener created"
              : CONSTANTS.STRINGS.ADD_LISTENER_SUBMIT_BUTTON_TEXT}
          </Button>
        </div>
      </div>

      <ResizablePanelGroup
        direction="vertical"
        autoSaveId="listener-addition-panel-layout"
        className="!w-full !h-full"
      >
        <ResizablePanel defaultSize={createdListener ? 60 : 100} className="!overflow-y-auto h-full p-3 md:p-6">
          <div className="mx-auto w-full max-w-2xl pb-8">
            <form
              id="listener-addition-form"
              className="space-y-4 w-full"
              onSubmit={listenerAdditionForm.handleSubmit}
              noValidate
            >
              <ListenerEditor listenerEditorForm={listenerAdditionForm} tenantID={tenantID} />
            </form>
          </div>
        </ResizablePanel>

        {/* Testing panel — shown after listener is created */}
        {createdListener?.listenerID && (
          <>
            <ResizableHandle withHandle={true} />
            <ResizablePanel defaultSize={40}>
              <div className="h-full w-full">
                <ListenerTestingForm
                  tenantID={tenantID}
                  listenerID={createdListener.listenerID}
                  currentStatus={createdListener.status || "inactive"}
                  transformScript={listenerAdditionForm.values.transformScript}
                  onStatusChange={(newStatus) =>
                    setCreatedListener((prev) => ({
                      ...prev,
                      status: newStatus,
                    }))
                  }
                />
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
};
