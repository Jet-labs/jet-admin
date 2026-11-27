import React, { useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "zustand";
import {
  Badge,
  Button,
  Callout,
  PageHeader,
  Spinner,
} from "@jet-admin/ui";
import { Info } from "lucide-react";
import {
  getApplicationRuntimeManifestAPI,
  getApplicationRuntimePageManifestAPI,
  runApplicationRuntimeQueryAPI,
  getApplicationWorkflowRunAPI,
  cancelApplicationWorkflowRunAPI,
  submitApplicationWorkflowInputAPI,
  getApplicationListenerEventsAPI,
} from "../../data/apis/application";
import { createApplicationStore } from "../../logic/applicationRuntime/applicationStore";
import { createRuntimeServices } from "../../logic/applicationRuntime/runtimeServices";
import { useAuthState } from "../../logic/hooks/useAuth";
import { ApplicationRouteSession } from "../components/applicationComponents/applicationRouteSession";
import { ApplicationFeedback } from "../components/applicationComponents/applicationFeedback";
import { CONSTANTS } from "../../constants";

function RuntimeSession({ manifest, tenantID, applicationID, environment, basePath, principal = null }) {
  const store = useMemo(
    () =>
      createApplicationStore(manifest.definition.state.application, {
        tenantID,
        applicationID,
        releaseID: manifest.runtime.releaseID,
        persistence: manifest.definition.state.persistence,
        scope: principal,
      }),
    [
      manifest.runtime.releaseID,
      manifest.definition.state,
      tenantID,
      applicationID,
      principal,
    ]
  );
  const variables = useStore(store, (state) => state.variables);
  const setApplicationVariable = useCallback(
    (key, value) => store.getState().setVariable(key, value),
    [store]
  );
  const resetApplicationState = useCallback(
    () => store.getState().reset(),
    [store]
  );
  const workflowRuns = useMemo(() => new Map(), [manifest.runtime.releaseID]);
  const makeServices = useCallback(
    ({ pageAssetKey, route, pageManifest = null }) =>
      createRuntimeServices({
        manifest: {
          ...manifest,
          pages: pageManifest?.page
            ? { [pageAssetKey]: pageManifest.page }
            : {},
          widgets: pageManifest?.widgets || {},
        },
        pageAssetKey,
        routeID: route?.id || null,
        workflowRuns,
        executeQuery: ({ alias, inputValues, routeID, signal }) =>
          runApplicationRuntimeQueryAPI({
            tenantID,
            applicationID,
            environment,
            pageAssetKey,
            alias,
            data: { inputValues, routeID, releaseID: manifest.runtime.releaseID },
            signal,
          }),
        getWorkflowStatus: ({ alias, instanceID, routeID }) => getApplicationWorkflowRunAPI({ tenantID, applicationID, environment, pageAssetKey, alias, instanceID, routeID }),
        cancelWorkflow: ({ alias, instanceID, routeID }) => cancelApplicationWorkflowRunAPI({ tenantID, applicationID, environment, pageAssetKey, alias, instanceID, routeID }),
        submitWorkflowInput: ({ alias, instanceID, collectionRequestID, submittedData, routeID }) => submitApplicationWorkflowInputAPI({ tenantID, applicationID, environment, pageAssetKey, alias, instanceID, collectionRequestID, submittedData, routeID }),
        readListenerEvents: ({ alias, cursor, routeID, signal }) => getApplicationListenerEventsAPI({ tenantID, applicationID, environment, pageAssetKey, alias, params: { cursor, routeID, releaseID: manifest.runtime.releaseID }, signal }),
      }),
    [manifest, tenantID, applicationID, environment, workflowRuns]
  );
  const resolvePage = useCallback(
    ({ pageAssetKey, routeID }) =>
      getApplicationRuntimePageManifestAPI({
        tenantID,
        applicationID,
        environment,
        pageAssetKey,
        routeID,
      }),
    [tenantID, applicationID, environment]
  );

  return (
    <ApplicationRouteSession
      definition={manifest.definition}
      pages={manifest.pages}
      tenantID={tenantID}
      basePath={basePath}
      appTitle={manifest.applicationTitle || ""}
      applicationVariables={variables}
      setApplicationVariable={setApplicationVariable}
      resetApplicationState={resetApplicationState}
      banner={
        <Callout icon={Info}>
          Production runtime · release {manifest.runtime.releaseNumber} ·{" "}
          <span className="font-mono">{manifest.runtime.contentHash.slice(0, 12)}</span>.{" "}
          Captured query and workflow versions execute as configured. Buffered listeners are observed without starting new integrations.
        </Callout>
      }
      makeServices={makeServices}
      resolvePage={resolvePage}
      scopePrefix={`runtime:${manifest.runtime.releaseID}`}
      notFoundMessage="This view has no reachable page in the deployed release."
    />
  );
}

RuntimeSession.propTypes = {
  manifest: PropTypes.object.isRequired,
  tenantID: PropTypes.string.isRequired,
  applicationID: PropTypes.string.isRequired,
  environment: PropTypes.string.isRequired,
  basePath: PropTypes.string.isRequired,
  principal: PropTypes.string,
};

export default function ApplicationRuntimePage() {
  const { tenantID, applicationID, environment = "production" } = useParams();
  const { firebaseUserState } = useAuthState();
  const principal = firebaseUserState?.user?.uid;
  const basePath = CONSTANTS.ROUTES.APPLICATION_RUNTIME.path(
    tenantID,
    applicationID,
    environment
  );
  const manifestQuery = useQuery({
    queryKey: [
      "application-runtime",
      principal,
      tenantID,
      applicationID,
      environment,
    ],
    queryFn: ({ signal }) =>
      getApplicationRuntimeManifestAPI({
        tenantID,
        applicationID,
        environment,
        signal,
      }),
    enabled: !!principal,
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  const manifest = manifestQuery.data?.manifest;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <PageHeader
        title={manifest?.applicationTitle || "Application runtime"}
        id={applicationID}
        subTitle={
          manifest
            ? `Production · release ${manifest.runtime.releaseNumber}`
            : "Resolving deployed release"
        }
      >
        <Badge variant="secondary">
          Versioned runtime
        </Badge>
        <Button variant="outline" size="sm" asChild>
          <Link
            to={CONSTANTS.ROUTES.APPLICATION_STUDIO.path(
              tenantID,
              applicationID
            )}
          >
            Back to editor
          </Link>
        </Button>
      </PageHeader>

      {manifestQuery.isPending && (
        <div className="flex flex-1 items-center justify-center">
          <Spinner size={16} className="text-primary" />
        </div>
      )}
      {manifestQuery.error && (
        <div className="p-2">
          <ApplicationFeedback
            error={manifestQuery.error}
            onRetry={() => manifestQuery.refetch()}
          />
        </div>
      )}
      {manifest && (
        <RuntimeSession
          key={`${principal}:${tenantID}:${applicationID}:${manifest.runtime.releaseID}`}
          manifest={manifest}
          tenantID={tenantID}
          applicationID={applicationID}
          environment={environment}
          basePath={basePath}
          principal={principal}
        />
      )}
    </div>
  );
}
