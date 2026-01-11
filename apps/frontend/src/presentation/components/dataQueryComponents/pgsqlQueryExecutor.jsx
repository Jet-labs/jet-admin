import { CircularProgress, Tooltip } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import PropTypes from "prop-types";
import React, { useState } from "react";
import { FaPlay } from "react-icons/fa";
import { MdFormatAlignLeft, MdWrapText } from "react-icons/md";
import { format as formatSQL } from "sql-formatter";
import { CONSTANTS } from "../../../constants";
import { executeRawSQLQueryAPI } from "../../../data/apis/database";
import { extractError } from "../../../utils/error";
import { displayError, displaySuccess } from "../../../utils/notification";
import { CodeEditorField } from "../ui/codeEditorField";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { QueryResponseView } from "./queryResponseView";

export const PGSQLQueryExecutor = ({ tenantID, initialQuery }) => {
  PGSQLQueryExecutor.propTypes = {
    tenantID: PropTypes.number.isRequired,
    initialQuery: PropTypes.string,
  };
  const [sqlQuery, setSqlQuery] = useState(initialQuery || "");
  const [queryResults, setQueryResults] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [resultTab, setResultTab] = useState(0);
  const [wordWrap, setWordWrap] = useState(true);

  // Use React Query's useMutation hook
  const {
    isPending: isExecuting,
    error: executeQueryError,
    mutate: executeQuery,
  } = useMutation({
    mutationFn: (sqlQuery) => {
      return executeRawSQLQueryAPI({
        tenantID,
        query: sqlQuery.trim(),
      });
    },
    retry: false,
    onSuccess: (data) => {
      setQueryResults(data);
      displaySuccess(CONSTANTS.STRINGS.QUERY_EXECUTED_SUCCESSFULLY);
    },
    onError: (error) => {
      displayError(`Query execution failed: ${extractError(error)}`);
    },
  });

  const handleFormatSQL = () => {
    if (!sqlQuery.trim()) {
      displayError("No SQL query to format");
      return;
    }
    try {
      const formatted = formatSQL(sqlQuery, {
        language: "postgresql",
        tabWidth: 2,
        useTabs: false,
        keywordCase: "upper",
        linesBetweenQueries: 2,
      });
      setSqlQuery(formatted);
      displaySuccess("SQL formatted successfully");
    } catch (error) {
      displayError(`Failed to format SQL: ${error.message}`);
    }
  };

  const handleToggleWordWrap = () => {
    setWordWrap((prev) => !prev);
  };

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
        <ResizablePanelGroup
          direction="vertical"
          autoSaveId={
            CONSTANTS.RESIZABLE_PANEL_KEYS
              .RAW_QUERY_EXECUTION_FORM_RESULT_SEPARATION
          }
          className={"!w-full !h-full"}
        >
          <ResizablePanel defaultSize={20}>
            <div className="p-3 flex-shrink-0">
              {/* Toolbar */}
              <div className="flex items-center gap-1 mb-2">
                <Tooltip title="Format SQL" arrow>
                  <button
                    type="button"
                    onClick={handleFormatSQL}
                    disabled={!sqlQuery.trim()}
                    className="p-1.5 bg-[#f5f5ff] rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 hover:text-slate-800 transition-colors"
                  >
                    <MdFormatAlignLeft size={14} />
                  </button>
                </Tooltip>
                <Tooltip title={wordWrap ? "Disable Word Wrap" : "Enable Word Wrap"} arrow>
                  <button
                    type="button"
                    onClick={handleToggleWordWrap}
                    className={`p-1.5 rounded bg-[#f5f5ff] hover:bg-slate-100 transition-colors ${wordWrap ? "text-[#646cff] bg-slate-100" : "text-slate-600 hover:text-slate-800"
                      }`}
                  >
                    <MdWrapText size={14} />
                  </button>
                </Tooltip>
              </div>
              <div className="mb-2">
                <CodeEditorField
                  code={sqlQuery}
                  setCode={setSqlQuery}
                  language="sql"
                  height="150px"
                  wordWrap={wordWrap}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleExecuteQuery}
                  disabled={isExecuting || !sqlQuery.trim()}
                  className="flex flex-row justify-center items-center px-2.5 !cursor-pointer py-1.5 text-xs font-medium text-center text-white bg-[#646cff] rounded hover:bg-[#747bff] focus:ring-4 focus:outline-none"
                >
                  {isExecuting && (
                    <CircularProgress
                      className="!mr-3"
                      size={16}
                      color="inherit"
                    />
                  )}
                  {!isExecuting && <FaPlay className="mr-2" size={12} />}
                  {isExecuting ? "Executing..." : "Execute Query"}
                </button>
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel defaultSize={80}>
            {executeQueryError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded m-3">
                <h3 className="font-semibold mb-1">Error</h3>
                <pre className="text-sm whitespace-pre-wrap">
                  {extractError(executeQueryError)}
                </pre>
              </div>
            )}
            {queryResults &&
              <QueryResponseView queryResult={queryResults} />
            }

            {!queryResults && !executeQueryError && !isExecuting && (
              <div className="flex items-center justify-center h-full text-slate-500 p-3">
                {CONSTANTS.STRINGS.RAW_QUERY_EXCECUTOR_RESULT_PLACEHOLDER}
              </div>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};
