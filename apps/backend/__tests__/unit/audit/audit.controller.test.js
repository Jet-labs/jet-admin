jest.mock('../../../modules/audit/audit.service', () => ({
  auditService: {
    exportAuditLogsCSV: jest.fn(),
  },
}));

const { auditController } = require('../../../modules/audit/audit.controller');
const { auditService } = require('../../../modules/audit/audit.service');

describe('auditController.exportAuditLogsCSV', () => {
  beforeEach(() => {
    auditService.exportAuditLogsCSV.mockReset();
    auditService.exportAuditLogsCSV.mockResolvedValue('Log ID,User\n');
  });

  it('passes the UUID tenantID through without parseInt truncation', async () => {
    const tenantID = '97ca7876-7c73-4578-bccb-6d56b98a0113';
    const req = { params: { tenantID }, query: {} };
    const res = {
      setHeader: jest.fn(),
      status: jest.fn(),
      send: jest.fn(),
    };
    res.status.mockReturnValue(res);

    await auditController.exportAuditLogsCSV(req, res);

    expect(auditService.exportAuditLogsCSV).toHaveBeenCalledWith({
      tenantID,
      dateFrom: undefined,
      dateTo: undefined,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('Log ID,User\n');
  });
});
