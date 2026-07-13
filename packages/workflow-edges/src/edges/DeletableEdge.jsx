import React, { useState } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, getSmoothStepPath, getStraightPath, getSimpleBezierPath } from 'reactflow';
import { useWorkflowEdge } from '../context';
import { Button, Input } from '@jet-admin/ui';

/**
 * Base Deletable Edge component that supports all edge path types
 * @param {string} pathType - 'bezier' | 'smoothstep' | 'straight' | 'step' | 'simplebezier'
 */
export default function DeletableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  data,
  pathType = 'smoothstep', // Default to smoothstep for best appearance
}) {
  const { deleteEdge, updateEdge } = useWorkflowEdge();

  // Calculate path based on pathType
  const getPath = () => {
    const pathParams = {
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    };

    switch (pathType) {
      case 'straight':
        return getStraightPath(pathParams);
      case 'step':
        return getSmoothStepPath({ ...pathParams, borderRadius: 0 });
      case 'smoothstep':
        return getSmoothStepPath(pathParams);
      case 'simplebezier':
        return getSimpleBezierPath(pathParams);
      case 'bezier':
      case 'default':
      default:
        return getBezierPath(pathParams);
    }
  };

  const [edgePath, labelX, labelY] = getPath();

  const [isEditing, setIsEditing] = useState(false);
  const [edgeLabel, setEdgeLabel] = useState(label || data?.label || "");

  const onEdgeClick = (evt) => {
    evt.stopPropagation();
    setIsEditing(true);
  };

  const onDeleteClick = (evt) => {
    evt.stopPropagation();
    if (deleteEdge) {
      deleteEdge(id);
    }
  };

  const onLabelChange = (evt) => {
    setEdgeLabel(evt.target.value);
  };

  const onLabelBlur = () => {
    setIsEditing(false);
    if (updateEdge) {
      updateEdge(id, { label: edgeLabel, data: { ...data, label: edgeLabel } });
    }
  };

  const onKeyDown = (evt) => {
    if (evt.key === 'Enter') {
      onLabelBlur();
    }
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {isEditing ? (
            <Input
              autoFocus
              value={edgeLabel}
              onChange={onLabelChange}
              onBlur={onLabelBlur}
              onKeyDown={onKeyDown}
              className="text-xs border border-brand-border rounded px-1 py-0.5 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-brand-black min-w-[60px] text-brand-text-primary placeholder:text-brand-text-primary"
              placeholder="Name edge"
            />
          ) : (
            <div className="flex items-center gap-1 group">
                <Button
                    className="w-5 h-5 bg-brand-black border border-brand-border rounded-full flex items-center justify-center cursor-pointer shadow-sm hover:bg-red-50 hover:border-red-200 transition-colors text-brand-text-primary hover:text-red-500 text-[10px]"
                    onClick={onDeleteClick}
                    title="Delete Edge"
                >
                    ✂
                </Button>
                <div 
                    onClick={onEdgeClick}
                  className={`px-1.5 py-0.5 rounded bg-brand-black border border-brand-border text-[10px] text-brand-text-primary shadow-sm cursor-text hover:border-blue-300 transition-colors ${!edgeLabel ? 'opacity-50 hover:opacity-100' : ''}`}
                >
                    {edgeLabel || "Name edge"}
                </div>
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
