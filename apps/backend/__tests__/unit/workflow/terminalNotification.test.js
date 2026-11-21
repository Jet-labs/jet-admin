jest.mock('../../../modules/workflow/workflowEngine/stateManager', () => ({ stateManager: { completeInstance: jest.fn() } }));
jest.mock('../../../config/socket.io', () => ({ socketIO: { to: jest.fn(), sockets: { adapter: { rooms: new Map() } } } }));
jest.mock('../../../modules/widget/widgetWorkflowBridge', () => ({ widgetWorkflowBridge: { emitWorkflowStatus: jest.fn() } }));
const { stateManager } = require('../../../modules/workflow/workflowEngine/stateManager');
const { socketIO } = require('../../../config/socket.io');
const { emitWorkflowCompletedActivity } = require('../../../modules/workflow/temporal/activities/emitCompleted');

describe('terminal durability versus notifications', () => {
  let emit;
  beforeEach(() => {
    jest.resetAllMocks();
    emit = jest.fn();
    socketIO.to.mockReturnValue({ emit });
    stateManager.completeInstance.mockResolvedValue(true);
  });
  test('late conflicting finalization emits no false terminal event', async () => {
    stateManager.completeInstance.mockResolvedValue(false);
    expect(await emitWorkflowCompletedActivity({ instanceID: 'r', finalStatus: 'FAILED' })).toEqual({ completed: false });
    expect(emit).not.toHaveBeenCalled();
  });
  test('socket outage cannot invalidate an already committed business outcome', async () => {
    emit.mockImplementation(() => { throw new Error('socket offline'); });
    await expect(emitWorkflowCompletedActivity({ instanceID: 'r', finalStatus: 'COMPLETED', contextData: { a: 1 } })).resolves.toEqual({ completed: true });
  });
  test('durability failure propagates instead of claiming completion', async () => {
    stateManager.completeInstance.mockRejectedValue(new Error('DB unavailable'));
    await expect(emitWorkflowCompletedActivity({ instanceID: 'r', finalStatus: 'COMPLETED' })).rejects.toThrow('DB unavailable');
    expect(emit).not.toHaveBeenCalled();
  });
});
