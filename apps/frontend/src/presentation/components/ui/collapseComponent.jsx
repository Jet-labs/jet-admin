import React, { useState } from "react";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { CONSTANTS } from "../../../constants";
import PropTypes from "prop-types";

import { Button } from "@jet-admin/ui";
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
      <Button
        onClick={handleToggle}
        type="button"
        variant="ghost" className="p-0 m-0 text-primary hover:text-primary"
      >
        {isOpen ? (
          <ChevronUp className="text-base mr-1" />
        ) : (
            <ChevronDown className="text-base mr-1" />
        )}
        {isOpen
          ? hideButtonText ||
            CONSTANTS.STRINGS.HIDE_QUERY_META_CONTENT_BUTTON_TEXT
          : showButtonText ||
            CONSTANTS.STRINGS.SHOW_QUERY_META_CONTENT_BUTTON_TEXT}
      </Button>

      <div
        className={`grid transition-all duration-200 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">{content()}</div>
      </div>
    </div>
  );
};
