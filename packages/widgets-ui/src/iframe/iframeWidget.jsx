import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Globe, ShieldAlert } from "lucide-react";
import { Skeleton, WidgetError, WidgetSurface } from "@jet-admin/ui";
import { buildSandboxAttribute, isAllowedEmbedUrl, normalizeEmbedBoolean } from "../_shared/embedSafety";

export const IframeWidget = ({ widgetConfig }) => {
  const rawUrl = widgetConfig?.url ?? widgetConfig?.src ?? "";
  const url = typeof rawUrl === "string" ? rawUrl.trim() : String(rawUrl ?? "").trim();
  const allowSameOrigin = normalizeEmbedBoolean(widgetConfig?.allowSameOrigin, false);
  const allowScripts = normalizeEmbedBoolean(widgetConfig?.allowScripts, true);
  const allowForms = normalizeEmbedBoolean(widgetConfig?.allowForms, true);
  const allowPopups = normalizeEmbedBoolean(widgetConfig?.allowPopups, false);
  const allowFullscreen = widgetConfig?.allowFullscreen !== false;
  const allowCamera = normalizeEmbedBoolean(widgetConfig?.allowCamera, false);
  const title = widgetConfig?.title || "Embedded content";
  const referrerPolicy = widgetConfig?.referrerPolicy || "no-referrer-when-downgrade";
  const density = widgetConfig?.properties?.density || "comfortable";
  const [loaded, setLoaded] = useState(false);
  const isLoading = normalizeEmbedBoolean(widgetConfig?.isLoading, false);

  const sandboxValue = useMemo(
    () => buildSandboxAttribute({ allowSameOrigin, allowScripts, allowForms, allowPopups }),
    [allowSameOrigin, allowScripts, allowForms, allowPopups]
  );
  const allowValue = useMemo(() => {
    const tokens = [];
    if (allowFullscreen) tokens.push("fullscreen");
    if (allowCamera) tokens.push("camera", "microphone");
    return tokens.join("; ") || undefined;
  }, [allowFullscreen, allowCamera]);

  if (!url) {
    return (
      <WidgetSurface density={density} className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center gap-1 text-muted-foreground">
          <Globe className="h-5 w-5 opacity-60" aria-hidden="true" />
          <span className="text-xs">No iframe URL configured</span>
        </div>
      </WidgetSurface>
    );
  }

  if (!isAllowedEmbedUrl(url)) {
    return (
      <WidgetSurface density={density} className="flex h-full w-full">
        <WidgetError
          title="Embedding blocked"
          message={`This URL scheme cannot be embedded: ${url.slice(0, 160)}`}
        />
      </WidgetSurface>
    );
  }

  return (
    <WidgetSurface density={density} className="relative h-full w-full overflow-hidden p-0">
      {!loaded && !isLoading && <Skeleton className="absolute inset-0 z-10 rounded-none" />}
      {isLoading && <Skeleton className="absolute inset-0 z-10 rounded-none" />}
      <iframe
        src={url}
        className="h-full w-full border-0 bg-background"
        sandbox={sandboxValue}
        allow={allowValue}
        allowFullScreen={allowFullscreen}
        referrerPolicy={referrerPolicy}
        onLoad={() => setLoaded(true)}
        title={title}
      />
    </WidgetSurface>
  );
};

IframeWidget.propTypes = { widgetConfig: PropTypes.object };
export default IframeWidget;
