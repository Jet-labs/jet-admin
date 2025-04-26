import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import {
  Bar,
  Bubble,
  Line,
  Pie,
  PolarArea,
  Radar,
  Scatter,
} from "react-chartjs-2";

// Wrap ChartWrapper with forwardRef to accept a ref from the parent
export const ChartWrapper = forwardRef(
  ({ type, data, options, plugins }, ref) => {
    const ChartComponent = {
      bar: Bar,
      line: Line,
      pie: Pie,
      radar: Radar,
      polarArea: PolarArea,
      bubble: Bubble,
      scatter: Scatter,
    }[type];

    // Throw an error if the chart type is unsupported (unchanged)
    if (!ChartComponent) {
      throw new Error(`Unsupported chart type: ${type}`);
    }

    // Render the selected chart component, passing the internal ref
    return (
      <ChartComponent
        ref={ref}
        data={data}
        options={options}
        plugins={plugins}
      />
    );
  }
);

// Add display name
ChartWrapper.displayName = "ChartWrapper";

// Add prop validation
ChartWrapper.propTypes = {
  type: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  options: PropTypes.object,
  plugins: PropTypes.array,
};
