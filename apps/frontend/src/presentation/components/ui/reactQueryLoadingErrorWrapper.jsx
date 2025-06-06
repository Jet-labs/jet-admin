import { CircularProgress } from "@mui/material";
import PropTypes from "prop-types";
import React from "react";
import { ErrorDisplay } from "./errorDisplay";

export const ReactQueryLoadingErrorWrapper = ({
  isLoading,
  error,
  loadingContainerClass,
  children,
}) => {
  ReactQueryLoadingErrorWrapper.propTypes = {
    isLoading: PropTypes.bool.isRequired,
    error: PropTypes.object,
    children: PropTypes.node.isRequired,
    loadingContainerClass: PropTypes.string,
  };

  return isLoading ? (
    <div
      className={`h-full w-full flex justify-center items-center ${loadingContainerClass}`}
    >
      <CircularProgress className="!text-[#646cff]" size={16} />
    </div>
  ) : error ? (
    <div className="h-full w-full flex flex-col justify-center items-center">
      <ErrorDisplay error={error || "Something went wrong"} />
    </div>
  ) : (
    children
  );
};
