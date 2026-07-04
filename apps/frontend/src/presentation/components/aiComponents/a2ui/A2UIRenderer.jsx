/* eslint-disable react/prop-types, no-empty, no-unused-vars */
import React, { useMemo } from "react";
import {
  A2UICard,
  A2UIConfirmCard,
  A2UIChoiceSelector,
  A2UICodeView,
  A2UIChart,
  A2UISteps,
  A2UIStat,
  A2UITable,
  A2UIAlert,
} from "./A2UICatalog";

/**
 * Extracts and parses A2UI JSON payload from text or object.
 * Returns an array of parsed A2UI schema objects.
 */
export function extractA2UISchemas(input) {
  if (!input) return [];

  if (typeof input === "object") {
    if (input.type) return [input];
    if (Array.isArray(input.schemas)) return input.schemas;
    return [];
  }

  if (typeof input !== "string") return [];

  const schemas = [];
  const regex = /```a2ui\s*([\s\S]*?)\s*```/g;
  let match;
  while ((match = regex.exec(input)) !== null) {
    try {
      const json = JSON.parse(match[1].trim());
      if (json && typeof json === "object") {
        schemas.push(json);
      }
    } catch (err) {}
  }

  if (schemas.length === 0 && input.trim().startsWith("{")) {
    try {
      const json = JSON.parse(input.trim());
      if (json && json.type) schemas.push(json);
    } catch (err) {}
  }

  return schemas;
}

export function A2UIRenderer({ schema, onAction, submitting = false }) {
  const schemas = useMemo(() => extractA2UISchemas(schema), [schema]);

  if (!schemas || schemas.length === 0) return null;

  return (
    <div className="space-y-3 my-2">
      {schemas.map((s, idx) => {
        const type = s.type?.toLowerCase() || "card";

        // 1. Confirmation Card (Human-in-the-Loop)
        if (type === "confirm" || type === "confirmation") {
          return (
            <A2UIConfirmCard
              key={idx}
              title={s.title}
              description={s.description}
              toolName={s.toolName || s.tool}
              params={s.params}
              onAction={onAction}
              submitting={submitting}
            />
          );
        }

        // 2. Choice Selector / Multi-Choice Grid
        if (type === "choice" || type === "choices" || type === "selector") {
          return (
            <A2UIChoiceSelector
              key={idx}
              title={s.title}
              description={s.description}
              choices={s.choices || s.options || []}
              onAction={onAction}
              submitting={submitting}
            />
          );
        }

        // 3. Syntax Highlighted Code / SQL Viewer
        if (type === "code" || type === "sql" || type === "json_view") {
          return (
            <A2UICodeView
              key={idx}
              title={s.title}
              language={s.language || "sql"}
              code={s.code || s.content || ""}
              actions={s.actions || []}
              onAction={onAction}
              submitting={submitting}
            />
          );
        }

        // 4. Data Visualization Chart (Bar, Line, Donut)
        if (type === "chart" || type === "graph") {
          return (
            <A2UIChart
              key={idx}
              title={s.title}
              chartType={s.chartType || s.variant || "bar"}
              data={s.data || s.points || []}
            />
          );
        }

        // 5. Multi-Step Workflow Progress
        if (type === "steps" || type === "progress") {
          return (
            <A2UISteps
              key={idx}
              title={s.title}
              steps={s.steps || s.items || []}
            />
          );
        }

        // 6. Metric Stat Card
        if (type === "stat") {
          return (
            <A2UIStat
              key={idx}
              title={s.title}
              label={s.label}
              value={s.value}
              trend={s.trend}
              change={s.change}
            />
          );
        }

        // 7. Table Grid
        if (type === "table") {
          return (
            <A2UITable
              key={idx}
              title={s.title}
              columns={s.columns || []}
              rows={s.rows || []}
            />
          );
        }

        // 8. Alert Banner
        if (type === "alert") {
          return (
            <A2UIAlert
              key={idx}
              title={s.title}
              description={s.description}
              variant={s.variant}
            />
          );
        }

        // Default: Card / Form
        return (
          <A2UICard
            key={idx}
            title={s.title}
            description={s.description}
            fields={s.fields || []}
            actions={s.actions || []}
            onAction={onAction}
            submitting={submitting}
          />
        );
      })}
    </div>
  );
}
