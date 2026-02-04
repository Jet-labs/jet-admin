import React, { useEffect, useRef, useMemo } from "react";
import { Bubble } from "react-chartjs-2";
import PropTypes from "prop-types";

export const BubbleChartComponent = ({ data, onWidgetInit, widgetConfig }) => {
  const widgetRef = useRef(null);

  // Chart options with responsive defaults
  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: widgetConfig?.showLegend !== false,
      },
    },
    ...widgetConfig?.chartOptions,
  }), [widgetConfig]);

  // Background color plugin
  const plugin = useMemo(() => ({
    id: 'customCanvasBackgroundColor',
    beforeDraw: (chart) => {
      const { ctx } = chart;
      const backgroundColor = widgetConfig?.backgroundColor || 'transparent';
      ctx.save();
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, chart.width, chart.height);
      ctx.restore();
    },
  }), [widgetConfig?.backgroundColor]);

  // Callback when widget is initialized
  useEffect(() => {
    if (onWidgetInit && widgetRef.current) {
      onWidgetInit(widgetRef);
    }
  }, [onWidgetInit]);

  return (
    <Bubble ref={widgetRef} data={data} options={options} plugins={[plugin]} />
  );
};

BubbleChartComponent.propTypes = {
  data: PropTypes.object,
  onWidgetInit: PropTypes.func,
  widgetConfig: PropTypes.object,
};
