export class Graph {
  constructor({
    pm_graph_id,
    graph_title,
    graph_description,
    graph_options,
    dataset,
    is_disabled,
    created_at,
    updated_at,
    disabled_at,
    disable_reason,
  }) {
    this.pm_graph_id = parseInt(pm_graph_id);
    this.graph_title = String(graph_title);
    this.graph_description = String(graph_description);
    this.graph_options =
      typeof graph_options === "object"
        ? graph_options
        : JSON.parse(graph_options);
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
