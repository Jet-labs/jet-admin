import PropTypes from "prop-types";
import React, { useEffect, useRef } from "react";

export const TextWidgetComponent = ({ data, onWidgetInit, widgetConfig }) => {
  TextWidgetComponent.propTypes = {
    data: PropTypes.object,
    onWidgetInit: PropTypes.func,
    widgetConfig: PropTypes.object,
  };
  const widgetRef = useRef(null);
  const { widgetCss = {}, widgetTailwindCss = "" } = widgetConfig || {};

  const widgetStyle = {
    ...widgetCss,
  };

  useEffect(() => {
    if (widgetRef.current) {
      onWidgetInit?.(widgetRef);
    }
  }, [onWidgetInit, widgetRef]);

  return (
    <div ref={widgetRef} style={widgetStyle} className={`${widgetTailwindCss}`}>
      {widgetConfig.titleEnabled && widgetConfig.title && (
        <h2
          className={
            "text-sm font-semibold text-gray-700 truncate line-clamp-2" +
            widgetConfig.titleTailwindCss
          }
        >
          {widgetConfig.title}
        </h2>
      )}
      <span>{data && data.text ? data.text : "Invalid data"}</span>
    </div>
  );
};
