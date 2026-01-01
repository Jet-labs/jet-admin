/**
 * Unit tests for auth service - pure function tests
 * 
 * Tests the pure utility functions in auth service that don't require database access
 */

const { authService } = require('../../../modules/auth/auth.service');

describe('authService - Pure Functions', () => {
  describe('extractUserPermissions', () => {
    it('should extract permissions from role mappings', () => {
      const roleMappings = [
        {
          tblRoles: {
            tblRolePermissionMappings: [
              { tblPermissions: { permissionTitle: 'read:users' } },
              { tblPermissions: { permissionTitle: 'write:users' } },
            ],
          },
        },
      ];

      const result = authService.extractUserPermissions(roleMappings);

      expect(result).toBeInstanceOf(Set);
      expect(result.has('read:users')).toBe(true);
      expect(result.has('write:users')).toBe(true);
    });

    it('should handle empty role mappings', () => {
      const result = authService.extractUserPermissions([]);
      expect(result).toBeInstanceOf(Set);
      expect(result.size).toBe(0);
    });

    it('should handle role mappings without permissions', () => {
      const roleMappings = [
        {
          tblRoles: {
            tblRolePermissionMappings: [],
          },
        },
      ];

      const result = authService.extractUserPermissions(roleMappings);
      expect(result.size).toBe(0);
    });

    it('should normalize permission names to lowercase', () => {
      const roleMappings = [
        {
          tblRoles: {
            tblRolePermissionMappings: [
              { tblPermissions: { permissionTitle: 'READ:USERS' } },
            ],
          },
        },
      ];

      const result = authService.extractUserPermissions(roleMappings);
      expect(result.has('read:users')).toBe(true);
    });

    it('should handle missing tblRoles', () => {
      const roleMappings = [{ tblRoles: null }];
      const result = authService.extractUserPermissions(roleMappings);
      expect(result.size).toBe(0);
    });

    it('should deduplicate permissions across multiple roles', () => {
      const roleMappings = [
        {
          tblRoles: {
            tblRolePermissionMappings: [
              { tblPermissions: { permissionTitle: 'read:users' } },
            ],
          },
        },
        {
          tblRoles: {
            tblRolePermissionMappings: [
              { tblPermissions: { permissionTitle: 'read:users' } },
              { tblPermissions: { permissionTitle: 'write:users' } },
            ],
          },
        },
      ];

      const result = authService.extractUserPermissions(roleMappings);
      expect(result.size).toBe(2);
    });
  });

  describe('checkPermissions', () => {
    it('should return true when user has all required permissions (requireAll=true)', () => {
      const userPermissions = new Set(['read:users', 'write:users', 'delete:users']);
      const requiredPermissions = ['read:users', 'write:users'];

      const result = authService.checkPermissions(userPermissions, requiredPermissions, true);
      expect(result).toBe(true);
    });

    it('should return false when user is missing a required permission (requireAll=true)', () => {
      const userPermissions = new Set(['read:users']);
      const requiredPermissions = ['read:users', 'write:users'];

      const result = authService.checkPermissions(userPermissions, requiredPermissions, true);
      expect(result).toBe(false);
    });

    it('should return true when user has any required permission (requireAll=false)', () => {
      const userPermissions = new Set(['read:users']);
      const requiredPermissions = ['read:users', 'write:users'];

      const result = authService.checkPermissions(userPermissions, requiredPermissions, false);
      expect(result).toBe(true);
    });

    it('should return false when user has no required permissions (requireAll=false)', () => {
      const userPermissions = new Set(['other:permission']);
      const requiredPermissions = ['read:users', 'write:users'];

      const result = authService.checkPermissions(userPermissions, requiredPermissions, false);
      expect(result).toBe(false);
    });

    it('should support wildcard matching with user wildcard', () => {
      const userPermissions = new Set(['*:users']);
      const requiredPermissions = ['read:users'];

      const result = authService.checkPermissions(userPermissions, requiredPermissions, true);
      expect(result).toBe(true);
    });

    it('should support wildcard matching with required wildcard', () => {
      const userPermissions = new Set(['read:users']);
      const requiredPermissions = ['*:users'];

      const result = authService.checkPermissions(userPermissions, requiredPermissions, true);
      expect(result).toBe(true);
    });

    it('should handle empty required permissions', () => {
      const userPermissions = new Set(['read:users']);
      const requiredPermissions = [];

      const result = authService.checkPermissions(userPermissions, requiredPermissions, true);
      expect(result).toBe(true);
    });

    it('should handle empty user permissions', () => {
      const userPermissions = new Set();
      const requiredPermissions = ['read:users'];

      const result = authService.checkPermissions(userPermissions, requiredPermissions, true);
      expect(result).toBe(false);
    });
  });
});
