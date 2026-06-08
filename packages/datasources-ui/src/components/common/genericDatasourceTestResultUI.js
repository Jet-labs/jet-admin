import React from "react";

export const GenericDatasourceTestResultUI = ({ connectionResult }) => {
  console.log("connectionResult", connectionResult);

  let status = "untested"; // "success" | "error" | "warning" | "untested"
  let title = "Connection not tested";
  let details = null;

  if (connectionResult === true || connectionResult?.ok === true) {
    status = "success";
    title = connectionResult?.statusText || "Connection successful";
    if (connectionResult?.details) {
      details = connectionResult.details;
    } else if (typeof connectionResult === "object" && connectionResult !== null && connectionResult !== true) {
      const keys = Object.keys(connectionResult).filter(k => k !== 'ok' && k !== 'statusText');
      if (keys.length > 0) {
        details = connectionResult;
      }
    }
  } else if (connectionResult === undefined || connectionResult === null) {
    status = "untested";
    title = "Connection not tested";
  } else {
    // Either failed or returned an error
    const isError = !connectionResult?.ok;
    status = isError ? "error" : "warning";
    
    // Extract main message
    if (typeof connectionResult === "string") {
      title = connectionResult;
    } else {
      title = connectionResult?.message || connectionResult?.error || (isError ? "Connection failed" : "Error testing connection");
      
      // Extract details
      if (connectionResult?.details) {
        details = connectionResult.details;
      } else if (connectionResult?.stack) {
        details = connectionResult.stack;
      } else if (connectionResult?.response?.data) {
        details = connectionResult.response.data;
      } else if (typeof connectionResult === "object") {
        // Filter out fields we already show in title
        const filtered = { ...connectionResult };
        delete filtered.ok;
        delete filtered.message;
        delete filtered.error;
        if (Object.keys(filtered).length > 0) {
          details = filtered;
        }
      }
    }
  }

  // Set style mappings according to UI Guidelines V3 (keeping border radius rounded-md / 6px)
  const styles = {
    success: {
      container: "bg-primary/5 border-primary/20 text-primary",
      badge: "bg-primary/10 text-primary border border-primary/20",
      badgeText: "Success",
      icon: (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    error: {
      container: "bg-destructive/5 border-destructive/20 text-destructive",
      badge: "bg-destructive/10 text-destructive border border-destructive/20",
      badgeText: "Failed",
      icon: (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    warning: {
      container: "bg-amber-500/5 border-amber-500/20 text-amber-500",
      badge: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
      badgeText: "Warning",
      icon: (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    untested: {
      container: "bg-muted/30 border-border text-muted-foreground",
      badge: "bg-muted/50 text-muted-foreground border border-border/50",
      badgeText: "Untested",
      icon: (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  };

  const currentStyle = styles[status];

  // Helper to format details nicely
  const renderDetails = () => {
    if (!details) return null;
    let text = "";
    if (typeof details === "string") {
      text = details;
    } else {
      try {
        text = JSON.stringify(details, null, 2);
      } catch (e) {
        text = String(details);
      }
    }

    return (
      <div className="mt-4 pt-4 border-t border-current/10 w-full space-y-2">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">
          Details / Logs
        </p>
        <div className="rounded-md bg-foreground text-background p-4 font-mono text-xs leading-relaxed overflow-x-auto max-h-60 border border-border/50">
          <code>{text}</code>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className={`w-full flex flex-col justify-start items-start p-4 rounded-md border transition-all duration-200 ${currentStyle.container}`}>
        <div className="flex flex-row justify-between items-center w-full gap-4">
          <div className="flex flex-row justify-start items-center gap-3">
            {currentStyle.icon}
            <span className="text-sm font-medium tracking-tight">
              {title}
            </span>
          </div>
          <span className={`text-[10px] font-mono font-medium uppercase px-2 py-0.5 rounded-full ${currentStyle.badge}`}>
            {currentStyle.badgeText}
          </span>
        </div>
        {renderDetails()}
      </div>
    </div>
  );
};
