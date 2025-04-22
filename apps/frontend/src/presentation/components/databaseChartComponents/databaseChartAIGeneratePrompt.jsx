import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useMutation } from "@tanstack/react-query";
import React, { useCallback, useState } from "react";
import { FaCheck, FaMagic } from "react-icons/fa";
import { CONSTANTS } from "../../../constants";
import { generateAIPromptBasedChartAPI } from "../../../data/apis/databaseChart";
import { createBulkDatabaseQueryAPI } from "../../../data/apis/databaseQuery";
import { displayError } from "../../../utils/notification";
import { CodeBlock } from "../ui/codeBlock";
import PropTypes from "prop-types";

// Styled components to override MUI defaults
const StyledDialog = styled(Dialog)(() => ({
  "& .MuiDialog-paper": {
    borderRadius: 4, // Keep original border radius
    border: "1px solid rgba(99, 102, 241, 0.2)",
    boxShadow: "0 0 20px rgba(79, 70, 229, 0.15)",
    background: "transparent",
    overflow: "hidden",
    position: "relative",
  },
}));

const StyledDialogTitle = styled(DialogTitle)(() => ({
  padding: "16px 16px 0 16px",
  fontWeight: 500,
  position: "relative",
  zIndex: 10,
  color: "#333",
  background: "transparent",
}));

const StyledDialogContent = styled(DialogContent)(() => ({
  padding: "16px",
  position: "relative",
  zIndex: 10,
  background: "transparent",
}));

const StyledDialogActions = styled(DialogActions)(() => ({
  padding: "16px",
  position: "relative",
  zIndex: 10,
  background: "transparent",
}));

export const DatabaseChartAIGeneratePrompt = ({ tenantID, onAccepted }) => {
  DatabaseChartAIGeneratePrompt.propTypes = {
    tenantID: PropTypes.number.isRequired,
    onAccepted: PropTypes.func.isRequired,
  };

  const [aiPrompt, setAIPrompt] = useState("Top 10 most spending users");
  const [aiGeneratedChart, setAIGeneratedChart] = useState("");
  const [isAIPromptDialogOpen, setIsAIPromptDialogOpen] = useState(false);
  const [generatedQueries, setGeneratedQueries] = useState([]);

  const {
    isPending: isGeneratingAIPromptBasedChart,
    mutate: generateAIPromptBasedChart,
  } = useMutation({
    mutationFn: ({ aiPrompt }) => {
      return generateAIPromptBasedChartAPI({
        tenantID,
        aiPrompt,
      });
    },
    retry: false,
    onSuccess: (data) => {
      console.log({ data });
      setAIGeneratedChart(data);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const { isPending: isGeneratingQueries, mutate: generateQueries } =
    useMutation({
      mutationFn: ({ databaseQueriesData }) => {
        return createBulkDatabaseQueryAPI({
          tenantID,
          databaseQueriesData,
        });
      },
      retry: false,
      onSuccess: (data) => {
        setGeneratedQueries(data);
      },
      onError: (error) => {
        displayError(error);
      },
    });

  const _handleAcceptGeneratedQueries = () => {
    const databaseChart = JSON.parse(aiGeneratedChart);
    const databaseQueriesData =
      databaseChart.output.databaseChartQueryMappings?.map((q) => ({
        databaseQueryTitle: q.title,
        databaseQueryData: {
          databaseQueryString: q.databaseQueryString,
          databaseQueryArgs: q.databaseQueryArgs,
        },
        runOnLoad: false,
      }));
    generateQueries({ databaseQueriesData });
  };

  const _handleOnChartConfigAccepted = useCallback(() => {
    if (!generatedQueries || generatedQueries.length === 0) return;
    const databaseChart = JSON.parse(aiGeneratedChart).output;
    onAccepted({
      databaseChartName: databaseChart.databaseChartTitle,
      databaseChartType: databaseChart.databaseChartType,
      databaseQueries: databaseChart.databaseChartQueryMappings.map(
        (q, index) => ({
          title: q.title,
          databaseQueryID: generatedQueries[index].databaseQueryID,
          parameters: q.parameters,
          databaseQueryArgValues: q.databaseQueryArgValues,
          datasetFields: q.datasetFields,
        })
      ),
      databaseChartConfig: databaseChart.databaseChartConfig,
    });
    setIsAIPromptDialogOpen(false);
  }, [aiGeneratedChart, generatedQueries, onAccepted]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsAIPromptDialogOpen(true)}
        className="
        flex flex-row justify-center items-center
        px-3 py-2 text-xs font-medium text-center text-white
        bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500
        rounded border-none shadow-md
        transform transition-all duration-300 ease-in-out
        hover:scale-105 hover:shadow-lg hover:from-indigo-500 hover:via-purple-500 hover:to-pink-400
        focus:outline-none
        relative overflow-hidden group
    "
      >
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        <FaMagic className="text-sm mr-1 animate-pulse" />
        {CONSTANTS.STRINGS.DATABASE_CHART_AI_PROMPT_BUTTON}
      </button>

      <StyledDialog
        open={isAIPromptDialogOpen}
        onClose={() => setIsAIPromptDialogOpen(false)}
        BackdropProps={{
          style: {
            // backgroundColor: "rgba(255, 255, 255, 0.8)",
            // backdropFilter: "blur(8px)",
          },
        }}
        fullWidth
        maxWidth="md"
      >
        {/* Sci-Fi Animated Background - Light Theme without lines */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: "hidden",
            zIndex: 1,
            background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          }}
        >
          {/* Glow effect */}
          <div
            style={{
              position: "absolute",
              top: "30%",
              left: "10%",
              width: "80%",
              height: "40%",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(99, 102, 241, 0.07) 0%, transparent 70%)",
              filter: "blur(30px)",
              animation: "pulse 8s infinite alternate",
            }}
          />

          {/* Animated overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(168, 85, 247, 0.03) 100%)",
              transition: "opacity 0.5s ease",
            }}
          />
        </div>

        <StyledDialogTitle>
          <div className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-medium">
            {CONSTANTS.STRINGS.DATABASE_CHART_AI_PROMPT_FORM_TITLE}
          </div>
        </StyledDialogTitle>

        <StyledDialogContent>
          <span className="text-sm font-normal text-gray-600">
            {CONSTANTS.STRINGS.DATABASE_CHART_AI_PROMPT_FORM_DESCRIPTION}
          </span>

          <div className="space-y-4 mt-4">
            <textarea
              id="aiPrompt"
              name="aiPrompt"
              rows="4"
              required
              value={aiPrompt}
              onChange={(e) => setAIPrompt(e.target.value)}
              autoComplete="off"
              className="w-full rounded border border-indigo-200 p-2.5 text-sm text-gray-800 bg-white/70 backdrop-blur-md outline-none transition-all duration-200 shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 focus:shadow-indigo-500/30"
              placeholder="Describe what you want to create..."
              style={{
                backdropFilter: "blur(4px)",
                boxShadow: "0 0 10px rgba(99, 102, 241, 0.1)",
              }}
            />
          </div>
          {aiGeneratedChart &&
            JSON.parse(aiGeneratedChart).output?.databaseChartQueryMappings && (
              <>
                <div className="w-full flex flex-row justify-between items-center mt-4 pl-0.5">
                  <div className="flex flex-col w-full justify-start items-start">
                    <span className="text-sm font-medium text-gray-600">
                      {
                        CONSTANTS.STRINGS
                          .DATABASE_CHART_AI_PROMPT_GENERATED_QUERIES_TITLE
                      }
                    </span>
                    <span className="text-xs font-light text-gray-500">
                      {
                        CONSTANTS.STRINGS
                          .DATABASE_CHART_AI_PROMPT_GENERATED_QUERIES_DESCRIPTION
                      }
                    </span>
                  </div>
                  <button
                    onClick={_handleAcceptGeneratedQueries}
                    disabled={isGeneratingQueries}
                    type="button"
                    className="flex flex-row items-center bg-green-100 px-2 py-1 rounded"
                  >
                    {isGeneratingQueries ? (
                      <CircularProgress
                        className="!text-xs !text-green-500"
                        size={18}
                      />
                    ) : (
                      <>
                        <FaCheck className="mr-2 h-3 w-3 text-green-500" />
                        <span className="text-xs font-medium text-green-600">
                          {
                            CONSTANTS.STRINGS
                              .DATABASE_CHART_AI_PROMPT_GENERATED_QUERIES_ACCEPT_BUTTON
                          }
                        </span>
                      </>
                    )}
                  </button>
                </div>
                <div className="mt-1 transition-all duration-300">
                  <CodeBlock
                    code={JSON.stringify(
                      JSON.parse(aiGeneratedChart).output
                        .databaseChartQueryMappings
                    )}
                    language="json"
                  />
                </div>
              </>
            )}

          {aiGeneratedChart && (
            <div className="mt-4 transition-all duration-300">
              <CodeBlock code={aiGeneratedChart} language="json" />
            </div>
          )}
        </StyledDialogContent>

        <StyledDialogActions className="justify-end space-x-2">
          <button
            onClick={() => setIsAIPromptDialogOpen(false)}
            type="button"
            className="px-2.5 py-1.5 text-sm text-gray-700 border border-gray-200 bg-gray-100 hover:bg-gray-200 rounded transition-all duration-200"
            style={{
              boxShadow: "0 0 10px rgba(0, 0, 0, 0.05)",
            }}
          >
            {
              CONSTANTS.STRINGS
                .DATABASE_CHART_AI_PROMPT_ACCEPT_FORM_CANCEL_BUTTON
            }
          </button>

          {aiGeneratedChart && (
            <button
              type="button"
              onClick={() => {
                _handleOnChartConfigAccepted();
                setIsAIPromptDialogOpen(false);
              }}
              className="px-2.5 py-1.5 text-sm text-white bg-emerald-500 rounded hover:bg-emerald-600 transition-all duration-200 flex items-center"
              style={{
                boxShadow: "0 0 15px rgba(16, 185, 129, 0.2)",
              }}
            >
              <span>
                {
                  CONSTANTS.STRINGS
                    .DATABASE_CHART_AI_PROMPT_ACCEPT_FORM_CONFIRM_BUTTON
                }
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => generateAIPromptBasedChart({ aiPrompt })}
            className="px-2.5 py-1.5 text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 flex flex-row items-center rounded hover:from-indigo-500 hover:to-purple-500 transition-all duration-200"
            style={{
              boxShadow: "0 0 15px rgba(99, 102, 241, 0.2)",
            }}
          >
            {isGeneratingAIPromptBasedChart ? (
              <div className="flex items-center">
                <CircularProgress
                  className="!text-xs mr-2"
                  size={18}
                  color="inherit"
                />
                <span>Generating...</span>
              </div>
            ) : aiGeneratedChart ? (
              <div className="flex items-center">
                <FaMagic className="mr-2" />
                <span>
                  {
                    CONSTANTS.STRINGS
                      .DATABASE_CHART_AI_PROMPT_FORM_REGENERATE_BUTTON
                  }
                </span>
              </div>
            ) : (
              <div className="flex items-center">
                <FaMagic className="mr-2" />
                <span>
                  {
                    CONSTANTS.STRINGS
                      .DATABASE_CHART_AI_PROMPT_FORM_GENERATE_BUTTON
                  }
                </span>
              </div>
            )}
          </button>
        </StyledDialogActions>

        {/* Add global CSS animation */}
        <style>{`
          @keyframes pulse {
            0% {
              opacity: 0.4;
              transform: scale(1);
            }
            50% {
              opacity: 0.6;
              transform: scale(1.1);
            }
            100% {
              opacity: 0.4;
              transform: scale(1);
            }
          }
        `}</style>
      </StyledDialog>
    </>
  );
};
