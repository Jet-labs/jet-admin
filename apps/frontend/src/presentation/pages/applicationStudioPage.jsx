import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Callout,
  CodeEditor,
  Input,
  Label,
  SearchSelect,
  Section,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
} from "@jet-admin/ui";
import {
  Archive,
  ExternalLink,
  FileText,
  GripVertical,
  Info,
  Link2,
  Play,
  Plus,
  Route,
  Rocket,
  Trash2,
} from "lucide-react";
import { validateApplicationDefinition } from "@jet-admin/application-contracts";
import {
  archiveApplicationAPI,
  deployApplicationReleaseAPI,
  getApplicationAPI,
  getApplicationEnvironmentAPI,
  linkApplicationPageAPI,
  listApplicationReleasesAPI,
  selectApplicationPageVersionAPI,
  publishApplicationReleaseAPI,
  saveApplicationDraftAPI,
  unlinkApplicationAssetAPI,
} from "../../data/apis/application";
import { getAllAppPagesAPI } from "../../data/apis/appPage";
import { useAuthState } from "../../logic/hooks/useAuth";
import { useEntityItems } from "../../logic/hooks/useEntityItems";
import { useGlobalUI } from "../../logic/stores/useUIStore";
import { useUnsavedChangesGuard } from "../../logic/hooks/useUnsavedChangesGuard";
import {
  moveApplicationRoute,
  moveApplicationRouteByOffset,
} from "../../logic/applicationRuntime/routeOrdering";
import { displayError, displaySuccess } from "../../utils/notification";
import { ApplicationFeedback } from "../components/applicationComponents/applicationFeedback";
import { EditorTopBar } from "../components/editorShell/editorTopBar";
import { useEditorFocusMode } from "../components/editorShell/useEditorFocusMode";
import { ApplicationPageVersionStatus } from "../components/applicationComponents/applicationPageVersionStatus";
import { ApplicationRouteQueryDialog } from "../components/applicationComponents/applicationRouteQueryDialog";
import { ApplicationRouteSettingsDialog } from "../components/applicationComponents/applicationRouteSettingsDialog";
import { ApplicationShellSettings } from "../components/applicationComponents/applicationShellSettings";
import { ApplicationLayoutPreview } from "../components/applicationComponents/applicationLayoutPreview";
import { ApplicationEnvironmentBindingsDialog } from "../components/applicationComponents/applicationEnvironmentBindingsDialog";
import { ApplicationConsumerPolicyDialog } from "../components/applicationComponents/applicationConsumerPolicyDialog";
import { ApplicationRunHistoryDialog } from "../components/applicationComponents/applicationRunHistoryDialog";
import { ApplicationStateEditor } from "../components/applicationComponents/applicationStateEditor";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../components/ui/resizable";
import { CONSTANTS } from "../../constants";

function ApplicationStudioSession() {
  const { tenantID, applicationID } = useParams();
  const { firebaseUserState } = useAuthState();
  const { showConfirmation } = useGlobalUI();
  const navigate = useNavigate();
  const principal = firebaseUserState?.user?.uid;
  const client = useQueryClient();
  const [focusMode, setFocusMode] = useEditorFocusMode();
  const key = ["application", principal, tenantID, applicationID];
  const query = useQuery({
    queryKey: key,
    queryFn: ({ signal }) => getApplicationAPI({ tenantID, applicationID, signal }),
    enabled: !!principal,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const pageQuery = useQuery({
    queryKey: ["application-page-options", principal, tenantID],
    queryFn: () => getAllAppPagesAPI({ tenantID, page: 1, pageSize: 1000 }),
    enabled: !!principal,
    retry: false,
  });
  const environmentQuery = useQuery({
    queryKey: ["application-environment", principal, tenantID, applicationID, "production"],
    queryFn: () =>
      getApplicationEnvironmentAPI({
        tenantID,
        applicationID,
        environment: "production",
      }),
    enabled: !!principal,
    retry: false,
  });
  const releasesQuery = useQuery({
    queryKey: ["application-releases", principal, tenantID, applicationID],
    queryFn: () =>
      listApplicationReleasesAPI({ tenantID, applicationID }),
    enabled: !!principal,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const app = query.data?.application;
  const [text, setText] = useState("");
  const [dirty, setDirty] = useState(false);
  const dirtyRef = useRef(false);
  dirtyRef.current = dirty;
  const [editRevision, setEditRevision] = useState(null);
  const [assetKey, setAssetKey] = useState("");
  const [pageID, setPageID] = useState("");
  const [routeID, setRouteID] = useState("");
  const [routePath, setRoutePath] = useState("");
  const [routePage, setRoutePage] = useState("");
  const [managementMode, setManagementMode] = useState("referenced");
  const [draggingRouteID, setDraggingRouteID] = useState(null);
  const [routeDropTarget, setRouteDropTarget] = useState(null);
  const [previewRouteID, setPreviewRouteID] = useState(null);
  const { items: widgets = [] } = useEntityItems({
    tenantID,
    entityType: "widget",
  });

  useUnsavedChangesGuard({ isDirty: dirty });

  useEffect(() => {
    if (app && !dirtyRef.current) {
      setText(JSON.stringify(app.draft.definition, null, 2));
      setEditRevision(app.draft.revision);
    }
  }, [app]);

  let definition, validation;
  try {
    definition = JSON.parse(text);
    validation = validateApplicationDefinition(definition, app?.assets || []);
  } catch {
    validation = {
      valid: false,
      diagnostics: [
        {
          code: "INVALID_JSON",
          path: "definition",
          message: "Enter valid JSON.",
        },
      ],
    };
  }

  const refresh = async (result) => {
    if (result.application) client.setQueryData(key, result);
    else await query.refetch();
    client.invalidateQueries({ queryKey: ["applications", principal, tenantID] });
    client.removeQueries({
      queryKey: ["application-preview", principal, tenantID, applicationID],
      type: "inactive",
    });
  };

  const save = useMutation({
    mutationFn: () =>
      saveApplicationDraftAPI({
        tenantID,
        applicationID,
        data: { expectedRevision: editRevision, definition },
      }),
    onSuccess: async (result) => {
      dirtyRef.current = false;
      setDirty(false);
      setEditRevision(result.draft.revision);
      setText(JSON.stringify(result.draft.definition, null, 2));
      displaySuccess("Draft saved.");
      await refresh(result);
    },
  });
  const link = useMutation({
    mutationFn: () =>
      linkApplicationPageAPI({
        tenantID,
        applicationID,
        data: {
          expectedRevision: app.draft.revision,
          appPageID: pageID,
          assetKey: assetKey.trim(),
          managementMode,
        },
      }),
    onSuccess: async (result) => {
      setAssetKey("");
      setPageID("");
      displaySuccess("Page linked.");
      await refresh(result);
    },
  });
  const unlink = useMutation({
    mutationFn: (linkedAssetKey) =>
      unlinkApplicationAssetAPI({
        tenantID,
        applicationID,
        assetKey: linkedAssetKey,
        data: { expectedRevision: app.draft.revision },
      }),
    onSuccess: async (result) => {
      displaySuccess("Page unlinked.");
      await refresh(result);
    },
  });
  const selectPageVersion = useMutation({
    mutationFn: ({ assetKey, pageVersionID }) =>
      selectApplicationPageVersionAPI({
        tenantID,
        applicationID,
        assetKey,
        data: { expectedRevision: app.draft.revision, pageVersionID },
      }),
    onSuccess: async (result) => {
      displaySuccess("Page version selection updated.");
      await refresh(result);
    },
  });
  const publishAndDeploy = useMutation({
    mutationFn: async () => {
      const published = await publishApplicationReleaseAPI({
        tenantID,
        applicationID,
        data: { expectedRevision: app.draft.revision },
      });
      const deployed = await deployApplicationReleaseAPI({
        tenantID,
        applicationID,
        environment: "production",
        data: { releaseID: published.release.releaseID },
      });
      return { release: published.release, deployment: deployed };
    },
    onSuccess: async ({ release }) => {
      displaySuccess(`Release ${release.releaseNumber} compiled and deployed.`);
      await Promise.all([environmentQuery.refetch(), releasesQuery.refetch()]);
      await client.invalidateQueries({
        queryKey: ["asset-versions", tenantID],
      });
    },
  });
  const deployRelease = useMutation({
    mutationFn: (releaseID) =>
      deployApplicationReleaseAPI({
        tenantID,
        applicationID,
        environment: "production",
        data: { releaseID },
      }),
    onSuccess: async (result) => {
      displaySuccess(
        `Release ${result.release.releaseNumber} deployed to production.`
      );
      await Promise.all([environmentQuery.refetch(), releasesQuery.refetch()]);
    },
    onError: displayError,
  });
  const archive = useMutation({
    mutationFn: () =>
      archiveApplicationAPI({
        tenantID,
        applicationID,
        data: { expectedRevision: app.draft.revision },
      }),
    onSuccess: async (result) => {
      displaySuccess("Application archived. Linked pages were preserved.");
      await refresh(result);
    },
  });

  const busy =
    save.isPending ||
    link.isPending ||
    unlink.isPending ||
    selectPageVersion.isPending ||
    archive.isPending ||
    publishAndDeploy.isPending ||
    deployRelease.isPending;
  const archived = app?.status === "ARCHIVED";
  const edit = (value) => {
    setText(value);
    setDirty(true);
  };
  const pages = Array.isArray(pageQuery.data)
    ? pageQuery.data
    : pageQuery.data?.appPages || [];
  const unlinkedPages = pages.filter(
    (page) => !app?.assets?.some((asset) => asset.appPageID === page.appPageID)
  );
  const pagesByAsset = useMemo(() => {
    const byID = new Map(
      pages.map((page) => [String(page.appPageID), page])
    );
    const map = {};
    for (const asset of app?.assets || []) {
      const page = byID.get(String(asset.appPageID));
      if (page) map[asset.assetKey] = page;
    }
    return map;
  }, [app?.assets, pages]);
  const widgetByID = useMemo(
    () =>
      Object.fromEntries(
        widgets.map((widget) => [String(widget.widgetID), widget])
      ),
    [widgets]
  );
  const previewRoutes = useMemo(
    () =>
      Array.isArray(definition?.routes)
        ? definition.routes.filter((route) => !route.path.includes(":"))
        : [],
    [definition?.routes]
  );
  const effectivePreviewRoute =
    previewRoutes.find((route) => route.id === previewRouteID) ||
    previewRoutes.find((route) => route.id === definition?.shell?.homeRouteID) ||
    previewRoutes[0] ||
    null;

  const addRoute = (event) => {
    event.preventDefault();
    if (!definition || !Array.isArray(definition.routes)) return;
    const next = structuredClone(definition);
    next.routes.push({
      id: routeID,
      path: routePath,
      pageAssetKey: routePage,
      params: {},
      query: {},
      syncPageVariables: false,
      syncAllPageVariables: false,
      keepAlive: false,
    });
    if (!routePath.includes(":")) {
      next.shell.navigation.push({
        routeID,
        label: routeID.replace(/[-_]/g, " "),
      });
      next.shell.homeRouteID ||= routeID;
    }
    edit(JSON.stringify(next, null, 2));
    setRouteID("");
    setRoutePath("");
    setRoutePage("");
  };

  const removeRoute = (route) => {
    if (!definition) return;
    const next = structuredClone(definition);
    next.routes = next.routes.filter((candidate) => candidate.id !== route.id);
    next.shell.navigation = next.shell.navigation.filter(
      (item) => item.routeID !== route.id
    );
    if (next.shell.homeRouteID === route.id) {
      next.shell.homeRouteID = next.routes.find((item) => !item.path.includes(":"))?.id || null;
    }
    edit(JSON.stringify(next, null, 2));
  };

  const reorderRoutes = (sourceID, targetID, position) => {
    const next = moveApplicationRoute(definition, sourceID, targetID, position);
    if (!next) return;
    edit(JSON.stringify(next, null, 2));
  };

  const handleRouteDragStart = (event, routeID) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/x-jet-route", routeID);
    setDraggingRouteID(routeID);
  };

  const handleRouteDragOver = (event, routeID) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    const bounds = event.currentTarget.getBoundingClientRect();
    const position =
      event.clientY - bounds.top > bounds.height / 2 ? "after" : "before";
    setRouteDropTarget((current) =>
      current?.id === routeID && current?.position === position
        ? current
        : { id: routeID, position }
    );
  };

  const handleRouteDrop = (event, routeID) => {
    event.preventDefault();
    const sourceID =
      event.dataTransfer.getData("application/x-jet-route") || draggingRouteID;
    const position =
      routeDropTarget?.id === routeID ? routeDropTarget.position : "before";
    if (sourceID) reorderRoutes(sourceID, routeID, position);
    setDraggingRouteID(null);
    setRouteDropTarget(null);
  };

  const handleRouteDragEnd = () => {
    setDraggingRouteID(null);
    setRouteDropTarget(null);
  };

  const moveRouteWithKeyboard = (route, offset) => {
    const next = moveApplicationRouteByOffset(definition, route.id, offset);
    if (!next) return;
    edit(JSON.stringify(next, null, 2));
  };

  const handleArchive = async () => {
    const confirmed = await showConfirmation({
      title: "Archive this application?",
      message:
        "The application will no longer launch. Linked pages and their contents are preserved.",
      confirmText: "Archive",
      cancelText: "Cancel",
      confirmVariant: "destructive",
    });
    if (confirmed) archive.mutate();
  };

  const handleDeployRelease = async (release) => {
    const currentRelease = environmentQuery.data?.environment?.currentRelease;
    if (currentRelease?.releaseID === release.releaseID) return;
    const isRollback =
      currentRelease && release.releaseNumber < currentRelease.releaseNumber;
    const confirmed = await showConfirmation({
      title: isRollback
        ? `Roll back to release ${release.releaseNumber}?`
        : `Deploy release ${release.releaseNumber}?`,
      message:
        "Production will switch to this immutable release. External side effects are not reversed.",
      confirmText: isRollback ? "Roll back" : "Deploy",
      cancelText: "Cancel",
      confirmVariant: isRollback ? "destructive" : "default",
    });
    if (confirmed) deployRelease.mutate(release.releaseID);
  };

  if (query.isPending) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <Spinner size={16} className="text-primary" />
      </div>
    );
  }
  if (query.error) {
    return (
      <div className="flex h-full w-full flex-col overflow-hidden bg-background">
        <EditorTopBar
          title="Application"
          subtitle="Unable to load this application"
          onBack={() => navigate(CONSTANTS.ROUTES.VIEW_APPLICATIONS.path(tenantID))}
          backLabel="Back to Applications"
          focusMode={focusMode}
          onToggleFocus={() => setFocusMode((value) => !value)}
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link to={CONSTANTS.ROUTES.VIEW_APPLICATIONS.path(tenantID)}>
                Back to applications
              </Link>
            </Button>
          }
        />
        <div className="p-2">
          <ApplicationFeedback error={query.error} onRetry={() => query.refetch()} />
        </div>
      </div>
    );
  }
  if (!app) return null;

  const canPreview =
    !archived && !dirty && !busy && app.draft.definition.routes.length > 0;
  const canPublish = canPreview && validation.valid;
  const deployedRelease = environmentQuery.data?.environment?.currentRelease;
  const releases = releasesQuery.data?.releases || [];

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <EditorTopBar
        title={app.title}
        subtitle={`Application Studio | Draft revision ${app.draft.revision}${dirty ? " | Unsaved changes" : ""}`}
        badge={
          <Badge
            variant={archived ? "secondary" : "outline"}
            className="h-4 px-1 text-[9px]"
            title="Draft changes do not affect deployed releases until you publish and deploy a new release."
          >
            {archived ? "Archived" : dirty ? "Unsaved" : "Draft"}
          </Badge>
        }
        onBack={() => navigate(CONSTANTS.ROUTES.VIEW_APPLICATIONS.path(tenantID))}
        backLabel="Back to Applications"
        focusMode={focusMode}
        onToggleFocus={() => setFocusMode((value) => !value)}
        actions={
          <>
            <div className="hidden items-center gap-0.5 sm:flex">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              disabled={!canPreview}
              onClick={() =>
                navigate(
                  CONSTANTS.ROUTES.APPLICATION_PREVIEW.path(tenantID, applicationID)
                )
              }
            >
              Preview
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-destructive hover:bg-destructive/10 border-destructive/20"
              disabled={archived || dirty || busy}
              onClick={handleArchive}
            >
              {archive.isPending ? <Spinner size={14} /> : <Archive className="h-3.5 w-3.5" />}
              Archive
            </Button>
            </div>
            <Button
              type="button"
              size="sm"
              className="ml-1 h-8"
              onClick={() => {
                if (dirty && validation.valid && !archived && !busy) save.mutate();
              }}
              disabled={archived || !dirty || !validation.valid || busy}
            >
              {save.isPending ? "Saving..." : "Save draft"}
            </Button>
          </>
        }
      />

      <div className="min-h-0 flex-1 overflow-hidden p-2">
        <ResizablePanelGroup
          direction="vertical"
          autoSaveId={
            CONSTANTS.RESIZABLE_PANEL_KEYS.APPLICATION_STUDIO_PREVIEW_JSON_SEPARATION
          }
          className="h-full"
        >
          <ResizablePanel
            id={CONSTANTS.RESIZABLE_PANEL_IDS.APPLICATION_STUDIO_PREVIEW_TOP_PANEL}
            defaultSize={82}
            minSize={38}
            className="min-h-0"
          >
            <ResizablePanelGroup
              direction="horizontal"
              autoSaveId={
                CONSTANTS.RESIZABLE_PANEL_KEYS
                  .APPLICATION_STUDIO_EDITOR_PREVIEW_SEPARATION
              }
              className="h-full"
            >
              <ResizablePanel
                id={CONSTANTS.RESIZABLE_PANEL_IDS.APPLICATION_STUDIO_EDITOR_PANEL}
                defaultSize={42}
                minSize={26}
                className="min-h-0 overflow-hidden"
              >
                <div className="h-full overflow-y-auto pr-1">
        <div className="space-y-2">
          <Callout icon={Info}>
            Composition preview does not execute data sources. Publishing captures
            changed page and dependency versions and deploys a thin release to production;
            queries and workflows execute as configured, and buffered listeners can be
            observed. Referenced pages stay shared; managed copies isolate page edits.
          </Callout>
          <ApplicationFeedback
            error={
              save.error ||
              link.error ||
              unlink.error ||
              selectPageVersion.error ||
              archive.error ||
              publishAndDeploy.error ||
              deployRelease.error ||
              environmentQuery.error ||
              releasesQuery.error
            }
          />
        </div>

        <div className="mt-2 space-y-2">
          <div className="min-w-0 space-y-2">
            <Section
              title="Linked pages"
              description="Reuse existing App Pages as routes in this application."
            >
              {app.assets.length === 0 ? (
                <p className="rounded border border-dashed border-border/70 bg-muted/30 p-2 text-xs text-muted-foreground">
                  No pages linked yet. Link a page below, then give it a route.
                </p>
              ) : (
                <div className="divide-y divide-border/60 overflow-hidden rounded border border-border/60">
                  {app.assets.map((asset) => {
                    const inUse = app.draft.definition.routes.some(
                      (route) => route.pageAssetKey === asset.assetKey
                    );
                    return (
                      <div
                        key={asset.assetKey}
                        className="flex items-center gap-2 bg-background px-2 py-1.5"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-muted/50">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-mono text-xs font-medium text-foreground">
                            {asset.assetKey}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {asset.managementMode === "managed"
                              ? "Managed copy · edits stay in this application"
                              : "Shared reference"}
                          </p>
                          <Link
                            to={`${CONSTANTS.ROUTES.UPDATE_APP_PAGE_BY_ID.path(
                              tenantID,
                              asset.appPageID
                            )}?applicationId=${encodeURIComponent(applicationID)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-primary/90 hover:text-primary"
                          >
                            Open {asset.managementMode === "managed" ? "managed page" : "shared page"}
                            <ExternalLink className="h-2.5 w-2.5" />
                          </Link>
                        </div>
                        <Button
                          type="button"
                          variant="destructive-ghost"
                          size="icon"
                          square
                          className="h-7 w-7 shrink-0"
                          disabled={archived || dirty || busy || inUse}
                          onClick={() => unlink.mutate(asset.assetKey)}
                          aria-label={`Unlink ${asset.assetKey}`}
                          title={
                            inUse
                              ? "Remove the route using this page first"
                              : `Unlink ${asset.assetKey}`
                          }
                        >
                          {unlink.isPending ? <Spinner size={13} /> : <Trash2 className="h-3 w-3" />}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              {!archived && (
                <form
                  className="space-y-2 border-t border-border/60 pt-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    link.mutate();
                  }}
                >
                  <div className="space-y-1">
                    <Label htmlFor="application-page">Page</Label>
                    <SearchSelect
                      value={pageID ? String(pageID) : ""}
                      onChange={(value) => setPageID(value)}
                      options={unlinkedPages.map((page) => ({
                        value: String(page.appPageID),
                        label: page.appPageTitle,
                      }))}
                      placeholder="Select an App Page"
                      size="sm"
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="application-page-mode">Ownership</Label>
                    <Select
                      value={managementMode}
                      onValueChange={setManagementMode}
                      disabled={dirty || link.isPending}
                    >
                      <SelectTrigger id="application-page-mode" className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="referenced">
                          Referenced shared page
                        </SelectItem>
                        <SelectItem value="managed">
                          Managed copy of this page
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-muted-foreground">
                      Managed copies isolate page edits for this application.
                      Widgets and connection bindings stay shared.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="application-asset-key" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Page key
                    </Label>
                    <Input
                      id="application-asset-key"
                      required
                      pattern="[a-zA-Z][a-zA-Z0-9_\-]{0,63}"
                      maxLength={64}
                      placeholder="orders-page"
                      className="font-mono text-xs"
                      value={assetKey}
                      onChange={(event) => setAssetKey(event.target.value)}
                      disabled={dirty || link.isPending}
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="secondary"
                    size="sm"
                    className="w-full justify-center"
                    disabled={dirty || busy || !pageID || !assetKey.trim()}
                  >
                    {link.isPending ? <Spinner size={14} /> : <Link2 className="h-3.5 w-3.5" />}
                    {managementMode === "managed" ? "Adopt managed copy" : "Link shared page"}
                  </Button>
                  {dirty && (
                    <p className="text-[11px] text-muted-foreground">
                      Save or discard draft edits before linking pages.
                    </p>
                  )}
                  {pageQuery.error && (
                    <p className="text-[11px] text-destructive">
                      Page listing is unavailable. Check your App Page permissions.
                    </p>
                  )}
                </form>
              )}
            </Section>

            <Section
              title="Version readiness"
              description="Publishing captures the latest immutable version of each linked page and dependency. This review shows exact page versions before you release."
            >
              {app.assets.length === 0 ? (
                <p className="rounded border border-dashed border-border/70 bg-muted/30 p-2 text-xs text-muted-foreground">
                  Link a page to review its version status.
                </p>
              ) : (
                <div className="divide-y divide-border/60 overflow-hidden rounded border border-border/60">
                  {app.assets.map((asset) => (
                    <ApplicationPageVersionStatus
                      key={`version_status_${asset.assetKey}`}
                      tenantID={tenantID}
                      asset={asset}
                      deployedRelease={deployedRelease}
                      pinDisabled={archived || dirty || busy}
                      onPin={(pageVersionID) =>
                        selectPageVersion.mutate({
                          assetKey: asset.assetKey,
                          pageVersionID,
                        })
                      }
                    />
                  ))}
                </div>
              )}
              <p className="text-[11px] text-muted-foreground">
                Routed pages upgrade when they change and you publish again.
                Existing releases keep their exact page version IDs.
              </p>
            </Section>

            <Section
              title="Routes"
              description="Connect page keys to stable URL paths. Drag routes to reorder the application navigation."
            >
              {definition?.routes?.length ? (
                <div className="divide-y divide-border/60 overflow-hidden rounded border border-border/60">
                  {definition.routes.map((route) => {
                    const isDragging = draggingRouteID === route.id;
                    const isDropTarget = routeDropTarget?.id === route.id;
                    return (
                      <div
                        key={route.id}
                        onDragOver={(event) => handleRouteDragOver(event, route.id)}
                        onDrop={(event) => handleRouteDrop(event, route.id)}
                        onDragEnd={handleRouteDragEnd}
                        className={`relative flex items-center gap-2 bg-background px-2 py-1.5 transition-colors ${
                          isDragging ? "opacity-45" : ""
                        } ${
                          isDropTarget
                            ? "bg-primary/5 ring-1 ring-inset ring-primary/50"
                            : ""
                        }`}
                      >
                        {isDropTarget && (
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none absolute inset-x-2 h-0.5 rounded-full bg-primary ${
                              routeDropTarget.position === "after"
                                ? "bottom-0"
                                : "top-0"
                            }`}
                          />
                        )}
                        {!archived && (
                          <span
                            draggable={!busy}
                            onDragStart={(event) =>
                              handleRouteDragStart(event, route.id)
                            }
                            onDragEnd={handleRouteDragEnd}
                            onKeyDown={(event) => {
                              if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                                event.preventDefault();
                                moveRouteWithKeyboard(
                                  route,
                                  event.key === "ArrowUp" ? -1 : 1
                                );
                              }
                            }}
                            tabIndex={0}
                            role="button"
                            aria-label={`Reorder ${route.id} route. Drag, or use the arrow keys.`}
                            title="Drag to reorder. Arrow keys also move this route."
                            className="flex h-7 w-5 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:cursor-grabbing disabled:cursor-not-allowed"
                          >
                            <GripVertical className="h-3.5 w-3.5" />
                          </span>
                        )}
                        <Route className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <div className="grid min-w-0 flex-1 sm:grid-cols-[160px_1fr] sm:items-center sm:gap-2">
                          <span className="truncate font-mono text-xs text-foreground">
                            {route.path}
                          </span>
                          <span className="truncate text-[11px] text-muted-foreground">
                            {route.id} → {route.pageAssetKey}
                          </span>
                        </div>
                        <Badge variant="outline" className="hidden shrink-0 sm:inline-flex">
                          {definition.shell.homeRouteID === route.id ? "Home" : "Route"}
                        </Badge>
                        <ApplicationRouteSettingsDialog
                          key={`route_settings_${route.id}`}
                          route={route}
                          routes={definition.routes}
                          disabled={archived || busy}
                          onSave={(settings) => {
                            const next = structuredClone(definition);
                            const target = next.routes.find(
                              (candidate) => candidate.id === route.id
                            );
                            target.title = settings.title;
                            target.parentRouteID = settings.parentRouteID;
                            target.keepAlive = settings.keepAlive;
                            target.syncAllPageVariables =
                              settings.syncAllPageVariables;
                            target.guard = settings.guard;
                            edit(JSON.stringify(next, null, 2));
                          }}
                        />
                        <ApplicationRouteQueryDialog
                          key={`route_query_${route.id}`}
                          route={route}
                          disabled={archived || busy}
                          onSave={(query, syncPageVariables) => {
                            const next = structuredClone(definition);
                            const target = next.routes.find(
                              (candidate) => candidate.id === route.id
                            );
                            target.query = query;
                            target.syncPageVariables = syncPageVariables;
                            edit(JSON.stringify(next, null, 2));
                          }}
                        />
                        {!archived && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            square
                            className="h-7 w-7 shrink-0"
                            disabled={busy}
                            onClick={() => removeRoute(route)}
                            aria-label={`Remove route ${route.id}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="rounded border border-dashed border-border/70 bg-muted/30 p-2 text-xs text-muted-foreground">
                  No routes yet. Add one below to make a linked page reachable.
                </p>
              )}

              {!archived && (
                <form
                  className="grid gap-2 border-t border-border/60 pt-2 sm:grid-cols-2"
                  onSubmit={addRoute}
                >
                  <div className="space-y-1">
                    <Label htmlFor="route-id">Route ID</Label>
                    <Input
                      id="route-id"
                      required
                      pattern="[a-zA-Z][a-zA-Z0-9_\-]{0,63}"
                      maxLength={64}
                      placeholder="orders"
                      className="font-mono text-xs"
                      value={routeID}
                      onChange={(event) => setRouteID(event.target.value)}
                      disabled={busy}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="route-path">Path</Label>
                    <Input
                      id="route-path"
                      required
                      maxLength={512}
                      placeholder="/orders/:orderID"
                      className="font-mono text-xs"
                      value={routePath}
                      onChange={(event) => setRoutePath(event.target.value)}
                      disabled={busy}
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="route-page">Linked page</Label>
                    <SearchSelect
                      value={routePage}
                      onChange={(value) => setRoutePage(value)}
                      options={app.assets.map((asset) => ({
                        value: asset.assetKey,
                        label: `${asset.assetKey} · shared page`,
                      }))}
                      placeholder="Select a linked page"
                      size="sm"
                      className="text-xs"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="secondary"
                    size="sm"
                    className="w-full justify-center sm:col-span-2"
                    disabled={busy || !routeID || !routePath || !routePage}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add route to draft
                  </Button>
                </form>
              )}
            </Section>

            <Section
              title="Navigation & shell"
              description="Choose a shell preset, then tune branding, item style, sticky/collapsible behavior and per-route icons, groups and badges."
            >
              <ApplicationShellSettings
                definition={definition}
                edit={edit}
                disabled={archived || busy}
              />
            </Section>

            <Section
              title="Application state"
              description="Release-scoped variables shared by every route. Pages read them as state.application.variables; enabled actions can update them."
            >
              <ApplicationStateEditor
                definition={definition}
                onChange={(next) => edit(JSON.stringify(next, null, 2))}
                disabled={archived || busy || !definition}
                tenantID={tenantID}
                applicationID={applicationID}
              />
            </Section>

            <Section
              title="Production"
              description="Exact page versions and configured query/workflow/listener execution."
            >
              {environmentQuery.isPending ? (
                <div className="flex h-12 items-center justify-center">
                  <Spinner size={14} className="text-primary" />
                </div>
              ) : deployedRelease ? (
                <div className="rounded border border-border/60 bg-background p-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">
                      Release {deployedRelease.releaseNumber}
                    </Badge>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {deployedRelease.contentHash.slice(0, 12)}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {deployedRelease.pageVersionCount > 0
                        ? `${deployedRelease.pageVersionCount} page version${deployedRelease.pageVersionCount === 1 ? "" : "s"}`
                        : "Legacy release"}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(deployedRelease.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Deployed to production. Pages and dependencies resolve from immutable page versions.
                  </p>
                  {environmentQuery.data?.diagnostics?.length > 0 && (
                    <div className="mt-1 space-y-0.5 text-[11px] text-muted-foreground">
                      <p>
                        {environmentQuery.data.diagnostics.length} runtime warning
                        {environmentQuery.data.diagnostics.length === 1 ? "" : "s"}:
                      </p>
                      <ul className="list-disc pl-4">
                        {environmentQuery.data.diagnostics.slice(0, 5).map((diagnostic, index) => (
                          <li key={`${diagnostic.code}:${diagnostic.path}:${index}`}>
                            {diagnostic.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="rounded border border-dashed border-border/70 bg-muted/30 p-2 text-xs text-muted-foreground">
                  No release deployed. Publish the current draft to make a pinned runtime.
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={!canPublish || publishAndDeploy.isPending}
                  onClick={() => publishAndDeploy.mutate()}
                >
                  {publishAndDeploy.isPending ? (
                    <Spinner size={14} />
                  ) : (
                    <Rocket className="h-3.5 w-3.5" />
                  )}
                  Publish &amp; deploy
                </Button>
                {deployedRelease && (
                  <Button type="button" variant="outline" size="sm" asChild>
                    <Link
                      to={CONSTANTS.ROUTES.APPLICATION_RUNTIME.path(
                        tenantID,
                        applicationID,
                        "production"
                      )}
                    >
                      <Play className="h-3.5 w-3.5" />
                      Open runtime
                    </Link>
                  </Button>
                )}
                <ApplicationEnvironmentBindingsDialog
                  tenantID={tenantID}
                  applicationID={applicationID}
                  environment={environmentQuery.data?.environment || {}}
                  disabled={archived || busy}
                />
                <ApplicationConsumerPolicyDialog
                  tenantID={tenantID}
                  applicationID={applicationID}
                  disabled={archived || busy}
                />
                <ApplicationRunHistoryDialog
                  tenantID={tenantID}
                  applicationID={applicationID}
                  disabled={archived || busy}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Runtime executes captured query and workflow versions through configured triggers
                and widget events. Listeners observe an existing saved buffer without
                starting new integrations; changing a listener definition requires republishing.
              </p>
              {dirty && (
                <p className="text-[11px] text-muted-foreground">
                  Save or discard draft edits before publishing.
                </p>
              )}
            </Section>

            <Section
              title="Release history"
              description="Every publish is an immutable release. Deploying or rolling back only moves the production pointer."
            >
              {releasesQuery.isPending ? (
                <div className="flex h-12 items-center justify-center">
                  <Spinner size={14} className="text-primary" />
                </div>
              ) : releasesQuery.error ? (
                <p className="rounded border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
                  Release history is unavailable. Check your application read permission.
                </p>
              ) : releases.length === 0 ? (
                <p className="rounded border border-dashed border-border/70 bg-muted/30 p-2 text-xs text-muted-foreground">
                  No releases yet. Save the draft, then publish to create the first
                  immutable release.
                </p>
              ) : (
                <div className="divide-y divide-border/60 overflow-hidden rounded border border-border/60">
                  {releases.map((release) => {
                    const isCurrent =
                      deployedRelease?.releaseID === release.releaseID;
                    const isRollback =
                      !!deployedRelease &&
                      release.releaseNumber < deployedRelease.releaseNumber;
                    return (
                      <div
                        key={release.releaseID}
                        className="flex flex-wrap items-center gap-2 bg-background px-2 py-1.5"
                      >
                        <Badge variant={isCurrent ? "success" : "outline"}>
                          Release {release.releaseNumber}
                        </Badge>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {release.contentHash.slice(0, 12)}…
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {release.pageVersionCount > 0
                            ? `${release.pageVersionCount} page version${
                                release.pageVersionCount === 1 ? "" : "s"
                              }`
                            : "Legacy release"}{" "}
                          · draft r{release.sourceRevision}
                        </span>
                        {release.warningCount > 0 && (
                          <Badge variant="warning">
                            {release.warningCount} warning
                            {release.warningCount === 1 ? "" : "s"}
                          </Badge>
                        )}
                        <span className="ml-auto">
                          {isCurrent ? (
                            <Badge variant="success">Production</Badge>
                          ) : (
                            <Button
                              type="button"
                              variant={isRollback ? "outline" : "secondary"}
                              size="sm"
                              disabled={archived || busy}
                              onClick={() => handleDeployRelease(release)}
                            >
                              {deployRelease.isPending &&
                              deployRelease.variables === release.releaseID ? (
                                <Spinner size={13} />
                              ) : isRollback ? (
                                "Roll back"
                              ) : (
                                "Deploy"
                              )}
                            </Button>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
              <p className="text-[11px] text-muted-foreground">
                Rollback only changes which retained release production serves; it
                does not undo data or schema migrations.
              </p>
            </Section>
          </div>
        </div>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel
                id={CONSTANTS.RESIZABLE_PANEL_IDS.APPLICATION_STUDIO_PREVIEW_PANEL}
                defaultSize={58}
                minSize={30}
                className="min-h-0 overflow-hidden pl-1"
              >
                <div className="flex h-full min-h-0 flex-col overflow-hidden rounded border border-border bg-card">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-2 py-1.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Live layout preview
                      </span>
                      {dirty && <Badge variant="secondary">Unsaved</Badge>}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground">Route</span>
                      <SearchSelect
                        value={effectivePreviewRoute?.id || ""}
                        onChange={(value) => setPreviewRouteID(value)}
                        options={previewRoutes.map((route) => ({
                          value: route.id,
                          label: `${route.title || route.id} · ${route.path}`,
                        }))}
                        placeholder="Select a route"
                        size="sm"
                        className="w-52 text-xs"
                        disabled={previewRoutes.length === 0}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-[11px]"
                        asChild
                      >
                        <Link
                          to={CONSTANTS.ROUTES.APPLICATION_PREVIEW.path(
                            tenantID,
                            applicationID
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Full preview
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <div className="min-h-0 flex-1 p-1">
                    <ApplicationLayoutPreview
                      definition={definition}
                      pagesByAsset={pagesByAsset}
                      widgetByID={widgetByID}
                      selectedRouteID={effectivePreviewRoute?.id || null}
                      onSelectRoute={(route) => setPreviewRouteID(route.id)}
                      appTitle={app.title}
                    />
                  </div>
                  <p className="border-t border-border/60 px-2 py-1 text-[10px] text-muted-foreground">
                    Shell and page structure update instantly. Widget bodies are
                    placeholders; no queries, workflows or actions execute here.
                  </p>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel
            id={CONSTANTS.RESIZABLE_PANEL_IDS.APPLICATION_STUDIO_JSON_PANEL}
            defaultSize={18}
            minSize={14}
            className="min-h-[80px]"
          >
            <div className="flex h-full min-h-0 flex-col overflow-hidden rounded border border-border bg-card">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-2 py-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    definition.json
                  </span>
                  {dirty && <Badge variant="secondary">Unsaved</Badge>}
                  <Badge variant={validation.valid ? "success" : "destructive"}>
                    {validation.valid ? "Valid" : "Invalid"}
                  </Badge>
                </div>
                {dirty && !archived && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[11px]"
                    disabled={busy}
                    onClick={() => {
                      setDirty(false);
                      setText(JSON.stringify(app.draft.definition, null, 2));
                      setEditRevision(app.draft.revision);
                    }}
                  >
                    Discard local edits
                  </Button>
                )}
              </div>
              <div className="min-h-0 flex-1 overflow-hidden">
                <CodeEditor
                  language="json"
                  height="100%"
                  className="h-full min-h-0 rounded-none border-0 shadow-none"
                  value={text}
                  onChange={edit}
                  disabled={archived || busy}
                  showHeader={false}
                  showExpandButton={false}
                  showFormatButton={false}
                />
              </div>
              <div
                aria-live="polite"
                className="max-h-24 overflow-y-auto border-t border-border/60 px-2 py-1"
              >
                {validation.valid ? (
                  <p className="text-[11px] text-muted-foreground">
                    Composition is valid. Publishing reuses unchanged versions,
                    creates versions for changed dependencies, and reports
                    unsupported actions.
                  </p>
                ) : (
                  <ul className="space-y-0.5 text-[11px] text-destructive">
                    {validation.diagnostics.map((item, index) => (
                      <li key={`${item.code}-${index}`} className="flex gap-1.5">
                        <span className="font-mono">{item.path || "definition"}</span>
                        <span>{item.message}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}

export default function ApplicationStudioPage() {
  const { tenantID, applicationID } = useParams();
  const { firebaseUserState } = useAuthState();
  return (
    <ApplicationStudioSession
      key={JSON.stringify([firebaseUserState?.user?.uid, tenantID, applicationID])}
    />
  );
}
