/**
 * Unit tests for Vault Service
 */

// Set up environment variable mock key
process.env.VAULT_ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

const { vaultService } = require("../../../modules/vault/vault.service");
const { prisma } = require("../../../config/prisma.config");

jest.mock("../../../config/prisma.config", () => ({
  prisma: {
    tblVaultCredentials: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

describe("VaultService", () => {
  const tenantID = "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d";
  const vaultCredentialID = "f6e5d4c3-b2a1-0f9e-8d7c-6b5a4f3e2d1c";
  const provider = "google";
  const name = "Google Sheet Auth";
  const data = {
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("storeCredential", () => {
    it("should successfully encrypt and store the credential", async () => {
      const mockResult = {
        vaultCredentialID,
        tenantID,
        provider,
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.tblVaultCredentials.create.mockResolvedValue(mockResult);

      const result = await vaultService.storeCredential({
        tenantID,
        provider,
        name,
        data,
      });

      expect(prisma.tblVaultCredentials.create).toHaveBeenCalledTimes(1);
      const createArg = prisma.tblVaultCredentials.create.mock.calls[0][0].data;
      expect(createArg.tenantID).toBe(tenantID);
      expect(createArg.provider).toBe(provider);
      expect(createArg.name).toBe(name);
      expect(createArg.encryptedData).toBeDefined();
      expect(createArg.encryptedData.iv).toBeDefined();
      expect(createArg.encryptedData.data).toBeDefined();
      expect(createArg.encryptedData.authTag).toBeDefined();

      expect(result).toEqual({
        vaultCredentialID: mockResult.vaultCredentialID,
        tenantID: mockResult.tenantID,
        name: mockResult.name,
        provider: mockResult.provider,
        createdAt: mockResult.createdAt,
        updatedAt: mockResult.updatedAt,
      });
    });
  });

  describe("getCredential", () => {
    it("should successfully retrieve and decrypt the credential", async () => {
      // First encrypt data to set up database mock value
      const { encrypt } = require("../../../utils/encryption.util");
      const encryptedData = encrypt(JSON.stringify(data));

      const mockDbRecord = {
        vaultCredentialID,
        tenantID,
        provider,
        name,
        encryptedData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.tblVaultCredentials.findUnique.mockResolvedValue(mockDbRecord);

      const result = await vaultService.getCredential({
        tenantID,
        vaultCredentialID,
      });

      expect(prisma.tblVaultCredentials.findUnique).toHaveBeenCalledWith({
        where: { vaultCredentialID },
      });
      expect(result).toEqual(data);
    });

    it("should throw error if credential is not found", async () => {
      prisma.tblVaultCredentials.findUnique.mockResolvedValue(null);

      await expect(
        vaultService.getCredential({
          tenantID,
          vaultCredentialID,
        })
      ).rejects.toThrow("Credential not found in Vault");
    });

    it("should throw unauthorized error if tenantID does not match", async () => {
      const { encrypt } = require("../../../utils/encryption.util");
      const encryptedData = encrypt(JSON.stringify(data));

      const mockDbRecord = {
        vaultCredentialID,
        tenantID: "wrong-tenant-id",
        provider,
        name,
        encryptedData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.tblVaultCredentials.findUnique.mockResolvedValue(mockDbRecord);

      await expect(
        vaultService.getCredential({
          tenantID,
          vaultCredentialID,
        })
      ).rejects.toThrow("Unauthorized access to credential");
    });
  });
});
