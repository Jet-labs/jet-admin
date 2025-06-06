import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useMutation } from "@tanstack/react-query";
import React, { useCallback, useRef, useState } from "react";
import { FaMagic } from "react-icons/fa";
import { CONSTANTS } from "../../../constants";
import {
  generateAIPromptBasedChartStyleAPI,
  getDatabaseChartDataUsingChartAPI,
} from "../../../data/apis/databaseChart";
import { displayError } from "../../../utils/notification";
import { CodeBlock } from "../ui/codeBlock";
import PropTypes from "prop-types";
import { DatabaseChartPreview } from "./databaseChartPreview";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";

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

export const DatabaseChartAIStylePrompt = ({
  tenantID,
  databaseChartData,
  onAccepted,
  databaseChartFetchedData,
  databaseChartName,
  databaseChartType,
  databaseChartConfig,
}) => {
  DatabaseChartAIStylePrompt.propTypes = {
    tenantID: PropTypes.number.isRequired,
    onAccepted: PropTypes.func.isRequired,
    databaseChartData: PropTypes.object.isRequired,
    databaseChartFetchedData: PropTypes.object.isRequired,
    databaseChartName: PropTypes.string.isRequired,
    databaseChartType: PropTypes.string.isRequired,
    databaseChartConfig: PropTypes.object.isRequired,
  };

  const uniqueKey = useRef(`databaseChartAIStylePrompt_${Date.now()}`);
  const [generatedStyleBasedChartData, setGeneratedStyleBasedChartData] =
    useState(null);

  const [aiPrompt, setAIPrompt] = useState(
    "Style the chart with more modern look and feel"
  );
  const [aiStyledChart, setAIStyledChart] = useState("");
  const [isAIPromptDialogOpen, setIsAIPromptDialogOpen] = useState(false);

  const {
    isPending: isFetchingDatabaseChartData,
    mutate: fetchDatabaseChartData,
  } = useMutation({
    mutationFn: (data) => {
      return getDatabaseChartDataUsingChartAPI({
        tenantID,
        databaseChartData: data,
      });
    },
    retry: false,
    onSuccess: (data) => {
      setGeneratedStyleBasedChartData(data?.data);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const _handleOnNewDatabaseChartStyle = useCallback(
    (aiStyledChart) => {
      if (!aiStyledChart || !databaseChartData) return;
      try {
        const _aiStyledChart = JSON.parse(aiStyledChart);
        const _databaseChartData = {
          ...databaseChartData,
          databaseChartConfig: _aiStyledChart?.databaseChartConfig,
          databaseQueries: databaseChartData?.databaseQueries?.map(
            (query, index) => {
              console.log({
                parameters: _aiStyledChart?.databaseQueries[index]?.parameters,
              });
              return {
                ...query,
                parameters: _aiStyledChart?.databaseQueries[index]?.parameters,
              };
            }
          ),
          databaseChartName,
          databaseChartType,
        };
        fetchDatabaseChartData(_databaseChartData);
      } catch (error) {
        displayError(error);
      }
    },
    [databaseChartData]
  );

  const {
    isPending: isGeneratingAIPromptBasedChartStyle,
    mutate: generateAIPromptBasedChartStyle,
  } = useMutation({
    mutationFn: ({ aiPrompt }) => {
      return generateAIPromptBasedChartStyleAPI({
        tenantID,
        aiPrompt,
        databaseChartData,
      });
    },
    retry: false,
    onSuccess: (data) => {
      console.log({ data });
      setAIStyledChart(data);
      _handleOnNewDatabaseChartStyle(data);
    },
    onError: (error) => {
      displayError(error);
    },
  });
  console.log({
    databaseChartFetchedData,
    databaseChartData,
    aiStyledChart: aiStyledChart,
    generatedStyleBasedChartData,
  });

  const _handleOnChartConfigAccepted = useCallback(() => {
    if (!aiStyledChart) return;
    onAccepted({ databaseChartData: JSON.parse(aiStyledChart) });
    setIsAIPromptDialogOpen(false);
  }, [aiStyledChart, onAccepted]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsAIPromptDialogOpen(true)}
        className="
        flex flex-row justify-center items-center
        px-3 py-3 text-xs font-medium text-center text-white
        bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-400
        rounded border-none
        transform transition-all duration-300 ease-in-out
        hover:shadow-lg hover:from-indigo-500 hover:via-purple-500 hover:to-pink-400
        focus:outline-none
        relative overflow-hidden group w-full
    "
      >
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        <FaMagic className="text-sm mr-1 animate-pulse" />
        {CONSTANTS.STRINGS.DATABASE_CHART_AI_STYLE_PROMPT_BUTTON}
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
            {CONSTANTS.STRINGS.DATABASE_CHART_AI_STYLE_PROMPT_FORM_TITLE}
          </div>
        </StyledDialogTitle>

        <StyledDialogContent>
          <div className="flex flex-col justify-start items-start w-full">
            <span className="text-sm font-medium text-gray-600 mb-1 mt-4">
              {
                CONSTANTS.STRINGS
                  .DATABASE_CHART_AI_STYLE_PROMPT_FORM_DESCRIPTION
              }
            </span>

            <div className="space-y-4 w-full">
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
            <span className="text-sm font-medium text-gray-600 mt-4 mb-1">
              {CONSTANTS.STRINGS.DATABASE_CHART_AI_STYLE_CHART_PREVIEW}
            </span>
            <ReactQueryLoadingErrorWrapper
              isLoading={isFetchingDatabaseChartData}
              isFetching={isFetchingDatabaseChartData}
              isRefetching={isFetchingDatabaseChartData}
              refetch={fetchDatabaseChartData}
              error={null}
            >
              <DatabaseChartPreview
                databaseChartName={databaseChartName}
                databaseChartType={databaseChartType}
                databaseChartConfig={
                  aiStyledChart
                    ? JSON.parse(aiStyledChart)?.databaseChartConfig
                    : databaseChartConfig
                }
                data={
                  generatedStyleBasedChartData
                    ? generatedStyleBasedChartData
                    : databaseChartFetchedData
                }
                key={`databaseChartPreview_${uniqueKey.current}`}
                allowActionBar={false}
                containerClass="!rounded !overflow-hidden border border-indigo-200"
              />
            </ReactQueryLoadingErrorWrapper>
            {aiStyledChart && (
              <>
                <div className="w-full flex flex-row justify-between items-center mt-4 pl-0.5">
                  <div className="flex flex-col w-full justify-start items-start">
                    <span className="text-sm font-medium text-gray-600">
                      {
                        CONSTANTS.STRINGS
                          .DATABASE_CHART_AI_STYLE_PROMPT_GENERATED_STYLES_TITLE
                      }
                    </span>
                    <span className="text-xs font-light text-gray-500">
                      {
                        CONSTANTS.STRINGS
                          .DATABASE_CHART_AI_STYLE_PROMPT_GENERATED_STYLES_DESCRIPTION
                      }
                    </span>
                  </div>
                </div>
                <div className="mt-1 transition-all duration-300 w-full">
                  <CodeBlock code={aiStyledChart} language="json" />
                </div>
              </>
            )}
          </div>
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
                .DATABASE_CHART_AI_STYLE_PROMPT_ACCEPT_FORM_CANCEL_BUTTON
            }
          </button>

          {aiStyledChart && (
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
                    .DATABASE_CHART_AI_STYLE_PROMPT_ACCEPT_FORM_CONFIRM_BUTTON
                }
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => generateAIPromptBasedChartStyle({ aiPrompt })}
            className="px-2.5 py-1.5 text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 flex flex-row items-center rounded hover:from-indigo-500 hover:to-purple-500 transition-all duration-200"
            style={{
              boxShadow: "0 0 15px rgba(99, 102, 241, 0.2)",
            }}
          >
            {isGeneratingAIPromptBasedChartStyle ? (
              <div className="flex items-center">
                <CircularProgress className="mr-2" size={16} color="inherit" />
                <span>Generating...</span>
              </div>
            ) : aiStyledChart ? (
              <div className="flex items-center">
                <FaMagic className="mr-2" />
                <span>
                  {
                    CONSTANTS.STRINGS
                      .DATABASE_CHART_AI_STYLE_PROMPT_FORM_REGENERATE_BUTTON
                  }
                </span>
              </div>
            ) : (
              <div className="flex items-center">
                <FaMagic className="mr-2" />
                <span>
                  {
                    CONSTANTS.STRINGS
                      .DATABASE_CHART_AI_STYLE_PROMPT_FORM_GENERATE_BUTTON
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
