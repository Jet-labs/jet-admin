import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { Boxes, ExternalLink, Search, ShieldCheck, Store, Trash2, Users } from "lucide-react";
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
  Input,
  PageHeader,
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

export const TemplateGallery = ({ tenantID }) => {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("");
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [installOptions, setInstallOptions] = useState({ includeSampleData: true, createDemoUsers: false, enableAutomation: false });
  const [confirmUninstall, setConfirmUninstall] = useState(false);
  const debouncedSearch = useDebounce(searchInput, 300);

  const listQuery = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.TEMPLATES(tenantID), debouncedSearch, category],
    queryFn: () => listTemplatesAPI({ tenantID, search: debouncedSearch, category }),
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
    mutationFn: ({ slug }) => uninstallTemplateAPI({ tenantID, slug }),
    onSuccess: () => {
      displaySuccess("Template uninstalled.");
      invalidate();
      setConfirmUninstall(false);
      setSelectedSlug(null);
    },
    onError: (error) => displayError(error),
  });

  const entries = listQuery.data?.entries || [];
  const categories = listQuery.data?.categories || [];
  const selected = detailQuery.data;
  const isBusy = installMutation.isPending || uninstallMutation.isPending;

  const stats = useMemo(() => {
    if (!selected?.manifest) return null;
    return selected.manifest.counts;
  }, [selected]);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <PageHeader
        title="App templates"
        subTitle={entries.length === 0 ? "No templates found" : `${entries.length} install-ready template${entries.length === 1 ? "" : "s"}`}
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
            <Input
              type="text"
              size="sm"
              placeholder="Search templates..."
              className="w-56 pl-8"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </div>
          <select
            aria-label="Filter templates by category"
            className="h-8 rounded border border-border/50 bg-background px-2 text-xs text-foreground"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
      </PageHeader>

      <div className="flex-1 overflow-auto p-3">
        {listQuery.isLoading ? (
          <div className="flex h-64 items-center justify-center"><Spinner /></div>
        ) : listQuery.error ? (
          <NoEntityUI message="Could not load app templates. Check your permissions and try again." />
        ) : entries.length === 0 ? (
          <NoEntityUI message="No templates match these filters." />
        ) : (
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Uninstall {selected?.manifest?.name}?</DialogTitle>
            <DialogDescription>
              This deletes the template pages, widgets, queries, workflows, roles, cron jobs and the tenant-isolated tables. It cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConfirmUninstall(false)} disabled={isBusy}>Cancel</Button>
            <Button type="button" variant="destructive" disabled={isBusy} onClick={() => uninstallMutation.mutate({ slug: selected.manifest.slug })}>
              {uninstallMutation.isPending ? <Spinner className="h-4 w-4" /> : "Uninstall"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

TemplateGallery.propTypes = {
  tenantID: PropTypes.string.isRequired,
};
