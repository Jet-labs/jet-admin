class BaseGraph {
  constructor({ pm_graph_id, graph_title, graph_options }) {
    this.pm_graph_id = parseInt(pm_graph_id);
    this.graph_title = graph_title;
    this.graph_options = graph_options;
  }
  transformData = () => {};
  runQueries = () => {};
  getProcessedData = () => {};
}
module.exports = { BaseGraph };
