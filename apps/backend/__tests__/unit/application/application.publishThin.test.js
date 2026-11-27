jest.mock('../../../config/prisma.config', () => ({ prisma: {} }));
jest.mock('../../../config/casbin.config', () => ({ enforce: jest.fn(), grantCreatorAccess: jest.fn() }));
jest.mock('../../../modules/assetVersion/assetVersion.service', () => ({
  createAssetVersionService: jest.fn(() => ({
    ensureVersion: jest.fn().mockResolvedValue({ assetVersionID: 'page-version-1' }),
    inspectVersion: jest.fn().mockResolvedValue({ dirty: false, changeCount: 0, staleDependencies: [] }),
    recordReleaseReferences: jest.fn().mockResolvedValue(),
  })),
}));
jest.mock('../../../modules/application/application.versionRelease', () => ({
  assembleApplicationRelease: jest.fn().mockResolvedValue({
    clientManifest: { mode: 'runtime', executionEnabled: true, actionsEnabled: true, applicationTitle: 'App', applicationSlug: 'app', definition: {}, pages: { page: {} }, widgets: {}, diagnostics: [] },
    serverManifest: { pages: { page: {} } },
    contentHash: 'a'.repeat(64),
  }),
}));
const { createApplicationService } = require('../../../modules/application/application.service');
const { createApplicationDefinition } = require('@jet-admin/application-contracts');
const { assembleApplicationRelease } = require('../../../modules/application/application.versionRelease');
const { createAssetVersionService } = require('../../../modules/assetVersion/assetVersion.service');

it('stores only page version pointers in a published release', async () => {
  const definition = { ...createApplicationDefinition(), routes: [{ id: 'home', path: '/', pageAssetKey: 'page' }], shell: { kind: 'sidebar', homeRouteID: 'home', navigation: [{ routeID: 'home', label: 'Home' }] } };
  const app = { applicationID: 'app', tenantID: 'tenant-a', title: 'App', slug: 'app', status: 'DRAFT', draft: { revision: 2, definition }, assets: [{ assetType: 'appPage', assetKey: 'page', appPageID: 'page-id' }] };
  const db = {
    tblUsersTenantsRelationship: { findFirst: jest.fn().mockResolvedValue({ userID: 'user-a' }) },
    tblAPIKeys: { findFirst: jest.fn() },
    tblApplications: { findFirst: jest.fn().mockResolvedValue(app), updateMany: jest.fn() },
    tblApplicationReleases: { findFirst: jest.fn().mockResolvedValue(null), create: jest.fn(async ({ data }) => ({ ...data, releaseID: 'release-1', createdAt: new Date() })) },
    $executeRaw: jest.fn(),
  };
  db.$transaction = jest.fn(fn => fn(db));
  const service = createApplicationService({ db, enforce: jest.fn().mockResolvedValue(true), grantCreatorAccess: jest.fn() });
  const release = await service.publish({ ctx: { tenantID: 'tenant-a', caller: { type: 'user', id: 'user-a' } }, applicationID: 'app', expectedRevision: 2 });
  expect(createAssetVersionService).toHaveBeenCalled();
  expect(assembleApplicationRelease).toHaveBeenCalledWith(expect.objectContaining({ pageVersions: { page: 'page-version-1' } }));
  expect(release).toMatchObject({ releaseID: 'release-1', releaseNumber: 1 });
  const created = db.tblApplicationReleases.create.mock.calls[0][0].data;
  expect(created.clientManifest).toMatchObject({ pageVersions: { page: 'page-version-1' } });
  expect(created.clientManifest).not.toHaveProperty('pages');
  expect(created.clientManifest).not.toHaveProperty('widgets');
  expect(created.serverManifest).toEqual({ schemaVersion: 1, applicationID: 'app', tenantID: 'tenant-a', pageVersions: { page: 'page-version-1' } });
  expect(created.contentHash).toBe('a'.repeat(64));
  expect(createAssetVersionService.mock.results[0].value.recordReleaseReferences).toHaveBeenCalledWith(expect.objectContaining({ releaseID: 'release-1', pageVersionIDs: ['page-version-1'] }));
});

it('publishes a selected page version without capturing the latest draft', async () => {
  const definition = { ...createApplicationDefinition(), routes: [{ id: 'home', path: '/', pageAssetKey: 'page' }], shell: { kind: 'sidebar', homeRouteID: 'home', navigation: [{ routeID: 'home', label: 'Home' }] } };
  const app = { applicationID: 'app', tenantID: 'tenant-a', title: 'App', slug: 'app', status: 'DRAFT', draft: { revision: 2, definition }, assets: [{ assetType: 'appPage', assetKey: 'page', appPageID: 'page-id', pageVersionID: 'pinned-page-version' }] };
  const db = {
    tblUsersTenantsRelationship: { findFirst: jest.fn().mockResolvedValue({ userID: 'user-a' }) },
    tblAPIKeys: { findFirst: jest.fn() },
    tblApplications: { findFirst: jest.fn().mockResolvedValue(app), updateMany: jest.fn() },
    tblAssetVersions: { findFirst: jest.fn().mockResolvedValue({ assetVersionID: 'pinned-page-version' }) },
    tblApplicationReleases: { findFirst: jest.fn().mockResolvedValue(null), create: jest.fn(async ({ data }) => ({ ...data, releaseID: 'release-2', createdAt: new Date() })) },
    $executeRaw: jest.fn(),
  };
  db.$transaction = jest.fn(fn => fn(db));
  const service = createApplicationService({ db, enforce: jest.fn().mockResolvedValue(true), grantCreatorAccess: jest.fn() });
  const release = await service.publish({ ctx: { tenantID: 'tenant-a', caller: { type: 'user', id: 'user-a' } }, applicationID: 'app', expectedRevision: 2 });
  const authoringService = createAssetVersionService.mock.results.at(-1).value;
  expect(authoringService.ensureVersion).not.toHaveBeenCalled();
  expect(assembleApplicationRelease).toHaveBeenCalledWith(expect.objectContaining({ pageVersions: { page: 'pinned-page-version' } }));
  expect(db.tblAssetVersions.findFirst).toHaveBeenCalledWith(expect.objectContaining({
    where: expect.objectContaining({ assetVersionID: 'pinned-page-version', assetType: 'appPage', assetID: 'page-id' }),
  }));
  expect(release).toMatchObject({ releaseID: 'release-2' });
  expect(db.tblApplicationReleases.create.mock.calls[0][0].data.serverManifest.pageVersions).toEqual({ page: 'pinned-page-version' });
});
