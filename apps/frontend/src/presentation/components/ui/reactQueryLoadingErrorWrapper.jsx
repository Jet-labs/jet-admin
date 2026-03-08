import PropTypes from "prop-types";
import React from "react";
import { ErrorDisplay } from "./errorDisplay";

import { Spinner } from "@jet-admin/ui";
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
      <Spinner className="text-primary" size={16} />
    </div>
  ) : error ? (
    <div className="h-full w-full flex flex-col justify-center items-center">
      <ErrorDisplay error={error || "Something went wrong"} />
    </div>
  ) : (
    children
  );
};
