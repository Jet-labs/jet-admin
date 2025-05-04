import React, { useEffect, useRef, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import PropTypes from "prop-types";

export const BarChartComponent = ({
  data,
  onWidgetInit,
  databaseWidgetConfig,
}) => {
    BarChartComponent.propTypes = {
      data: PropTypes.object,
      onWidgetInit: PropTypes.func,
      databaseWidgetConfig: PropTypes.object,
    };
    const widgetRef = useRef(null);

    
    const options = useMemo(() => {
      return {
        ...databaseWidgetConfig,
      };
    }, [databaseWidgetConfig]);

    const plugin = {
      id: "customCanvasBackgroundColor",
      beforeDraw: (chart, args, options) => {
        const { ctx } = chart;
        ctx.save();
        ctx.globalCompositeOperation = "destination-over";
        ctx.fillStyle = options.backgroundColor || "#fff";
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
    <Bar ref={widgetRef} data={data} options={options} plugins={[plugin]} />
  );
};
