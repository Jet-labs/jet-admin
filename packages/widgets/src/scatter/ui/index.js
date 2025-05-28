import React, { useEffect, useRef, useMemo } from "react";
import { Scatter } from "react-chartjs-2";
import PropTypes from "prop-types";

export const ScatterChartComponent = ({ data, onWidgetInit, widgetConfig }) => {
  ScatterChartComponent.propTypes = {
    data: PropTypes.object,
    onWidgetInit: PropTypes.func,
    widgetConfig: PropTypes.object,
  };
  const widgetRef = useRef(null);

  // Add plugin configuration to options
  const options = useMemo(
    () => ({
      ...widgetConfig,
      plugins: {
        ...widgetConfig?.plugins,
        customCanvasBackgroundColor: {
          chartBackgroundColor: widgetConfig?.chartBackgroundColor || "#ffffff",
        },
      },
    }),
    [widgetConfig]
  );

  // Custom plugin with proper v3+ syntax
  const plugin = {
    id: "customCanvasBackgroundColor",
    beforeDraw: (chart) => {
      const { ctx } = chart;
      const backgroundColor =
        chart.options.plugins.customCanvasBackgroundColor?.chartBackgroundColor;

      ctx.save();
      ctx.globalCompositeOperation = "destination-over";
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, chart.width, chart.height);
      ctx.restore();
    },
  };

  useEffect(() => {
    if (widgetRef.current) {
      onWidgetInit?.(widgetRef);
    }
  }, [onWidgetInit]);
  return (
    <Scatter ref={widgetRef} data={data} options={options} plugins={[plugin]} />
  );
};
