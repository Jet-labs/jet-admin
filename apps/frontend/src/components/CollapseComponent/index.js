import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import React, { useState } from "react";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";
import { LOCAL_CONSTANTS } from "../../constants";

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
    <div className={`${containerClass}`}>
      <Button
        variant="text"
        className="!capitalize"
        sx={{
          padding: "0px !important",
          textTransform: "capitalize",
          minWidth: 0,
        }}
        startIcon={
          isOpen ? (
            <BiChevronUp className="!text-sm" />
          ) : (
            <BiChevronDown className="!text-sm" />
          )
        }
        onClick={handleToggle}
      >
        {isOpen
          ? hideButtonText || LOCAL_CONSTANTS.STRINGS.HIDE_CONTENT_BUTTON_TEXT
          : showButtonText || LOCAL_CONSTANTS.STRINGS.SHOW_CONTENT_BUTTON_TEXT}
      </Button>

      <Collapse in={isOpen}>{content()}</Collapse>
    </div>
  );
};
