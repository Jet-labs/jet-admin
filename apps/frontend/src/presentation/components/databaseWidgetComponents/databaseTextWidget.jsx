import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";

export const DatabaseTextWidget = ({
  data,
  onWidgetInit,
  databaseWidgetConfig,
}) => {
  DatabaseTextWidget.propTypes = {
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
    <span
      ref={widgetRef}
      style={widgetStyle}
      className={`${widgetTailwindCss}`}
    >
      {data && data.text ? data.text : "Invalid data"}
    </span>
  );
};
