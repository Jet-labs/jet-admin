import React from "react";
import { AlertCircle } from 'lucide-react';
import { extractError } from "../../../utils/error";
import PropTypes from "prop-types";

export const ErrorDisplay = ({ error }) => {
  ErrorDisplay.propTypes = {
    error: PropTypes.object.isRequired,
  };
  return (
    <>
      <AlertCircle className="text-red-500 h-6 w-6" />
      <span className="text-red-500 text-xs">
        {extractError(error || "Something went wrong")}
      </span>
    </>
  );
};
