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
  return (
    <span
      ref={widgetRef}
      className={`text-slate-700 ${databaseWidgetConfig.className}`}
    >
      {JSON.stringify(data)}
    </span>
  );
};
