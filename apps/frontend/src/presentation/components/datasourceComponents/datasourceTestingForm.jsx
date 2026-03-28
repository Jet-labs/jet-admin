import { useMutation } from "@tanstack/react-query";
import React from "react";
import { CONSTANTS } from "../../../constants";
import { testDatasourceConnectionAPI } from "../../../data/apis/datasource";
import { displayError, displaySuccess } from "../../../utils/notification";
import PropTypes from "prop-types";

import { Button, Spinner } from "@jet-admin/ui";

export const DatasourceTestingForm = ({
  tenantID,
  datasourceType,
  datasourceOptions,
  setDatasourceTestResult,
  size = "sm"
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
      onSuccess: (data) => {
        setDatasourceTestResult(data);
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
      <Button
        onClick={_handleTestQuery}
        disabled={isTestingDatasource}
        type="button"
        variant="primary-ghost"
        size={size}
      >
        {isTestingDatasource ? (
          <Spinner size={14} />
        ) : null}
        {CONSTANTS.STRINGS.TEST_DATASOURCE_FORM_TEST_BUTTON}
      </Button>
    </>
  );
};
