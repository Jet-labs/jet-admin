import { CircularProgress } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { CONSTANTS } from "../../../constants";
import { testDataQueryAPI } from "../../../data/apis/dataQuery";
import { displayError, displaySuccess } from "../../../utils/notification";
import { DataQueryArgsForm } from "./dataQueryArgsForm";
import PropTypes from "prop-types";

export const DataQueryTestingForm = ({
  tenantID,
  dataQueryID,
  dataQueryString,
  dataQueryArgs,
  setDataQueryTestResult,
}) => {
  DataQueryTestingForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
    dataQueryID: PropTypes.number.isRequired,
    dataQueryString: PropTypes.string.isRequired,
    dataQueryArgs: PropTypes.array.isRequired,
    setDataQueryTestResult: PropTypes.func.isRequired,
  };
  console.log({
    dataQueryID,
    dataQueryString,
    dataQueryArgs,
  });
  const [isArgsFormOpen, setIsArgsFormOpen] = useState(false);

  const { isPending: isTestingDataQuery, mutate: testDataQuery } = useMutation({
    mutationFn: (dataQueryOptions) => {
      return testDataQueryAPI({
        tenantID,
        dataQueryID,
        dataQueryOptions,
      });
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
      dataQueryArgs &&
      Array.isArray(dataQueryArgs) &&
      dataQueryArgs.length > 0
    ) {
      _handleOpenArgsForm();
    } else {
      testDataQuery({
        dataQueryString: dataQueryString,
        dataQueryArgs: null,
      });
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
      dataQueryString: dataQueryString,
      dataQueryArgValues: dataQueryArgValues,
    });
  };

  return (
    <>
      {dataQueryArgs && (
        <DataQueryArgsForm
          open={isArgsFormOpen}
          onAccepted={_handleOnArgFormCompleted}
          onDecline={_handleOnArgFormDeclined}
          dataQueryArgs={dataQueryArgs}
        />
      )}
      <button
        onClick={_handleTestQuery}
        disabled={isTestingDataQuery}
        type="button"
        className="flex flex-row items-center justify-center rounded bg-[#646cff]/10 mr-2 px-3 py-1.5 text-xs text-[#646cff] hover:bg-[#646cff]/20 focus:ring-2 focus:ring-[#646cff]/50 outline-none focus:outline-none"
      >
        {isTestingDataQuery && (
          <CircularProgress className="!mr-3" size={16} color="white" />
        )}
        {CONSTANTS.STRINGS.TEST_QUERY_FORM_TEST_BUTTON}
      </button>
    </>
  );
};
