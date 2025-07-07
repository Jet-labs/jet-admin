import PropTypes from "prop-types";
import React, { useEffect, useRef } from "react";

export const IframeWidgetComponent = ({ data, onWidgetInit, widgetConfig }) => {
  IframeWidgetComponent.propTypes = {
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
    <div
      ref={widgetRef}
      style={widgetStyle}
      className={`w-full flex-grow h-full overflow-y-auto${widgetTailwindCss}`}
    >
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
      <iframe
        src={data[0].url}
        title="Web View"
        className="w-full flex-grow h-full overflow-y-auto"
      />
    </div>
  );
};
