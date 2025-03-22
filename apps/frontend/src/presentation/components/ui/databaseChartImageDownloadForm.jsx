import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slider
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FiDownload } from "react-icons/fi";
import { CONSTANTS } from "../../../constants";
import { StringUtils } from "../../../utils/string";
export const DatabaseChartDownloadForm = ({
  databaseChartName,
  chartRef,
}) => {
  const [isQualityDialogOpen, setIsQualityDialogOpen] = useState(false);
  const [previewData, setPreviewData] = useState(
    null
  );
  const [selectedQuality, setSelectedQuality] = useState(1); // Default quality is 1 (high)
  const _handleDownloadImage = useCallback(() => {
    if (!chartRef || !chartRef.current) {
      console.error("Chart reference is not available.");
      return;
    }
    setIsQualityDialogOpen(true);
  }, [chartRef]);

  const _handleConfirmDownload = useCallback(() => {
    if (!chartRef || !chartRef.current) {
      console.error("Chart reference is not available.");
      return;
    }

    const base64Image = chartRef?.current?.toBase64Image(
      "image/jpeg",
      parseFloat(selectedQuality)
    );
    if(!base64Image)return;

    const link = document.createElement("a");
    link.href = base64Image;
    link.download = `${databaseChartName || "chart"}.jpeg`;
    link.click();

    setIsQualityDialogOpen(false);
  }, [setIsQualityDialogOpen, chartRef, databaseChartName, selectedQuality]);

  const _handleCancelDownload = useCallback(() => {
    setIsQualityDialogOpen(false);
  }, [setIsQualityDialogOpen]);

  const _handleQualityChange = useCallback(
    (event) => {
      setSelectedQuality(event.target.value);
      const base64Image = chartRef?.current?.toBase64Image(
        "image/jpeg",
        parseFloat(event.target.value)
      );
      setPreviewData(base64Image);
    },
    [setSelectedQuality, chartRef, setPreviewData]
  );

  

  const processedPreview = useMemo(() => {
    console.log(chartRef);
    if (previewData) return previewData;
    if (chartRef?.current) {
      const base64Image = chartRef?.current?.toBase64Image("image/jpeg", 1.0);
      console.log(base64Image);
      return base64Image;
    }
  }, [chartRef, chartRef.current, previewData]); 

  return (
    <>
      <button
        type="button"
        className="p-1 bg-[#646cff]/20 m-0 flex flex-row justify-center items-center rounded text-xs text-[#646cff] hover:border-[#646cff] hover:border outline-none focus:outline-none"
        onClick={_handleDownloadImage}
      >
        <FiDownload className="h-4 w-4" />
      </button>
      <Dialog
        open={isQualityDialogOpen}
        onClose={_handleCancelDownload}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle className="!p-4 !pb-0 !z-10">
          {CONSTANTS.STRINGS.CHART_DATASET_CHART_DOWNLOAD_FORM_TITLE}
        </DialogTitle>
        <DialogContent className="!p-4 !space-y-4">
          <span className="block text-sm font-medium text-gray-700 !z-10 bg-white">
            {CONSTANTS.STRINGS.CHART_DATASET_CHART_DOWNLOAD_FORM_DESCRIPTION}
          </span>

          <input
            id="default-range"
            type="range"
            value={selectedQuality}
            onChange={_handleQualityChange}
            min={0.1}
            max={1}
            step={0.1}
            className="w-full h-1 rounded-lg appearance-none cursor-pointer !z-10 text-blue-500 bg-[#646cff]"
          ></input>
          {processedPreview&&<span className="text-xs text-slate-500">
            Image size: {StringUtils.getImageSizeInKB(processedPreview)} KB
          </span>}

          {processedPreview && (
            <div className="flex flex-row justify-center items-center w-full relative">
              <img
                src={processedPreview}
                className=" absolute top-0 left-0 right-0 h-96 w-full"
              />
              <div className=" backdrop-blur-3xl absolute top-0 left-0 z-10 right-0 h-96 w-full" />
              <img src={processedPreview} className="h-96 z-20" />
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <button
            onClick={_handleCancelDownload}
            type="button"
            className={`px-2.5 py-1.5 text-sm !text-slate-600 border-0 hover:border-0 !border-slate-300 bg-slate-200 hover:!bg-slate-300 rounded  hover:outline-none  outline-none `}
          >
            {CONSTANTS.STRINGS.CHART_DATASET_CHART_DOWNLOAD_FORM_CANCEL}
          </button>

          <button
            type="button"
            onClick={_handleConfirmDownload}
            className={`px-2.5 py-1.5 text-white text-sm bg-[#646cff] rounded hover:outline-none hover:border-0 border-0 outline-none `}
          >
            {CONSTANTS.STRINGS.CHART_DATASET_CHART_DOWNLOAD_FORM_CONFIRM}
          </button>
        </DialogActions>
      </Dialog>
    </>
  );
};
