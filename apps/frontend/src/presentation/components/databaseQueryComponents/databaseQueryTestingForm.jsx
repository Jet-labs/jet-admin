import { useMutation } from "@tanstack/react-query";
import { CONSTANTS } from "../../../constants";
import { displayError, displaySuccess } from "../../../utils/notification";
import { testDatabaseQueryAPI } from "../../../data/apis/databaseQuery";
import { CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { DatabaseQueryArgsForm } from "./databaseQueryArgsForm";
import { useDatabaseQueryRunner } from "../../../logic/hooks/useDatabaseQueryRunner";

export const DatabaseQueryTestingForm = ({
  tenantID,
  databaseQueryID,
  databaseQueryString,
  databaseQueryArgs,
  setDatabaseQueryTestResult,
}) => {
  const {
    execute: testDatabaseQuery,
    status,
    reset,
  } = useDatabaseQueryRunner(tenantID);
  const [isArgsFormOpen, setIsArgsFormOpen] = useState(false);

  useEffect(() => {
    return () => {
      reset();
    };
  }, []);
  useEffect(() => {
    if (status.data?.databaseQueryResult) {
      setDatabaseQueryTestResult(status.data.databaseQueryResult);
      displaySuccess(CONSTANTS.STRINGS.TEST_QUERY_FORM_QUERY_TESTING_SUCCESS);
    }
    if (status.error) {
      displayError(status.error);
    }
    if (status.data?.status === CONSTANTS.BACKEND_JOB_STATUS.FAILED) {
      displayError(status.data?.error);
    }
    if (status.isIdle) {
      setDatabaseQueryTestResult(null);
    }
  }, [status, displayError, displaySuccess, setDatabaseQueryTestResult]);

  const _handleTestQuery = () => {
    if (
      databaseQueryArgs &&
      Array.isArray(databaseQueryArgs) &&
      databaseQueryArgs.length > 0
    ) {
      _handleOpenArgsForm();
    } else {
      testDatabaseQuery({
        databaseQueryData: {
          databaseQueryString: databaseQueryString,
          databaseQueryArgValues: null,
        },
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
      databaseQueryData: {
        databaseQueryString: databaseQueryString,
        databaseQueryArgValues: databaseQueryArgValues,
      },
    });
  };

  return (
    <>
      {databaseQueryArgs && (
        <DatabaseQueryArgsForm
          open={isArgsFormOpen}
          onAccepted={_handleOnArgFormCompleted}
          onDecline={_handleOnArgFormDeclined}
          args={databaseQueryArgs}
        />
      )}
      <button
        onClick={_handleTestQuery}
        disabled={status?.isExecuting || status?.isPolling}
        type="button"
        class="flex flex-row items-center justify-center rounded bg-[#646cff]/10 mr-2 px-3 py-1.5 text-xs text-[#646cff] hover:bg-[#646cff]/20 focus:ring-2 focus:ring-[#646cff]/50 outline-none focus:outline-none"
      >
        {status?.isExecuting ||
          (status?.isPolling && (
            <CircularProgress
              className="!text-xs !mr-3"
              size={16}
              color="white"
            />
          ))}
        {CONSTANTS.STRINGS.TEST_QUERY_FORM_TEST_BUTTON}
      </button>
    </>
  );
};
