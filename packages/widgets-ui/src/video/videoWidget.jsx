import React, { useState } from "react";
import PropTypes from "prop-types";
import { Clapperboard } from "lucide-react";
import { Skeleton, WidgetEmpty, WidgetError, WidgetSurface, cn } from "@jet-admin/ui";
import { normalizeFieldBoolean } from "../_shared/fieldContracts";

export const VideoWidget = ({ widgetConfig, fireWidgetEvent }) => {
  const src = widgetConfig?.src || "";
  const poster = widgetConfig?.poster || undefined;
  const controls = widgetConfig?.controls !== false;
  const autoplay = normalizeFieldBoolean(widgetConfig?.autoplay, false);
  const loop = normalizeFieldBoolean(widgetConfig?.loop, false);
  const muted = normalizeFieldBoolean(widgetConfig?.muted, false);
  const playsInline = widgetConfig?.playsInline !== false;
  const preload = widgetConfig?.preload || "metadata";
  const aspectRatio = widgetConfig?.aspectRatio || "";
  const tracks = Array.isArray(widgetConfig?.tracks) ? widgetConfig.tracks : [];
  const isLoading = normalizeFieldBoolean(widgetConfig?.isLoading, false);
  const density = widgetConfig?.properties?.density || "comfortable";
  const [failed, setFailed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  if (isLoading) {
    return (
      <WidgetSurface density={density} className="flex h-full w-full items-center justify-center">
        <Skeleton className="h-full min-h-[120px] w-full rounded-card" />
      </WidgetSurface>
    );
  }

  if (!src) {
    return (
      <WidgetSurface density={density} className="flex h-full w-full">
        <WidgetEmpty icon={Clapperboard} title="No video URL" description="Add a video source in the video settings." />
      </WidgetSurface>
    );
  }

  if (failed) {
    return (
      <WidgetSurface density={density} className="flex h-full w-full">
        <WidgetError title="Video could not load" message="Check the URL or try a different format." onRetry={() => { setFailed(false); setRetryKey((key) => key + 1); }} />
      </WidgetSurface>
    );
  }

  return (
    <WidgetSurface density={density} className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <div className="w-full" style={aspectRatio ? { aspectRatio } : undefined}>
        <video
          key={retryKey}
          src={src}
          poster={poster}
          controls={controls}
          autoPlay={autoplay}
          loop={loop}
          muted={muted || autoplay}
          playsInline={playsInline}
          preload={preload}
          onError={() => setFailed(true)}
          onClick={() => fireWidgetEvent?.("onClick", { src })}
          className={cn("h-full w-full object-contain", aspectRatio && "h-full")}
        >
          {tracks.map((track, index) => (
            <track
              key={`${track.src}-${index}`}
              kind={track.kind || "captions"}
              label={track.label || `Track ${index + 1}`}
              srcLang={track.srclang || "en"}
              src={track.src}
              default={index === 0}
            />
          ))}
        </video>
      </div>
    </WidgetSurface>
  );
};

VideoWidget.propTypes = { widgetConfig: PropTypes.object, fireWidgetEvent: PropTypes.func };
export default VideoWidget;
