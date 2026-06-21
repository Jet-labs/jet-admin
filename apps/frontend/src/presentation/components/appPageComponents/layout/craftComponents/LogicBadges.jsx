/**
 * LogicBadges.jsx
 *
 * Small inline badge shown on layout nodes that have condition or repeat configured.
 */
import React from "react";
import { Eye, Repeat } from "lucide-react";

export function LogicBadges({ condition, repeat }) {
  const hasCondition = !!condition;
  const hasRepeat = !!repeat;
  if (!hasCondition && !hasRepeat) return null;

  return (
    <div className="flex items-center gap-2 select-none">
      {hasCondition && (
        <span
          className="inline-flex items-center gap-0.5 px-1 py-px rounded text-[8px] font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30"
          title={`Condition: ${condition}`}
        >
          <Eye style={{ width: 8, height: 8 }} />
          If
        </span>
      )}
      {hasRepeat && (
        <span
          className="inline-flex items-center gap-0.5 px-1 py-px rounded text-[8px] font-semibold uppercase tracking-wider bg-violet-500/20 text-violet-400 border border-violet-500/30"
          title={`Repeat: ${repeat.collection} as ${repeat.itemAlias}`}
        >
          <Repeat style={{ width: 8, height: 8 }} />
          Loop
        </span>
      )}
    </div>
  );
}
