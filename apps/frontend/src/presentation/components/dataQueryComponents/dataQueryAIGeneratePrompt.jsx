import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { FaMagic } from "react-icons/fa";
import { CONSTANTS } from "../../../constants";
import { generateAIPromptBasedQueryAPI } from "../../../data/apis/dataQuery";
import { displayError } from "../../../utils/notification";
import { CodeBlock } from "../ui/codeBlock";
import PropTypes from "prop-types";

import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, Spinner, Textarea } from "@jet-admin/ui";

export const DataQueryAIGeneratePrompt = ({ tenantID, onAccepted }) => {
  DataQueryAIGeneratePrompt.propTypes = {
    tenantID: PropTypes.number.isRequired,
    onAccepted: PropTypes.func.isRequired,
  };
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGeneratedQuery, setAiGeneratedQuery] = useState("");
  const [isAIPromptDialogOpen, setIsAIPromptDialogOpen] = useState(false);

  const {
    isPending: isGeneratingAIPromptBasedQuery,
    mutate: generateAIPromptBasedQuery,
  } = useMutation({
    mutationFn: ({ aiPrompt }) => {
      return generateAIPromptBasedQueryAPI({
        tenantID,
        aiPrompt,
      });
    },
    retry: false,
    onSuccess: (data) => {
      setAiGeneratedQuery(data);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  return (
    <>
      <Button
        type="button"
        size="sm"
        onClick={() => setIsAIPromptDialogOpen(true)}
        className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-400 text-white border-none shadow-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
      >
        <FaMagic className="mr-2 size-3.5 animate-pulse" />
        {CONSTANTS.STRINGS.DATA_QUERY_AI_PROMPT_BUTTON}
      </Button>

      <Dialog open={isAIPromptDialogOpen} onOpenChange={(v) => { if (!v) setIsAIPromptDialogOpen(false); }}>
        <DialogContent className="max-w-md p-0 overflow-hidden border border-border">
          <div className="p-6 space-y-4">
            <DialogHeader>
              <DialogTitle className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-semibold text-lg">
                {CONSTANTS.STRINGS.DATA_QUERY_AI_PROMPT_FORM_TITLE}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {CONSTANTS.STRINGS.DATA_QUERY_AI_PROMPT_FORM_DESCRIPTION}
              </p>

              <div className="space-y-1">
                <Textarea
                  id="aiPrompt"
                  name="aiPrompt"
                  rows="4"
                  required
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  autoComplete="off"
                  className="w-full resize-none"
                  placeholder="Describe what you want to query..."
                />
              </div>

              {aiGeneratedQuery && (
                <div className="mt-4 rounded border border-border overflow-hidden">
                  <CodeBlock code={aiGeneratedQuery} language="pgsql" />
                </div>
              )}
            </div>

            <div className="flex justify-end items-center gap-3 mt-6">
              <Button
                onClick={() => setIsAIPromptDialogOpen(false)}
                type="button"
                variant="outline"
                size="sm"
              >
                {CONSTANTS.STRINGS.CHART_DATASET_CHART_DOWNLOAD_FORM_CANCEL}
              </Button>

              <div className="flex items-center gap-2">
                {aiGeneratedQuery && (
                  <Button
                    type="button"
                    variant="primary-ghost"
                    size="sm"
                    onClick={() => {
                      onAccepted(aiGeneratedQuery);
                      setIsAIPromptDialogOpen(false);
                    }}
                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  >
                    {CONSTANTS.STRINGS.DATA_QUERY_AI_PROMPT_ACCEPT_FORM_CONFIRM_BUTTON}
                  </Button>
                )}

                <Button
                  type="button"
                  size="sm"
                  onClick={() => generateAIPromptBasedQuery({ aiPrompt })}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-none"
                >
                  {isGeneratingAIPromptBasedQuery ? (
                    <>
                      <Spinner className="mr-2" size={16} />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <FaMagic className="mr-2 size-3.5" />
                      <span>
                          {aiGeneratedQuery
                            ? CONSTANTS.STRINGS.DATA_QUERY_AI_PROMPT_FORM_REGENERATE_BUTTON
                            : CONSTANTS.STRINGS.DATA_QUERY_AI_PROMPT_FORM_GENERATE_BUTTON}
                        </span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
