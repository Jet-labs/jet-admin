import { useMutation } from "@tanstack/react-query";
import { CONSTANTS } from "../../../constants";
import { displayError, displaySuccess } from "../../../utils/notification";
import { testDatabaseQueryAPI } from "../../../data/apis/databaseQuery";
import { CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { DatabaseQueryArgsForm } from "./databaseQueryArgsForm";

export const DatabaseQueryTestingForm = ({
  tenantID,
  databaseQueryID,
  databaseQueryString,
  databaseQueryArgs,
  setDatabaseQueryTestResult,
}) => {
  const [isArgsFormOpen, setIsArgsFormOpen] = useState(false);

  const {
    isPending: isTestingDatabaseQuery,
    isSuccess: isTestingDatabaseQuerySuccess,
    isError: isTestingDatabaseQueryError,
    error: testDatabaseQueryError,
    data: databaseQueryTestResult,
    mutate: testDatabaseQuery,
  } = useMutation({
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
        class="flex flex-row items-center justify-center rounded bg-[#646cff]/10 mr-2 px-3 py-1.5 text-xs text-[#646cff] hover:bg-[#646cff]/20 focus:ring-2 focus:ring-[#646cff]/50 outline-none focus:outline-none"
      >
        {isTestingDatabaseQuery && (
          <CircularProgress
            className="!text-xs !mr-3"
            size={16}
            color="white"
          />
        )}
        {CONSTANTS.STRINGS.TEST_QUERY_FORM_TEST_BUTTON}
      </button>
    </>
  );
};
