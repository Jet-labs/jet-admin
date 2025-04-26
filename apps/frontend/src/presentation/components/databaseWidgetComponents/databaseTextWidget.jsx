import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";

export const DatabaseTextWidget = ({
  databaseWidgetName,
  data,
  onWidgetInit,
  databaseWidgetConfig,
}) => {
  DatabaseTextWidget.propTypes = {
    databaseWidgetName: PropTypes.string.isRequired,
    data: PropTypes.object,
    onWidgetInit: PropTypes.func,
    databaseWidgetConfig: PropTypes.object,
  };
  const widgetRef = useRef(null);

  useEffect(() => {
    if (widgetRef.current) {
      onWidgetInit?.(widgetRef);
    }
  }, [onWidgetInit]);

  // Extract CSS configurations
  const { widgetCss = {}, widgetTailwindCss = "" } = databaseWidgetConfig || {};

  const widgetStyle = {
    ...widgetCss,
  };

  return (
    <div ref={widgetRef} style={widgetStyle} className={`${widgetTailwindCss}`}>
      {databaseWidgetConfig.titleEnabled && (
        <h2
          className={
            "text-sm font-semibold text-gray-700 truncate line-clamp-2 " +
            databaseWidgetConfig.titleTailwindCss
          }
        >
          {databaseWidgetName}
        </h2>
      )}
      <span>{data && data.text ? data.text : "Invalid data"}</span>
    </div>
  );
};
