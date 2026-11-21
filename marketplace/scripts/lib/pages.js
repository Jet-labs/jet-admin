/**
 * Widget, page, workflow, listener, cron and role builders.
 * Kept separate from the schema/seed/query generator for readability.
 */
const { deterministicUUID, titleCase } = require("./util");
const {
  coreEntities,
  statusField,
  labelField,
  ownerField,
  amountField,
  dateField,
} = require("./model");

function expr(body) {
  return `{{ ${body} }}`;
}

function rows(alias) {
  return `((state.queries.${alias} || {}).data || [])`;
}

function rowField(alias, field, index = 0) {
  return `((((state.queries.${alias} || {}).data || [])[${index}] || {}).${field})`;
}

function qid(spec, slug) {
  return deterministicUUID(`${spec.slug}:dataQuery:${slug}`);
}

function wid(spec, slug) {
  return deterministicUUID(`${spec.slug}:widget:${slug}`);
}

function wfid(spec, slug) {
  return deterministicUUID(`${spec.slug}:workflow:${slug}`);
}

function nid(spec, slug, node) {
  return deterministicUUID(`${spec.slug}:node:${slug}:${node}`);
}

function eid(spec, slug, index) {
  return deterministicUUID(`${spec.slug}:edge:${slug}:${index}`);
}

function slotId(spec, pageSlug, index) {
  return deterministicUUID(`${spec.slug}:slot:${pageSlug}:${index}`);
}

function setVar(key, value) {
  return { actionType: "SET_VARIABLE", config: { key: `state.variables.${key}`, value } };
}

function execute(alias, inputValues, toasts = {}) {
  return {
    actionType: "EXECUTE_QUERY",
    config: { alias, inputValues: inputValues || {}, ...toasts },
  };
}

function trigger(spec, workflowSlug, inputValues, toasts = {}) {
  return {
    actionType: "TRIGGER_WORKFLOW",
    config: {
      workflowID: wfid(spec, workflowSlug),
      inputValues: inputValues || {},
      ...toasts,
    },
  };
}

function createWidget(ctx, spec, pageSlug, key, title, type, config) {
  const slug = `${pageSlug}.${key}`;
  const widget = {
    slug,
    key,
    page: pageSlug,
    title,
    type,
    config: { showHeader: true, ...config },
  };
  ctx.widgets.push(widget);
  return { widget, widgetKey: `widget_${wid(spec, slug)}_1` };
}

function buildPage(ctx, spec, definition) {
  const slug = `${spec.alias}-${definition.key}`;
  const state = {
    slug,
    rows: [],
    slots: [],
    counter: 0,
    add(widgetRef, span = 12, options = {}) {
      const slot = {
        id: slotId(spec, slug, state.counter++),
        type: "widget",
        widgetKey: widgetRef.widgetKey,
        span,
        sizing: options.sizing || "fill",
        ...(options.minHeight ? { minHeight: options.minHeight } : {}),
        ...(options.condition ? { condition: options.condition } : {}),
      };
      state.slots.push(slot);
      return slot;
    },
    row(...items) {
      state.rows.push({
        id: deterministicUUID(`${spec.slug}:row:${slug}:${state.rows.length}`),
        type: "row",
        sizing: "auto",
        children: items,
      });
    },
    widget(key, title, type, config) {
      const ref = createWidget(ctx, spec, slug, key, title, type, config);
      ref.add = (span, options) => state.add(ref, span, options);
      return ref;
    },
  };
  definition.build(state);
  const page = {
    slug,
    key: definition.key,
    title: definition.title,
    description: definition.description,
    accessTags: definition.tags,
    variables: definition.variables,
    sources: definition.sources,
    appPageConfig: {
      layoutVersion: 2,
      layout: { id: "root", type: "column", children: state.rows },
      layouts: {},
      widgets: state.slots,
      variables: definition.variables,
      dataSources: definition.sources,
    },
  };
  ctx.pages.push(page);
  return page;
}

function source(spec, alias, querySlug, options = {}) {
  return {
    alias,
    type: "query",
    queryID: qid(spec, querySlug),
    triggerMode: options.triggerMode || "auto",
    inputValues: options.inputs || {},
    refreshOn: options.refreshOn || [],
    refetchInterval: null,
  };
}

function statusOptions(field) {
  return field.values.map((value) => ({ label: titleCase(value), value }));
}

function columnDefs(entity, options = {}) {
  const skip = new Set(["total_count", "deleted_at", ...(options.skip || [])]);
  return entity.fields
    .filter((f) => !skip.has(f.key))
    .map((field) => ({
      key: field.key,
      label: field.label || titleCase(field.key),
      sortable: ["text", "code", "int", "money", "decimal", "date", "timestamptz", "enum"].includes(field.type),
      type: field.type === "enum" ? "badge" : field.type === "money" || field.type === "decimal" ? "number" : field.type === "int" ? "number" : field.type === "bool" ? "boolean" : field.type === "date" || field.type === "timestamptz" ? "date" : field.type === "url" ? "link" : "text",
      editable: options.editable !== false && ["text", "longtext", "email", "phone", "url", "code", "int", "money", "decimal", "bool", "date", "timestamptz", "enum"].includes(field.type),
      ...(field.type === "money" || field.type === "decimal" ? { format: "0,0.00" } : {}),
    }));
}

function tableConfig(entity, alias, options = {}) {
  const st = options.statusField;
  const label = options.labelField;
  return {
    dataArrayTemplate: rows(alias),
    columns: columnDefs(entity, { editable: options.editable }),
    pagination: {
      enabled: true,
      pageParam: "page",
      pageSize: options.pageSize || 10,
      totalTemplate: `{{ ((state.queries.${alias} || {}).data && (state.queries.${alias} || {}).data[0] ? (state.queries.${alias} || {}).data[0].total_count : 0) }}`,
    },
    search: { enabled: true, serverSide: true, placeholder: `Search ${entity.plural || entity.title}...` },
    export: { enabled: true, format: "csv", serverSide: false, buttonLabel: "Export CSV" },
    editing: { enabled: options.editable !== false },
    bulkEdit: { enabled: false, saveLabel: "Save changes" },
    multiSelect: {
      enabled: true,
      showSelectAll: true,
      actions: [{ label: "Archive selected", actionKey: "archive", variant: "destructive" }],
    },
    emptyText: options.emptyText || `No ${entity.plural || entity.title} found.`,
    emptyHint: "Adjust the filters or create a new record.",
    isLoading: expr(`(state.queries.${alias} || {}).isLoading || false`),
    ...(options.events ? { events: options.events } : {}),
  };
}

function tableWidgetDefinition(entity, alias, options = {}) {
  return {
    type: "table",
    config: tableConfig(entity, alias, options),
  };
}

function buildListPage(ctx, spec, entity, index) {
  const pageSlug = `${spec.alias}-${entity.key}-list`;
  const st = statusField(entity);
  const label = labelField(entity);
  const owner = ownerField(entity);
  const amount = amountField(entity);
  const listAlias = entity.key;
  const statsAlias = `${entity.key}_stats`;
  const viewsAlias = `${entity.key}_views`;
  const detailAlias = `${entity.key}_selected`;
  const updateAlias = `${entity.key}_update`;
  const deleteAlias = `${entity.key}_delete`;
  const statusAlias = `${entity.key}_status`;
  const analytics = coreEntities(spec).findIndex((e) => e.key === entity.key) < 2;
  const variables = [
    { key: "search", type: "string", defaultValue: "" },
    { key: "status", type: "string", defaultValue: "" },
    { key: "page", type: "number", defaultValue: 1 },
    { key: "sortBy", type: "string", defaultValue: label },
    { key: "sortDir", type: "string", defaultValue: "asc" },
    { key: "dateFrom", type: "string", defaultValue: "" },
    { key: "dateTo", type: "string", defaultValue: "" },
    { key: "selectedID", type: "number", defaultValue: 1 },
  ];
  const listInputs = {
    search: expr("state.variables.search"),
    page: expr("state.variables.page"),
    limit: 10,
    sortBy: expr("state.variables.sortBy"),
    sortDir: expr("state.variables.sortDir"),
    dateFrom: expr("state.variables.dateFrom"),
    dateTo: expr("state.variables.dateTo"),
  };
  if (st) listInputs.status = expr("state.variables.status");
  const sources = [
    source(spec, listAlias, `${spec.alias}.${entity.key}.list`, {
      triggerMode: "reactive",
      inputs: listInputs,
      refreshOn: ["variables.search", "variables.status", "variables.page", "variables.sortBy", "variables.sortDir", "variables.dateFrom", "variables.dateTo"],
    }),
    ...(analytics ? [source(spec, statsAlias, `${spec.alias}.${entity.key}.stats`, {
      inputs: { dateFrom: expr("state.variables.dateFrom"), dateTo: expr("state.variables.dateTo") },
      refreshOn: ["variables.dateFrom", "variables.dateTo"],
    })] : []),
    source(spec, viewsAlias, `${spec.alias}.shared.saved_views`, {
      inputs: { prefix: `saved_view.${spec.alias}-${entity.key}-list` },
    }),
    source(spec, detailAlias, `${spec.alias}.${entity.key}.detail`, {
      triggerMode: "reactive",
      inputs: { id: expr("state.variables.selectedID") },
      refreshOn: ["variables.selectedID"],
    }),
    source(spec, updateAlias, `${spec.alias}.${entity.key}.update`, { triggerMode: "manual" }),
    source(spec, deleteAlias, `${spec.alias}.${entity.key}.delete`, { triggerMode: "manual" }),
    ...(st ? [source(spec, statusAlias, `${spec.alias}.${entity.key}.status`, { triggerMode: "manual" })] : []),
  ];

  buildPage(ctx, spec, {
    key: `${entity.key}-list`,
    title: `${entity.title} · list`,
    description: `Server-side list, filters, inline edit and bulk actions for ${entity.title.toLowerCase()}.`,
    tags: ["core", "staff", "manager", "admin"],
    variables,
    sources,
    build(page) {
      page.row(page.widget("heading", entity.title, "text", {
        content: `# ${entity.title}\nBrowse, filter and update ${entity.plural || entity.title.toLowerCase()}. All edits are audit-logged and soft-deleted records can be restored from the record detail page.`,
        format: "markdown",
        showHeader: false,
      }).add(12));

      page.row(
        page.widget("search", "Search", "search-input", {
          placeholder: `Search ${entity.title.toLowerCase()}...`,
          debounceMs: 350,
          showHeader: false,
          events: { onSearch: [setVar("search", expr("event.searchTerm || ''")), setVar("page", 1)] },
        }).add(4, { minHeight: 56 }),
        ...(st ? [page.widget("status", "Status filter", "select", {
          label: "",
          placeholder: "All statuses",
          defaultValue: "all",
          options: [{ label: "All statuses", value: "all" }, ...statusOptions(st)],
          showHeader: false,
          events: { onChange: [setVar("status", expr("event.value === 'all' ? '' : event.value")), setVar("page", 1)] },
        }).add(3, { minHeight: 56 })] : []),
        page.widget("range", "Date range", "date-range-picker", {
          label: "",
          showHeader: false,
          events: {
            onChange: [setVar("dateFrom", expr("event.startDate || ''")), setVar("dateTo", expr("event.endDate || ''")), setVar("page", 1)],
            onClear: [setVar("dateFrom", ""), setVar("dateTo", ""), setVar("page", 1)],
          },
        }).add(3, { minHeight: 56 }),
        page.widget("sort", "Sort", "select", {
          label: "",
          placeholder: "Sort by",
          defaultValue: label,
          options: entity.fields.filter((f) => ["text", "code", "int", "money", "decimal", "date", "timestamptz"].includes(f.type)).slice(0, 6).map((f) => ({ label: titleCase(f.key), value: f.key })),
          showHeader: false,
          events: { onChange: [setVar("sortBy", expr("event.value")), setVar("page", 1)] },
        }).add(2, { minHeight: 56 })
      );

      page.row(
        ...(analytics ? [
          page.widget("total", "Total records", "stat", {
            label: "Total records",
            valueTemplate: expr(rowField(statsAlias, "total")),
            isLoading: expr(`(state.queries.${statsAlias} || {}).isLoading || false`),
          }).add(3, { minHeight: 120 }),
          ...(amount ? [page.widget("value", "Total value", "stat", {
            label: "Total value",
            valueTemplate: expr(rowField(statsAlias, "total_value")),
            prefix: "$",
            isLoading: expr(`(state.queries.${statsAlias} || {}).isLoading || false`),
          }).add(3, { minHeight: 120 })] : []),
          page.widget("avg", "Average", "stat", {
            label: amount ? "Average value" : "Visible rows",
            valueTemplate: amount ? expr(rowField(statsAlias, "average_value")) : expr(rowField(statsAlias, "total")),
            prefix: amount ? "$" : "",
            isLoading: expr(`(state.queries.${statsAlias} || {}).isLoading || false`),
          }).add(3, { minHeight: 120 }),
        ] : []),
        page.widget("selected", "Selected record", "key-value", {
          label: "Selected record",
          dataTemplate: expr(`(((state.queries.${detailAlias} || {}).data || [])[0] || {})`),
          columns: 1,
          emptyText: "Select a row to inspect it.",
          isLoading: expr(`(state.queries.${detailAlias} || {}).isLoading || false`),
        }).add(analytics ? 3 : 12, { minHeight: 120 })
      );

      page.row(
        page.widget("table", entity.title, "table", {
          ...tableWidgetDefinition(entity, listAlias, {
            statusField: st,
            labelField: label,
            events: {
              onRowSelect: [setVar("selectedID", expr("event.row.id"))],
              onPageChange: [setVar("page", expr("event.page"))],
              onSearch: [setVar("search", expr("event.searchTerm || ''")), setVar("page", 1)],
              onRowSave: [execute(updateAlias, {
                id: expr("event.originalRow.id"),
                ...Object.fromEntries(entity.fields.map((f) => [f.key, expr(`event.updatedRow.${f.key}`)])),
              }, { successToast: "Record updated", errorToast: "Update failed" })],
              onBulkAction: [execute(deleteAlias, { ids: expr("event.selectedRows.map(function (r) { return r.id; })") }, { successToast: "Records archived", errorToast: "Archive failed" })],
            },
          }).config,
        }).add(9, { minHeight: 460 }),
        page.widget("actions", "Selected record actions", "key-value", {
          label: "Selected record actions",
          dataTemplate: expr(`(((state.queries.${detailAlias} || {}).data || [])[0] || {})`),
          columns: 1,
          emptyText: "Select a row, then use the buttons below.",
        }).add(3, { minHeight: 460 })
      );

      page.row(
        page.widget("archive", "Archive selected", "button", {
          text: "Archive selected",
          variant: "destructive",
          showHeader: false,
          events: {
            onClick: [execute(deleteAlias, { ids: expr("[state.variables.selectedID]") }, { successToast: "Record archived", errorToast: "Archive failed" })],
          },
        }).add(3, { minHeight: 48 }),
        ...(st ? [page.widget("advance", "Advance status", "button", {
          text: "Advance status",
          showHeader: false,
          events: {
            onClick: [execute(statusAlias, {
              id: expr("state.variables.selectedID"),
              status: expr(`"${st.values[Math.min(1, st.values.length - 1)]}"`),
            }, { successToast: "Status updated", errorToast: "Status update failed" })],
          },
        }).add(3, { minHeight: 48 })] : []),
        page.widget("explain", "List notes", "text", {
          content: "Rows are loaded server-side. Use the table toolbar to search, sort and export the current view. Inline edits and bulk actions run the template's parameterized update queries and write to the audit log.",
          format: "plain",
          showHeader: false,
        }).add(6)
      );

      page.row(
        page.widget("views", "Saved views", "table", {
          dataArrayTemplate: rows(viewsAlias),
          columns: [
            { key: "label", label: "View", type: "text", sortable: false },
            { key: "config_key", label: "Key", type: "text", sortable: false },
          ],
          pagination: { enabled: false, pageSize: 5 },
          search: { enabled: true, serverSide: false, placeholder: "Filter saved views" },
          export: { enabled: false },
          editing: { enabled: false },
          multiSelect: { enabled: false },
          emptyText: "No saved views yet.",
          isLoading: expr(`(state.queries.${viewsAlias} || {}).isLoading || false`),
          events: {
            onRowSelect: [
              setVar("search", expr("event.row.config_value.search || ''")),
              setVar("status", expr("event.row.config_value.status || ''")),
              setVar("page", 1),
            ],
          },
        }).add(7, { minHeight: 220 }),
        page.widget("saveView", "Save current view", "form", {
          title: "Save current view",
          submitLabel: "Save view",
          fields: [{ key: "name", label: "View name", type: "text", required: true, placeholder: "e.g. My open " + entity.title.toLowerCase() }],
          events: {
            onSubmit: [execute(`${entity.key}_view_create`, {
              configKey: expr(`"saved_view.${spec.alias}-${entity.key}-list." + String(event.formData.name || "view").toLowerCase().replace(/[^a-z0-9]+/g, "-")`),
              value: expr("({ search: state.variables.search, status: state.variables.status, page: 1 })"),
              label: expr("event.formData.name"),
            }, { successToast: "View saved", errorToast: "Could not save view" })],
          },
        }).add(5, { minHeight: 220 })
      );
    },
  });

  // The save-view form needs a query source on the page.
  const page = ctx.pages[ctx.pages.length - 1];
  page.sources.push(source(spec, `${entity.key}_view_create`, `${spec.alias}.shared.saved_view_create`, { triggerMode: "manual" }));
  page.appPageConfig.dataSources = page.sources;
  // The form was built before the source append; nothing else to patch.
}

function buildDetailPage(ctx, spec, entity, index) {
  const st = statusField(entity);
  const label = labelField(entity);
  const detailAlias = `${entity.key}_detail`;
  const commentsAlias = `${entity.key}_comments`;
  const attachmentsAlias = `${entity.key}_attachments`;
  const auditAlias = `${entity.key}_audit`;
  const statusAlias = `${entity.key}_status`;
  const updateAlias = `${entity.key}_update`;
  const deleteAlias = `${entity.key}_delete`;
  const restoreAlias = `${entity.key}_restore`;
  const commentCreate = `${entity.key}_comment_create`;
  const attachmentCreate = `${entity.key}_attachment_create`;
  const variables = [
    { key: "recordID", type: "number", defaultValue: 1 },
    { key: "tab", type: "string", defaultValue: "overview" },
  ];
  const sources = [
    source(spec, detailAlias, `${spec.alias}.${entity.key}.detail`, { triggerMode: "reactive", inputs: { id: expr("state.variables.recordID") }, refreshOn: ["variables.recordID"] }),
    source(spec, commentsAlias, `${spec.alias}.shared.comments`, { inputs: { entity: entity.key, entityID: expr("state.variables.recordID") }, refreshOn: ["variables.recordID"] }),
    source(spec, attachmentsAlias, `${spec.alias}.shared.attachments`, { inputs: { entity: entity.key, entityID: expr("state.variables.recordID") }, refreshOn: ["variables.recordID"] }),
    source(spec, auditAlias, `${spec.alias}.shared.audit`, { inputs: { entity: entity.key, entityID: expr("state.variables.recordID"), actor: "", dateFrom: "", dateTo: "" }, refreshOn: ["variables.recordID"] }),
    ...(st ? [source(spec, statusAlias, `${spec.alias}.${entity.key}.status`, { triggerMode: "manual" })] : []),
    source(spec, updateAlias, `${spec.alias}.${entity.key}.update`, { triggerMode: "manual" }),
    source(spec, deleteAlias, `${spec.alias}.${entity.key}.delete`, { triggerMode: "manual" }),
    source(spec, restoreAlias, `${spec.alias}.${entity.key}.restore`, { triggerMode: "manual" }),
    source(spec, commentCreate, `${spec.alias}.shared.comment_create`, { triggerMode: "manual" }),
    source(spec, attachmentCreate, `${spec.alias}.shared.attachment_create`, { triggerMode: "manual" }),
  ];
  buildPage(ctx, spec, {
    key: `${entity.key}-detail`,
    title: `${entity.title} · detail`,
    description: `Full record detail with tabs, comments, attachments and audit timeline.`,
    tags: ["core", "staff", "manager", "admin"],
    variables,
    sources,
    build(page) {
      page.row(page.widget("heading", "Record detail", "text", {
        content: `# ${entity.singular || entity.title} detail\nRecord #{{ state.variables.recordID }} · every change is captured in the audit timeline.`,
        format: "markdown",
        showHeader: false,
      }).add(12));

      page.row(
        page.widget("status", "Status", "badge", {
          text: st ? expr(rowField(detailAlias, st.key)) : "—",
          variant: "default",
          showHeader: false,
        }).add(2, { minHeight: 44 }),
        page.widget("statusForm", "Change status", "select", {
          label: "",
          placeholder: "Select status",
          defaultValue: st ? st.values[0] : "",
          options: st ? statusOptions(st) : [],
          showHeader: false,
          events: { onChange: [setVar("tab", "overview")] },
        }).add(3, { minHeight: 44 }),
        ...(st ? [page.widget("statusButton", "Apply status", "button", {
          text: "Apply status",
          showHeader: false,
          events: {
            onClick: [execute(statusAlias, {
              id: expr("state.variables.recordID"),
              status: expr(`(state.widgets["widget_${wid(spec, `${spec.alias}-${entity.key}-detail.statusForm`)}_1"] || {}).value || "${st.values[0]}"`),
            }, { successToast: "Status updated", errorToast: "Status update failed" })],
          },
        }).add(2, { minHeight: 44 })] : []),
        page.widget("delete", "Archive", "button", {
          text: "Archive record",
          variant: "destructive",
          showHeader: false,
          events: { onClick: [execute(deleteAlias, { ids: expr("[state.variables.recordID]") }, { successToast: "Record archived", errorToast: "Archive failed" })] },
        }).add(2, { minHeight: 44 }),
        page.widget("restore", "Restore", "button", {
          text: "Restore record",
          variant: "outline",
          showHeader: false,
          events: { onClick: [execute(restoreAlias, { ids: expr("[state.variables.recordID]") }, { successToast: "Record restored", errorToast: "Restore failed" })] },
        }).add(2, { minHeight: 44 })
      );

      page.row(page.widget("tabs", "Record sections", "tabs", {
        tabs: [
          { label: "Overview", value: "overview" },
          { label: "Comments", value: "comments" },
          { label: "Attachments", value: "attachments" },
          { label: "Activity", value: "activity" },
        ],
        defaultTab: "overview",
        showHeader: false,
        events: { onChange: [setVar("tab", expr("event.value"))] },
      }).add(12, { minHeight: 52 }));

      page.row(
        page.widget("record", "Record fields", "key-value", {
          label: "Record fields",
          dataTemplate: expr(`(((state.queries.${detailAlias} || {}).data || [])[0] || {})`),
          columns: 2,
          emptyText: "Record not found.",
          isLoading: expr(`(state.queries.${detailAlias} || {}).isLoading || false`),
        }).add(8, { condition: expr("state.variables.tab === 'overview'") }),
        page.widget("editTable", "Inline edit", "table", {
          dataArrayTemplate: rows(detailAlias),
          columns: columnDefs(entity),
          pagination: { enabled: false, pageSize: 1 },
          search: { enabled: false },
          export: { enabled: false },
          editing: { enabled: true },
          multiSelect: { enabled: false },
          emptyText: "No record loaded.",
          isLoading: expr(`(state.queries.${detailAlias} || {}).isLoading || false`),
          events: {
            onRowSave: [execute(updateAlias, {
              id: expr("event.originalRow.id"),
              ...Object.fromEntries(entity.fields.map((f) => [f.key, expr(`event.updatedRow.${f.key}`)])),
            }, { successToast: "Record updated", errorToast: "Update failed" })],
          },
        }).add(4, { condition: expr("state.variables.tab === 'overview'"), minHeight: 300 })
      );

      page.row(
        page.widget("comments", "Comments", "table", {
          dataArrayTemplate: rows(commentsAlias),
          columns: [
            { key: "author", label: "Author", type: "text" },
            { key: "body", label: "Comment", type: "text" },
            { key: "created_at", label: "Created", type: "date" },
          ],
          pagination: { enabled: true, pageSize: 5 },
          search: { enabled: true, serverSide: false },
          export: { enabled: true, format: "csv" },
          editing: { enabled: false },
          multiSelect: { enabled: false },
          emptyText: "No comments yet.",
          isLoading: expr(`(state.queries.${commentsAlias} || {}).isLoading || false`),
        }).add(8, { condition: expr("state.variables.tab === 'comments'"), minHeight: 280 }),
        page.widget("commentForm", "Add comment", "form", {
          title: "Add comment",
          submitLabel: "Post comment",
          fields: [
            { key: "body", label: "Comment", type: "textarea", required: true, placeholder: "Add context, decisions or next steps" },
            { key: "authorID", label: "Author", type: "select", required: true, defaultValue: 1, options: (ctx.seedRows.staff || []).slice(0, 24).map((s) => ({ label: s.full_name, value: s.id })) },
          ],
          events: {
            onSubmit: [execute(commentCreate, {
              entity: entity.key,
              entityID: expr("state.variables.recordID"),
              authorID: expr("Number(event.formData.authorID || 1)"),
              body: expr("event.formData.body"),
            }, { successToast: "Comment added", errorToast: "Comment failed" })],
          },
        }).add(4, { condition: expr("state.variables.tab === 'comments'"), minHeight: 280 })
      );

      page.row(
        page.widget("attachments", "Attachments", "table", {
          dataArrayTemplate: rows(attachmentsAlias),
          columns: [
            { key: "file_name", label: "File", type: "link" },
            { key: "file_url", label: "URL", type: "link" },
            { key: "mime_type", label: "Type", type: "text" },
            { key: "created_at", label: "Uploaded", type: "date" },
          ],
          pagination: { enabled: true, pageSize: 5 },
          search: { enabled: true, serverSide: false },
          export: { enabled: true, format: "csv" },
          editing: { enabled: false },
          multiSelect: { enabled: false },
          emptyText: "No attachments yet.",
          isLoading: expr(`(state.queries.${attachmentsAlias} || {}).isLoading || false`),
        }).add(8, { condition: expr("state.variables.tab === 'attachments'"), minHeight: 280 }),
        page.widget("attachmentForm", "Add attachment", "form", {
          title: "Add attachment",
          submitLabel: "Attach file",
          fields: [
            { key: "fileName", label: "File name", type: "text", required: true, defaultValue: "document.pdf" },
            { key: "fileURL", label: "File URL", type: "text", required: true, defaultValue: "https://files.example.invalid/document.pdf" },
            { key: "mimeType", label: "MIME type", type: "text", defaultValue: "application/pdf" },
          ],
          events: {
            onSubmit: [execute(attachmentCreate, {
              entity: entity.key,
              entityID: expr("state.variables.recordID"),
              fileName: expr("event.formData.fileName"),
              fileURL: expr("event.formData.fileURL"),
              mimeType: expr("event.formData.mimeType"),
              uploadedBy: expr("1"),
            }, { successToast: "Attachment linked", errorToast: "Attachment failed" })],
          },
        }).add(4, { condition: expr("state.variables.tab === 'attachments'"), minHeight: 280 })
      );

      page.row(page.widget("activity", "Audit timeline", "timeline", {
        label: "Audit timeline",
        dataTemplate: expr(`(state.queries.${auditAlias} || {}).data || []`),
        titleKey: "title",
        timeKey: "created_at",
        descriptionKey: "description",
        emptyText: "No audit entries yet.",
        isLoading: expr(`(state.queries.${auditAlias} || {}).isLoading || false`),
      }).add(12, { condition: expr("state.variables.tab === 'activity'"), minHeight: 300 }));
    },
  });
}

function buildCreatePage(ctx, spec, entity, index) {
  const createAlias = `${entity.key}_create`;
  const st = statusField(entity);
  const variables = [{ key: "createdID", type: "number", defaultValue: 0 }];
  const sources = [source(spec, createAlias, `${spec.alias}.${entity.key}.create`, { triggerMode: "manual" })];
  const fields = entity.fields.map((field) => {
    const type = field.type === "enum" || field.type === "ref" ? "select" : field.type === "bool" ? "checkbox" : field.type === "longtext" || field.type === "json" ? "textarea" : field.type === "int" || field.type === "money" || field.type === "decimal" ? "number" : field.type === "email" ? "email" : "text";
    const defaultValue = (() => {
      const seeded = ctx.seedRows[entity.key]?.[0]?.[field.key];
      if (seeded === undefined || seeded === null) return field.type === "bool" ? false : "";
      if (typeof seeded === "object" && seeded.__sql) return "";
      if (typeof seeded === "object") return JSON.stringify(seeded);
      return seeded;
    })();
    return {
      key: field.key,
      label: field.label || titleCase(field.key),
      type,
      required: !!field.required,
      defaultValue,
      ...(type === "select" ? { options: field.type === "enum" ? statusOptions(field) : (ctx.seedRows[field.ref] || []).slice(0, 40).map((r) => ({ label: r.full_name || r.name || r.title || r.label || `#${r.id}`, value: r.id })) } : {}),
      ...(field.type === "int" || field.type === "money" || field.type === "decimal" ? { validation: { min: 0 } } : {}),
      ...(field.type === "longtext" ? { help: "Plain text or short notes" } : {}),
    };
  });
  buildPage(ctx, spec, {
    key: `${entity.key}-create`,
    title: `Create ${entity.singular || entity.title}`,
    description: `Validated create form for ${entity.title} with audit-logged writes.`,
    tags: ["core", "staff", "manager", "admin"],
    variables,
    sources,
    build(page) {
      page.row(page.widget("heading", `Create ${entity.singular || entity.title}`, "text", {
        content: `# Create ${entity.singular || entity.title}\nComplete the fields below. Required fields are validated before the parameterized insert query runs; the database trigger records the audit entry.`,
        format: "markdown",
        showHeader: false,
      }).add(12));
      page.row(
        page.widget("form", `New ${entity.singular || entity.title}`, "form", {
          title: `New ${entity.singular || entity.title}`,
          submitLabel: `Create ${entity.singular || entity.title}`,
          resetLabel: "Reset",
          layout: "grid",
          columns: 2,
          fields,
          events: {
            onSubmit: [execute(createAlias, Object.fromEntries(entity.fields.map((f) => [f.key, expr(`event.formData.${f.key}`)])), { successToast: "Record created", errorToast: "Create failed" })],
          },
        }).add(8, { minHeight: 520 }),
        page.widget("result", "Created record", "json-viewer", {
          label: "Created record",
          dataTemplate: expr(`(state.queries.${createAlias} || {}).data || null`),
          isLoading: expr(`(state.queries.${createAlias} || {}).isLoading || false`),
        }).add(4, { minHeight: 520 })
      );
    },
  });
}

function buildDashboard(ctx, spec) {
  const main = coreEntities(spec)[0];
  const second = coreEntities(spec)[1] || main;
  const st = statusField(main);
  const amount = amountField(main);
  const owner = ownerField(main);
  const aliases = {
    summary: `${main.key}_summary`,
    trend: `${main.key}_trend`,
    status: `${main.key}_status_chart`,
    second: `${second.key}_summary`,
    tasks: "my_tasks",
    activity: "recent_activity",
    notifications: "notifications",
    quality: "quality",
  };
  const variables = [
    { key: "staffID", type: "number", defaultValue: 1 },
    { key: "dateFrom", type: "string", defaultValue: "" },
    { key: "dateTo", type: "string", defaultValue: "" },
  ];
  const sources = [
    source(spec, aliases.summary, `${spec.alias}.${main.key}.stats`, { inputs: { dateFrom: expr("state.variables.dateFrom"), dateTo: expr("state.variables.dateTo") } }),
    source(spec, aliases.trend, `${spec.alias}.${main.key}.trend`, { inputs: { dateFrom: expr("state.variables.dateFrom"), dateTo: expr("state.variables.dateTo") } }),
    ...(st ? [source(spec, aliases.status, `${spec.alias}.${main.key}.by_status`, { inputs: { dateFrom: expr("state.variables.dateFrom"), dateTo: expr("state.variables.dateTo") } })] : []),
    source(spec, aliases.second, `${spec.alias}.${second.key}.stats`, { inputs: { dateFrom: expr("state.variables.dateFrom"), dateTo: expr("state.variables.dateTo") } }),
    source(spec, aliases.tasks, `${spec.alias}.shared.my_tasks`, { inputs: { staffID: expr("state.variables.staffID") } }),
    source(spec, aliases.activity, `${spec.alias}.shared.audit`, { inputs: { entity: "", entityID: "", actor: "", dateFrom: "", dateTo: "" } }),
    source(spec, aliases.notifications, `${spec.alias}.shared.notifications`, { inputs: { staffID: expr("state.variables.staffID") } }),
    source(spec, aliases.quality, `${spec.alias}.shared.data_quality`, {}),
  ];
  buildPage(ctx, spec, {
    key: "dashboard",
    title: "Dashboard",
    description: "KPIs, trends, tasks, notifications and recent audit activity.",
    tags: ["core", "shared", "staff", "manager", "admin", "viewer"],
    variables,
    sources,
    build(page) {
      page.row(page.widget("heading", "Dashboard", "text", {
        content: `# ${spec.name}\nOperational overview for the current team. Use the date range to scope the metrics; tasks and notifications are filtered by the selected staff member.`,
        format: "markdown",
        showHeader: false,
      }).add(12));
      page.row(
        page.widget("range", "Date range", "date-range-picker", {
          label: "Reporting window",
          showHeader: false,
          events: {
            onChange: [setVar("dateFrom", expr("event.startDate || ''")), setVar("dateTo", expr("event.endDate || ''"))],
            onClear: [setVar("dateFrom", ""), setVar("dateTo", "")],
          },
        }).add(4, { minHeight: 52 }),
        page.widget("staff", "Tasks for", "select", {
          label: "Tasks for",
          defaultValue: 1,
          options: (ctx.seedRows.staff || []).slice(0, 24).map((s) => ({ label: s.full_name, value: s.id })),
          showHeader: false,
          events: { onChange: [setVar("staffID", expr("Number(event.value || 1)"))] },
        }).add(4, { minHeight: 52 }),
        page.widget("qualityBadge", "Data quality issues", "badge", {
          text: expr(`String(((state.queries.${aliases.quality} || {}).data || []).reduce(function (n, r) { return n + Number(r.affected_rows || 0); }, 0)) + " issues"`),
          variant: "warning",
          showHeader: false,
        }).add(4, { minHeight: 52 })
      );
      page.row(
        page.widget("kpiTotal", main.title, "stat", {
          label: main.title,
          valueTemplate: expr(rowField(aliases.summary, "total")),
          isLoading: expr(`(state.queries.${aliases.summary} || {}).isLoading || false`),
        }).add(3, { minHeight: 124 }),
        page.widget("kpiValue", "Total value", "stat", {
          label: amount ? "Total value" : "Secondary records",
          prefix: amount ? "$" : "",
          valueTemplate: amount ? expr(rowField(aliases.summary, "total_value")) : expr(rowField(aliases.second, "total")),
          isLoading: expr(`(state.queries.${amount ? aliases.summary : aliases.second} || {}).isLoading || false`),
        }).add(3, { minHeight: 124 }),
        page.widget("kpiSecond", second.title, "stat", {
          label: second.title,
          valueTemplate: expr(rowField(aliases.second, "total")),
          isLoading: expr(`(state.queries.${aliases.second} || {}).isLoading || false`),
        }).add(3, { minHeight: 124 }),
        page.widget("kpiTasks", "Tasks for me", "stat", {
          label: "Tasks for me",
          valueTemplate: expr(`(((state.queries.${aliases.tasks} || {}).data || []).length)`),
          isLoading: expr(`(state.queries.${aliases.tasks} || {}).isLoading || false`),
        }).add(3, { minHeight: 124 })
      );
      page.row(
        page.widget("trend", "Volume trend", "vega-lite", {
          label: "Volume trend",
          vegaSpec: {
            $schema: "https://vega.github.io/schema/vega-lite/v5.json",
            width: "container",
            height: "container",
            autosize: { type: "fit", contains: "padding" },
            data: { values: expr(`(state.queries.${aliases.trend} || {}).data || []`) },
            mark: { type: "line", tooltip: true, point: true },
            encoding: {
              x: { field: "day", type: "temporal", axis: { labelAngle: 0 } },
              y: { field: "count", type: "quantitative" },
              color: { value: spec.accent || "#2563eb" },
            },
          },
          options: { renderer: "svg", showActions: false },
          isLoading: expr(`(state.queries.${aliases.trend} || {}).isLoading || false`),
        }).add(8, { minHeight: 320 }),
        ...(st ? [page.widget("statusChart", "By status", "vega-lite", {
          label: "By status",
          vegaSpec: {
            $schema: "https://vega.github.io/schema/vega-lite/v5.json",
            width: "container",
            height: "container",
            autosize: { type: "fit", contains: "padding" },
            data: { values: expr(`(state.queries.${aliases.status} || {}).data || []`) },
            mark: { type: "arc", innerRadius: 55, tooltip: true },
            encoding: {
              theta: { field: "count", type: "quantitative" },
              color: { field: "status", type: "nominal" },
            },
          },
          options: { renderer: "svg", showActions: false },
          isLoading: expr(`(state.queries.${aliases.status} || {}).isLoading || false`),
        }).add(4, { minHeight: 320 })] : [])
      );
      page.row(
        page.widget("tasks", "Tasks for me", "table", {
          dataArrayTemplate: rows(aliases.tasks),
          columns: columnDefs(main, { editable: false }),
          pagination: { enabled: true, pageSize: 5 },
          search: { enabled: true, serverSide: false },
          export: { enabled: true },
          editing: { enabled: false },
          multiSelect: { enabled: false },
          emptyText: "No open tasks for this staff member.",
          isLoading: expr(`(state.queries.${aliases.tasks} || {}).isLoading || false`),
        }).add(7, { minHeight: 300 }),
        page.widget("notifications", "Notifications", "table", {
          dataArrayTemplate: rows(aliases.notifications),
          columns: [
            { key: "title", label: "Notification", type: "text" },
            { key: "category", label: "Category", type: "badge" },
            { key: "created_at", label: "Created", type: "date" },
          ],
          pagination: { enabled: true, pageSize: 5 },
          search: { enabled: true, serverSide: false },
          export: { enabled: false },
          editing: { enabled: false },
          multiSelect: { enabled: false },
          emptyText: "No notifications.",
          isLoading: expr(`(state.queries.${aliases.notifications} || {}).isLoading || false`),
        }).add(5, { minHeight: 300 })
      );
      page.row(page.widget("activity", "Recent activity", "timeline", {
        label: "Recent activity",
        dataTemplate: expr(`(state.queries.${aliases.activity} || {}).data || []`),
        titleKey: "title",
        timeKey: "created_at",
        descriptionKey: "description",
        emptyText: "No activity yet.",
        isLoading: expr(`(state.queries.${aliases.activity} || {}).isLoading || false`),
      }).add(12, { minHeight: 260 }));
    },
  });
}

function buildReports(ctx, spec) {
  const core = coreEntities(spec);
  const main = core[0];
  const second = core[1] || main;
  const st = statusField(main);
  const amount = amountField(main);
  const secondSt = statusField(second);
  const variables = [
    { key: "dateFrom", type: "string", defaultValue: "" },
    { key: "dateTo", type: "string", defaultValue: "" },
  ];

  // Report 1 — operating trend.
  {
    const summary = "report_summary";
    const trend = "report_trend";
    const byStatus = "report_status";
    buildPage(ctx, spec, {
      key: "reports-operations",
      title: "Reports · operations",
      description: "Date-filtered operating trend, status mix and exportable record list.",
      tags: ["report", "manager", "admin"],
      variables,
      sources: [
        source(spec, summary, `${spec.alias}.${main.key}.stats`, { inputs: { dateFrom: expr("state.variables.dateFrom"), dateTo: expr("state.variables.dateTo") } }),
        source(spec, trend, `${spec.alias}.${main.key}.trend`, { inputs: { dateFrom: expr("state.variables.dateFrom"), dateTo: expr("state.variables.dateTo") } }),
        ...(st ? [source(spec, byStatus, `${spec.alias}.${main.key}.by_status`, { inputs: { dateFrom: expr("state.variables.dateFrom"), dateTo: expr("state.variables.dateTo") } })] : []),
        source(spec, "report_list", `${spec.alias}.${main.key}.export`, { triggerMode: "manual" }),
      ],
      build(page) {
        page.row(page.widget("heading", "Operations report", "text", {
          content: "# Operations report\nUse the date range to scope totals. The export button downloads the filtered record list as CSV.",
          format: "markdown",
          showHeader: false,
        }).add(12));
        page.row(page.widget("range", "Date range", "date-range-picker", {
          label: "Date range", showHeader: false,
          events: { onChange: [setVar("dateFrom", expr("event.startDate || ''")), setVar("dateTo", expr("event.endDate || ''"))], onClear: [setVar("dateFrom", ""), setVar("dateTo", "")] },
        }).add(4, { minHeight: 52 }),
        page.widget("total", "Records", "stat", { label: "Records", valueTemplate: expr(rowField(summary, "total")), isLoading: expr(`(state.queries.${summary} || {}).isLoading || false`) }).add(4, { minHeight: 52 }),
        page.widget("value", amount ? "Value" : "Status groups", "stat", { label: amount ? "Value" : "Groups", prefix: amount ? "$" : "", valueTemplate: amount ? expr(rowField(summary, "total_value")) : expr(`(((state.queries.${byStatus} || {}).data || []).length)`), isLoading: expr(`(state.queries.${summary} || {}).isLoading || false`) }).add(4, { minHeight: 52 }));
        page.row(page.widget("trend", "Daily trend", "vega-lite", {
          label: "Daily trend",
          vegaSpec: {
            $schema: "https://vega.github.io/schema/vega-lite/v5.json", width: "container", height: "container", autosize: { type: "fit", contains: "padding" },
            data: { values: expr(`(state.queries.${trend} || {}).data || []`) },
            mark: { type: "bar", tooltip: true },
            encoding: { x: { field: "day", type: "temporal", axis: { labelAngle: 0 } }, y: { field: amount ? "total" : "count", type: "quantitative" }, color: { value: spec.accent || "#2563eb" } },
          },
          options: { renderer: "svg", showActions: false },
          isLoading: expr(`(state.queries.${trend} || {}).isLoading || false`),
        }).add(7, { minHeight: 320 }),
        ...(st ? [page.widget("status", "Status mix", "vega-lite", {
          label: "Status mix",
          vegaSpec: {
            $schema: "https://vega.github.io/schema/vega-lite/v5.json", width: "container", height: "container", autosize: { type: "fit", contains: "padding" },
            data: { values: expr(`(state.queries.${byStatus} || {}).data || []`) },
            mark: { type: "bar", tooltip: true },
            encoding: { y: { field: "status", type: "nominal", sort: "-x" }, x: { field: "count", type: "quantitative" }, color: { field: "status", type: "nominal" } },
          },
          options: { renderer: "svg", showActions: false },
          isLoading: expr(`(state.queries.${byStatus} || {}).isLoading || false`),
        }).add(5, { minHeight: 320 })] : [])
        );
        page.row(page.widget("data", "Filtered records", "table", {
          dataArrayTemplate: rows("report_list"),
          columns: columnDefs(main, { editable: false }),
          pagination: { enabled: true, pageSize: 10 },
          search: { enabled: true, serverSide: false },
          export: { enabled: true, format: "csv" },
          editing: { enabled: false },
          multiSelect: { enabled: false },
          emptyText: "No records in this range.",
          isLoading: expr(`(state.queries.report_list || {}).isLoading || false`),
        }).add(9, { minHeight: 340 }),
        page.widget("run", "Load export set", "button", {
          text: "Load filtered rows",
          showHeader: false,
          events: { onClick: [execute("report_list", { search: "", status: "", dateFrom: expr("state.variables.dateFrom"), dateTo: expr("state.variables.dateTo") }, { successToast: "Report loaded", errorToast: "Report failed" })] },
        }).add(3, { minHeight: 48 })
        );
      },
    });
  }

  // Report 2 — second entity mix.
  {
    const aliases = { summary: "second_summary", status: "second_status" };
    buildPage(ctx, spec, {
      key: "reports-secondary",
      title: "Reports · secondary mix",
      description: "Secondary entity mix and value trend with exportable records.",
      tags: ["report", "manager", "admin"],
      variables,
      sources: [
        source(spec, aliases.summary, `${spec.alias}.${second.key}.stats`, { inputs: { dateFrom: expr("state.variables.dateFrom"), dateTo: expr("state.variables.dateTo") } }),
        ...(secondSt ? [source(spec, aliases.status, `${spec.alias}.${second.key}.by_status`, { inputs: { dateFrom: expr("state.variables.dateFrom"), dateTo: expr("state.variables.dateTo") } })] : []),
        source(spec, "second_list", `${spec.alias}.${second.key}.export`, { triggerMode: "manual" }),
      ],
      build(page) {
        page.row(page.widget("heading", `${second.title} report`, "text", { content: `# ${second.title} report\nCompare volume and value by status. This report uses the same parameterized query contract as the live list.`, format: "markdown", showHeader: false }).add(12));
        page.row(page.widget("range", "Date range", "date-range-picker", { label: "Date range", showHeader: false, events: { onChange: [setVar("dateFrom", expr("event.startDate || ''")), setVar("dateTo", expr("event.endDate || ''"))], onClear: [setVar("dateFrom", ""), setVar("dateTo", "")] } }).add(4, { minHeight: 52 }),
        page.widget("total", "Records", "stat", { label: "Records", valueTemplate: expr(rowField(aliases.summary, "total")), isLoading: expr(`(state.queries.${aliases.summary} || {}).isLoading || false`) }).add(4, { minHeight: 52 }),
        page.widget("value", "Value", "stat", { label: "Value", prefix: amountField(second) ? "$" : "", valueTemplate: amountField(second) ? expr(rowField(aliases.summary, "total_value")) : expr(rowField(aliases.summary, "total")), isLoading: expr(`(state.queries.${aliases.summary} || {}).isLoading || false`) }).add(4, { minHeight: 52 }));
        page.row(
          ...(secondSt ? [page.widget("status", "By status", "vega-lite", {
            label: "By status",
            vegaSpec: {
              $schema: "https://vega.github.io/schema/vega-lite/v5.json", width: "container", height: "container", autosize: { type: "fit", contains: "padding" },
              data: { values: expr(`(state.queries.${aliases.status} || {}).data || []`) },
              mark: { type: "bar", tooltip: true },
              encoding: { x: { field: "status", type: "nominal", axis: { labelAngle: 0 } }, y: { field: "count", type: "quantitative" }, color: { field: "status", type: "nominal" } },
            },
            options: { renderer: "svg", showActions: false },
            isLoading: expr(`(state.queries.${aliases.status} || {}).isLoading || false`),
          }).add(12, { minHeight: 320 })] : [])
        );
        page.row(page.widget("data", second.title, "table", {
          dataArrayTemplate: rows("second_list"),
          columns: columnDefs(second, { editable: false }),
          pagination: { enabled: true, pageSize: 10 },
          search: { enabled: true, serverSide: false },
          export: { enabled: true },
          editing: { enabled: false },
          multiSelect: { enabled: false },
          emptyText: "No records.",
          isLoading: expr(`(state.queries.second_list || {}).isLoading || false`),
        }).add(12, { minHeight: 340 }));
      },
    });
  }

  // Report 3 — quality and aging.
  {
    buildPage(ctx, spec, {
      key: "reports-quality",
      title: "Reports · data quality",
      description: "Data quality checks, failing operations and aging work.",
      tags: ["report", "manager", "admin"],
      variables,
      sources: [
        source(spec, "quality", `${spec.alias}.shared.data_quality`, {}),
        source(spec, "ops", `${spec.alias}.shared.ops`, { inputs: { kinds: ["data_quality", "job_run"] } }),
      ],
      build(page) {
        page.row(page.widget("heading", "Data quality report", "text", {
          content: "# Data quality report\nChecks are tenant-scoped and run against the template's own tables. Failed operational runs are shown below for triage.",
          format: "markdown", showHeader: false,
        }).add(12));
        page.row(page.widget("quality", "Checks", "table", {
          dataArrayTemplate: rows("quality"),
          columns: [
            { key: "entity", label: "Entity", type: "text" },
            { key: "check_name", label: "Check", type: "text" },
            { key: "affected_rows", label: "Affected", type: "number" },
            { key: "detail", label: "Detail", type: "text" },
          ],
          pagination: { enabled: true, pageSize: 10 },
          search: { enabled: true, serverSide: false },
          export: { enabled: true },
          editing: { enabled: false },
          multiSelect: { enabled: false },
          emptyText: "No checks returned.",
          isLoading: expr(`(state.queries.quality || {}).isLoading || false`),
        }).add(7, { minHeight: 320 }),
        page.widget("ops", "Failed operations", "table", {
          dataArrayTemplate: rows("ops"),
          columns: [
            { key: "kind", label: "Kind", type: "badge" },
            { key: "source", label: "Source", type: "text" },
            { key: "status", label: "Status", type: "badge" },
            { key: "created_at", label: "When", type: "date" },
          ],
          pagination: { enabled: true, pageSize: 8 },
          search: { enabled: true, serverSide: false },
          export: { enabled: true },
          editing: { enabled: false },
          multiSelect: { enabled: false },
          emptyText: "No operations.",
          isLoading: expr(`(state.queries.ops || {}).isLoading || false`),
        }).add(5, { minHeight: 320 }));
      },
    });
  }
}

function buildKanbanCalendar(ctx, spec) {
  const main = coreEntities(spec)[0];
  const st = statusField(main);
  const dt = dateField(main);
  const owner = ownerField(main);
  const amount = amountField(main);
  const label = labelField(main);
  if (st) {
    buildPage(ctx, spec, {
      key: `${main.key}-kanban`,
      title: `${main.title} · kanban`,
      description: "Status board grouped by the primary workflow stage.",
      tags: ["core", "staff", "manager", "admin"],
      variables: [{ key: "selectedID", type: "number", defaultValue: 1 }],
      sources: [
        source(spec, main.key, `${spec.alias}.${main.key}.list`, { inputs: { search: "", page: 1, limit: 200, sortBy: label, sortDir: "asc", status: "", dateFrom: "", dateTo: "" } }),
        source(spec, `${main.key}_selected`, `${spec.alias}.${main.key}.detail`, { triggerMode: "reactive", inputs: { id: expr("state.variables.selectedID") }, refreshOn: ["variables.selectedID"] }),
      ],
      build(page) {
        page.row(page.widget("heading", `${main.title} board`, "text", { content: `# ${main.title} board\nCards are grouped by **${st.key.replace(/_/g, " ")}**. Select a card to inspect the record; drag-and-drop is intentionally not enabled because status changes must run through the audited transition query.`, format: "markdown", showHeader: false }).add(12));
        page.row(page.widget("board", "Pipeline board", "kanban", {
          dataArrayTemplate: rows(main.key),
          groupBy: st.key,
          titleKey: label,
          subtitleKey: owner ? owner.key : label,
          valueKey: amount ? amount.key : undefined,
          dateKey: dt ? dt.key : undefined,
          badgeKey: st.key,
          columns: st.values,
          emptyText: "No cards in this pipeline.",
          isLoading: expr(`(state.queries.${main.key} || {}).isLoading || false`),
          events: { onCardSelect: [setVar("selectedID", expr("event.card.id"))] },
        }).add(8, { minHeight: 520 }),
        page.widget("selected", "Selected card", "key-value", {
          label: "Selected card",
          dataTemplate: expr(`(((state.queries.${main.key}_selected || {}).data || [])[0] || {})`),
          columns: 1,
          emptyText: "Select a card.",
          isLoading: expr(`(state.queries.${main.key}_selected || {}).isLoading || false`),
        }).add(4, { minHeight: 520 }));
      },
    });
  }
  if (dt) {
    buildPage(ctx, spec, {
      key: `${main.key}-calendar`,
      title: `${main.title} · calendar`,
      description: "Calendar view of the primary date field.",
      tags: ["core", "staff", "manager", "admin"],
      variables: [{ key: "selectedID", type: "number", defaultValue: 1 }],
      sources: [
        source(spec, main.key, `${spec.alias}.${main.key}.list`, { inputs: { search: "", page: 1, limit: 300, sortBy: dt.key, sortDir: "asc", status: "", dateFrom: "", dateTo: "" } }),
        source(spec, `${main.key}_selected`, `${spec.alias}.${main.key}.detail`, { triggerMode: "reactive", inputs: { id: expr("state.variables.selectedID") }, refreshOn: ["variables.selectedID"] }),
      ],
      build(page) {
        page.row(page.widget("heading", `${main.title} calendar`, "text", { content: `# ${main.title} calendar\nMonth view keyed on **${dt.key.replace(/_/g, " ")}**. Select an event to inspect the record.`, format: "markdown", showHeader: false }).add(12));
        page.row(page.widget("calendar", "Calendar", "calendar", {
          dataArrayTemplate: rows(main.key),
          dateKey: dt.key,
          titleKey: label,
          subtitleKey: owner ? owner.key : undefined,
          groupKey: st ? st.key : undefined,
          emptyText: "No dated records.",
          isLoading: expr(`(state.queries.${main.key} || {}).isLoading || false`),
          events: { onEventSelect: [setVar("selectedID", expr("event.event.id"))] },
        }).add(8, { minHeight: 540 }),
        page.widget("selected", "Selected record", "key-value", {
          label: "Selected record",
          dataTemplate: expr(`(((state.queries.${main.key}_selected || {}).data || [])[0] || {})`),
          columns: 1,
          emptyText: "Select an event.",
          isLoading: expr(`(state.queries.${main.key}_selected || {}).isLoading || false`),
        }).add(4, { minHeight: 540 }));
      },
    });
  }
}

function buildSharedPages(ctx, spec) {
  const main = coreEntities(spec)[0];
  const st = statusField(main);
  const label = labelField(main);
  const owner = ownerField(main);

  // Global search.
  buildPage(ctx, spec, {
    key: "search",
    title: "Global search",
    description: "Cross-entity search across every core table.",
    tags: ["shared", "staff", "manager", "admin", "viewer"],
    variables: [{ key: "search", type: "string", defaultValue: "" }, { key: "selected", type: "string", defaultValue: "" }],
    sources: [
      source(spec, "search", `${spec.alias}.shared.search`, { triggerMode: "reactive", inputs: { search: expr("state.variables.search") }, refreshOn: ["variables.search"] }),
    ],
    build(page) {
      page.row(page.widget("heading", "Global search", "text", { content: "# Global search\nSearch names, subjects and reference codes across every core table. Results are capped at 50 and are tenant-isolated.", format: "markdown", showHeader: false }).add(12));
      page.row(page.widget("search", "Search", "search-input", { placeholder: "Search records...", showHeader: false, events: { onSearch: [setVar("search", expr("event.searchTerm || ''"))] } }).add(12, { minHeight: 52 }));
      page.row(page.widget("results", "Results", "table", {
        dataArrayTemplate: rows("search"),
        columns: [
          { key: "entity", label: "Entity", type: "badge" },
          { key: "title", label: "Title", type: "text" },
          { key: "subtitle", label: "Subtitle", type: "text" },
          { key: "status", label: "Status", type: "badge" },
          { key: "created_at", label: "Created", type: "date" },
        ],
        pagination: { enabled: true, pageSize: 10 },
        search: { enabled: true, serverSide: false },
        export: { enabled: true },
        editing: { enabled: false },
        multiSelect: { enabled: false },
        emptyText: "No matches. Try a different term.",
        isLoading: expr("(state.queries.search || {}).isLoading || false"),
        events: { onRowSelect: [setVar("selected", expr("event.row.entity + ' #' + event.row.id"))] },
      }).add(12, { minHeight: 380 }));
      page.row(page.widget("selected", "Selection", "badge", { text: expr("state.variables.selected || 'None'"), variant: "outline", showHeader: false }).add(12));
    },
  });

  // Profile.
  buildPage(ctx, spec, {
    key: "profile",
    title: "My profile",
    description: "Staff profile and editable contact details.",
    tags: ["shared", "staff", "manager", "admin", "viewer", "portal"],
    variables: [{ key: "staffID", type: "number", defaultValue: 1 }],
    sources: [
      source(spec, "profile", `${spec.alias}.shared.staff_detail`, { inputs: { id: expr("state.variables.staffID") } }),
      source(spec, "staff", `${spec.alias}.shared.staff_list`, {}),
      source(spec, "update", `${spec.alias}.shared.staff_update`, { triggerMode: "manual" }),
    ],
    build(page) {
      page.row(page.widget("heading", "My profile", "text", { content: "# My profile\nUpdate your directory details. Role and permission changes are managed by an administrator.", format: "markdown", showHeader: false }).add(12));
      page.row(
        page.widget("picker", "Profile", "select", { label: "Profile", defaultValue: 1, options: (ctx.seedRows.staff || []).slice(0, 24).map((s) => ({ label: s.full_name, value: s.id })), showHeader: false, events: { onChange: [setVar("staffID", expr("Number(event.value || 1)"))] } }).add(4, { minHeight: 52 }),
        page.widget("profile", "Profile", "key-value", { label: "Profile", dataTemplate: expr("(((state.queries.profile || {}).data || [])[0] || {})"), columns: 2, isLoading: expr("(state.queries.profile || {}).isLoading || false") }).add(8, { minHeight: 220 })
      );
      page.row(page.widget("form", "Edit profile", "form", {
        title: "Edit profile", submitLabel: "Save profile", layout: "grid", columns: 2,
        fields: [
          { key: "fullName", label: "Full name", type: "text", required: true },
          { key: "department", label: "Department", type: "text" },
          { key: "jobTitle", label: "Job title", type: "text" },
          { key: "phone", label: "Phone", type: "text" },
          { key: "city", label: "City", type: "text" },
        ],
        events: { onSubmit: [execute("update", {
          id: expr("state.variables.staffID"),
          fullName: expr("event.formData.fullName"),
          department: expr("event.formData.department"),
          jobTitle: expr("event.formData.jobTitle"),
          phone: expr("event.formData.phone"),
          city: expr("event.formData.city"),
        }, { successToast: "Profile saved", errorToast: "Profile update failed" })] },
      }).add(12, { minHeight: 300 }));
    },
  });

  // Notifications.
  buildPage(ctx, spec, {
    key: "notifications",
    title: "Notifications",
    description: "In-app notification center with mark-as-read.",
    tags: ["shared", "staff", "manager", "admin", "viewer", "portal"],
    variables: [{ key: "staffID", type: "number", defaultValue: 1 }],
    sources: [
      source(spec, "notifications", `${spec.alias}.shared.notifications`, { inputs: { staffID: expr("state.variables.staffID") } }),
      source(spec, "read", `${spec.alias}.shared.notifications_read`, { triggerMode: "manual" }),
    ],
    build(page) {
      page.row(page.widget("heading", "Notifications", "text", { content: "# Notifications\nIn-app notifications generated by workflows, SLA sweeps and digest jobs. Mark one or more as read; the action is audited.", format: "markdown", showHeader: false }).add(12));
      page.row(page.widget("table", "Inbox", "table", {
        dataArrayTemplate: rows("notifications"),
        columns: [
          { key: "title", label: "Title", type: "text" },
          { key: "body", label: "Body", type: "text" },
          { key: "category", label: "Category", type: "badge" },
          { key: "is_read", label: "Read", type: "boolean" },
          { key: "created_at", label: "Created", type: "date" },
        ],
        pagination: { enabled: true, pageSize: 10 },
        search: { enabled: true, serverSide: false },
        export: { enabled: true },
        editing: { enabled: false },
        multiSelect: { enabled: true, showSelectAll: true, actions: [{ label: "Mark read", actionKey: "mark-read", variant: "default" }] },
        emptyText: "No notifications.",
        isLoading: expr("(state.queries.notifications || {}).isLoading || false"),
        events: { onBulkAction: [execute("read", { ids: expr("event.selectedRows.map(function (r) { return r.id; })") }, { successToast: "Marked as read", errorToast: "Mark read failed" })] },
      }).add(12, { minHeight: 420 }));
    },
  });

  // Settings.
  buildPage(ctx, spec, {
    key: "settings",
    title: "Settings",
    description: "Branding, notification preferences, general settings and feature flags.",
    tags: ["shared", "manager", "admin"],
    variables: [{ key: "settings", type: "string", defaultValue: "" }],
    sources: [
      source(spec, "settings", `${spec.alias}.shared.settings`, { inputs: { kinds: ["setting", "branding", "feature_flag"] } }),
      source(spec, "update", `${spec.alias}.shared.settings_update`, { triggerMode: "manual" }),
    ],
    build(page) {
      page.row(page.widget("heading", "Settings", "text", { content: "# Settings\nUpdate branding, notification and general preferences. Each form writes a single JSON value through the parameterized settings query.", format: "markdown", showHeader: false }).add(12));
      page.row(page.widget("branding", "Branding", "form", {
        title: "Branding", submitLabel: "Save branding", fields: [
          { key: "value", label: "Application name", type: "text", required: true, defaultValue: spec.name },
        ],
        events: { onSubmit: [execute("update", { kind: "branding", configKey: "brand.name", value: expr("({ value: event.formData.value })") }, { successToast: "Branding saved", errorToast: "Branding failed" })] },
      }).add(4, { minHeight: 240 }),
      page.widget("notifications", "Notifications", "form", {
        title: "Notifications", submitLabel: "Save preferences", fields: [
          { key: "value", label: "In-app notifications", type: "checkbox", defaultValue: true },
        ],
        events: { onSubmit: [execute("update", { kind: "setting", configKey: "notifications.inApp", value: expr("({ value: event.formData.value })") }, { successToast: "Preferences saved", errorToast: "Preferences failed" })] },
      }).add(4, { minHeight: 240 }),
      page.widget("feature", "Automation flag", "form", {
        title: "Automation flag", submitLabel: "Save flag", fields: [
          { key: "value", label: "Enable workflow automation", type: "checkbox", defaultValue: false },
        ],
        events: { onSubmit: [execute("update", { kind: "feature_flag", configKey: "flags.workflowAutomation", value: expr("({ value: event.formData.value })") }, { successToast: "Flag saved", errorToast: "Flag failed" })] },
      }).add(4, { minHeight: 240 })
      );
      page.row(page.widget("all", "All settings", "table", {
        dataArrayTemplate: rows("settings"),
        columns: [
          { key: "kind", label: "Kind", type: "badge" },
          { key: "config_key", label: "Key", type: "text" },
          { key: "label", label: "Label", type: "text" },
          { key: "updated_at", label: "Updated", type: "date" },
        ],
        pagination: { enabled: true, pageSize: 10 },
        search: { enabled: true, serverSide: false },
        export: { enabled: true },
        editing: { enabled: false },
        multiSelect: { enabled: false },
        emptyText: "No settings.",
        isLoading: expr("(state.queries.settings || {}).isLoading || false"),
      }).add(12, { minHeight: 320 }));
    },
  });

  // Client portal.
  buildPage(ctx, spec, {
    key: "portal",
    title: "Client portal",
    description: "External-facing record list scoped to the selected client owner.",
    tags: ["portal", "client", "admin", "manager"],
    variables: [{ key: "staffID", type: "number", defaultValue: 1 }, { key: "selectedID", type: "number", defaultValue: 1 }],
    sources: [
      ...(owner ? [source(spec, "portal", `${spec.alias}.shared.portal_records`, { inputs: { staffID: expr("state.variables.staffID") } })] : []),
      source(spec, "detail", `${spec.alias}.${main.key}.detail`, { triggerMode: "reactive", inputs: { id: expr("state.variables.selectedID") }, refreshOn: ["variables.selectedID"] }),
    ],
    build(page) {
      page.row(page.widget("heading", "Client portal", "text", { content: `# Client portal\nA restricted view of ${main.title.toLowerCase()} owned by the selected client contact. External roles only receive this page, their profile and notifications.`, format: "markdown", showHeader: false }).add(12));
      page.row(
        page.widget("client", "Client contact", "select", { label: "Client contact", defaultValue: 1, options: (ctx.seedRows.staff || []).slice(0, 24).map((s) => ({ label: s.full_name, value: s.id })), showHeader: false, events: { onChange: [setVar("staffID", expr("Number(event.value || 1)"))] } }).add(4, { minHeight: 52 }),
        page.widget("table", "My records", "table", {
          dataArrayTemplate: rows("portal"),
          columns: columnDefs(main, { editable: false }),
          pagination: { enabled: true, pageSize: 10 },
          search: { enabled: true, serverSide: false },
          export: { enabled: true },
          editing: { enabled: false },
          multiSelect: { enabled: false },
          emptyText: "No records are assigned to this contact.",
          isLoading: expr("(state.queries.portal || {}).isLoading || false"),
          events: { onRowSelect: [setVar("selectedID", expr("event.row.id"))] },
        }).add(8, { minHeight: 360 })
      );
      page.row(page.widget("detail", "Record summary", "key-value", { label: "Record summary", dataTemplate: expr("(((state.queries.detail || {}).data || [])[0] || {})"), columns: 1, isLoading: expr("(state.queries.detail || {}).isLoading || false") }).add(12, { minHeight: 220 }));
    },
  });
}

function buildAdminPages(ctx, spec) {
  const main = coreEntities(spec)[0];
  const coreLabel = labelField(main);

  // 1. Users.
  buildPage(ctx, spec, {
    key: "admin-users",
    title: "Admin � users",
    description: "Tenant users, platform roles and app-level role assignment overview.",
    tags: ["admin", "manager"],
    variables: [{ key: "search", type: "string", defaultValue: "" }],
    sources: [
      source(spec, "users", `${spec.alias}.shared.admin_users`, { inputs: { tenantID: expr("state.globals.tenantID") } }),
      source(spec, "staff", `${spec.alias}.shared.staff_list`, {}),
    ],
    build(page) {
      page.row(page.widget("heading", "Users", "text", { content: "# Users\nTenant-scoped platform users and their assigned roles. This screen is read-only; membership changes run through the platform's user-management API so Firebase identity and Casbin stay consistent.", format: "markdown", showHeader: false }).add(12));
      page.row(page.widget("users", "Tenant users", "table", {
        dataArrayTemplate: rows("users"),
        columns: [
          { key: "email", label: "Email", type: "link" },
          { key: "firstName", label: "First name", type: "text" },
          { key: "lastName", label: "Last name", type: "text" },
          { key: "role", label: "Membership", type: "badge" },
          { key: "primary_role", label: "Role", type: "text" },
        ],
        pagination: { enabled: true, pageSize: 10 },
        search: { enabled: true, serverSide: false },
        export: { enabled: true },
        editing: { enabled: false },
        multiSelect: { enabled: false },
        emptyText: "No tenant users.",
        isLoading: expr("(state.queries.users || {}).isLoading || false"),
      }).add(7, { minHeight: 380 }),
      page.widget("staff", "Staff directory", "table", {
        dataArrayTemplate: rows("staff"),
        columns: [
          { key: "label", label: "Name", type: "text" },
          { key: "role_key", label: "App role", type: "badge" },
          { key: "department", label: "Department", type: "text" },
          { key: "email", label: "Email", type: "link" },
        ],
        pagination: { enabled: true, pageSize: 10 },
        search: { enabled: true, serverSide: false },
        export: { enabled: true },
        editing: { enabled: false },
        multiSelect: { enabled: false },
        emptyText: "No staff rows.",
        isLoading: expr("(state.queries.staff || {}).isLoading || false"),
      }).add(5, { minHeight: 380 })
      );
    },
  });

  // 2. Roles.
  buildPage(ctx, spec, {
    key: "admin-roles",
    title: "Admin � roles and permissions",
    description: "Provisioned tenant roles, permission counts and the app page matrix.",
    tags: ["admin"],
    variables: [{ key: "roleKey", type: "string", defaultValue: "admin" }],
    sources: [
      source(spec, "roles", `${spec.alias}.shared.admin_roles`, { inputs: { tenantID: expr("state.globals.tenantID") } }),
      source(spec, "matrix", `${spec.alias}.shared.role_matrix`, {}),
      source(spec, "update", `${spec.alias}.shared.role_matrix_update`, { triggerMode: "manual" }),
    ],
    build(page) {
      page.row(page.widget("heading", "Roles and permissions", "text", { content: "# Roles and permissions\nProvisioned Casbin roles are read-only here. The page matrix mirrors the package's role map and can be adjusted for internal review; platform permission mappings remain the enforcement source.", format: "markdown", showHeader: false }).add(12));
      page.row(
        page.widget("roles", "Tenant roles", "table", {
          dataArrayTemplate: rows("roles"),
          columns: [
            { key: "roleTitle", label: "Role", type: "text" },
            { key: "roleDescription", label: "Description", type: "text" },
            { key: "permission_count", label: "Permissions", type: "number" },
          ],
          pagination: { enabled: true, pageSize: 10 },
          search: { enabled: true, serverSide: false },
          export: { enabled: true },
          editing: { enabled: false },
          multiSelect: { enabled: false },
          emptyText: "No roles.",
          isLoading: expr("(state.queries.roles || {}).isLoading || false"),
        }).add(5, { minHeight: 320 }),
        page.widget("matrix", "Page matrix", "table", {
          dataArrayTemplate: rows("matrix"),
          columns: [
            { key: "role_key", label: "Role", type: "badge" },
            { key: "page_slug", label: "Page", type: "text" },
            { key: "can_view", label: "View", type: "boolean" },
            { key: "can_export", label: "Export", type: "boolean" },
          ],
          pagination: { enabled: true, pageSize: 10 },
          search: { enabled: true, serverSide: false },
          export: { enabled: true },
          editing: { enabled: false },
          multiSelect: { enabled: false },
          emptyText: "No matrix rows.",
          isLoading: expr("(state.queries.matrix || {}).isLoading || false"),
        }).add(7, { minHeight: 320 })
      );
      page.row(page.widget("toggle", "Update matrix row", "form", {
        title: "Update matrix row", submitLabel: "Save matrix row", layout: "grid", columns: 2,
        fields: [
          { key: "roleKey", label: "Role key", type: "select", required: true, options: ctx.roles.map((r) => ({ label: r.title, value: r.key })) },
          { key: "pageSlug", label: "Page slug", type: "select", required: true, options: ctx.pages.map((p) => ({ label: p.slug, value: p.slug })) },
          { key: "canView", label: "Can view", type: "checkbox", defaultValue: true },
          { key: "canExport", label: "Can export", type: "checkbox", defaultValue: false },
        ],
        events: { onSubmit: [execute("update", {
          roleKey: expr("event.formData.roleKey"),
          pageSlug: expr("event.formData.pageSlug"),
          canView: expr("event.formData.canView"),
          canExport: expr("event.formData.canExport"),
        }, { successToast: "Matrix updated", errorToast: "Matrix update failed" })] },
      }).add(12, { minHeight: 220 }));
    },
  });

  // 3. Audit.
  buildPage(ctx, spec, {
    key: "admin-audit",
    title: "Admin � audit log",
    description: "Filterable audit log with old/new JSON diff.",
    tags: ["admin", "manager"],
    variables: [
      { key: "entity", type: "string", defaultValue: "" },
      { key: "actor", type: "string", defaultValue: "" },
      { key: "dateFrom", type: "string", defaultValue: "" },
      { key: "dateTo", type: "string", defaultValue: "" },
      { key: "auditID", type: "number", defaultValue: 1 },
    ],
    sources: [
      source(spec, "audit", `${spec.alias}.shared.audit`, { triggerMode: "reactive", inputs: { entity: expr("state.variables.entity"), entityID: "", actor: expr("state.variables.actor"), dateFrom: expr("state.variables.dateFrom"), dateTo: expr("state.variables.dateTo") }, refreshOn: ["variables.entity", "variables.actor", "variables.dateFrom", "variables.dateTo"] }),
    ],
    build(page) {
      page.row(page.widget("heading", "Audit log", "text", { content: "# Audit log\nEvery template write is captured by database triggers, including writes from workflows, listeners and cron jobs. Select an event to inspect the old/new snapshots.", format: "markdown", showHeader: false }).add(12));
      page.row(
        page.widget("entity", "Entity", "select", { label: "Entity", defaultValue: "", options: [{ label: "All entities", value: "" }, ...spec.entities.map((e) => ({ label: e.title, value: e.key }))], showHeader: false, events: { onChange: [setVar("entity", expr("event.value"))] } }).add(3, { minHeight: 52 }),
        page.widget("actor", "Actor", "search-input", { placeholder: "Filter by actor", showHeader: false, events: { onSearch: [setVar("actor", expr("event.searchTerm || ''"))] } }).add(3, { minHeight: 52 }),
        page.widget("range", "Date range", "date-range-picker", { label: "", showHeader: false, events: { onChange: [setVar("dateFrom", expr("event.startDate || ''")), setVar("dateTo", expr("event.endDate || ''"))], onClear: [setVar("dateFrom", ""), setVar("dateTo", "")] } }).add(4, { minHeight: 52 })
      );
      page.row(page.widget("table", "Audit events", "table", {
        dataArrayTemplate: rows("audit"),
        columns: [
          { key: "created_at", label: "When", type: "date" },
          { key: "entity", label: "Entity", type: "badge" },
          { key: "entity_id", label: "Record", type: "number" },
          { key: "action", label: "Action", type: "badge" },
          { key: "actor", label: "Actor", type: "text" },
        ],
        pagination: { enabled: true, pageSize: 10 },
        search: { enabled: true, serverSide: false },
        export: { enabled: true },
        editing: { enabled: false },
        multiSelect: { enabled: false },
        emptyText: "No audit events.",
        isLoading: expr("(state.queries.audit || {}).isLoading || false"),
        events: { onRowSelect: [setVar("auditID", expr("event.row.id"))] },
      }).add(7, { minHeight: 380 }),
      page.widget("diff", "Selected event", "json-viewer", {
        label: "Selected event (old/new)",
        dataTemplate: expr(`(state.widgets["widget_${wid(spec, `${spec.alias}-admin-audit.table`)}_1"] || {}).selectedRow || null`),
        collapsed: false,
        isLoading: false,
      }).add(5, { minHeight: 380 })
      );
    },
  });

  // 4. Settings and feature flags.
  buildPage(ctx, spec, {
    key: "admin-settings",
    title: "Admin � system settings",
    description: "Settings and feature flags with audited updates.",
    tags: ["admin"],
    variables: [{ key: "kind", type: "string", defaultValue: "feature_flag" }],
    sources: [
      source(spec, "settings", `${spec.alias}.shared.settings`, { inputs: { kinds: ["setting", "branding", "feature_flag"] } }),
      source(spec, "update", `${spec.alias}.shared.settings_update`, { triggerMode: "manual" }),
    ],
    build(page) {
      page.row(page.widget("heading", "System settings", "text", { content: "# System settings\nBranding, notification preferences and feature flags. Settings are stored as JSON and every write is audited.", format: "markdown", showHeader: false }).add(12));
      page.row(page.widget("settings", "Configuration", "table", {
        dataArrayTemplate: rows("settings"),
        columns: [
          { key: "kind", label: "Kind", type: "badge" },
          { key: "config_key", label: "Key", type: "text" },
          { key: "label", label: "Label", type: "text" },
          { key: "updated_at", label: "Updated", type: "date" },
        ],
        pagination: { enabled: true, pageSize: 10 },
        search: { enabled: true, serverSide: false },
        export: { enabled: true },
        editing: { enabled: false },
        multiSelect: { enabled: false },
        emptyText: "No settings.",
        isLoading: expr("(state.queries.settings || {}).isLoading || false"),
      }).add(7, { minHeight: 340 }),
      page.widget("flagForm", "Toggle feature flag", "form", {
        title: "Toggle feature flag", submitLabel: "Save flag",
        fields: [
          { key: "configKey", label: "Flag", type: "select", required: true, options: [
            { label: "Bulk actions", value: "flags.bulkActions" },
            { label: "CSV import", value: "flags.csvImport" },
            { label: "Workflow automation", value: "flags.workflowAutomation" },
            { label: "External portal", value: "flags.externalPortal" },
          ] },
          { key: "value", label: "Enabled", type: "checkbox", defaultValue: true },
        ],
        events: { onSubmit: [execute("update", { kind: "feature_flag", configKey: expr("event.formData.configKey"), value: expr("({ value: event.formData.value })") }, { successToast: "Flag saved", errorToast: "Flag failed" })] },
      }).add(5, { minHeight: 340 })
      );
    },
  });

  // 5. Import / export.
  buildPage(ctx, spec, {
    key: "admin-import",
    title: "Admin � import / export",
    description: "CSV import with validation summary and record export.",
    tags: ["admin", "manager"],
    variables: [{ key: "entity", type: "string", defaultValue: main.key }, { key: "csv", type: "string", defaultValue: "" }],
    sources: [
      source(spec, "jobs", `${spec.alias}.shared.import_jobs`, {}),
      source(spec, "import", `${spec.alias}.shared.import_csv`, { triggerMode: "manual" }),
      source(spec, "export", `${spec.alias}.${main.key}.export`, { triggerMode: "manual" }),
    ],
    build(page) {
      page.row(page.widget("heading", "Import / export", "text", { content: `# Import / export\nPaste CSV with the header \`${main.fields.filter((f) => ["text", "email", "phone", "code"].includes(f.type)).slice(0, 3).map((f) => f.key).join(",")}\` for ${main.title.toLowerCase()}. The importer validates row width, inserts valid rows and returns a success/error summary.`, format: "markdown", showHeader: false }).add(12));
      page.row(
        page.widget("form", "CSV import", "form", {
          title: "CSV import", submitLabel: "Run import",
          fields: [{ key: "csv", label: "CSV content", type: "textarea", required: true, defaultValue: `${main.fields.filter((f) => ["text", "email", "phone", "code"].includes(f.type)).slice(0, 3).map((f) => f.key).join(",")}\nSample,row,value` }],
          events: { onSubmit: [execute("import", { csv: expr("event.formData.csv") }, { successToast: "Import completed", errorToast: "Import failed" })] },
        }).add(6, { minHeight: 280 }),
        page.widget("result", "Import result", "json-viewer", { label: "Import result", dataTemplate: expr("(state.queries.import || {}).data || null"), isLoading: expr("(state.queries.import || {}).isLoading || false") }).add(6, { minHeight: 280 })
      );
      page.row(page.widget("jobs", "Import jobs", "table", {
        dataArrayTemplate: rows("jobs"),
        columns: [
          { key: "entity", label: "Entity", type: "text" },
          { key: "file_name", label: "File", type: "text" },
          { key: "status", label: "Status", type: "badge" },
          { key: "total_rows", label: "Total", type: "number" },
          { key: "success_rows", label: "Success", type: "number" },
          { key: "error_rows", label: "Errors", type: "number" },
          { key: "created_at", label: "When", type: "date" },
        ],
        pagination: { enabled: true, pageSize: 8 },
        search: { enabled: true, serverSide: false },
        export: { enabled: true },
        editing: { enabled: false },
        multiSelect: { enabled: false },
        emptyText: "No import jobs.",
        isLoading: expr("(state.queries.jobs || {}).isLoading || false"),
      }).add(12, { minHeight: 320 }));
    },
  });

  // 6. Integrations.
  buildPage(ctx, spec, {
    key: "admin-integrations",
    title: "Admin � integration health",
    description: "Integration health and inbound webhook event log.",
    tags: ["admin"],
    variables: [],
    sources: [
      source(spec, "ops", `${spec.alias}.shared.ops`, { inputs: { kinds: ["integration_health", "webhook"] } }),
      source(spec, "ping", `${spec.alias}.shared.integration_ping`, { triggerMode: "manual" }),
    ],
    build(page) {
      page.row(page.widget("heading", "Integration health", "text", { content: "# Integration health\nThe packaged REST connector is a mock and intentionally unreachable until reconnected. Raw webhook events are read from the platform listener event store, tenant-scoped.", format: "markdown", showHeader: false }).add(12));
      page.row(page.widget("ping", "Probe integration", "button", { text: "Run health probe", showHeader: false, events: { onClick: [execute("ping", {}, { successToast: "Probe completed", errorToast: "Probe failed (expected for the mock)" })] } }).add(4, { minHeight: 52 }),
      page.widget("result", "Probe result", "json-viewer", { label: "Probe result", dataTemplate: expr("(state.queries.ping || {}).data || null"), isLoading: expr("(state.queries.ping || {}).isLoading || false") }).add(8, { minHeight: 120 }));
      page.row(page.widget("ops", "Operations events", "table", {
        dataArrayTemplate: rows("ops"),
        columns: [
          { key: "kind", label: "Kind", type: "badge" },
          { key: "source", label: "Source", type: "text" },
          { key: "status", label: "Status", type: "badge" },
          { key: "severity", label: "Severity", type: "badge" },
          { key: "created_at", label: "When", type: "date" },
        ],
        pagination: { enabled: true, pageSize: 10 },
        search: { enabled: true, serverSide: false },
        export: { enabled: true },
        editing: { enabled: false },
        multiSelect: { enabled: false },
        emptyText: "No integration events.",
        isLoading: expr("(state.queries.ops || {}).isLoading || false"),
      }).add(12, { minHeight: 380 }));
    },
  });

  // 7. Jobs.
  buildPage(ctx, spec, {
    key: "admin-jobs",
    title: "Admin � jobs and workflow runs",
    description: "Workflow instance monitor, run logs and cron history.",
    tags: ["admin"],
    variables: [],
    sources: [
      source(spec, "runs", `${spec.alias}.shared.admin_workflow_runs`, { inputs: { tenantID: expr("state.globals.tenantID") } }),
      source(spec, "logs", `${spec.alias}.shared.admin_workflow_logs`, { inputs: { tenantID: expr("state.globals.tenantID") } }),
      source(spec, "cron", `${spec.alias}.shared.admin_cron_history`, { inputs: { tenantID: expr("state.globals.tenantID") } }),
    ],
    build(page) {
      page.row(page.widget("heading", "Jobs and workflow runs", "text", { content: "# Jobs and workflow runs\nTenant-scoped platform workflow instances, node logs and cron history. This page is read-only; retries are managed by the platform engine.", format: "markdown", showHeader: false }).add(12));
      page.row(page.widget("runs", "Workflow runs", "table", {
        dataArrayTemplate: rows("runs"),
        columns: [
          { key: "workflow_title", label: "Workflow", type: "text" },
          { key: "status", label: "Status", type: "badge" },
          { key: "started_at", label: "Started", type: "date" },
          { key: "completed_at", label: "Completed", type: "date" },
          { key: "is_test", label: "Test", type: "boolean" },
        ],
        pagination: { enabled: true, pageSize: 8 },
        search: { enabled: true, serverSide: false },
        export: { enabled: true },
        editing: { enabled: false },
        multiSelect: { enabled: false },
        emptyText: "No workflow runs.",
        isLoading: expr("(state.queries.runs || {}).isLoading || false"),
      }).add(12, { minHeight: 280 }));
      page.row(page.widget("logs", "Run logs", "table", {
        dataArrayTemplate: rows("logs"),
        columns: [
          { key: "event_type", label: "Event", type: "badge" },
          { key: "node_id", label: "Node", type: "text" },
          { key: "node_status", label: "Status", type: "badge" },
          { key: "error_message", label: "Error", type: "text" },
          { key: "created_at", label: "When", type: "date" },
        ],
        pagination: { enabled: true, pageSize: 8 },
        search: { enabled: true, serverSide: false },
        export: { enabled: true },
        editing: { enabled: false },
        multiSelect: { enabled: false },
        emptyText: "No run logs.",
        isLoading: expr("(state.queries.logs || {}).isLoading || false"),
      }).add(7, { minHeight: 300 }),
      page.widget("cron", "Cron history", "table", {
        dataArrayTemplate: rows("cron"),
        columns: [
          { key: "job_title", label: "Job", type: "text" },
          { key: "status", label: "Status", type: "badge" },
          { key: "scheduled_at", label: "Scheduled", type: "date" },
          { key: "duration_ms", label: "Duration (ms)", type: "number" },
        ],
        pagination: { enabled: true, pageSize: 8 },
        search: { enabled: true, serverSide: false },
        export: { enabled: true },
        editing: { enabled: false },
        multiSelect: { enabled: false },
        emptyText: "No cron history.",
        isLoading: expr("(state.queries.cron || {}).isLoading || false"),
      }).add(5, { minHeight: 300 })
      );
    },
  });

  // 8. Data quality.
  buildPage(ctx, spec, {
    key: "admin-quality",
    title: "Admin � data quality",
    description: "Quality checks and operational failures.",
    tags: ["admin", "manager"],
    variables: [],
    sources: [
      source(spec, "quality", `${spec.alias}.shared.data_quality`, {}),
      source(spec, "ops", `${spec.alias}.shared.ops`, { inputs: { kinds: ["data_quality"] } }),
    ],
    build(page) {
      page.row(page.widget("heading", "Data quality", "text", { content: "# Data quality\nAutomated checks for missing labels and negative financial amounts, plus the operational quality event log. Fix source records from their list/detail pages.", format: "markdown", showHeader: false }).add(12));
      page.row(page.widget("quality", "Checks", "table", {
        dataArrayTemplate: rows("quality"),
        columns: [
          { key: "entity", label: "Entity", type: "badge" },
          { key: "check_name", label: "Check", type: "text" },
          { key: "affected_rows", label: "Affected", type: "number" },
          { key: "detail", label: "Detail", type: "text" },
        ],
        pagination: { enabled: true, pageSize: 10 },
        search: { enabled: true, serverSide: false },
        export: { enabled: true },
        editing: { enabled: false },
        multiSelect: { enabled: false },
        emptyText: "No checks.",
        isLoading: expr("(state.queries.quality || {}).isLoading || false"),
      }).add(7, { minHeight: 320 }),
      page.widget("ops", "Quality operations", "table", {
        dataArrayTemplate: rows("ops"),
        columns: [
          { key: "source", label: "Source", type: "text" },
          { key: "status", label: "Status", type: "badge" },
          { key: "created_at", label: "When", type: "date" },
        ],
        pagination: { enabled: true, pageSize: 8 },
        search: { enabled: true, serverSide: false },
        export: { enabled: true },
        editing: { enabled: false },
        multiSelect: { enabled: false },
        emptyText: "No operations.",
        isLoading: expr("(state.queries.ops || {}).isLoading || false"),
      }).add(5, { minHeight: 320 }))
      ;
    },
  });
}

module.exports = {
  buildListPage,
  buildDetailPage,
  buildCreatePage,
  buildDashboard,
  buildReports,
  buildKanbanCalendar,
  buildSharedPages,
  buildAdminPages,
};
