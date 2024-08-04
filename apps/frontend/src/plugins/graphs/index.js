import { BarGraphComponent } from "./barGraph/components/BarGraphComponent";
import { DoughnutGraphComponent } from "./doughnutGraph/components/DoughnutGraphComponent";
import { LineGraphComponent } from "./lineGraph/components/LineGraphComponent";
import { PieGraphComponent } from "./pieGraph/components/PieGraphComponent";
import { PolarAreaGraphComponent } from "./polarGraph/components/PolarAreaGraphComponent";
import { RadarGraphComponent } from "./radarGraph/components/RadarGraphComponent";
import { TbApi } from "react-icons/tb";
import { FaChartBar } from "react-icons/fa";
import { FaChartLine } from "react-icons/fa6";
import { FaChartPie } from "react-icons/fa";
import { BiSolidDoughnutChart } from "react-icons/bi";
import { PiChartPolar } from "react-icons/pi";
import { BiRadar } from "react-icons/bi";
export const GRAPH_PLUGINS_MAP = {
  BAR: {
    label: "Bar",
    value: "BAR",
    fields: ["label", "x_axis", "y_axis", "index_axis"],
    component: ({ legendPosition, titleDisplayEnabled, graphTitle, data }) => (
      <BarGraphComponent
        legendPosition={legendPosition}
        titleDisplayEnabled={titleDisplayEnabled}
        graphTitle={graphTitle}
        data={data}
      />
    ),
    icon: <FaChartBar />,
  },
  LINE: {
    label: "Line",
    value: "LINE",
    fields: ["label", "x_axis", "y_axis", "fill"],
    component: ({ legendPosition, titleDisplayEnabled, graphTitle, data }) => (
      <LineGraphComponent
        legendPosition={legendPosition}
        titleDisplayEnabled={titleDisplayEnabled}
        graphTitle={graphTitle}
        data={data}
      />
    ),
    icon: <FaChartLine />,
  },
  PIE: {
    label: "Pie",
    value: "PIE",
    fields: ["label", "value"],
    component: ({ legendPosition, titleDisplayEnabled, graphTitle, data }) => (
      <PieGraphComponent
        legendPosition={legendPosition}
        titleDisplayEnabled={titleDisplayEnabled}
        graphTitle={graphTitle}
        data={data}
      />
    ),
    icon: <FaChartPie />,
  },
  DOUGHNUT: {
    label: "Doughnut",
    value: "DOUGHNUT",
    fields: ["label", "value"],
    component: ({ legendPosition, titleDisplayEnabled, graphTitle, data }) => (
      <DoughnutGraphComponent
        legendPosition={legendPosition}
        titleDisplayEnabled={titleDisplayEnabled}
        graphTitle={graphTitle}
        data={data}
      />
    ),
    icon: <BiSolidDoughnutChart />,
  },
  POLAR_AREA: {
    label: "Polar Area",
    value: "POLAR_AREA",
    fields: ["label", "value"],
    component: ({ legendPosition, titleDisplayEnabled, graphTitle, data }) => (
      <PolarAreaGraphComponent
        legendPosition={legendPosition}
        titleDisplayEnabled={titleDisplayEnabled}
        graphTitle={graphTitle}
        data={data}
      />
    ),
    icon: <PiChartPolar />,
  },
  RADAR: {
    label: "Radar",
    value: "RADAR",
    fields: ["label", "value"],
    component: ({ legendPosition, titleDisplayEnabled, graphTitle, data }) => (
      <RadarGraphComponent
        legendPosition={legendPosition}
        titleDisplayEnabled={titleDisplayEnabled}
        graphTitle={graphTitle}
        data={data}
      />
    ),
    icon: <BiRadar />,
  },
};
