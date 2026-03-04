
jest.mock('uuid', () => ({
  v4: () => 'mock-uuid'
}), { virtual: true });

jest.mock('amqplib', () => ({}), { virtual: true });
jest.mock('socket.io', () => ({
  Server: jest.fn().mockImplementation(() => ({
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
    use: jest.fn(),
  })),
}), { virtual: true });
jest.mock('express', () => {
  const express = jest.fn(() => ({
    use: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    enable: jest.fn(),
    options: jest.fn(),
    set: jest.fn(),
  }));
  express.json = jest.fn();
  express.urlencoded = jest.fn();
  express.static = jest.fn();
  return express;
}, { virtual: true });
jest.mock('cors', () => jest.fn(), { virtual: true });
jest.mock('morgan', () => jest.fn(), { virtual: true });

const mockWinstonFormat = jest.fn().mockImplementation((fn) => {
  if (typeof fn === 'function') {
    return (info) => fn(info || { message: '' });
  }
  return fn;
});
mockWinstonFormat.combine = jest.fn();
mockWinstonFormat.timestamp = jest.fn();
mockWinstonFormat.printf = jest.fn();
mockWinstonFormat.colorize = jest.fn();
mockWinstonFormat.json = jest.fn();
mockWinstonFormat.label = jest.fn();

jest.mock('winston', () => ({
  createLogger: jest.fn().mockReturnValue({
    add: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  }),
  format: mockWinstonFormat,
  transports: {
    Console: jest.fn(),
    File: jest.fn(),
    Syslog: jest.fn(),
    DailyRotateFile: jest.fn(),
  },
  addColors: jest.fn(),
}), { virtual: true });
jest.mock('winston-daily-rotate-file', () => jest.fn(), { virtual: true });
jest.mock('winston-syslog', () => ({ Syslog: jest.fn() }), { virtual: true });
jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
}), { virtual: true });
jest.mock('dotenv', () => ({
  config: jest.fn(),
}), { virtual: true });
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn().mockReturnValue({
    options: {
      credential: {
        projectId: 'mock-project-id'
      }
    }
  }),
  credential: {
    cert: jest.fn(),
  },
  messaging: jest.fn().mockReturnValue({}),
  auth: jest.fn().mockReturnValue({}),
}), { virtual: true });
jest.mock('@jet-admin/widgets-logic', () => ({
  processWorkflowDataForWidget: jest.fn(),
}), { virtual: true });

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
  Prisma: {
    dmmf: {
      datamodel: {
        models: []
      }
    }
  }
}), { virtual: true });

// The mocks for the modules MUST come BEFORE requiring the orchestrator
jest.mock('../../../config/rabbitmq.config');
jest.mock('../../../modules/workflow/orchestrator/stateManager');
jest.mock('../../../modules/workflow/orchestrator/dagScheduler');
jest.mock('../../../config/socket.io');
jest.mock('../../../modules/widget/widgetWorkflowBridge');
jest.mock('../../../utils/logger');

const { handleTaskResult } = require('../../../modules/workflow/orchestrator/orchestrator');
const { addNodeJob } = require('../../../config/rabbitmq.config');
const { stateManager } = require('../../../modules/workflow/orchestrator/stateManager');
const { dagScheduler } = require('../../../modules/workflow/orchestrator/dagScheduler');

describe('Orchestrator Performance Benchmark', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('benchmark sequential addNodeJob', async () => {
    const nextNodes = Array.from({ length: 50 }, (_, i) => ({
      nodeID: `node-${i}`,
      nodeType: 'task',
      nodeConfig: {}
    }));

    stateManager.getInstance.mockResolvedValue({
      instanceID: 'inst-1',
      workflowID: 'wf-1',
      contextData: {},
      version: 1
    });
    stateManager.updateContext.mockResolvedValue({
      contextData: {}
    });
    dagScheduler.calculateNextNodes.mockResolvedValue(nextNodes);
    dagScheduler.getWorkflowNodes.mockResolvedValue([{ nodeID: 'start-node', nodeType: 'start' }]);

    // Simulate a slow addNodeJob (10ms delay)
    addNodeJob.mockImplementation(() => {
      return new Promise(resolve => setTimeout(resolve, 10));
    });

    const result = {
      instanceID: 'inst-1',
      nodeID: 'start-node',
      nodeType: 'start',
      status: 'success'
    };

    const start = Date.now();
    await handleTaskResult(result);
    const end = Date.now();
    const duration = end - start;
    console.log(`Execution time: ${duration}ms`);
    console.log(`addNodeJob call count: ${addNodeJob.mock.calls.length}`);

    // Expect significantly less than 500ms for concurrent execution
    // With 10ms delay, it should be close to 10-50ms
    expect(duration).toBeLessThan(100);
  });
});
