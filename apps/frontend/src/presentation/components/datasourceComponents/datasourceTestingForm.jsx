import { CircularProgress } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { CONSTANTS } from "../../../constants";
import { testDatasourceConnectionAPI } from "../../../data/apis/datasource";
import { displayError, displaySuccess } from "../../../utils/notification";
import PropTypes from "prop-types";

export const DatasourceTestingForm = ({
  tenantID,
  datasourceType,
  datasourceOptions,
  setDatasourceTestResult,
}) => {
  DatasourceTestingForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
    datasourceType: PropTypes.string.isRequired,
    datasourceOptions: PropTypes.object.isRequired,
    setDatasourceTestResult: PropTypes.func.isRequired,
  };

  const { isPending: isTestingDatasource, mutate: testDatasource } =
    useMutation({
      mutationFn: () => {
        return testDatasourceConnectionAPI({
          tenantID,
          datasourceType,
          datasourceOptions,
        });
      },
      retry: false,
      onSuccess: () => {
        setDatasourceTestResult(true);
        displaySuccess(CONSTANTS.STRINGS.TEST_DATASOURCE_FORM_TESTING_SUCCESS);
      },
      onError: (error) => {
        setDatasourceTestResult(false);
        displayError(error);
      },
    });

  const _handleTestQuery = () => {
    testDatasource();
  };

  return (
    <>
      <button
        onClick={_handleTestQuery}
        disabled={isTestingDatasource}
        type="button"
        className="flex flex-row items-center justify-center rounded bg-[#646cff]/10 mr-2 px-3 py-1.5 text-xs text-[#646cff] hover:bg-[#646cff]/20 focus:ring-2 focus:ring-[#646cff]/50 outline-none focus:outline-none"
      >
        {isTestingDatasource && (
          <CircularProgress className="!mr-3" size={16} color="white" />
        )}
        {CONSTANTS.STRINGS.TEST_DATASOURCE_FORM_TEST_BUTTON}
      </button>
    </>
  );
};
