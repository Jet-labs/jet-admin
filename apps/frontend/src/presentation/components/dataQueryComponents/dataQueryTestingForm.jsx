import { useMutation } from "@tanstack/react-query";
import { Play } from 'lucide-react';
import React, { useState } from "react";
import { CONSTANTS } from "../../../constants";
import { testDataQueryByDataAPI, testDataQueryByIDAPI } from "../../../data/apis/dataQuery";
import { displayError, displaySuccess } from "../../../utils/notification";
import { DataQueryInputsForm } from "./dataQueryInputsForm";
import PropTypes from "prop-types";
import { Button, Spinner } from "@jet-admin/ui";

export const DataQueryTestingForm = ({
  tenantID,
  dataQueryID,
  setDataQueryTestResult,
  // eslint-disable-next-line no-unused-vars
  datasourceID,
  // eslint-disable-next-line no-unused-vars
  datasourceType,
  dataQueryOptions,
  dataQuery,
  size = "sm"
}) => {
  DataQueryTestingForm.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    dataQueryID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    setDataQueryTestResult: PropTypes.func.isRequired,
    datasourceID: PropTypes.string,
    datasourceType: PropTypes.string,
    dataQueryOptions: PropTypes.object.isRequired,
    dataQuery: PropTypes.object.isRequired,
  };
  const [isArgsFormOpen, setIsArgsFormOpen] = useState(false);
  console.log({
    tenantID,
    dataQueryID,
    setDataQueryTestResult,
    // eslint-disable-next-line no-unused-vars
    datasourceID,
    // eslint-disable-next-line no-unused-vars
    datasourceType,
    dataQueryOptions,
    dataQuery,
  });

  const { isPending: isTestingDataQuery, mutate: testDataQuery } = useMutation({
    mutationFn: ({ inputValues }) => {
      if (dataQuery) {
        return testDataQueryByDataAPI({
          tenantID,
          dataQuery,
          inputValues,
        });
      } else {
        return testDataQueryByIDAPI({
          tenantID,
          dataQueryID,
          inputValues,
        });
      }
    },
    retry: false,
    onSuccess: (data) => {
      setDataQueryTestResult(data);
      displaySuccess(CONSTANTS.STRINGS.TEST_QUERY_FORM_QUERY_TESTING_SUCCESS);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _handleTestQuery = () => {
    if (
      dataQueryOptions &&
      Array.isArray(dataQueryOptions.inputDefinitions) &&
      dataQueryOptions.inputDefinitions.length > 0
    ) {
      _handleOpenArgsForm();
    } else {
      testDataQuery({ inputValues: {} });
    }
  };

  const _handleOpenArgsForm = () => {
    setIsArgsFormOpen(true);
  };

  const _handleOnArgFormDeclined = () => {
    setIsArgsFormOpen(false);
  };

  const _handleOnArgFormCompleted = (dataQueryArgValues) => {
    setIsArgsFormOpen(false);
    testDataQuery({
      inputValues: dataQueryArgValues,
    });
  };

  return (
    <>
      {dataQueryOptions?.inputDefinitions?.length > 0 ? (
        <DataQueryInputsForm
          open={isArgsFormOpen}
          onAccepted={_handleOnArgFormCompleted}
          onDecline={_handleOnArgFormDeclined}
          inputDefinitions={dataQueryOptions?.inputDefinitions}
        />
      ) : null}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={_handleTestQuery}
        disabled={isTestingDataQuery}
        className="shrink-0"
        aria-label="Test query"
      >
        {isTestingDataQuery ? (
          <Spinner size={14} className="mr-1" />
        ) : (
          <Play className="h-3 w-3 mr-1" />
        )}
        Test
      </Button>
    </>
  );
};
