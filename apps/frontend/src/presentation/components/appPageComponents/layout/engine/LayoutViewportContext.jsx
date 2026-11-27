import React, { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { getBreakpointTier } from "./responsive.js";

/**
 * The editor canvas provider supplies its simulated width; the viewer leaves
 * the value `null` and the hook follows the real window width. Keeping the
 * canvas width in context prevents the editor preview and a viewer mirror on
 * the same page from fighting over a global DOM query.
 */
const LayoutViewportWidthContext = createContext(null);

export function LayoutViewportProvider({ width = null, children }) {
  return (
    <LayoutViewportWidthContext.Provider value={width}>
      {children}
    </LayoutViewportWidthContext.Provider>
  );
}

LayoutViewportProvider.propTypes = {
  width: PropTypes.number,
  children: PropTypes.node,
};

export function useLayoutBreakpoint() {
  const providedWidth = useContext(LayoutViewportWidthContext);
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window === "undefined" ? 1280 : window.innerWidth
  );

  useEffect(() => {
    if (Number.isFinite(providedWidth)) return undefined;
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, [providedWidth]);

  const effectiveWidth = Number.isFinite(providedWidth) ? providedWidth : windowWidth;
  return getBreakpointTier(effectiveWidth);
}
