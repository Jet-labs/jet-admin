import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

/**
 * ConfigEditorContext
 *
 * The single source of truth for the widget configurator chrome:
 * active tab, search, modified-from-default tracking, section persistence,
 * and a small undo/redo history. Type editors stay declarative by wrapping
 * fields in <ConfigField> and <ConfigSection>.
 */

const ConfigEditorContext = createContext(null);

const HISTORY_LIMIT = 50;
const HISTORY_DEBOUNCE_MS = 350;

const isPlainObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

export const cloneJson = (value) => {
  if (value === undefined) return undefined;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
};

const deepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const getStorageKey = (widgetType) => `jet.config.sections.${widgetType || "unknown"}`;

const readSectionState = (widgetType) => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(getStorageKey(widgetType));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeSectionState = (widgetType, state) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(getStorageKey(widgetType), JSON.stringify(state));
  } catch {
    /* storage may be unavailable; open state is a nicety, not a requirement */
  }
};

/** Dot/bracket path reader used by defaults and reset. */
export const getPath = (source, path) => {
  if (!source || !path) return undefined;
  const parts = String(path)
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter(Boolean);
  let cursor = source;
  for (const part of parts) {
    if (cursor === null || cursor === undefined) return undefined;
    cursor = cursor[part];
  }
  return cursor;
};

/** Dot/bracket path writer used by section reset. */
export const setPath = (source, path, value) => {
  const parts = String(path)
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter(Boolean);
  if (!parts.length) return value;
  const root = isPlainObject(source) ? cloneJson(source) : {};
  let cursor = root;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const key = parts[i];
    if (!isPlainObject(cursor[key]) && !Array.isArray(cursor[key])) {
      cursor[key] = /^\d+$/.test(parts[i + 1]) ? [] : {};
    }
    cursor = cursor[key];
  }
  cursor[parts[parts.length - 1]] = value;
  return root;
};

export const deletePath = (source, path) => {
  const parts = String(path)
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter(Boolean);
  if (!parts.length) return source;
  const root = cloneJson(source);
  let cursor = root;
  for (let i = 0; i < parts.length - 1; i += 1) {
    if (cursor === null || cursor === undefined) return root;
    cursor = cursor[parts[i]];
  }
  if (cursor && typeof cursor === "object") delete cursor[parts[parts.length - 1]];
  return root;
};

export const fieldMatchesQuery = (field, query) => {
  const term = String(query || "").trim().toLowerCase();
  if (!term) return true;
  const haystack = [
    field.label,
    field.helper,
    field.path,
    field.keywords,
    field.sectionLabel,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return term.split(/\s+/).every((token) => haystack.includes(token));
};

export const ConfigEditorProvider = ({
  widgetType,
  widgetEditorForm,
  defaultConfig = {},
  children,
  initialTab = "content",
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [query, setQuery] = useState("");
  const [showChanged, setShowChanged] = useState(false);
  const [fields, setFields] = useState([]);
  const [sectionOpen, setSectionOpen] = useState(() => readSectionState(widgetType));
  const [historyVersion, setHistoryVersion] = useState(0);

  const formRef = useRef(widgetEditorForm);
  formRef.current = widgetEditorForm;

  useEffect(() => {
    setQuery("");
    setActiveTab("content");
    setShowChanged(false);
    setSectionOpen(readSectionState(widgetType));
    pastRef.current = [];
    futureRef.current = [];
    setHistoryVersion((value) => value + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetType]);

  const config = widgetEditorForm?.values?.widgetConfig || {};
  const configKey = useMemo(() => {
    try {
      return JSON.stringify(config) || "{}";
    } catch {
      return "{}";
    }
  }, [config]);

  const lastKeyRef = useRef(configKey);
  const applyingHistoryRef = useRef(false);
  const pastRef = useRef([]);
  const futureRef = useRef([]);

  useEffect(() => {
    // A type change replaces the whole config; start a fresh history baseline.
    lastKeyRef.current = configKey;
    applyingHistoryRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetType]);

  // Group rapid edits into one undo step. The snapshot is the value *before*
  // the burst started, so Cmd/Ctrl+Z restores a meaningful state.
  useEffect(() => {
    if (applyingHistoryRef.current) {
      applyingHistoryRef.current = false;
      lastKeyRef.current = configKey;
      return undefined;
    }
    if (lastKeyRef.current === configKey) return undefined;
    const timer = setTimeout(() => {
      pastRef.current = [...pastRef.current.slice(-(HISTORY_LIMIT - 1)), lastKeyRef.current];
      futureRef.current = [];
      lastKeyRef.current = configKey;
      setHistoryVersion((v) => v + 1);
    }, HISTORY_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [configKey]);

  const applySnapshot = useCallback((snapshot) => {
    const form = formRef.current;
    if (!form) return;
    applyingHistoryRef.current = true;
    lastKeyRef.current = snapshot;
    form.setFieldValue("widgetConfig", JSON.parse(snapshot));
    setHistoryVersion((v) => v + 1);
  }, []);

  const undo = useCallback(() => {
    if (!pastRef.current.length) return;
    const previous = pastRef.current.pop();
    futureRef.current.push(lastKeyRef.current);
    applySnapshot(previous);
  }, [applySnapshot]);

  const redo = useCallback(() => {
    if (!futureRef.current.length) return;
    const next = futureRef.current.pop();
    pastRef.current.push(lastKeyRef.current);
    applySnapshot(next);
  }, [applySnapshot]);

  const registerField = useCallback((field) => {
    setFields((prev) => {
      const next = prev.filter((item) => item.id !== field.id);
      next.push(field);
      return next;
    });
    return () => {
      setFields((prev) => prev.filter((item) => item.id !== field.id));
    };
  }, []);

  const getDefaultValue = useCallback(
    (path) => (path ? getPath(defaultConfig, path) : undefined),
    [defaultConfig]
  );

  const isFieldModified = useCallback(
    (field) => {
      if (!field?.path) return false;
      const current = getPath(config, field.path);
      const fallback = field.defaultValue !== undefined ? field.defaultValue : getDefaultValue(field.path);
      if (current === undefined || current === null) return false;
      if (fallback === undefined) {
        return current !== "" && !(Array.isArray(current) && current.length === 0);
      }
      return !deepEqual(current, fallback);
    },
    [config, getDefaultValue]
  );

  const resetField = useCallback(
    (field) => {
      const form = formRef.current;
      if (!form || !field?.path) return;
      const fallback = field.defaultValue !== undefined ? field.defaultValue : getDefaultValue(field.path);
      if (fallback === undefined) {
        form.setFieldValue("widgetConfig", deletePath(form.values.widgetConfig || {}, field.path));
      } else {
        form.setFieldValue("widgetConfig", setPath(form.values.widgetConfig || {}, field.path, cloneJson(fallback)));
      }
    },
    [getDefaultValue]
  );

  const resetTab = useCallback(
    (tab) => {
      const form = formRef.current;
      if (!form) return;
      const tabFields = fields.filter((field) => field.tab === tab && field.path);
      if (!tabFields.length) return;
      let next = cloneJson(form.values.widgetConfig || {});
      for (const field of tabFields) {
        const fallback = field.defaultValue !== undefined ? field.defaultValue : getDefaultValue(field.path);
        next = fallback === undefined ? deletePath(next, field.path) : setPath(next, field.path, cloneJson(fallback));
      }
      form.setFieldValue("widgetConfig", next);
    },
    [fields, getDefaultValue]
  );

  const toggleSection = useCallback(
    (sectionId, nextOpen) => {
      setSectionOpen((prev) => {
        const next = { ...prev, [sectionId]: nextOpen };
        writeSectionState(widgetType, next);
        return next;
      });
    },
    [widgetType]
  );

  const visibleFields = useMemo(
    () =>
      fields.filter((field) => {
        if (!fieldMatchesQuery(field, query)) return false;
        if (showChanged && !isFieldModified(field)) return false;
        return true;
      }),
    [fields, query, showChanged, isFieldModified]
  );

  const changedCount = useMemo(
    () => fields.filter((field) => field.path && isFieldModified(field)).length,
    [fields, isFieldModified]
  );

  const value = useMemo(
    () => ({
      widgetType,
      widgetEditorForm,
      config,
      defaultConfig,
      activeTab,
      setActiveTab,
      query,
      setQuery,
      showChanged,
      setShowChanged,
      fields,
      visibleFields,
      changedCount,
      registerField,
      isFieldModified,
      getDefaultValue,
      resetField,
      resetTab,
      fieldMatches: (field) => fieldMatchesQuery(field, query),
      sectionOpen,
      toggleSection,
      undo,
      redo,
      canUndo: pastRef.current.length > 0,
      canRedo: futureRef.current.length > 0,
      historyVersion,
      setConfig: (nextConfig) => formRef.current?.setFieldValue("widgetConfig", nextConfig),
    }),
    [
      widgetType,
      widgetEditorForm,
      config,
      defaultConfig,
      activeTab,
      query,
      showChanged,
      fields,
      visibleFields,
      changedCount,
      registerField,
      isFieldModified,
      getDefaultValue,
      resetField,
      resetTab,
      sectionOpen,
      toggleSection,
      undo,
      redo,
      historyVersion,
    ]
  );

  return <ConfigEditorContext.Provider value={value}>{children}</ConfigEditorContext.Provider>;
};

export const useConfigEditor = () => {
  const context = useContext(ConfigEditorContext);
  if (!context) {
    throw new Error("useConfigEditor must be used inside <ConfigEditorProvider>");
  }
  return context;
};

export const useConfigEditorOptional = () => useContext(ConfigEditorContext);

/**
 * Read/write a widgetConfig path without repeating Formik plumbing.
 */
export const useConfigValue = (path, defaultValue) => {
  const context = useConfigEditorOptional();
  const form = context?.widgetEditorForm;
  const config = form?.values?.widgetConfig || {};
  const value = path ? getPath(config, path) : undefined;
  const setValue = useCallback(
    (nextValue) => {
      if (!form || !path) return;
      form.setFieldValue(`widgetConfig.${path}`, nextValue);
    },
    [form, path]
  );
  return [value === undefined ? defaultValue : value, setValue];
};

export default ConfigEditorContext;
