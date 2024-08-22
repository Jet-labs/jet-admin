class BaseGraph {
  constructor({ pm_graph_id, pm_graph_title, pm_graph_options }) {
    this.pm_graph_id = parseInt(pm_graph_id);
    this.pm_graph_title = pm_graph_title;
    this.pm_graph_options = pm_graph_options;
  }
  transformData = () => {};
  runQueries = () => {};
  getProcessedData = () => {};
}
module.exports = { BaseGraph };
