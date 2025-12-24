import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { useWorkflowNodes } from '../context';
import { TbLogicAnd } from 'react-icons/tb';

export const ConditionNode = memo(({ data, isConnectable }) => {
  const { strings } = useWorkflowNodes();
  return (
    <div className="bg-white border-2 border-orange-200 rounded shadow-md min-w-[150px] hover:border-orange-400 transition-colors">
      <div className="bg-orange-50 px-3 py-1 border-b border-orange-100 rounded-t text-xs font-bold text-orange-700">
        {strings.WORKFLOW_EDITOR_CONDITION_NODE_LABEL }
      </div>
      <div className="p-3 text-sm">
        <div className="flex items-center gap-2 mb-2">
            <TbLogicAnd className="text-orange-500 text-lg" />
            <span className="font-bold text-slate-700">{data.label || 'Condition'}</span>
        </div>
        <div className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded break-all border border-gray-100">
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
