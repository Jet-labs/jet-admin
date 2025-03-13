import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import React, { useState } from "react";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";
import { CONSTANTS } from "../../../constants";

export const CollapseComponent = ({
  showButtonText,
  hideButtonText,
  containerClass,
  content,
}) => {
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
        className="p-0 text-xs m-0 inline-flex bg-transparent text-blue-500 outline-none focus:outline-none hover:outline-none border-0 focus:border-0 hover:border-0"
      >
        {isOpen ? (
          <BiChevronUp className="!text-base" />
        ) : (
          <BiChevronDown className="!text-base" />
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
