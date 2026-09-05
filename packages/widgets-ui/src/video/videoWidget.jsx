import React from "react";
import PropTypes from "prop-types";
import { Clapperboard } from "lucide-react";

export const VideoWidget = ({ widgetConfig, fireWidgetEvent }) => {
  const src = widgetConfig?.src || "";
  const poster = widgetConfig?.poster || undefined;
  const controls = widgetConfig?.controls !== false;
  const autoplay = !!widgetConfig?.autoplay;
  const loop = !!widgetConfig?.loop;
  const muted = !!widgetConfig?.muted;
  const isLoading = widgetConfig?.isLoading === true || widgetConfig?.isLoading === "true";

  if (!src) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-4 border border-dashed border-border bg-muted/20 text-muted-foreground text-xs gap-1.5">
        <Clapperboard className="h-5 w-5 opacity-60" />
        <span>No video URL configured</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-background overflow-hidden relative flex items-center justify-center" onClick={() => fireWidgetEvent?.("onClick", {})}>
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
          <div className="flex items-center gap-2 rounded bg-muted/50 px-4 py-2 text-sm text-foreground shadow-sm border border-border">
            <svg width="16" height="16" viewBox="0 0 24 24" className="animate-spin"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" /></svg>
            Updating...
          </div>
        </div>
      )}
      <video src={src} poster={poster} controls={controls} autoPlay={autoplay} loop={loop} muted={muted} className="w-full h-full" style={{ objectFit: "contain" }} />
    </div>
  );
};

VideoWidget.propTypes = { widgetConfig: PropTypes.object, fireWidgetEvent: PropTypes.func };
export default VideoWidget;
