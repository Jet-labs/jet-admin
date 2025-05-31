import { CircularProgress } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { CONSTANTS } from "../../../constants";
import { testDataQueryByIDAPI } from "../../../data/apis/dataQuery";
import { displayError, displaySuccess } from "../../../utils/notification";
import { DataQueryArgsForm } from "./dataQueryArgsForm";
import PropTypes from "prop-types";

export const DataQueryTestingForm = ({
  tenantID,
  dataQueryID,
  setDataQueryTestResult,
  datasourceID,
  datasourceType,
  dataQueryOptions,
}) => {
  DataQueryTestingForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
    dataQueryID: PropTypes.number.isRequired,
    setDataQueryTestResult: PropTypes.func.isRequired,
    datasourceID: PropTypes.string.isRequired,
    datasourceType: PropTypes.string.isRequired,
    dataQueryOptions: PropTypes.object.isRequired,
  };
  const [isArgsFormOpen, setIsArgsFormOpen] = useState(false);

  const { isPending: isTestingDataQuery, mutate: testDataQuery } = useMutation({
    mutationFn: (argValues) => {
      return testDataQueryByIDAPI({
        tenantID,
        dataQueryID,
        argValues,
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
      dataQueryOptions &&
      Array.isArray(dataQueryOptions.args) &&
      dataQueryOptions.args.length > 0
    ) {
      _handleOpenArgsForm();
    } else {
      testDataQuery();
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
      args: dataQueryArgValues,
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
