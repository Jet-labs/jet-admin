import { useEffect, useRef } from "react";

export const DatabaseTextWidget = ({
  data,
  refetchInterval,
  onWidgetInit,
  databaseWidgetConfig,
}) => {
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
