import React from "react";
import PropTypes from "prop-types";
import { Image as ImageIcon } from "lucide-react";

/**
 * ImageWidget
 *
 * Renders an image URL with standard visual options like object-fit,
 * border-radius, and triggers actions onClick.
 */
export const ImageWidget = ({
  widgetConfig,
  fireWidgetEvent,
}) => {
  const src = widgetConfig?.src || "";
  const alt = widgetConfig?.alt || "Image content";
  const objectFit = widgetConfig?.objectFit || "cover"; // "cover" | "contain" | "fill" | "none"
  const borderRadius = widgetConfig?.borderRadius || "none"; // "none" | "sm" | "md" | "lg" | "full"

  const handleImageClick = (e) => {
    if (fireWidgetEvent) {
      fireWidgetEvent("onClick", { event: e });
    }
  };

  if (!src) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-4 border border-dashed border-border bg-muted/20 text-muted-foreground text-xs gap-1.5">
        <ImageIcon className="h-5 w-5 opacity-60" />
        <span>No image URL configured</span>
      </div>
    );
  }

  const radiusClass = {
    none: "rounded-none",
    sm: "rounded",
    md: "rounded",
    lg: "rounded-lg",
    full: "rounded-full",
  }[borderRadius] || "rounded-none";

  const isLoading = widgetConfig?.isLoading === true || widgetConfig?.isLoading === "true";

  return (
    <div className="w-full h-full relative overflow-hidden flex items-center justify-center p-1 bg-transparent">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
          <div className="flex items-center gap-2 rounded bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border">
            <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" /></svg>
            Updating...
          </div>
        </div>
      )}

      <img
        src={src}
        alt={alt}
        className={`w-full h-full select-none cursor-pointer transition-all duration-200 hover:opacity-95 ${radiusClass}`}
        style={{ objectFit }}
        onClick={handleImageClick}
      />
    </div>
  );
};

ImageWidget.propTypes = {
  widgetConfig: PropTypes.object,
  fireWidgetEvent: PropTypes.func,
};

export default ImageWidget;
