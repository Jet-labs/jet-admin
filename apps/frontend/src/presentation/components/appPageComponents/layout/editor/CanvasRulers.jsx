import React, { useMemo } from "react";
import PropTypes from "prop-types";

const HORIZONTAL_EXTENT = 1120;
const VERTICAL_EXTENT = 6000;

const pickStep = (zoom) => {
  if (zoom < 0.55) return 500;
  if (zoom < 0.85) return 200;
  return 100;
};

const buildTicks = (extent, step) => {
  const ticks = [];
  for (let value = 0; value <= extent; value += step) {
    ticks.push(value);
  }
  return ticks;
};

/**
 * CanvasRulers
 *
 * Screen-space rulers positioned from the viewport's pan/zoom CSS variables.
 * Ticks are children of a transformed track, so panning updates them without
 * React re-rendering. Labels counter-scale to stay legible at any zoom.
 */
export default function CanvasRulers({ pageWidth = HORIZONTAL_EXTENT, zoom = 1 }) {
  const labelStep = pickStep(zoom);
  const minorStep = Math.max(20, Math.round(labelStep / 2));
  const horizontalTicks = useMemo(
    () => buildTicks(Math.max(pageWidth, HORIZONTAL_EXTENT), minorStep),
    [pageWidth, minorStep]
  );
  const verticalTicks = useMemo(
    () => buildTicks(VERTICAL_EXTENT, minorStep),
    [minorStep]
  );

  return (
    <>
      <div className="craft-ruler craft-ruler-top" aria-hidden="true">
        <div
          className="craft-ruler-track craft-ruler-track-x"
          style={{ width: Math.max(pageWidth, HORIZONTAL_EXTENT) }}
        >
          {horizontalTicks.map((value) => {
            const major = value % labelStep === 0;
            return (
              <React.Fragment key={`h-${value}`}>
                <span
                  className={`craft-ruler-tick ${major ? "is-major" : ""}`}
                  style={{ left: value }}
                />
                {major && (
                  <span className="craft-ruler-label" style={{ left: value }}>
                    {value}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      <div className="craft-ruler craft-ruler-left" aria-hidden="true">
        <div
          className="craft-ruler-track craft-ruler-track-y"
          style={{ height: VERTICAL_EXTENT }}
        >
          {verticalTicks.map((value) => {
            const major = value % labelStep === 0;
            return (
              <span
                key={`v-${value}`}
                className={`craft-ruler-tick ${major ? "is-major" : ""}`}
                style={{ top: value }}
              />
            );
          })}
        </div>
      </div>
      <div className="craft-ruler-corner" aria-hidden="true" />
    </>
  );
}

CanvasRulers.propTypes = {
  pageWidth: PropTypes.number,
  zoom: PropTypes.number,
};
