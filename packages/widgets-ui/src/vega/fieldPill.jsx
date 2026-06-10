import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { getFieldTypeIcon } from './chartSpecGenerator';
import { Hash, Type, Calendar, ArrowUpDown, X } from 'lucide-react';

/**
 * Get consistent Lucide icon for field type
 */
const getTypeIconComponent = (type) => {
  switch (type) {
    case 'quantitative': return <Hash className="w-3 h-3 shrink-0" />;
    case 'temporal': return <Calendar className="w-3 h-3 shrink-0" />;
    case 'ordinal': return <ArrowUpDown className="w-3 h-3 shrink-0" />;
    case 'nominal':
    default: return <Type className="w-3 h-3 shrink-0" />;
  }
};

/**
 * Get Tailwind CSS class for field type — dark-mode compatible
 */
const getTypeClass = (type) => {
  switch (type) {
    case 'quantitative': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25';
    case 'temporal': return 'bg-amber-500/15 text-amber-400 border-amber-500/25';
    case 'ordinal': return 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/25';
    case 'nominal':
    default: return 'bg-blue-500/15 text-blue-400 border-blue-500/25';
  }
};

/**
 * FieldPill — A draggable, color-coded pill representing a data field.
 * Used in both the Data Panel (as source) and Encoding Shelves (as assigned fields).
 */
export const FieldPill = ({
  field,        // { name, type, icon? }
  onRemove,     // called when × is clicked (shelf mode)
  onClick,      // called when pill is clicked
  isDragging = false,
  isCompact = false,
  className = '',
}) => {
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
      className={`flex items-center gap-1.5 rounded font-medium cursor-grab border transition-colors hover:brightness-110 max-w-full min-w-0 ${typeClass} ${isCompact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-[11px]'} ${isDragging ? 'opacity-50' : ''} ${className}`}
      title={`${field.name} (${field.type})`}
    >
      {/* Type icon */}
      {getTypeIconComponent(field.type)}

      {/* Field name */}
      <span className="truncate min-w-0">{field.name}</span>

      {/* Aggregate badge */}
      {field.aggregate && field.aggregate !== 'none' && (
        <span className="text-[8px] uppercase tracking-wider bg-background/10 px-1 py-px rounded font-bold ml-auto shrink-0" title={`Aggregate: ${field.aggregate}`}>
          {field.aggregate.slice(0, 3)}
        </span>
      )}

      {/* Remove button */}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-auto h-3.5 w-3.5 rounded-sm flex items-center justify-center hover:bg-background/20 shrink-0"
          title="Remove"
        >
          <X className="w-2.5 h-2.5" />
        </button>
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
