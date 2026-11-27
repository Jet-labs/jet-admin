import React, { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Navigate, matchRoutes, useLocation, useNavigate } from "react-router-dom";
import { EmptyState, Spinner } from "@jet-admin/ui";
import { FileQuestion } from "lucide-react";
import {
  matchesRouteQueryType,
  parseApplicationRouteQuery,
  validateApplicationRouteParams,
} from "@jet-admin/application-contracts";
import { AppPageView } from "../appPageComponents/viewer/AppPageView";
import { shouldRedirectToHome } from "../../../logic/applicationRuntime/routeOrdering";
import { buildApplicationRouteTarget } from "../../../logic/applicationRuntime/applicationNavigation";
import { applicationRouteGuardRedirect } from "../../../logic/applicationRuntime/applicationGuards";
import {
  ApplicationEventBusContext,
  createApplicationEventBus,
} from "../../../logic/applicationRuntime/applicationEventBus";
import { ApplicationShellFrame } from "./applicationShell";
import { applyVariablesToSearchParams } from "../../../logic/appPageRuntime/appPageUrlSync";
import { createPageStateCache } from "../../../logic/appPageRuntime/appPageStateCache";

/**
 * Shared application shell + route surface used by composition preview and
 * the deployed runtime. Hosts provide their own services and banner; route
 * matching, root handling, navigation and page rendering stay identical.
 */
export function ApplicationRouteSession({
  definition,
  pages,
  tenantID,
  basePath,
  applicationVariables,
  setApplicationVariable,
  resetApplicationState,
  banner,
  makeServices,
  scopePrefix,
  resolvePage = null,
  notFoundMessage = "This view has no reachable page.",
  appTitle = "",
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [resolvedPages, setResolvedPages] = useState({});
  const [pageLoading, setPageLoading] = useState(false);
  const [pageLoadError, setPageLoadError] = useState(null);
  const relativePath = location.pathname.slice(basePath.length) || "/";
  const routes = definition.routes;
  const pageStateCache = useMemo(() => createPageStateCache(), [definition]);
  const applicationEventBus = useMemo(
    () => createApplicationEventBus(),
    [scopePrefix]
  );
  useEffect(() => () => applicationEventBus.dispose(), [applicationEventBus]);
  const navigateToRoute = useCallback(
    ({ routeID, params, query, replace = false }) => {
      const target = buildApplicationRouteTarget({
        routes,
        routeID,
        params,
        query,
        basePath,
      });
      navigate(target.path, { replace: replace === true });
      return target;
    },
    [routes, basePath, navigate]
  );
  const matchableRoutes = useMemo(
    () => routes.map((route) => ({ ...route, caseSensitive: false })),
    [routes]
  );
  const match = matchRoutes(matchableRoutes, relativePath)?.[0];
  const route = match?.route;
  const notFoundRoute =
    !route && definition.shell.notFoundRouteID
      ? routes.find(
          (candidate) => candidate.id === definition.shell.notFoundRouteID
        ) || null
      : null;
  const effectiveRoute = route || notFoundRoute;
  const params = match?.params || {};
  const paramsKey = JSON.stringify(params);
  const invalidParam = route && !validateApplicationRouteParams(route, params);
  const queryResult = useMemo(() => {
    if (!route) return { valid: true, query: {} };
    return parseApplicationRouteQuery(
      route,
      new URLSearchParams(location.search)
    );
  }, [route, location.search]);
  const query = queryResult.query || {};
  const queryKey = JSON.stringify(query);
  const invalidQuery = route && !queryResult.valid;
  const syncPageVariableKeys = useMemo(
    () =>
      effectiveRoute?.syncPageVariables
        ? Object.keys(effectiveRoute.query || {})
        : [],
    [effectiveRoute]
  );
  const initialPageVariables = useMemo(() => {
    if (!effectiveRoute?.syncPageVariables) return null;
    const values = {};
    for (const key of syncPageVariableKeys) {
      if (Object.prototype.hasOwnProperty.call(query, key)) {
        values[key] = query[key];
      }
    }
    return values;
  }, [effectiveRoute, queryKey, syncPageVariableKeys]);
  const writePageVariablesToRouteQuery = useCallback(
    (definitions, values, keys) => {
      if (!Array.isArray(keys) || keys.length === 0) return;
      const params = new URLSearchParams(location.search);
      if (
        !applyVariablesToSearchParams(params, definitions, values, { keys })
      ) {
        return;
      }
      const search = params.toString();
      navigate(
        `${location.pathname}${search ? `?${search}` : ""}${location.hash}`,
        { replace: true }
      );
    },
    [location.pathname, location.search, location.hash, navigate]
  );
  const isSyncPageVariableValueAllowed = useCallback(
    (key, value) => {
      const declaration = effectiveRoute?.query?.[key];
      if (!declaration) return false;
      return matchesRouteQueryType(value, declaration.type || "string");
    },
    [effectiveRoute]
  );
  const expressionContext = useMemo(
    () => ({
      application: { variables: applicationVariables },
      route: { id: effectiveRoute?.id, params, query },
    }),
    [applicationVariables, effectiveRoute?.id, paramsKey, queryKey]
  );
  const applicationPageKey = effectiveRoute?.pageAssetKey || null;
  const resolvedPageManifest = applicationPageKey
    ? resolvedPages[applicationPageKey] || null
    : null;
  const page = applicationPageKey
    ? resolvedPageManifest?.page || pages[applicationPageKey] || null
    : null;

  useEffect(() => {
    if (!applicationPageKey || !resolvePage || resolvedPages[applicationPageKey]) {
      setPageLoading(false);
      setPageLoadError(null);
      return undefined;
    }
    let cancelled = false;
    setPageLoading(true);
    setPageLoadError(null);
    Promise.resolve()
      .then(() =>
        resolvePage({
          pageAssetKey: applicationPageKey,
          routeID: effectiveRoute?.id || null,
        })
      )
      .then((manifest) => {
        if (cancelled) return;
        setResolvedPages((previous) => ({
          ...previous,
          [applicationPageKey]: manifest,
        }));
      })
      .catch((error) => {
        if (cancelled) return;
        setPageLoadError(error);
      })
      .finally(() => {
        if (!cancelled) setPageLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [applicationPageKey, effectiveRoute?.id, resolvePage, resolvedPages]);

  const guardRedirect = route
    ? applicationRouteGuardRedirect(route, routes, expressionContext)
    : null;
  const cacheKey = effectiveRoute
    ? `${scopePrefix}:${effectiveRoute.id}:${paramsKey}:${effectiveRoute.pageAssetKey}`
    : null;
  useEffect(() => {
    if (!effectiveRoute) return undefined;
    const previousTitle = document.title;
    document.title = `${effectiveRoute.title || page?.appPageTitle || effectiveRoute.id} · Application`;
    return () => {
      document.title = previousTitle;
    };
  }, [effectiveRoute?.id, effectiveRoute?.title, page?.appPageTitle]);
  const services = useMemo(
    () =>
      effectiveRoute && page && !invalidParam && !invalidQuery
        ? makeServices({
            route: effectiveRoute,
            pageAssetKey: effectiveRoute.pageAssetKey,
            pageManifest: resolvedPageManifest,
          })
        : null,
    [
      makeServices,
      effectiveRoute?.id,
      effectiveRoute?.pageAssetKey,
      paramsKey,
      invalidParam,
      invalidQuery,
      page,
      resolvedPageManifest,
    ]
  );
  const home = routes.find(
    (item) => item.id === definition.shell.homeRouteID
  );
  if (
    !route &&
    shouldRedirectToHome(routes, relativePath, definition.shell.homeRouteID)
  ) {
    return <Navigate replace to={`${basePath}${home.path}`} />;
  }
  if (guardRedirect) {
    return <Navigate replace to={`${basePath}${guardRedirect.path}`} />;
  }
  return (
    <ApplicationEventBusContext.Provider value={applicationEventBus}>
    <div className="flex min-h-0 flex-1 flex-col gap-2 p-2">
      {banner}
      <div className="flex min-h-0 flex-1 overflow-hidden rounded border border-border bg-card">
        <ApplicationShellFrame
          definition={definition}
          routes={routes}
          activeRouteID={effectiveRoute?.id}
          basePath={basePath}
          appTitle={appTitle}
        >
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            {pageLoading && !page ? (
              <div className="flex flex-1 items-center justify-center p-4">
                <Spinner size={16} className="text-primary" />
              </div>
            ) : pageLoadError && !page ? (
              <div className="p-2 text-sm text-destructive">
                {pageLoadError.message || "The page manifest could not be loaded."}
              </div>
            ) : page && !invalidParam && !invalidQuery && services ? (
              <AppPageView
                tenantID={tenantID}
                pageID={page.appPageID}
                pageConfig={page.appPageConfig}
                runtimeServices={services}
                expressionContext={expressionContext}
                setApplicationVariable={setApplicationVariable}
                resetApplicationState={resetApplicationState}
                emitApplicationEvent={applicationEventBus.emit}
                navigateToRoute={navigateToRoute}
                initialPageVariables={initialPageVariables}
                syncPageVariableKeys={syncPageVariableKeys}
                onWriteVariablesToUrl={writePageVariablesToRouteQuery}
                isSyncPageVariableValueAllowed={isSyncPageVariableValueAllowed}
                syncVariablesToUrl={effectiveRoute.syncAllPageVariables === true}
                retainState={effectiveRoute.keepAlive === true}
                stateCache={pageStateCache}
                cacheKey={cacheKey}
                scopeID={`${scopePrefix}:${JSON.stringify([effectiveRoute.id, params])}`}
              />
            ) : (
              <div className="p-2">
                <EmptyState
                  icon={FileQuestion}
                  message={
                    invalidParam
                      ? "The URL contains an invalid record identifier."
                      : invalidQuery
                        ? queryResult.message || "The URL contains invalid query parameters."
                        : notFoundMessage
                  }
                />
              </div>
            )}
          </div>
        </ApplicationShellFrame>
      </div>
    </div>
    </ApplicationEventBusContext.Provider>
  );
}

ApplicationRouteSession.propTypes = {
  definition: PropTypes.object.isRequired,
  pages: PropTypes.object.isRequired,
  tenantID: PropTypes.string.isRequired,
  basePath: PropTypes.string.isRequired,
  applicationVariables: PropTypes.object,
  setApplicationVariable: PropTypes.func,
  resetApplicationState: PropTypes.func,
  banner: PropTypes.node,
  makeServices: PropTypes.func.isRequired,
  scopePrefix: PropTypes.string.isRequired,
  resolvePage: PropTypes.func,
  notFoundMessage: PropTypes.string,
  appTitle: PropTypes.string,
};
