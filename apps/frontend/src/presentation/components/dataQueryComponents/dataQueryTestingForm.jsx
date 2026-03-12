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
    mutationFn: ({ argValues }) => {
      if (dataQuery) {
        return testDataQueryByDataAPI({
          tenantID,
          dataQuery,
          argValues,
        });
      } else {
        return testDataQueryByIDAPI({
          tenantID,
          dataQueryID,
          argValues,
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
      testDataQuery({ argValues: null });
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
      argValues: dataQueryArgValues,
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

      >
        {isTestingDataQuery ? (
          <Spinner className="mr-2" size={16} />
        ) : null}
        {CONSTANTS.STRINGS.TEST_QUERY_FORM_TEST_BUTTON}
      </Button>
    </>
  );
};
