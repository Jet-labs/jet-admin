import PropTypes from "prop-types";
import React, { useEffect, useRef } from "react";

export const TextWidgetComponent = ({
  data,
  onWidgetInit,
  databaseWidgetConfig,
}) => {
    TextWidgetComponent.propTypes = {
      data: PropTypes.object,
      onWidgetInit: PropTypes.func,
      databaseWidgetConfig: PropTypes.object,
    };
    const widgetRef = useRef(null);
    const { widgetCss = {}, widgetTailwindCss = "" } =
      databaseWidgetConfig || {};

    const widgetStyle = {
      ...widgetCss,
    }

    useEffect(() => {
      if (widgetRef.current) {
        onWidgetInit?.(widgetRef);
      }
    }, [onWidgetInit,widgetRef]);

  return (
    <div ref={widgetRef} style={widgetStyle} className={`${widgetTailwindCss}`}>
      {databaseWidgetConfig.titleEnabled &&
        databaseWidgetConfig.title&&(
          <h2
            className={
              "text-sm font-semibold text-gray-700 truncate line-clamp-2" +
              databaseWidgetConfig.titleTailwindCss
            }
          >
            {databaseWidgetConfig.title}
          </h2>
        )}
      <span>{data && data.text ? data.text : "Invalid data"}</span>
    </div>
  );
};
