import React from "react";
import PropTypes from "prop-types";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@jet-admin/ui";

export function ApplicationFeedback({ error, message, onRetry }) {
  if (!error && !message) return null;
  const isError = Boolean(error);
  const Icon = isError ? AlertTriangle : CheckCircle2;
  return (
    <div
      role={isError ? "alert" : "status"}
      className={`flex items-start gap-2 rounded border p-2 text-xs ${
        isError
          ? "border-destructive/40 bg-destructive/10 text-destructive"
          : "border-border/60 bg-muted/30 text-muted-foreground"
      }`}
    >
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p>{error?.message || message}</p>
        {error?.code === "APPLICATION_REVISION_CONFLICT" && (
          <p className="mt-1">
            Copy your changes before reloading. A newer revision is available.
          </p>
        )}
        {onRetry && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={onRetry}
          >
            Try again
          </Button>
        )}
      </div>
    </div>
  );
}

ApplicationFeedback.propTypes = {
  error: PropTypes.object,
  message: PropTypes.string,
  onRetry: PropTypes.func,
};
