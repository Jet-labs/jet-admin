const mockRoles = jest.fn();
const mockSyncRolePolicies = jest.fn().mockResolvedValue(undefined);
const mockReload = jest.fn().mockResolvedValue(undefined);

jest.mock('../../../config/prisma.config', () => ({
  prisma: {
    tblRoles: { findMany: mockRoles },
    tblRolePermissionMappings: { findMany: jest.fn().mockResolvedValue([]) },
  },
}));
jest.mock('../../../config/casbin.config', () => ({
  addPolicy: jest.fn().mockResolvedValue(true),
  removePoliciesForRole: jest.fn().mockResolvedValue(true),
  reloadPolicies: mockReload,
}));

const { tenantRoleService } = require('../../../modules/tenantRole/tenantRole.service');

describe('tenantRoleService.syncGlobalRolesForTenant', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    tenantRoleService.syncRolePolicies = mockSyncRolePolicies;
  });

  it('syncs every global role into the new tenant domain', async () => {
    mockRoles.mockResolvedValue([{ roleID: 'role-admin' }, { roleID: 'role-viewer' }]);
    await tenantRoleService.syncGlobalRolesForTenant('tenant-new');
    expect(mockRoles).toHaveBeenCalledWith({ where: { tenantID: null }, select: { roleID: true } });
    expect(mockSyncRolePolicies).toHaveBeenCalledTimes(2);
    expect(mockSyncRolePolicies).toHaveBeenCalledWith('role-admin', 'tenant-new');
    expect(mockSyncRolePolicies).toHaveBeenCalledWith('role-viewer', 'tenant-new');
    expect(mockReload).toHaveBeenCalled();
  });

  it('is a no-op without a tenant ID', async () => {
    await expect(tenantRoleService.syncGlobalRolesForTenant(null)).resolves.toEqual({ rolesCount: 0 });
    expect(mockSyncRolePolicies).not.toHaveBeenCalled();
  });
});
