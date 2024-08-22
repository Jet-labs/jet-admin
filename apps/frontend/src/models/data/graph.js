export class Graph {
  constructor({
    pm_graph_id,
    pm_graph_title,
    graph_description,
    pm_graph_options,
    dataset,
    is_disabled,
    created_at,
    updated_at,
    disabled_at,
    disable_reason,
  }) {
    this.pm_graph_id = parseInt(pm_graph_id);
    this.pm_graph_title = String(pm_graph_title);
    this.graph_description = String(graph_description);
    this.pm_graph_options = pm_graph_options
      ? typeof pm_graph_options === "object"
        ? pm_graph_options
        : JSON.parse(pm_graph_options)
      : null;
    this.dataset = dataset;
    this.is_disabled = is_disabled;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.disabled_at = disabled_at;
    this.disable_reason = disable_reason;
  }
  static toList = (data) => {
    if (Array.isArray(data)) {
      return data.map((item) => {
        return new Graph(item);
      });
    }
  };
}
