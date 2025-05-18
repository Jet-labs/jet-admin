import { CircularProgress } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { CONSTANTS } from "../../../constants";
import { testDatabaseQueryAPI } from "../../../data/apis/databaseQuery";
import { displayError, displaySuccess } from "../../../utils/notification";
import { DatabaseQueryArgsForm } from "./databaseQueryArgsForm";
import PropTypes from "prop-types";

export const DatabaseQueryTestingForm = ({
  tenantID,
  databaseQueryID,
  databaseQueryString,
  databaseQueryArgs,
  setDatabaseQueryTestResult,
}) => {
  DatabaseQueryTestingForm.propTypes = {
    tenantID: PropTypes.number.isRequired,
    databaseQueryID: PropTypes.number.isRequired,
    databaseQueryString: PropTypes.string.isRequired,
    databaseQueryArgs: PropTypes.array.isRequired,
    setDatabaseQueryTestResult: PropTypes.func.isRequired,
  };
  console.log({
    databaseQueryID,
    databaseQueryString,
    databaseQueryArgs,
  });
  const [isArgsFormOpen, setIsArgsFormOpen] = useState(false);

  const { isPending: isTestingDatabaseQuery, mutate: testDatabaseQuery } =
    useMutation({
      mutationFn: (databaseQueryData) => {
        return testDatabaseQueryAPI({
          tenantID,
          databaseQueryID,
          databaseQueryData,
        });
      },
      retry: false,
      onSuccess: (data) => {
        setDatabaseQueryTestResult(data);
        displaySuccess(CONSTANTS.STRINGS.TEST_QUERY_FORM_QUERY_TESTING_SUCCESS);
      },
      onError: (error) => {
        displayError(error);
      },
    });

  const _handleTestQuery = () => {
    if (
      databaseQueryArgs &&
      Array.isArray(databaseQueryArgs) &&
      databaseQueryArgs.length > 0
    ) {
      _handleOpenArgsForm();
    } else {
      testDatabaseQuery({
        databaseQueryString: databaseQueryString,
        databaseQueryArgs: null,
      });
    }
  };

  const _handleOpenArgsForm = () => {
    setIsArgsFormOpen(true);
  };

  const _handleOnArgFormDeclined = () => {
    setIsArgsFormOpen(false);
  };

  const _handleOnArgFormCompleted = (databaseQueryArgValues) => {
    setIsArgsFormOpen(false);
    testDatabaseQuery({
      databaseQueryString: databaseQueryString,
      databaseQueryArgValues: databaseQueryArgValues,
    });
  };

  return (
    <>
      {databaseQueryArgs && (
        <DatabaseQueryArgsForm
          open={isArgsFormOpen}
          onAccepted={_handleOnArgFormCompleted}
          onDecline={_handleOnArgFormDeclined}
          databaseQueryArgs={databaseQueryArgs}
        />
      )}
      <button
        onClick={_handleTestQuery}
        disabled={isTestingDatabaseQuery}
        type="button"
        className="flex flex-row items-center justify-center rounded bg-[#646cff]/10 mr-2 px-3 py-1.5 text-xs text-[#646cff] hover:bg-[#646cff]/20 focus:ring-2 focus:ring-[#646cff]/50 outline-none focus:outline-none"
      >
        {isTestingDatabaseQuery && (
          <CircularProgress className="!mr-3" size={16} color="white" />
        )}
        {CONSTANTS.STRINGS.TEST_QUERY_FORM_TEST_BUTTON}
      </button>
    </>
  );
};
