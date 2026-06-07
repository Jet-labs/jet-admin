import { useFormik } from "formik";
import React from "react";
import { createListenerAPI } from "../../../data/apis/listener";
import { displayError, displaySuccess } from "../../../utils/notification";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CONSTANTS } from "../../../constants";
import PropTypes from "prop-types";
import { ListenerEditor } from "./listenerEditor";
import { useNavigate } from "react-router-dom";

import { Button, Spinner, PageHeader } from "@jet-admin/ui";

export const ListenerAdditionForm = ({ tenantID }) => {
  ListenerAdditionForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };

  const queryClient = useQueryClient();
  const navigate = useNavigate();

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
      queryClient.invalidateQueries({
        queryKey:
        [CONSTANTS.REACT_QUERY_KEYS.LISTENERS(tenantID)],
      });
      if (newListener?.listenerID) {
        navigate(
          CONSTANTS.ROUTES.UPDATE_LISTENER_BY_ID.path(
            tenantID,
            newListener.listenerID
          )
        );
      }
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

  return (
    <div className="flex h-full w-full flex-col items-center bg-background">
      <PageHeader
        title={CONSTANTS.STRINGS.ADD_LISTENER_FORM_TITLE}
        parentTitle={CONSTANTS.STRINGS.MAIN_DRAWER_LISTENERS_TITLE}

        onSave={listenerAdditionForm.handleSubmit}
        isSaving={isAddingListener}
        saveText="Save"
      >
        <Button
          type="submit"
          form="listener-addition-form"
          disabled={isAddingListener}
          size="sm"
        >
          {isAddingListener && <Spinner size={14} className="mr-2" />}
          {CONSTANTS.STRINGS.ADD_LISTENER_SUBMIT_BUTTON_TEXT}
        </Button>
      </PageHeader>

      <div className="w-full h-full overflow-y-auto p-8">
        <div className="mx-auto w-full max-w-2xl">
          <form
            id="listener-addition-form"
            className="space-y-4 w-full"
            onSubmit={listenerAdditionForm.handleSubmit}
            noValidate
          >
            <ListenerEditor listenerEditorForm={listenerAdditionForm} tenantID={tenantID} />
          </form>
        </div>
      </div>
    </div>
  );
};
