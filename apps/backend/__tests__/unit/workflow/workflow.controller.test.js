jest.mock('../../../modules/workflow/workflow.service', () => ({
  workflowService: {
    updateWorkflow: jest.fn(),
  },
}));

jest.mock('../../../utils/auth.context.utils', () => ({
  getServiceAuthContext: jest.fn(() => ({ authType: 'USER', userID: 'user-1' })),
}));

// Controller unit tests must not initialize the execution proxy's Redis/DB
// clients merely by importing a controller method unrelated to execution.
jest.mock('../../../utils/authorizedProxy', () => ({ authorizedExecuteWorkflow: jest.fn() }));

const { workflowController } = require('../../../modules/workflow/workflow.controller');
const { workflowService } = require('../../../modules/workflow/workflow.service');

describe('workflowController.updateWorkflow', () => {
  beforeEach(() => {
    workflowService.updateWorkflow.mockReset();
    workflowService.updateWorkflow.mockResolvedValue({ workflowID: 'wf-1' });
  });

  const makeRes = () => {
    const res = {
      status: jest.fn(),
      json: jest.fn(),
    };
    res.status.mockReturnValue(res);
    return res;
  };

  it('does not turn a title-only PATCH into an empty graph replacement', async () => {
    const req = {
      user: { userID: 'user-1' },
      params: { tenantID: 'tenant-1', workflowID: 'wf-1' },
      body: { title: 'Renamed workflow' },
    };

    await workflowController.updateWorkflow(req, makeRes());

    expect(workflowService.updateWorkflow).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Renamed workflow',
        nodes: undefined,
        edges: undefined,
      })
    );
  });

  it('passes an explicitly supplied graph through unchanged', async () => {
    const nodes = [{ id: 'node-1', type: 'start' }];
    const edges = [{ id: 'edge-1', source: 'node-1', target: 'node-1' }];
    const req = {
      user: { userID: 'user-1' },
      params: { tenantID: 'tenant-1', workflowID: 'wf-1' },
      body: { title: 'Renamed workflow', nodes, edges },
    };

    await workflowController.updateWorkflow(req, makeRes());

    expect(workflowService.updateWorkflow).toHaveBeenCalledWith(
      expect.objectContaining({ nodes, edges })
    );
  });
});
