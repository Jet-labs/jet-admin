import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Compass, Home, RefreshCw } from "lucide-react";
import { Button } from "@jet-admin/ui";
import { CONSTANTS } from "../../../constants";

/**
 * Styled, user-facing 404. Never expose React Router's developer
 * ErrorBoundary or raw stack information in the product UI.
 */
const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-full w-full items-center justify-center bg-background px-6 py-10">
      <div className="w-full max-w-md rounded border border-border bg-card p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded border border-border bg-muted/40">
          <Compass className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Error 404
        </p>
        <h1 className="mt-2 text-2xl font-medium tracking-tight text-foreground">
          Page not found
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          The page you are looking for does not exist or may have been moved.
          Check the address, or return to your workspace.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Button asChild>
            <Link to={CONSTANTS.ROUTES.HOME.path()}>
              <Home className="h-4 w-4" />
              Go to dashboard
            </Link>
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Go back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

/**
 * Root route error boundary. Keeps unexpected render/loader failures inside
 * the design system and offers a recovery path instead of a stack trace.
 */
const RouteErrorPage = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-background px-6">
    <div className="w-full max-w-md rounded border border-border bg-card p-6 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded border border-destructive/30 bg-destructive/10">
        <RefreshCw className="h-6 w-6 text-destructive" aria-hidden="true" />
      </div>
      <h1 className="text-2xl font-medium tracking-tight text-foreground">
        Something went wrong
      </h1>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        This page could not be loaded. Reload to try again, or return to the
        dashboard.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Button type="button" onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4" />
          Reload page
        </Button>
        <Button asChild variant="outline">
          <Link to={CONSTANTS.ROUTES.HOME.path()}>
            <Home className="h-4 w-4" />
            Go to dashboard
          </Link>
        </Button>
      </div>
    </div>
  </div>
);

export { RouteErrorPage };
