
import React from "react";
import PropTypes from "prop-types";

export const QueryResponseWebViewTab = ({
  data,
  className,
  height = "100%",
  width = "100%",
}) => {
    QueryResponseWebViewTab.propTypes = {
      data: PropTypes.array,
      className: PropTypes.string,
      height: PropTypes.string,
      width: PropTypes.string,
    };
    console.log("data", data);
    return (
      <div className="w-100 flex-grow h-full overflow-y-auto pb-5">
        <iframe
          src={data.url}
          title="Web View"
          className="w-full h-full border-none"
        />
      </div>
    );
};