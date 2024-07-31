import { useState, useEffect } from "react";
export const useContainerDimensions = (containerRef) => {
  const getDimensions = () => ({
    width: containerRef.current.offsetWidth,
    height: containerRef.current.offsetHeight,
  });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const handleResize = () => {
      setDimensions(getDimensions());
    };
    let dimensionsTimeout = setTimeout(() => {
      if (containerRef.current) {
        setDimensions(getDimensions());
      }
    }, 100);
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(dimensionsTimeout);
      window.removeEventListener("resize", handleResize);
    };
  }, [containerRef]);
  return dimensions;
};
