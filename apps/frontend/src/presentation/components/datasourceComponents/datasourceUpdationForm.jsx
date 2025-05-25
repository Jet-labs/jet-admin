import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import {
  getDatasourceByIDAPI,
  updateDatasourceAPI,
} from "../../../data/apis/datasource";
import { displayError, displaySuccess } from "../../../utils/notification";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CONSTANTS } from "../../../constants";
import PropTypes from "prop-types";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { CircularProgress } from "@mui/material";
import { DATASOURCE_UI_COMPONENTS } from "@jet-admin/datasources-ui";
import { DATASOURCE_TYPES } from "@jet-admin/datasource-types";
import { DatasourceEditor } from "./datasourceEditor";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { DatasourceTestingForm } from "./datasourceTestingForm";

// --- Original Metadata (only for datasourceOptions) ---
const datasourceOptionsMetadata =
  DATASOURCE_UI_COMPONENTS[DATASOURCE_TYPES.POSTGRESQL.value].formConfig;

export const DatasourceUpdationForm = ({ tenantID, datasourceID }) => {
  DatasourceUpdationForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
    datasourceID: PropTypes.number.isRequired,
  };

  const queryClient = useQueryClient();
  const [datasourceTestResult, setDatasourceTestResult] = useState();

  const {
    isLoading: isLoadingDatasource,
    data: datasource,
    error: loadDatasourceError,
    isFetching: isFetchingDatasource,
    isRefetching: isRefetechingDatasource,
    refetch: refetchDatasource,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.DATASOURCES(tenantID), datasourceID],
    queryFn: () =>
      getDatasourceByIDAPI({
        tenantID,
        datasourceID,
      }),
    refetchOnWindowFocus: false,
  });

  const { isPending: isAddingDatasource, mutate: updateDatasource } =
    useMutation({
      mutationFn: (data) => {
        // 'data' here will be the complete form object from Formik
        return updateDatasourceAPI({
          tenantID,
          datasourceID,
          ...data,
        });
      },
      retry: false,
      onSuccess: () => {
        displaySuccess(
          CONSTANTS.STRINGS.UPDATE_DATASOURCE_FORM_DATASOURCE_ADDITION_SUCCESS
        );
        queryClient.invalidateQueries([
          CONSTANTS.REACT_QUERY_KEYS.DATASOURCES(tenantID),
        ]);
      },
      onError: (error) => {
        displayError(error);
      },
    });

  const datasourceUpdationForm = useFormik({
    initialValues: {
      datasourceTitle: "",
      datasourceDescription: "",
      datasourceType: "postgresql", // Default value
      datasourceOptions: datasourceOptionsMetadata.initialData, // Initialize nested object
    },
    onSubmit: (data) => {
      updateDatasource(data);
    },
  });

  useEffect(() => {
    if (datasource) {
      datasourceUpdationForm.setFieldValue(
        "datasourceTitle",
        datasource.datasourceTitle
      );
      datasourceUpdationForm.setFieldValue(
        "datasourceType",
        datasource.datasourceType
      );
      datasourceUpdationForm.setFieldValue(
        "datasourceOptions",
        datasource.datasourceOptions
      );
    }
  }, [datasource]);

  return (
    <div className="w-full flex flex-col justify-start items-center h-full">
      <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-700 md:text-2xl text-start w-full p-3">
        {CONSTANTS.STRINGS.UPDATE_DATASOURCE_FORM_TITLE}
      </h1>
      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingDatasource}
        isFetching={isFetchingDatasource}
        isRefetching={isRefetechingDatasource}
        refetch={refetchDatasource}
        error={loadDatasourceError}
      >
        <ResizablePanelGroup
          direction="vertical"
          autoSaveId={
            CONSTANTS.RESIZABLE_PANEL_KEYS.QUERY_ADDITION_FORM_RESULT_SEPARATION
          }
          className={"!w-full !h-full border-t border-gray-200"}
        >
          <ResizablePanel
            defaultSize={20}
            className="!overflow-y-auto h-full   p-3 "
          >
            <form
              className="space-y-3 md:space-y-4 w-full"
              onSubmit={datasourceUpdationForm.handleSubmit}
            >
              <DatasourceEditor datasourceEditorForm={datasourceUpdationForm} />
              <div className="flex flex-row justify-start items-center">
                <DatasourceTestingForm
                  tenantID={tenantID}
                  datasourceType={datasourceUpdationForm.values.datasourceType}
                  datasourceOptions={
                    datasourceUpdationForm.values.datasourceOptions
                  }
                  setDatasourceTestResult={setDatasourceTestResult}
                />
                <button
                  type="submit"
                  disabled={isAddingDatasource}
                  className="flex flex-row justify-center items-center px-3 py-1.5 text-xs font-medium text-center text-white bg-[#646cff] rounded hover:bg-[#646cff] focus:ring-4 focus:outline-none"
                >
                  {isAddingDatasource && (
                    <CircularProgress
                      className="!mr-3"
                      size={16}
                      color="white"
                    />
                  )}
                  {CONSTANTS.STRINGS.UPDATE_DATASOURCE_FORM_SUBMIT_BUTTON}
                </button>
              </div>
            </form>
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel defaultSize={80}>
            {datasourceTestResult !== undefined || datasourceTestResult !== null
              ? DATASOURCE_UI_COMPONENTS[
                  datasourceUpdationForm.values.datasourceType
                ]?.datasourceTestResultUI({
                  connectionResult: datasourceTestResult,
                })
              : null}
          </ResizablePanel>
        </ResizablePanelGroup>
      </ReactQueryLoadingErrorWrapper>
    </div>
  );
};
