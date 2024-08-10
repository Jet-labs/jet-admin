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
    fields: ["dataset_title", "x_axis", "y_axis", "index_axis"],
    component: ({
      legendPosition,
      titleDisplayEnabled,
      graphTitle,
      data,
      refetchInterval,
    }) => (
      <BarGraphComponent
        legendPosition={legendPosition}
        titleDisplayEnabled={titleDisplayEnabled}
        graphTitle={graphTitle}
        data={data}
        refetchInterval={refetchInterval}
      />
    ),
    icon: <FaChartBar className="!text-lg" />,
  },
  LINE: {
    label: "Line",
    value: "LINE",
    fields: ["dataset_title", "x_axis", "y_axis", "fill"],
    component: ({
      legendPosition,
      titleDisplayEnabled,
      graphTitle,
      data,
      refetchInterval,
    }) => (
      <LineGraphComponent
        legendPosition={legendPosition}
        titleDisplayEnabled={titleDisplayEnabled}
        graphTitle={graphTitle}
        data={data}
        refetchInterval={refetchInterval}
      />
    ),
    icon: <FaChartLine className="!text-lg" />,
  },
  PIE: {
    label: "Pie",
    value: "PIE",
    fields: ["dataset_title", "label", "value"],
    component: ({
      legendPosition,
      titleDisplayEnabled,
      graphTitle,
      data,
      refetchInterval,
    }) => (
      <PieGraphComponent
        legendPosition={legendPosition}
        titleDisplayEnabled={titleDisplayEnabled}
        graphTitle={graphTitle}
        data={data}
        refetchInterval={refetchInterval}
      />
    ),
    icon: <FaChartPie className="!text-lg" />,
  },
  DOUGHNUT: {
    label: "Doughnut",
    value: "DOUGHNUT",
    fields: ["dataset_title", "label", "value"],
    component: ({
      legendPosition,
      titleDisplayEnabled,
      graphTitle,
      data,
      refetchInterval,
    }) => (
      <DoughnutGraphComponent
        legendPosition={legendPosition}
        titleDisplayEnabled={titleDisplayEnabled}
        graphTitle={graphTitle}
        data={data}
        refetchInterval={refetchInterval}
      />
    ),
    icon: <BiSolidDoughnutChart className="!text-lg" />,
  },
  POLAR_AREA: {
    label: "Polar Area",
    value: "POLAR_AREA",
    fields: ["dataset_title", "label", "value"],
    component: ({
      legendPosition,
      titleDisplayEnabled,
      graphTitle,
      data,
      refetchInterval,
    }) => (
      <PolarAreaGraphComponent
        legendPosition={legendPosition}
        titleDisplayEnabled={titleDisplayEnabled}
        graphTitle={graphTitle}
        data={data}
        refetchInterval={refetchInterval}
      />
    ),
    icon: <PiChartPolar className="!text-lg" />,
  },
  RADAR: {
    label: "Radar",
    value: "RADAR",
    fields: ["dataset_title", "label", "value"],
    component: ({
      legendPosition,
      titleDisplayEnabled,
      graphTitle,
      data,
      refetchInterval,
    }) => (
      <RadarGraphComponent
        legendPosition={legendPosition}
        titleDisplayEnabled={titleDisplayEnabled}
        graphTitle={graphTitle}
        data={data}
        refetchInterval={refetchInterval}
      />
    ),
    icon: <BiRadar className="!text-lg" />,
  },
};
