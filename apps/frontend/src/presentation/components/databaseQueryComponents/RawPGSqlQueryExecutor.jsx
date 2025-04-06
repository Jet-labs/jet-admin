import { sql } from "@codemirror/lang-sql";
import { CircularProgress } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { githubLight } from "@uiw/codemirror-theme-github";
import CodeMirror from "@uiw/react-codemirror";
import React, { useState } from "react";
import { FaPlay } from "react-icons/fa";
import { CONSTANTS } from "../../../constants";
import { executeRawSQLQueryAPI } from "../../../data/apis/database";
import { extractError } from "../../../utils/error";
import { displayError, displaySuccess } from "../../../utils/notification";
import { DatabaseQueryResponseView } from "./databaseQueryResponseView";

export const RawPGSqlQueryExecutor = ({tenantID}) => {
  const [sqlQuery, setSqlQuery] = useState("");
  const [queryResults, setQueryResults] = useState(null);
 
  const [resultTab, setResultTab] = useState(0);

  // Use React Query's useMutation hook
  const {
    isPending: isExecuting,
    isError,
    error,
    mutate: executeQuery,
  } = useMutation({
    mutationFn: (sqlQuery) => {
      return executeRawSQLQueryAPI({
        tenantID,
        sqlQuery: sqlQuery.trim(),
      });
    },
    retry: false,
    onSuccess: (data) => {
      setQueryResults(data);
      displaySuccess(
        CONSTANTS.STRINGS.QUERY_EXECUTED_SUCCESSFULLY
      );
    },
    onError: (error) => {
      displayError(`Query execution failed: ${extractError(error)}`);
    },
  });

  const handleExecuteQuery = () => {
    if (!sqlQuery.trim()) {
      displayError("Please enter a SQL query to execute");
      return;
    }

    // Reset previous results
    setQueryResults(null);

    // Execute the mutation
    executeQuery(sqlQuery);
  };

  const handleTabChange = (event, newTab) => {
    setResultTab(newTab);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-700">
          {CONSTANTS.STRINGS.RAW_QUERY_EXCECUTOR_TITLE}
        </h2>
        <p className="text-sm text-slate-500">
          {CONSTANTS.STRINGS.RAW_QUERY_EXCECUTOR_DESCRIPTION}
        </p>
      </div>

      <div className="flex-grow flex flex-col h-full">
        <div className="p-3 border-b border-slate-200 flex-shrink-0">
          <div className="mb-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {CONSTANTS.STRINGS.RAW_QUERY_EXCECUTOR_QUERY_LABEL}
            </label>
            <div className="border border-slate-300 rounded-md">
              <CodeMirror
                value={sqlQuery}
                height="150px"
                theme={githubLight}
                extensions={[sql()]}
                onChange={(value) => setSqlQuery(value)}
                placeholder={CONSTANTS.STRINGS.RAW_QUERY_EXCECUTOR_PLACEHOLDER}
                className="border-slate-300 focus:border-slate-300 focus:outline-slate-300"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleExecuteQuery}
              disabled={isExecuting || !sqlQuery.trim()}
              className="flex flex-row justify-center items-center px-3 py-2 text-xs font-medium text-center text-white bg-[#646cff] rounded hover:bg-[#747bff] focus:ring-4 focus:outline-none"
            >
              {isExecuting && (
                <CircularProgress
                  className="!text-xs !mr-3"
                  size={16}
                  color="inherit"
                />
              )}
              {!isExecuting && <FaPlay className="mr-2" size={12} />}
              {isExecuting ? "Executing..." : "Execute Query"}
            </button>
          </div>
        </div>

        <div className="flex-grow overflow-auto flex flex-col">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded m-3">
              <h3 className="font-semibold mb-1">Error</h3>
              <pre className="text-sm whitespace-pre-wrap">
                {extractError(error)}
              </pre>
            </div>
          )}
          {queryResults && (
            <DatabaseQueryResponseView
              databaseQueryResult={{ result: queryResults }}
            />
          )}

          {!queryResults && !error && !isExecuting && (
            <div className="flex items-center justify-center h-full text-slate-500 p-3">
              {CONSTANTS.STRINGS.RAW_QUERY_EXCECUTOR_RESULT_PLACEHOLDER}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


