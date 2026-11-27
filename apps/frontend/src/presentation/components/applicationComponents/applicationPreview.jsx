import React, { useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { Link, useParams } from "react-router-dom";
import { useStore } from "zustand";
import { useQuery } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Callout,
  PageHeader,
  Spinner,
} from "@jet-admin/ui";
import { Info } from "lucide-react";
import { previewApplicationAPI } from "../../../data/apis/application";
import { createApplicationStore } from "../../../logic/applicationRuntime/applicationStore";
import { createCompositionServices } from "../../../logic/applicationRuntime/compositionRuntime";
import { useAuthState } from "../../../logic/hooks/useAuth";
import { ApplicationRouteSession } from "./applicationRouteSession";
import { ApplicationFeedback } from "./applicationFeedback";
import { CONSTANTS } from "../../../constants";

function PreviewSession({ preview, basePath }) {
  const store = useMemo(
    () =>
      createApplicationStore(preview.definition.state.application, {
        persistence: { mode: "none", resetOnRelease: true },
      }),
    [preview.previewID]
  );
  const variables = useStore(store, (state) => state.variables);
  const setApplicationVariable = useCallback(
    (key, value) => store.getState().setVariable(key, value),
    [store]
  );
  const resetApplicationState = useCallback(() => store.getState().reset(), [store]);
  const makeServices = useCallback(
    () => createCompositionServices(preview),
    [preview]
  );
  return (
    <ApplicationRouteSession
      definition={preview.definition}
      pages={preview.pages}
      tenantID={preview.tenantID}
      basePath={basePath}
      appTitle={preview.applicationTitle || ""}
      applicationVariables={variables}
      setApplicationVariable={setApplicationVariable}
      resetApplicationState={resetApplicationState}
      banner={
        <Callout icon={Info}>
          Composition preview · revision {preview.revision}. Data execution and actions are
          disabled. Only path bindings are evaluated.
        </Callout>
      }
      makeServices={makeServices}
      scopePrefix={`preview:${preview.previewID}`}
      notFoundMessage="This view has no reachable page. Return to the editor and check its route."
    />
  );
}

PreviewSession.propTypes = {
  preview: PropTypes.object.isRequired,
  basePath: PropTypes.string.isRequired,
};

export default function ApplicationPreview() {
  const { tenantID, applicationID } = useParams();
  const { firebaseUserState } = useAuthState();
  const principal = firebaseUserState?.user?.uid;
  const basePath = CONSTANTS.ROUTES.APPLICATION_PREVIEW.path(
    tenantID,
    applicationID
  );
  const preview = useQuery({
    queryKey: ["application-preview", principal, tenantID, applicationID],
    queryFn: ({ signal }) =>
      previewApplicationAPI({ tenantID, applicationID, signal }),
    enabled: !!principal,
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    gcTime: 0,
  });

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <PageHeader
        title={preview.data?.preview.applicationTitle || "Application preview"}
        id={applicationID}
        subTitle={
          preview.data?.preview
            ? `Composition preview · draft revision ${preview.data.preview.revision}`
            : "Preparing composition preview"
        }
      >
        <Badge variant="secondary">Composition only</Badge>
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

      {preview.isPending && (
        <div className="flex flex-1 items-center justify-center">
          <Spinner size={16} className="text-primary" />
        </div>
      )}
      {preview.error && (
        <div className="p-2">
          <ApplicationFeedback
            error={preview.error}
            onRetry={() => preview.refetch()}
          />
        </div>
      )}
      {preview.data && (
        <PreviewSession
          key={`${principal}:${tenantID}:${applicationID}:${preview.data.preview.previewID}`}
          preview={preview.data.preview}
          basePath={basePath}
        />
      )}
    </div>
  );
}
