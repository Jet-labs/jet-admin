import React, { useEffect, useRef, useMemo } from "react";
import { Radar } from "react-chartjs-2";
import PropTypes from "prop-types";

export const RadarChartComponent = ({ data, onWidgetInit, widgetConfig }) => {
  return (
    <Radar ref={widgetRef} data={data} options={options} plugins={[plugin]} />
  );
};

RadarChartComponent.propTypes = {
  data: PropTypes.object,
  onWidgetInit: PropTypes.func,
  widgetConfig: PropTypes.object,
};
