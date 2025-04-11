import {
    CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { CONSTANTS } from "../../../constants";
import { useState } from "react";
import { FaMagic } from "react-icons/fa";
import { useMutation } from "@tanstack/react-query";
import { displayError } from "../../../utils/notification";
import { generateAIPromptBasedQueryAPI } from "../../../data/apis/databaseQuery";
import CodeBlock from "../ui/codeBlock";

export const DatabaseQueryAIGeneratePrompt = ({tenantID, onAccepted }) => {
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGeneratedQuery, setAiGeneratedQuery] = useState("");
  const [isAIPromptDialogOpen, setIsAIPromptDialogOpen] = useState(false);

  const {
    isPending: isGeneratingAIPrompt,
    isSuccess: isGeneratingAIPromptSuccess,
    isError: isGeneratingAIPromptError,
    error: generateAIPromptError,
    mutate: generateAIPrompt,
  } = useMutation(
    {
        mutationFn: ({aiPrompt}) => {
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
    }
  );
  console.log({ aiGeneratedQuery });
  return (
    <>
      <button
        type="submit"
        onClick={() => setIsAIPromptDialogOpen(true)}
        className="
        flex mr-2 flex-row justify-center items-center
        px-3 py-2 text-xs font-medium text-center text-white
        bg-gradient-to-r from-[#646cff] via-[#8d5fb8] to-[#e654da]
        rounded border-none shadow-md
        transform transition-all duration-300 ease-in-out
        hover:scale-105 hover:shadow-lg hover:brightness-110
        focus:outline-none
    "
      >
        <FaMagic className="text-sm mr-1" />{" "}
        {/* Icon color will inherit from text-white */}
        {CONSTANTS.STRINGS.DATABASE_QUERY_AI_PROMPT_BUTTON}
      </button>
      <Dialog
        open={isAIPromptDialogOpen}
        onClose={() => setIsAIPromptDialogOpen(false)}
        PaperProps={{
          className: "rounded shadow-xl w-full max-w-lg", // Tailwind classes for the dialog container
        }}
        BackdropProps={{
          className: "bg-black/50", // Tailwind class for the backdrop
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle className="!p-4 !pb-0">
          {CONSTANTS.STRINGS.DATABASE_QUERY_AI_PROMPT_FORM_TITLE}
        </DialogTitle>
        <DialogContent className="!p-4 !space-y-4">
          <span className="text-sm font-normal text-gray-600">
            {CONSTANTS.STRINGS.DATABASE_QUERY_AI_PROMPT_FORM_DESCRIPTION}
          </span>
          <div className="space-y-4">
            <textarea
              id="aiPrompt"
              name="aiPrompt"
              rows="4"
              required
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              autoComplete="off"
              className="w-full rounded border p-2.5 text-sm text-gray-900 focus:border-[#646cff] focus:ring-2 focus:ring-[#646cff]/50 bg-white outline-none"
            />
          </div>
          {aiGeneratedQuery&&<CodeBlock code={aiGeneratedQuery} />}
          
        </DialogContent>
        <DialogActions className="!p-4">
          <button
            onClick={() => setIsAIPromptDialogOpen(false)}
            type="button"
            className={`px-2.5 py-1.5 text-sm !text-slate-600 border-0 hover:border-0 !border-slate-300 bg-slate-200 hover:!bg-slate-300 rounded  hover:outline-none  outline-none `}
          >
            {CONSTANTS.STRINGS.CHART_DATASET_CHART_DOWNLOAD_FORM_CANCEL}
          </button>

          {aiGeneratedQuery&&<button
            type="button"
            onClick={() => {onAccepted(aiGeneratedQuery); setIsAIPromptDialogOpen(false)}}
            className={`px-2.5 py-1.5 text-white text-sm bg-[#42CC3DFF]/60 rounded hover:outline-none hover:border-0 border-0 outline-none `}
          >
            {
              CONSTANTS.STRINGS
                .DATABASE_QUERY_AI_PROMPT_ACCEPT_FORM_CONFIRM_BUTTON
            }
          </button>}
          <button
            type="button"
            onClick={() => generateAIPrompt({aiPrompt})}
            className={`px-2.5 py-1.5 text-white text-sm bg-[#646cff] flex flex-row items-center rounded hover:outline-none hover:border-0 border-0 outline-none `}
          >
            {isGeneratingAIPrompt ? (
              <CircularProgress
                className="!text-xs"
                size={20}
                color="white"
              />
            ):
              CONSTANTS.STRINGS
                .DATABASE_QUERY_AI_PROMPT_FORM_CONFIRM_BUTTON
            }
          </button>
        </DialogActions>
      </Dialog>
    </>
  );
};
