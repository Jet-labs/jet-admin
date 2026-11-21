jest.mock('../../../modules/workflow/workflowEngine/stateManager', () => ({ stateManager: { logEvent: jest.fn() } }));
jest.mock('../../../config/socket.io', () => ({ socketIO: { to: jest.fn(), sockets: { adapter: { rooms: new Map() } } } }));
jest.mock('../../../modules/widget/widgetWorkflowBridge', () => ({ widgetWorkflowBridge: { emitContextUpdate: jest.fn() } }));
const mockActivityInfo = { workflowExecution: { runId: 'run' }, activityId: 'activity-1' };
jest.mock('@temporalio/activity', () => ({ Context: { current: () => ({ info: mockActivityInfo }) } }));
const { stateManager } = require('../../../modules/workflow/workflowEngine/stateManager');
const { socketIO } = require('../../../config/socket.io');
const { emitProgressActivity } = require('../../../modules/workflow/temporal/activities/emitProgress');

describe('required progress persistence', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    socketIO.to.mockReturnValue({ emit: jest.fn() });
    stateManager.logEvent.mockResolvedValue({});
  });
  const progress = { instanceID: 'i', nodeID: 'n', status: 'SUCCESS', output: { v: 1, success: true }, outputVariable: 'v', required: true };
  test('DB failure propagates to Temporal retry instead of returning emitted:true', async () => {
    stateManager.logEvent.mockRejectedValue(new Error('DB unavailable'));
    await expect(emitProgressActivity(progress)).rejects.toThrow('DB unavailable');
    expect(socketIO.to).not.toHaveBeenCalled();
  });
  test('activity retries use the same stable event key', async () => {
    await emitProgressActivity(progress);
    await emitProgressActivity(progress);
    expect(stateManager.logEvent.mock.calls.map(([event]) => event.eventKey)).toEqual(['run:activity-1:SUCCESS', 'run:activity-1:SUCCESS']);
  });
  test('request notification can skip an already committed suspension record', async () => {
    await emitProgressActivity({ ...progress, status: 'SUSPENDED', persist: false });
    expect(stateManager.logEvent).not.toHaveBeenCalled();
    expect(socketIO.to).toHaveBeenCalled();
  });
});
