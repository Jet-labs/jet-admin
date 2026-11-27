import { evaluateConditions } from "./ConditionBuilder";

export const CONDITIONAL_TONE_CLASS = {
  neutral: "text-foreground",
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  danger: "text-destructive",
  info: "text-info",
};

export const CONDITIONAL_BG_CLASS = {
  neutral: "",
  primary: "bg-primary/10",
  success: "bg-success/10",
  warning: "bg-warning/10",
  danger: "bg-destructive/10",
  info: "bg-info/10",
};

export const EMPHASIS_CLASS = {
  normal: "",
  bold: "font-semibold",
  muted: "text-muted-foreground",
};

/**
 * Resolve a `{ logic, rules, style: { tone, emphasis } }` config against a
 * renderer context. Returns null when there are no rules or they do not match.
 */
export const resolveConditionalStyle = (config, context = {}) => {
  if (!config || !Array.isArray(config.rules) || config.rules.length === 0) return null;
  let matches = false;
  try {
    matches = evaluateConditions(config, context);
  } catch {
    matches = false;
  }
  if (!matches) return null;
  const tone = config.style?.tone || "neutral";
  const emphasis = config.style?.emphasis || "normal";
  const textClass = CONDITIONAL_TONE_CLASS[tone] || CONDITIONAL_TONE_CLASS.neutral;
  const bgClass = CONDITIONAL_BG_CLASS[tone] || "";
  const emphasisClass = EMPHASIS_CLASS[emphasis] || "";
  return {
    tone,
    emphasis,
    textClass,
    bgClass,
    emphasisClass,
    className: [textClass, bgClass, emphasisClass].filter(Boolean).join(" "),
    style: config.style || {},
  };
};

export default resolveConditionalStyle;
