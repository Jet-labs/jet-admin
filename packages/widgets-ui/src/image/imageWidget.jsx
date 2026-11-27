import React, { useState } from "react";
import PropTypes from "prop-types";
import { Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, Skeleton, WidgetEmpty, WidgetSurface, cn } from "@jet-admin/ui";
import { normalizeFieldBoolean } from "../_shared/fieldContracts";

const RADIUS = { none: "rounded-none", sm: "rounded-control", md: "rounded-card", lg: "rounded-overlay", full: "rounded-full" };

export const ImageWidget = ({ widgetConfig, fireWidgetEvent }) => {
  const src = widgetConfig?.src || "";
  const alt = widgetConfig?.alt ?? "Image content";
  const fallbackSrc = widgetConfig?.fallbackSrc || "";
  const objectFit = widgetConfig?.objectFit || "cover";
  const objectPosition = widgetConfig?.objectPosition || "center";
  const borderRadius = widgetConfig?.borderRadius || "none";
  const aspectRatio = widgetConfig?.aspectRatio || "";
  const caption = widgetConfig?.caption || "";
  const lazy = widgetConfig?.lazy !== false;
  const lightbox = normalizeFieldBoolean(widgetConfig?.lightbox, false);
  const showBorder = normalizeFieldBoolean(widgetConfig?.showBorder, false);
  const isLoading = normalizeFieldBoolean(widgetConfig?.isLoading, false);
  const density = widgetConfig?.properties?.density || "comfortable";
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const displaySrc = failed && fallbackSrc ? fallbackSrc : src;

  if (isLoading) {
    return (
      <WidgetSurface density={density} className="flex h-full w-full items-center justify-center">
        <Skeleton className="h-24 w-full rounded-card" />
      </WidgetSurface>
    );
  }

  if (!displaySrc) {
    return (
      <WidgetSurface density={density} className="flex h-full w-full">
        <WidgetEmpty icon={ImageIcon} title="No image URL" description="Add a source or binding in the image settings." />
      </WidgetSurface>
    );
  }

  const image = (
    <img
      src={displaySrc}
      alt={alt}
      loading={lazy ? "lazy" : "eager"}
      onError={() => {
        if (!failed && fallbackSrc) setFailed(true);
      }}
      onLoad={() => setLoaded(true)}
      onClick={(event) => {
        if (lightbox) {
          event.stopPropagation();
          setOpen(true);
        } else {
          fireWidgetEvent?.("onClick", { src: displaySrc });
        }
      }}
      onKeyDown={
        lightbox
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setOpen(true);
              }
            }
          : undefined
      }
      tabIndex={lightbox ? 0 : undefined}
      className={cn(
        "h-full w-full select-none object-cover transition-opacity duration-200 motion-reduce:transition-none",
        RADIUS[borderRadius] || "rounded-none",
        showBorder && "border border-border",
        lightbox && "cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        !loaded && "opacity-0"
      )}
      style={{ objectFit, objectPosition, aspectRatio: aspectRatio || undefined }}
    />
  );

  return (
    <WidgetSurface density={density} className="relative flex h-full w-full flex-col items-center justify-center gap-1 overflow-hidden">
      {isLoading && <Skeleton className="absolute inset-0 rounded-card" />}
      <div className="relative flex h-full w-full items-center justify-center">
        {image}
        {failed && !fallbackSrc && <WidgetEmpty icon={ImageIcon} title="Image failed to load" />}
      </div>
      {caption && <p className="w-full truncate text-center text-[10px] text-muted-foreground">{caption}</p>}
      {lightbox && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-4xl p-2" aria-label={alt || "Image preview"}>
            <img src={displaySrc} alt={alt} className="max-h-[75vh] w-full object-contain" />
          </DialogContent>
        </Dialog>
      )}
    </WidgetSurface>
  );
};

ImageWidget.propTypes = { widgetConfig: PropTypes.object, fireWidgetEvent: PropTypes.func };
export default ImageWidget;
