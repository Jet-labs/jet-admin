import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Boxes, ExternalLink, ShieldCheck, Store, Trash2, Users } from "lucide-react";
import {
  Badge,
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Spinner,
} from "@jet-admin/ui";
import { CONSTANTS } from "../../../constants";
import {
  fetchTemplateAssetBlob,
  getTemplateAPI,
  installTemplateAPI,
  listTemplatesAPI,
  uninstallTemplateAPI,
} from "../../../data/apis/templates";
import { displayError, displaySuccess } from "../../../utils/notification";
import { NoEntityUI } from "../ui/noEntityUI";

const TemplateAsset = ({ tenantID, slug, assetPath, alt, className }) => {
  const [url, setUrl] = useState(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    let objectURL;
    setUrl(null);
    setFailed(false);
    if (!tenantID || !slug || !assetPath) return undefined;
    fetchTemplateAssetBlob({ tenantID, slug, assetPath })
      .then((blob) => {
        if (!active) return;
        objectURL = URL.createObjectURL(blob);
        setUrl(objectURL);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
      if (objectURL) URL.revokeObjectURL(objectURL);
    };
  }, [tenantID, slug, assetPath]);
  if (url) return <img src={url} alt={alt} className={className} />;
  return (
    <div className={`${className} flex items-center justify-center bg-gradient-to-br from-primary/20 to-slate-900/80`}>
      {failed ? <Boxes className="h-8 w-8 text-white/70" aria-hidden="true" /> : <Spinner className="h-5 w-5 text-white/70" />}
    </div>
  );
};

TemplateAsset.propTypes = {
  tenantID: PropTypes.string,
  slug: PropTypes.string,
  assetPath: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.string,
};

export const TemplateGallery = ({ tenantID, search = "", category = "" }) => {
  const queryClient = useQueryClient();
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [installOptions, setInstallOptions] = useState({ includeSampleData: true, createDemoUsers: false, enableAutomation: false });
  const [confirmUninstall, setConfirmUninstall] = useState(false);
  const [uninstallKeys, setUninstallKeys] = useState([]);

  const listQuery = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.TEMPLATES(tenantID), search, category],
    queryFn: () => listTemplatesAPI({ tenantID, search, category }),
    enabled: Boolean(tenantID),
    refetchOnWindowFocus: false,
  });

  const detailQuery = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.TEMPLATES(tenantID), "detail", selectedSlug],
    queryFn: () => getTemplateAPI({ tenantID, slug: selectedSlug }),
    enabled: Boolean(tenantID && selectedSlug),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!detailQuery.data?.manifest) return;
    const next = {};
    for (const option of detailQuery.data.manifest.installOptions || []) {
      next[option.key] = option.default;
    }
    setInstallOptions(next);
  }, [detailQuery.data?.manifest]);

  const invalidate = () => {
    [
      CONSTANTS.REACT_QUERY_KEYS.TEMPLATES(tenantID),
      CONSTANTS.REACT_QUERY_KEYS.APP_PAGES(tenantID),
      CONSTANTS.REACT_QUERY_KEYS.WIDGETS(tenantID),
      CONSTANTS.REACT_QUERY_KEYS.QUERIES(tenantID),
      CONSTANTS.REACT_QUERY_KEYS.WORKFLOWS(tenantID),
      CONSTANTS.REACT_QUERY_KEYS.DATASOURCES(tenantID),
      CONSTANTS.REACT_QUERY_KEYS.LISTENERS(tenantID),
      CONSTANTS.REACT_QUERY_KEYS.MARKETPLACE(tenantID),
    ].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
  };

  const installMutation = useMutation({
    mutationFn: ({ slug }) => installTemplateAPI({ tenantID, slug, options: installOptions }),
    onSuccess: (result) => {
      displaySuccess(result.alreadyInstalled ? "Template is already installed." : "Template installed successfully.");
      invalidate();
      setSelectedSlug(null);
    },
    onError: (error) => displayError(error),
  });

  const uninstallMutation = useMutation({
    mutationFn: ({ slug, assetKeys }) => uninstallTemplateAPI({ tenantID, slug, assetKeys }),
    onSuccess: (result) => {
      displaySuccess(
        result?.mode === "partial"
          ? `Removed ${result.deleted.resources} resources and ${result.deleted.tables} tables. Unselected assets remain installed.`
          : "Template uninstalled."
      );
      invalidate();
      setConfirmUninstall(false);
      if (result?.mode !== "partial") setSelectedSlug(null);
    },
    onError: (error) => displayError(error),
  });

  const entries = listQuery.data?.entries || [];
  const selected = detailQuery.data;
  const uninstallPlan = selected?.install?.uninstallPlan;
  const uninstallAssets = useMemo(
    () => [...(uninstallPlan?.resources || []), ...(uninstallPlan?.tables || [])],
    [uninstallPlan]
  );
  const isBusy = installMutation.isPending || uninstallMutation.isPending;

  useEffect(() => {
    if (confirmUninstall) setUninstallKeys(uninstallAssets.map((asset) => asset.key));
  }, [confirmUninstall, uninstallAssets]);

  const stats = useMemo(() => {
    if (!selected?.manifest) return null;
    return selected.manifest.counts;
  }, [selected]);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <div className="flex-1 overflow-auto p-3">
        {listQuery.isLoading ? (
          <div className="flex h-64 items-center justify-center"><Spinner /></div>
        ) : listQuery.error ? (
          <NoEntityUI message="Could not load app bundles. Check your permissions and try again." />
        ) : entries.length === 0 ? (
          <NoEntityUI message="No app bundles match these filters." />
        ) : (
          <>
          <p className="mb-2 text-xs text-muted-foreground">
            {entries.length} app bundle{entries.length === 1 ? "" : "s"}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {entries.map((template) => (
              <article key={template.slug} className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                <div className="relative h-32">
                  <TemplateAsset
                    tenantID={tenantID}
                    slug={template.slug}
                    assetPath="cover.svg"
                    alt={`${template.name} cover`}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute right-2 top-2 flex gap-1">
                    {template.installed && <Badge variant="success">Installed</Badge>}
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                </div>
                <div className="space-y-2 p-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{template.name}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{template.shortDescription}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Boxes className="h-3 w-3" />{template.counts.pages} pages</span>
                    <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3" />{template.counts.queries} queries</span>
                    <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{template.counts.roles} roles</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <Button type="button" variant="outline" size="sm" onClick={() => setSelectedSlug(template.slug)}>
                      <ExternalLink className="mr-1 h-3.5 w-3.5" /> Details
                    </Button>
                    <Button type="button" size="sm" disabled={isBusy} onClick={() => { setSelectedSlug(template.slug); }}>
                      {template.installed ? "Manage" : "Install"}
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          </>
        )}
      </div>

      <Dialog open={Boolean(selectedSlug)} onOpenChange={(open) => { if (!open && !isBusy) { setSelectedSlug(null); setConfirmUninstall(false); } }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Store className="h-4 w-4" /> {selected?.manifest?.name || "Template"}
            </DialogTitle>
            <DialogDescription>{selected?.manifest?.shortDescription || "Loading template details..."}</DialogDescription>
          </DialogHeader>
          <DialogBody className="max-h-[65vh] overflow-y-auto">
            {detailQuery.isLoading ? (
              <div className="flex h-40 items-center justify-center"><Spinner /></div>
            ) : selected?.manifest ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[["Pages", stats.pages], ["Queries", stats.queries], ["Workflows", stats.workflows], ["Tables", stats.tables]].map(([label, value]) => (
                    <div key={label} className="rounded border border-border bg-muted/20 p-2 text-center">
                      <div className="text-lg font-semibold text-foreground">{value}</div>
                      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">What is included</h4>
                    <ul className="space-y-1 text-xs text-foreground">
                      {(selected.manifest.features || []).map((feature) => <li key={feature} className="flex gap-1.5"><span className="text-primary">•</span>{feature}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Integrations</h4>
                    <ul className="space-y-1 text-xs text-foreground">
                      {(selected.manifest.requiredIntegrations || []).map((integration) => <li key={integration.key} className="flex gap-1.5"><span className="text-primary">•</span>{integration.title}</li>)}
                    </ul>
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Data model (Mermaid ERD)</h4>
                  <pre className="max-h-64 overflow-auto rounded border border-border bg-muted/20 p-2 text-[11px] leading-relaxed text-foreground">{selected.erd || "ERD unavailable"}</pre>
                </div>
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Screenshots</h4>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {(selected.manifest.screenshots || []).map((shot) => (
                      <figure key={shot.path} className="overflow-hidden rounded border border-border">
                        <TemplateAsset tenantID={tenantID} slug={selected.manifest.slug} assetPath={shot.path.replace(/^assets\//, "")} alt={shot.title} className="h-24 w-full object-cover" />
                        <figcaption className="p-1 text-[10px] text-muted-foreground">{shot.title}</figcaption>
                      </figure>
                    ))}
                  </div>
                </div>
                {selected.installed ? (
                  <div className="rounded border border-border bg-muted/20 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">Installed v{selected.install?.version}</p>
                        <p className="text-xs text-muted-foreground">{selected.install?.resources} platform resources · prefix {selected.install?.tablePrefix}</p>
                      </div>
                      <Button type="button" variant="destructive" size="sm" disabled={isBusy} onClick={() => setConfirmUninstall(true)}>
                        <Trash2 className="mr-1 h-3.5 w-3.5" /> Uninstall
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 rounded border border-border p-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Install options</h4>
                    {(selected.manifest.installOptions || []).map((option) => (
                      <label key={option.key} className="flex cursor-pointer items-start gap-2 text-xs text-foreground">
                        <input
                          type="checkbox"
                          className="mt-0.5 h-4 w-4 rounded border-border"
                          checked={!!installOptions[option.key]}
                          onChange={(event) => setInstallOptions((current) => ({ ...current, [option.key]: event.target.checked }))}
                        />
                        <span>
                          <span className="font-medium">{option.label}</span>
                          <span className="block text-muted-foreground">{option.description}</span>
                        </span>
                      </label>
                    ))}
                    <p className="text-[11px] text-muted-foreground">Listeners and cron jobs install inactive/disabled unless automation is explicitly enabled. Demo staff identities are not Firebase logins.</p>
                  </div>
                )}
              </div>
            ) : (
              <NoEntityUI message="Template details could not be loaded." />
            )}
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSelectedSlug(null)} disabled={isBusy}>Close</Button>
            {selected && !selected.installed && (
              <Button type="button" disabled={isBusy} onClick={() => installMutation.mutate({ slug: selected.manifest.slug })}>
                {installMutation.isPending ? <Spinner className="h-4 w-4" /> : "Install template"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmUninstall} onOpenChange={setConfirmUninstall}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Uninstall {selected?.manifest?.name}?</DialogTitle>
            <DialogDescription>
              Selected assets and database tables are deleted. Unselected assets stay installed.
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Assets to delete
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {uninstallKeys.length} of {uninstallAssets.length} selected
                </Badge>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isBusy}
                  onClick={() => setUninstallKeys(uninstallAssets.map((asset) => asset.key))}
                >
                  Select all
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isBusy}
                  onClick={() => setUninstallKeys([])}
                >
                  Clear
                </Button>
              </div>
            </div>
            <div className="max-h-72 space-y-3 overflow-y-auto rounded border border-border/50 p-2">
              {Object.entries(
                uninstallAssets.reduce((groups, asset) => {
                  const key = asset.typeLabel || asset.type;
                  groups[key] = groups[key] || [];
                  groups[key].push(asset);
                  return groups;
                }, {})
              ).map(([group, assets]) => (
                <div key={group}>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {group} ({assets.length})
                  </p>
                  <div className="space-y-1">
                    {assets.map((asset) => (
                      <label key={asset.key} className="flex items-start gap-2 rounded px-1 py-0.5 text-xs text-foreground">
                        <input
                          type="checkbox"
                          className="mt-0.5"
                          checked={uninstallKeys.includes(asset.key)}
                          disabled={isBusy}
                          onChange={(event) =>
                            setUninstallKeys((current) =>
                              event.target.checked
                                ? [...current, asset.key]
                                : current.filter((key) => key !== asset.key)
                            )
                          }
                        />
                        <span className="min-w-0 break-words">{asset.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              {uninstallAssets.length === 0 && (
                <p className="text-xs text-muted-foreground">No installed assets were recorded for this template.</p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Unselecting an asset keeps it in the tenant and keeps the install ledger active.
              Unselecting a database table preserves its data.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConfirmUninstall(false)} disabled={isBusy}>Cancel</Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isBusy || uninstallKeys.length === 0}
              onClick={() => uninstallMutation.mutate({ slug: selected.manifest.slug, assetKeys: uninstallKeys })}
            >
              {uninstallMutation.isPending ? <Spinner className="h-4 w-4" /> : `Delete selected (${uninstallKeys.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

TemplateGallery.propTypes = {
  tenantID: PropTypes.string.isRequired,
  search: PropTypes.string,
  category: PropTypes.string,
};
