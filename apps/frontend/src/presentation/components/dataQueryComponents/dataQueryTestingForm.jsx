import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { CONSTANTS } from "../../../constants";
import { testDataQueryByDataAPI, testDataQueryByIDAPI } from "../../../data/apis/dataQuery";
import { displayError, displaySuccess } from "../../../utils/notification";
import { DataQueryArgsForm } from "./dataQueryArgsForm";
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
    tenantID: PropTypes.number.isRequired,
    dataQueryID: PropTypes.number,
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
    mutationFn: ({ inputArgs }) => {
      if (dataQuery) {
        return testDataQueryByDataAPI({
          tenantID,
          dataQuery,
          inputArgs,
        });
      } else {
        return testDataQueryByIDAPI({
          tenantID,
          dataQueryID,
          inputArgs,
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
      Array.isArray(dataQueryOptions.args) &&
      dataQueryOptions.args.length > 0
    ) {
      _handleOpenArgsForm();
    } else {
      testDataQuery({ inputArgs: null });
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
      inputArgs: dataQueryArgValues,
    });
  };

  return (
    <>
      {dataQueryOptions?.args?.length > 0 ? (
        <DataQueryArgsForm
          open={isArgsFormOpen}
          onAccepted={_handleOnArgFormCompleted}
          onDecline={_handleOnArgFormDeclined}
          dataQueryArgs={dataQueryOptions?.args}
        />
      ) : null}
      <Button
        onClick={_handleTestQuery}
        disabled={isTestingDataQuery}
        type="button"
        variant="primary-ghost"
        size={size}
      >
        {isTestingDataQuery ? (
          <Spinner size={14} />
        ) : null}
        {CONSTANTS.STRINGS.TEST_QUERY_FORM_TEST_BUTTON}
      </Button>
    </>
  );
};
