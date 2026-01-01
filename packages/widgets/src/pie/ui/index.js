import React, { useEffect, useRef, useMemo } from "react";
import { Pie } from "react-chartjs-2";
import PropTypes from "prop-types";

export const PieChartComponent = ({ data, onWidgetInit, widgetConfig }) => {
  return (
    <Pie ref={widgetRef} data={data} options={options} plugins={[plugin]} />
  );
};

PieChartComponent.propTypes = {
  data: PropTypes.object,
  onWidgetInit: PropTypes.func,
  widgetConfig: PropTypes.object,
};
