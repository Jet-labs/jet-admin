import Collapse from "@mui/material/Collapse";
import React, { useState } from "react";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";
import { CONSTANTS } from "../../../constants";
import PropTypes from "prop-types";

export const CollapseComponent = ({
  showButtonText,
  hideButtonText,
  containerClass,
  content,
}) => {
  CollapseComponent.propTypes = {
    showButtonText: PropTypes.string,
    hideButtonText: PropTypes.string,
    containerClass: PropTypes.string,
    content: PropTypes.func.isRequired,
  };
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={`flex flex-col justify-start items-stretch ${containerClass}`}
    >
      <button
        onClick={handleToggle}
        type="button"
        className="p-0 text-xs m-0 inline-flex bg-transparent text-[#646cff] hover:text-[#646cff] outline-none focus:outline-none hover:outline-none border-0 focus:border-0 hover:border-0"
      >
        {isOpen ? (
          <BiChevronUp className="!text-base mr-1" />
        ) : (
          <BiChevronDown className="!text-base mr-1" />
        )}
        {isOpen
          ? hideButtonText ||
            CONSTANTS.STRINGS.HIDE_QUERY_META_CONTENT_BUTTON_TEXT
          : showButtonText ||
            CONSTANTS.STRINGS.SHOW_QUERY_META_CONTENT_BUTTON_TEXT}
      </button>

      <Collapse in={isOpen}>{content()}</Collapse>
    </div>
  );
};
