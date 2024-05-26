export class Graph {
  constructor({ pm_graph_id, title, description, graph_options, dataset }) {
    this.pm_graph_id = parseInt(pm_graph_id);
    this.title = String(title);
    this.description = String(description);
    this.graph_options =
      typeof graph_options === "object"
        ? graph_options
        : JSON.parse(graph_options);
    this.dataset = dataset;
  }
  static toList = (data) => {
    if (Array.isArray(data)) {
      return data.map((item) => {
        return new Graph(item);
      });
    }
  };
}
