import { useMutation } from "@tanstack/react-query";
import { Play } from 'lucide-react';
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
  datasourceID,
  setDatasourceTestResult,
  size = "default"
}) => {
  DatasourceTestingForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
    datasourceType: PropTypes.string.isRequired,
    datasourceOptions: PropTypes.object.isRequired,
    datasourceID: PropTypes.string,
    setDatasourceTestResult: PropTypes.func.isRequired,
    size: PropTypes.oneOf(["default", "sm", "lg"]),
  };

  const { isPending: isTestingDatasource, mutate: testDatasource } =
    useMutation({
      mutationFn: () => {
        return testDatasourceConnectionAPI({
          tenantID,
          datasourceType,
          datasourceOptions,
          datasourceID,
        });
      },
      retry: false,
      onSuccess: (data) => {
        setDatasourceTestResult(data);
        displaySuccess(CONSTANTS.STRINGS.TEST_DATASOURCE_FORM_TESTING_SUCCESS);
      },
      onError: (error) => {
        // Axios errors carry a large stack/config object. Show only the
        // server-provided message so the result panel cannot dump internals.
        const serverError = error?.response?.data?.error;
        const message = (typeof serverError === "string" ? serverError : serverError?.message)
          || error?.response?.data?.message
          || error?.message
          || "Connection test failed";
        setDatasourceTestResult({ ok: false, error: message });
        displayError(message);
      },
    });

  const _handleTestQuery = () => {
    testDatasource();
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size={size}
        onClick={_handleTestQuery}
        disabled={isTestingDatasource}
        aria-label="Test datasource"
      >
        {isTestingDatasource ? (
          <Spinner size={14} className="mr-1" />
        ) : (
          <Play className="h-3 w-3 mr-1" />
        )}
        Test
      </Button>
    </>
  );
};
