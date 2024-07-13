import { BarGraphComponent } from "./barchart/components/BarGraphComponent";
import { DoughnutGraphComponent } from "./doughnutchart/components/DoughnutChartComponent";
import { LineGraphComponent } from "./linechart/components/LineGraphComponent";
import { PieGraphComponent } from "./piechart/components/PieChartComponent";
import { PolarAreaGraphComponent } from "./polarchart/components/PolarAreaChartComponent";
import { RadarGraphComponent } from "./radarchart/components/RadarChartComponent";
import { TbApi } from "react-icons/tb";
export const GRAPH_PLUGINS_MAP = {
  BAR: {
    label: "Bar",
    value: "BAR",
    fields: ["x_axis", "y_axis", "index_axis"],
    component: ({ legendPosition, titleDisplayEnabled, graphTitle, data }) => (
      <BarGraphComponent
        legendPosition={legendPosition}
        titleDisplayEnabled={titleDisplayEnabled}
        graphTitle={graphTitle}
        data={data}
      />
    ),
    icon: <TbApi />,
  },
  LINE: {
    label: "Line",
    value: "LINE",
    fields: ["x_axis", "y_axis", "fill"],
    component: ({ legendPosition, titleDisplayEnabled, graphTitle, data }) => (
      <LineGraphComponent
        legendPosition={legendPosition}
        titleDisplayEnabled={titleDisplayEnabled}
        graphTitle={graphTitle}
        data={data}
      />
    ),
    icon: <TbApi />,
  },
  PIE: {
    label: "Pie",
    value: "PIE",
    fields: ["x_axis", "y_axis"],
    component: ({ legendPosition, titleDisplayEnabled, graphTitle, data }) => (
      <PieGraphComponent
        legendPosition={legendPosition}
        titleDisplayEnabled={titleDisplayEnabled}
        graphTitle={graphTitle}
        data={data}
      />
    ),
    icon: <TbApi />,
  },
  DOUGHNUT: {
    label: "Doughnut",
    value: "DOUGHNUT",
    fields: ["x_axis", "y_axis"],
    component: ({ legendPosition, titleDisplayEnabled, graphTitle, data }) => (
      <DoughnutGraphComponent
        legendPosition={legendPosition}
        titleDisplayEnabled={titleDisplayEnabled}
        graphTitle={graphTitle}
        data={data}
      />
    ),
    icon: <TbApi />,
  },
  POLAR_AREA: {
    label: "Polar Area",
    value: "POLAR_AREA",
    fields: ["x_axis", "y_axis"],
    component: ({ legendPosition, titleDisplayEnabled, graphTitle, data }) => (
      <PolarAreaGraphComponent
        legendPosition={legendPosition}
        titleDisplayEnabled={titleDisplayEnabled}
        graphTitle={graphTitle}
        data={data}
      />
    ),
    icon: <TbApi />,
  },
  RADAR: {
    label: "Radar",
    value: "RADAR",
    fields: ["x_axis", "y_axis"],
    component: ({ legendPosition, titleDisplayEnabled, graphTitle, data }) => (
      <RadarGraphComponent
        legendPosition={legendPosition}
        titleDisplayEnabled={titleDisplayEnabled}
        graphTitle={graphTitle}
        data={data}
      />
    ),
    icon: <TbApi />,
  },
};
