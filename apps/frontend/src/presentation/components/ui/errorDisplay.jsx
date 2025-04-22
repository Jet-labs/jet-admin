import React from "react";
import { MdOutlineErrorOutline } from "react-icons/md";
import { extractError } from "../../../utils/error";
import PropTypes from "prop-types";

export const ErrorDisplay = ({ error }) => {
  ErrorDisplay.propTypes = {
    error: PropTypes.object.isRequired,
  };
  return (
    <>
      <MdOutlineErrorOutline className="text-red-500 h-6 w-6" />
      <span className="text-red-500 text-xs">
        {extractError(error || "Something went wrong")}
      </span>
    </>
  );
};
