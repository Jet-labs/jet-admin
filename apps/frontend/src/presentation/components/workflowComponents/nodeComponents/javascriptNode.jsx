import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

export const JavascriptNode = memo(({ data, isConnectable }) => {
  return (
    <div className="bg-white border rounded shadow-md min-w-[200px]">
      <div className="bg-yellow-50 px-3 py-1 border-b rounded-t text-xs font-bold text-yellow-700">
        JAVASCRIPT
      </div>
      <div className="p-3 text-sm font-mono">
        <div className="mb-2 font-bold font-sans">{data.label}</div>
        <div className="bg-gray-50 p-1 rounded text-xs truncate">
          {data.code}
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
