import React, { useEffect, useRef, useMemo } from "react";
import { Bubble } from "react-chartjs-2";
import PropTypes from "prop-types";

export const BubbleChartComponent = ({ data, onWidgetInit, widgetConfig }) => {
  return (
    <Bubble ref={widgetRef} data={data} options={options} plugins={[plugin]} />
  );
};

BubbleChartComponent.propTypes = {
  data: PropTypes.object,
  onWidgetInit: PropTypes.func,
  widgetConfig: PropTypes.object,
};
