import React, { useCallback, useState } from 'react';
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useSocketState } from '../../../logic/contexts/socketContext';
import { CONSTANTS } from '../../../constants';
import { v4 as uuidv4 } from 'uuid';

// Node Types Registry
const nodeTypes = {
  dataQuery: DataQueryNode,
  javascript: JavascriptNode,
  condition: ConditionNode,
};

const initialNodes = [
  { id: '1', type: 'dataQuery', position: { x: 100, y: 100 }, data: { label: 'Get Users', queryId: 'get_users' } },
  { id: '2', type: 'javascript', position: { x: 100, y: 300 }, data: { label: 'Filter Active', code: 'return ctx.n1.filter(u => u.active)' } },
];
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];


const WorkflowBuilder = ({ workflowId }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [runStatus, setRunStatus] = useState(null);
  const { socket } = useSocketState();

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onAddNode = (type) => {
    const id = uuidv4();
    const position = {
      x: Math.random() * 400,
      y: Math.random() * 400,
    };
    
    let data = { label: 'New Node' };
    if (type === 'dataQuery') {
        data = { label: 'Data Query', queryId: '' };
    } else if (type === 'javascript') {
        data = { label: 'Values Script', code: 'return true;' };
    } else if (type === 'condition') {
        data = { label: 'Condition', condition: 'true' };
    }

    const newNode = {
      id,
      type,
      position,
      data,
    };
    
    setNodes((nds) => nds.concat(newNode));
  };

  const handleRun = async () => {
    try {
      setRunStatus("Starting...");
      
      const { runId } = await executeWorkflowAPI({ workflowID: workflowId, params: {} });
      setRunStatus(`Running: ${runId}`);
      
      if (socket) {
        socket.emit(CONSTANTS.SOCKET_RECEIVE_EVENTS.WORKFLOW_RUN_JOIN, { runId });
        
        socket.on("NODE_START", (data) => {
           console.log("Node Start", data);
           // TODO: Visually highlight node
        });
        
        socket.on("NODE_COMPLETE", (data) => {
           console.log("Node Complete", data);
           // TODO: Visually indicate completion
           if (data.result) {
             setRunStatus(`Node ${data.nodeId} Completed`);
           }
        });

        socket.on("WORKFLOW_COMPLETE", () => {
             setRunStatus("Workflow Completed Successfully");
        });

         socket.on("WORKFLOW_ERROR", (err) => {
             setRunStatus("Workflow Error: " + err.message);
        });
      }

    } catch (error) {
      console.error("Run Failed", error);
      setRunStatus("Failed: " + (error.message || "Unknown error"));
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] w-full">
      {/* Sidebar / Palette */}
      <div className="w-64 bg-white border-r p-4 flex flex-col gap-3 shadow-sm z-10">
        <h3 className="font-bold text-gray-700 text-sm uppercase mb-2">Tools</h3>
        <button 
          onClick={() => onAddNode('dataQuery')}
          className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100 transition-colors text-sm font-medium text-left"
        >
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          Add Query
        </button>
        <button 
          onClick={() => onAddNode('javascript')}
          className="flex items-center gap-2 px-3 py-2 bg-yellow-50 text-yellow-700 rounded border border-yellow-200 hover:bg-yellow-100 transition-colors text-sm font-medium text-left"
        >
          <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
          Add Script
        </button>
        <button 
          onClick={() => onAddNode('condition')}
          className="flex items-center gap-2 px-3 py-2 bg-orange-50 text-orange-700 rounded border border-orange-200 hover:bg-orange-100 transition-colors text-sm font-medium text-left"
        >
          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
          Add Condition
        </button>

        <div className="mt-auto pt-4 border-t">
            <button 
            onClick={handleRun}
            className="w-full bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition-colors font-medium"
            >
            Run Workflow
            </button>
            {runStatus && <div className="mt-2 text-xs bg-gray-100 p-2 rounded border break-all font-mono">{runStatus}</div>}
        </div>
      </div>
      
      {/* Canvas */}
      <div className="flex-1 h-full relative bg-gray-50">
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
        >
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
};

export default WorkflowBuilder;
