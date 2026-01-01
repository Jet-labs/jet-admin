import React, { useEffect, useRef, useMemo } from "react";
import { Scatter } from "react-chartjs-2";
import PropTypes from "prop-types";

export const ScatterChartComponent = ({ data, onWidgetInit, widgetConfig }) => {
  return (
    <Scatter ref={widgetRef} data={data} options={options} plugins={[plugin]} />
  );
};

ScatterChartComponent.propTypes = {
  data: PropTypes.object,
  onWidgetInit: PropTypes.func,
  widgetConfig: PropTypes.object,
};
