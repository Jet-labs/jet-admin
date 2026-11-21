const tenantID = "tenant-1";
const parentFolderID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const childFolderID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

const mockFindFirst = jest.fn();
const mockFindUnique = jest.fn();
const mockUpdate = jest.fn();

jest.mock('../../../config/prisma.config', () => ({
  prisma: {
    tblFolders: {
      findFirst: (...args) => mockFindFirst(...args),
      findUnique: (...args) => mockFindUnique(...args),
      update: (...args) => mockUpdate(...args),
    },
  },
}));

jest.mock('../../../config/casbin.config', () => ({
  grantCreatorAccess: jest.fn(),
  removePoliciesForResource: jest.fn(),
  reloadPolicies: jest.fn(),
}));

jest.mock('../../../utils/auth.context.utils', () => ({
  getCreationContextFromAuthContext: jest.fn(() => ({ creatorID: 'user-1', createdByApiKeyID: null })),
}));

const { folderService } = require('../../../modules/folder/folder.service');

describe('folderService.updateFolder cycle guard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects moving a folder into its own descendant', async () => {
    mockFindFirst
      .mockResolvedValueOnce({
        folderID: parentFolderID,
        tenantID,
        entityType: 'dataQuery',
      })
      .mockResolvedValueOnce({
        folderID: childFolderID,
        tenantID,
        entityType: 'dataQuery',
      });
    mockFindUnique.mockResolvedValueOnce({
      parentFolderID,
      tenantID,
    });

    await expect(
      folderService.updateFolder({
        tenantID,
        folderID: parentFolderID,
        data: { parentFolderID: childFolderID },
      })
    ).rejects.toThrow(/Cannot move a folder into itself or one of its descendants/);

    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('rejects moving a folder into itself', async () => {
    mockFindFirst.mockResolvedValue({
      folderID: parentFolderID,
      tenantID,
      entityType: 'dataQuery',
    });

    await expect(
      folderService.updateFolder({
        tenantID,
        folderID: parentFolderID,
        data: { parentFolderID: parentFolderID },
      })
    ).rejects.toThrow(/Cannot move a folder into itself or one of its descendants/);

    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
