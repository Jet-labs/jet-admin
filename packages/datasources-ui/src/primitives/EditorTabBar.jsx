/**
 * EditorTabBar.jsx
 *
 * Reusable tab bar for dedicated editors.
 * Renders horizontal tabs with icons and optional badge counts.
 *
 * @param {Object}   props
 * @param {Array<{ id: string, label: string, icon: React.ComponentType }>} props.tabs
 * @param {string}   props.activeTab     — Currently active tab ID
 * @param {Function} props.onTabChange   — (tabId: string) => void
 * @param {Object}   [props.badges]      — Optional { [tabId]: number } badge counts
 */

import React from "react";

/** Badge count shown on tabs when rules are configured */
function TabBadge({ count }) {
  if (!count) return null;
  return (
    <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
      {count}
    </span>
  );
}

export const EditorTabBar = ({ tabs, activeTab, onTabChange, badges = {} }) => {
  return (
    <div className="flex items-center gap-0.5 border-b border-border pb-0 -mb-px">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {tab.label}
            <TabBadge count={badges[tab.id]} />
          </button>
        );
      })}
    </div>
  );
};
