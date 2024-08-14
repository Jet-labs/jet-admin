const { LineGraph } = require("./lineGraph");
const { BarGraph } = require("./BarGraph");
const { DoughnutGraph } = require("./doughnutGraph");
const { PieGraph } = require("./PieGraph");
const { PolarGraph } = require("./polarGraph");
const { RadialGraph } = require("./radialGraph");

const GRAPH_PLUGINS_MAP = {
  BAR: {
    label: "Bar",
    value: "BAR",
    getGraphModel: ({ pm_graph_id, graph_title, graph_options }) => {
      return new BarGraph({ pm_graph_id, graph_title, graph_options });
    },
  },
  LINE: {
    label: "Line",
    value: "LINE",
    fields: ["x_axis", "y_axis", "fill"],
    getGraphModel: ({ pm_graph_id, graph_title, graph_options }) => {
      return new LineGraph({ pm_graph_id, graph_title, graph_options });
    },
  },
  PIE: {
    label: "Pie",
    value: "PIE",
    fields: ["label", "value"],
    getGraphModel: ({ pm_graph_id, graph_title, graph_options }) => {
      return new PieGraph({ pm_graph_id, graph_title, graph_options });
    },
  },
  DOUGHNUT: {
    label: "Doughnut",
    value: "DOUGHNUT",
    fields: ["label", "value"],
    getGraphModel: ({ pm_graph_id, graph_title, graph_options }) => {
      return new DoughnutGraph({ pm_graph_id, graph_title, graph_options });
    },
  },
  POLAR_AREA: {
    label: "Polar Area",
    value: "POLAR_AREA",
    fields: ["label", "value"],
    getGraphModel: ({ pm_graph_id, graph_title, graph_options }) => {
      return new PolarGraph({ pm_graph_id, graph_title, graph_options });
    },
  },
  RADAR: {
    label: "Radar",
    value: "RADAR",
    fields: ["label", "value"],
    getGraphModel: ({ pm_graph_id, graph_title, graph_options }) => {
      return new RadialGraph({ pm_graph_id, graph_title, graph_options });
    },
  },
};

module.exports = { GRAPH_PLUGINS_MAP };
