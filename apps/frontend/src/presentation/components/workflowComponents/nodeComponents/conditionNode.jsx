import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

export const ConditionNode = memo(({ data, isConnectable }) => {
  return (
    <div className="bg-white border-2 border-orange-200 rounded shadow-md min-w-[150px]">
      <div className="bg-orange-50 px-3 py-1 border-b border-orange-100 rounded-t text-xs font-bold text-orange-700">
        CONDITION
      </div>
      <div className="p-3 text-sm">
        {data.label || 'Condition'}
        <div className="text-xs text-gray-400 mt-1 font-mono bg-gray-50 p-1 rounded">
          {data.condition || 'true'}
        </div>
      </div>
      
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-gray-400"
      />
      
      {/* True Handle */}
      <div className="absolute -bottom-6 left-1/4 transform -translate-x-1/2 flex flex-col items-center">
        <span className="text-[10px] text-green-600 font-bold mb-1">TRUE</span>
        <Handle
          type="source"
          position={Position.Bottom}
          id="true"
          isConnectable={isConnectable}
          className="w-3 h-3 bg-green-500 !static transform-none"
        />
      </div>

      {/* False Handle */}
      <div className="absolute -bottom-6 right-1/4 transform translate-x-1/2 flex flex-col items-center">
        <span className="text-[10px] text-red-600 font-bold mb-1">FALSE</span>
        <Handle
          type="source"
          position={Position.Bottom}
          id="false"
          isConnectable={isConnectable}
          className="w-3 h-3 bg-red-500 !static transform-none"
        />
      </div>
    </div>
  );
});
