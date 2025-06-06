// BaseChartComponent.js
import React, { useMemo, useRef, useEffect } from "react";
import {ChartWrapper} from "./chartWrapper";
import PropTypes from "prop-types";
import { getDemoData } from "./chartConfig";

export const BaseChartComponent = ({
  type,
  data,
  onChartInit,
  databaseChartConfig,
}) => {
  BaseChartComponent.propTypes = {
    type: PropTypes.string.isRequired,
    data: PropTypes.object,
    onChartInit: PropTypes.func,
    databaseChartConfig: PropTypes.object,
  };
  const chartRef = useRef(null);

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
  const options = useMemo(() => {
    return {
      ...databaseChartConfig,
    };
  }, [databaseChartConfig]);

  useEffect(() => {
    if (chartRef.current) {
      onChartInit?.(chartRef);
    }
  }, [onChartInit]);

  return (
    <ChartWrapper
      ref={chartRef}
      type={type}
      data={data || getDemoData(type)}
      options={options}
      plugins={[plugin]}
    />
  );
};

