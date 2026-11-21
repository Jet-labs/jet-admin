jest.mock('../../../config/prisma.config', () => ({ prisma: { $transaction: jest.fn() } }));
jest.mock('../../../config/casbin.config', () => ({ grantCreatorAccess: jest.fn(), removePoliciesForResource: jest.fn() }));
jest.mock('../../../modules/appPage/appPage.references', () => ({ validateAppPageReferences: jest.fn() }));
const { prisma } = require('../../../config/prisma.config');
const { appPageService } = require('../../../modules/appPage/appPage.service');

describe('page restore transaction contract', () => {
  let tx, operations;
  const args = { userID: 'u', tenantID: 't', appPageID: 'p', versionID: 'v' };
  beforeEach(() => {
    operations = [];
    tx = {
      $executeRaw: jest.fn(async () => { operations.push('lock'); }),
      tblAppPages: {
        findFirst: jest.fn(async () => { operations.push('read-page'); return { appPageTitle: 'current', appPageConfig: { current: true } }; }),
        update: jest.fn(async () => { operations.push('restore'); }),
      },
      tblAppPageVersions: {
        findFirst: jest.fn(async ({ select }) => select ? { versionNumber: 4 } : { versionNumber: 2, appPageTitle: 'old', appPageConfig: { previous: true } }),
        create: jest.fn(async () => { operations.push('snapshot'); }),
        count: jest.fn(async () => 5),
      },
    };
    prisma.$transaction.mockImplementation(fn => fn(tx));
  });
  test('locks before reading and snapshots/restores using the same transaction client', async () => {
    await expect(appPageService.restoreAppPageVersion(args)).resolves.toBe(true);
    expect(operations).toEqual(['lock', 'read-page', 'snapshot', 'restore']);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.$executeRaw.mock.calls[0][0].join('?')).toContain('pg_advisory_xact_lock');
    expect(tx.$executeRaw.mock.calls[0][1]).toBe('p');
    expect(tx.tblAppPageVersions.create.mock.calls[0][0].data).toMatchObject({ versionNumber: 5, appPageConfig: { current: true } });
    expect(tx.tblAppPages.update.mock.calls[0][0].data).toMatchObject({ appPageConfig: { previous: true }, updatedAt: expect.any(Date) });
  });
  test('snapshot failure aborts restore instead of losing undo history', async () => {
    tx.tblAppPageVersions.create.mockRejectedValue(new Error('snapshot unavailable'));
    await expect(appPageService.restoreAppPageVersion(args)).rejects.toThrow('snapshot unavailable');
    expect(tx.tblAppPages.update).not.toHaveBeenCalled();
  });
  test('missing tenant-bound version cannot modify page', async () => {
    tx.tblAppPageVersions.findFirst.mockResolvedValue(null);
    await expect(appPageService.restoreAppPageVersion(args)).rejects.toThrow('version not found');
    expect(tx.tblAppPages.update).not.toHaveBeenCalled();
    expect(tx.tblAppPageVersions.create).not.toHaveBeenCalled();
  });
});
