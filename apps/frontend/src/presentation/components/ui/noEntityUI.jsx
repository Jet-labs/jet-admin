import React from "react";
import PropTypes from "prop-types";
import emptyIcon from "../../../assets/empty.png";

export const NoEntityUI = ({ message }) => {
  NoEntityUI.propTypes = {
    message: PropTypes.string.isRequired,
  };
  return (
    <div className="flex w-full flex-col items-center justify-center rounded bg-transparent p-2 text-center">
      <img src={emptyIcon} alt="" className="h-12 w-12 opacity-70" aria-hidden="true" />
      <span className="mt-2 w-full text-center text-xs text-muted-foreground">
        {message}
      </span>
    </div>
  );
};
