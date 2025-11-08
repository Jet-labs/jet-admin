import React from "react";
import PropTypes from "prop-types";
import emptyIcon from "../../../assets/empty.png";

export const NoEntityUI = ({ message }) => {
  NoEntityUI.propTypes = {
    message: PropTypes.string.isRequired,
  };
  return (
    <div className=" bg-transparent p-5 py-2 w-full flex flex-col items-center rounded  justify-center  opacity-50">
      <img src={emptyIcon} alt="Empty" className="w-12 h-12" />
      <span className="!text-[#646cff] text-xs font-normal text-center w-full mt-3">
        {message}
      </span>
    </div>
  );
};
