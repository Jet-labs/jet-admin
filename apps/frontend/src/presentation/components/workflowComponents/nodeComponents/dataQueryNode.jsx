import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

export const DataQueryNode = memo(({ data, isConnectable }) => {
  return (
    <div className="bg-white border rounded shadow-md min-w-[150px]">
      <div className="bg-blue-50 px-3 py-1 border-b rounded-t text-xs font-bold text-blue-700">
        DATA QUERY
      </div>
      <div className="p-3 text-sm">
        {data.label}
        <div className="text-xs text-gray-500 mt-1">ID: {data.queryId}</div>
      </div>
      
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-400"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-400"
      />
    </div>
  );
});
