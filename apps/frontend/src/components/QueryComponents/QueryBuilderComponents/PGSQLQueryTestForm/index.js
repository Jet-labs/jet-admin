import { Button } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { runQueryAPI } from "../../../../api/queries";
import { LOCAL_CONSTANTS } from "../../../../constants";
import { displayError, displaySuccess } from "../../../../utils/notification";
import { PGSQLQueryArgsFormDialog } from "../PGSQLQueryArgsFormDialog";

export const PGSQLQueryTestForm = ({
  pmQueryID,
  value,
  setQueryRunResult,
  args,
}) => {
  const [isArgsFormOpen, setIsArgsFormOpen] = useState(false);
  const {
    isPending: isRunningPGQuery,
    isSuccess: isRunningPGQuerySuccess,
    isError: isRunningPGQueryError,
    error: runPGQueryError,
    mutate: runPGQuery,
    data: pgQueryData,
  } = useMutation({
    mutationFn: ({ raw_query, pm_query_arg_values }) => {
      return runQueryAPI({
        pm_query_type: "POSTGRE_QUERY",
        pm_query: { raw_query },
        pm_query_arg_values,
      });
    },
    retry: false,
    onSuccess: (data) => {
      setQueryRunResult(data);
      displaySuccess("Query executed successfully");
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _runQuery = () => {
    if (args && Array.isArray(args) && args.length > 0) {
      _handleOpenArgsForm();
    } else {
      runPGQuery({
        raw_query: value?.raw_query,
        pm_query_id: pmQueryID,
      });
    }
  };

  const _handleOpenArgsForm = () => {
    setIsArgsFormOpen(true);
  };

  const _handleOnArgFormDeclined = () => {
    setIsArgsFormOpen(false);
  };

  const _handleOnArgFormCompleted = (argValues) => {
    setIsArgsFormOpen(false);
    runPGQuery({
      raw_query: value?.raw_query,
      pm_query_id: pmQueryID,
      pm_query_arg_values: argValues,
    });
  };

  return (
    <>
      {args && (
        <PGSQLQueryArgsFormDialog
          open={isArgsFormOpen}
          onAccepted={_handleOnArgFormCompleted}
          onDecline={_handleOnArgFormDeclined}
          args={args}
        />
      )}
      <Button variant="outlined" className="!ml-3" onClick={_runQuery}>
        {LOCAL_CONSTANTS.STRINGS.QUERY_TEST_BUTTON}
      </Button>
    </>
  );
};
