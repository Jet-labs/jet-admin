const {
  buildWorkflowGraphPersistencePayload,
} = require('../../../modules/workflow/workflow.service');

describe('workflow.service graph persistence payload', () => {
  it('maps workflow graph nodes and edges into persistence payloads', () => {
    const result = buildWorkflowGraphPersistencePayload({
      workflowID: 'workflow-1',
      nodes: [
        {
          id: 'node-1',
          type: 'dataQuery',
          data: { title: 'Load customers' },
          position: { x: 10, y: 20 },
          width: 100,
          height: 80,
          measured: { width: 100, height: 80 },
        },
      ],
      edges: [
        {
          source: 'node-1',
          target: 'node-2',
          sourceHandle: 'success',
          targetHandle: 'input',
          type: 'smoothstep',
          label: 'next',
          style: { stroke: '#333' },
          animated: true,
          data: { branch: 'success' },
        },
      ],
    });

    expect(result.nodeCreateManyData).toEqual([
      {
        nodeID: 'node-1',
        workflowID: 'workflow-1',
        nodeType: 'dataQuery',
        nodeConfig: {
          title: 'Load customers',
          position: { x: 10, y: 20 },
          width: 100,
          height: 80,
          measured: { width: 100, height: 80 },
        },
      },
    ]);

    expect(result.edgeCreateManyData).toEqual([
      {
        workflowID: 'workflow-1',
        upstreamNodeID: 'node-1',
        downstreamNodeID: 'node-2',
        sourceHandle: 'success',
        targetHandle: 'input',
        edgeType: 'smoothstep',
        edgeConfig: {
          label: 'next',
          style: { stroke: '#333' },
          animated: true,
          data: { branch: 'success' },
        },
      },
    ]);
  });
});