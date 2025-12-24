import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { useWorkflowNodes } from '../context';
import { FaJs } from 'react-icons/fa';

export const JavascriptNode = memo(({ data, isConnectable }) => {
  const { strings } = useWorkflowNodes();
  return (
    <div className="bg-white border rounded shadow-md min-w-[200px] hover:border-yellow-400 transition-colors">
      <div className="bg-yellow-50 px-3 py-1 border-b rounded-t text-xs font-bold text-yellow-700 flex justify-between items-center">
        <span>{strings.WORKFLOW_EDITOR_JAVASCRIPT_NODE_LABEL}</span>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
            <FaJs className="text-yellow-500 text-lg" />
            <span className="font-bold text-sm text-slate-700 break-all">{data.label || 'Script'}</span>
        </div>
        <div className="text-[10px] text-slate-400 font-mono bg-slate-50 p-1.5 rounded truncate">
          {data.code ? `${data.code.substring(0, 30)}...` : '// No code'}
        </div>
      </div>
      
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-yellow-400"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-yellow-400"
      />
    </div>
  );
});
