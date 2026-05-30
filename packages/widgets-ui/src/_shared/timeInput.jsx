import React from 'react';
import { Input } from '@jet-admin/ui';
import { Clock } from 'lucide-react';

export function TimeInput({ hours = 0, minutes = 0, seconds = 0, onChange }) {
  const handleChange = (field, value) => {
    let num = parseInt(value, 10);
    if (isNaN(num)) num = 0;
    
    if (field === 'hours') {
      if (num > 23) num = 0;
      if (num < 0) num = 23;
    } else {
      if (num > 59) num = 0;
      if (num < 0) num = 59;
    }
    
    onChange({ hours, minutes, seconds, [field]: num });
  };

  const handleKeyDown = (e, field, value) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleChange(field, value + 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleChange(field, value - 1);
    }
  };

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-2 justify-center border-t border-border pt-3 mt-3">
      <Clock className="w-4 h-4 text-muted-foreground mr-1" />
      <Input 
        type="text" 
        value={pad(hours)} 
        onChange={(e) => handleChange('hours', e.target.value)}
        onKeyDown={(e) => handleKeyDown(e, 'hours', hours)}
        className="w-12 h-8 text-center px-1" 
      />
      <span className="text-muted-foreground">:</span>
      <Input 
        type="text" 
        value={pad(minutes)} 
        onChange={(e) => handleChange('minutes', e.target.value)}
        onKeyDown={(e) => handleKeyDown(e, 'minutes', minutes)}
        className="w-12 h-8 text-center px-1" 
      />
      <span className="text-muted-foreground">:</span>
      <Input 
        type="text" 
        value={pad(seconds)} 
        onChange={(e) => handleChange('seconds', e.target.value)}
        onKeyDown={(e) => handleKeyDown(e, 'seconds', seconds)}
        className="w-12 h-8 text-center px-1" 
      />
    </div>
  );
}
