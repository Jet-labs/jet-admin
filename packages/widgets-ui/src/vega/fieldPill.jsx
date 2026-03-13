import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { getFieldTypeIcon } from './chartSpecGenerator';

import { Button } from "@jet-admin/ui";
/**
 * Get Tailwind CSS class for field type (Tableau-style color coding)
 */
const getTypeClass = (type) => {
  switch (type) {
    case 'quantitative': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'temporal': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'ordinal': return 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200';
    case 'nominal':
    default: return 'bg-blue-50 text-blue-700 border-blue-200';
  }
};

/**
 * FieldPill — A draggable, color-coded pill representing a data field.
 * Used in both the Data Panel (as source) and Encoding Shelves (as assigned fields).
 * 
 * Uses Tailwind CSS
 */
export const FieldPill = ({
  field,        // { name, type, icon? }
  onRemove,     // called when × is clicked (shelf mode)
  onClick,      // called when pill is clicked
  isDragging = false,
  isCompact = false,
  className = '',
}) => {
  const icon = field.icon || getFieldTypeIcon(field.type);
  const typeClass = getTypeClass(field.type);

  // Drag start — transfer field data
  const handleDragStart = useCallback((e) => {
    e.dataTransfer.setData('application/json', JSON.stringify(field));
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.style.opacity = '0.5';
  }, [field]);

  const handleDragEnd = useCallback((e) => {
    e.currentTarget.style.opacity = '1';
  }, []);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded font-medium cursor-grab shadow-sm border transition-shadow hover:shadow-md ${typeClass} ${isCompact ? 'px-1.5 py-0.5 text-[11px]' : 'px-2.5 py-1.5 text-xs'} ${isDragging ? 'opacity-50' : ''} ${className}`}
      title={`${field.name} (${field.type})`}
    >
      {/* Type icon */}
      <span className="opacity-70 font-mono scale-90">{icon}</span>

      {/* Field name */}
      <span className="truncate">{field.name}</span>

      {/* Aggregate badge */}
      {field.aggregate && field.aggregate !== 'none' && (
        <span className="text-[9px] uppercase tracking-wider bg-white/50 px-1 rounded ml-1 font-bold" title={`Aggregate: ${field.aggregate}`}>
          {field.aggregate.slice(0, 3)}
        </span>
      )}

      {/* Remove button */}
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-auto h-4 w-4 rounded-full hover:bg-black/10 text-xs text-slate-500"
          title="Remove"
        >
          &times;
        </Button>
      )}
    </div>
  );
};

FieldPill.propTypes = {
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    icon: PropTypes.string,
    aggregate: PropTypes.string,
  }).isRequired,
  onRemove: PropTypes.func,
  onClick: PropTypes.func,
  isDragging: PropTypes.bool,
  isCompact: PropTypes.bool,
  className: PropTypes.string,
};
