import { BarGraphComponent } from "./BarGraphComponent";
import { DoughnutGraphComponent } from "./DoughnutGraphComponent";
import { LineGraphComponent } from "./LineGraphComponent";
import { PieGraphComponent } from "./PieGraphComponent";
import { PolarAreaGraphComponent } from "./PolarAreaGraphComponent";
import { RadarGraphComponent } from "./RadarGraphComponent";
import { FaChartBar } from "react-icons/fa";
import { FaChartLine } from "react-icons/fa6";
import { FaChartPie } from "react-icons/fa";
import { BiSolidDoughnutChart } from "react-icons/bi";
import { PiChartPolar } from "react-icons/pi";
import { BiRadar } from "react-icons/bi";
import { ScatterGraphComponent } from "./ScatterGraphComponent";
export const GRAPH_PLUGINS_MAP = {
  BAR: {
    label: "Bar",
    value: "BAR",
    fields: ["dataset_title", "x_axis", "y_axis", "index_axis"],
    component: ({
      legendPosition,
      titleDisplayEnabled,
      pmGraphTitle,
      data,
      refetchInterval,
    }) => (
      <BarGraphComponent
        legendPosition={legendPosition}
        titleDisplayEnabled={titleDisplayEnabled}
        pmGraphTitle={pmGraphTitle}
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
      pmGraphTitle,
      data,
      refetchInterval,
    }) => (
      <LineGraphComponent
        legendPosition={legendPosition}
        titleDisplayEnabled={titleDisplayEnabled}
        pmGraphTitle={pmGraphTitle}
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
      pmGraphTitle,
      data,
      refetchInterval,
    }) => (
      <PieGraphComponent
        legendPosition={legendPosition}
        titleDisplayEnabled={titleDisplayEnabled}
        pmGraphTitle={pmGraphTitle}
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
      pmGraphTitle,
      data,
      refetchInterval,
    }) => (
      <DoughnutGraphComponent
        legendPosition={legendPosition}
        titleDisplayEnabled={titleDisplayEnabled}
        pmGraphTitle={pmGraphTitle}
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
      pmGraphTitle,
      data,
      refetchInterval,
    }) => (
      <PolarAreaGraphComponent
        legendPosition={legendPosition}
        titleDisplayEnabled={titleDisplayEnabled}
        pmGraphTitle={pmGraphTitle}
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
      pmGraphTitle,
      data,
      refetchInterval,
    }) => (
      <RadarGraphComponent
        legendPosition={legendPosition}
        titleDisplayEnabled={titleDisplayEnabled}
        pmGraphTitle={pmGraphTitle}
        data={data}
        refetchInterval={refetchInterval}
      />
    ),
    icon: <BiRadar className="!text-lg" />,
  },
  SCATTER: {
    label: "Scatter",
    value: "SCATTER",
    fields: ["dataset_title", "label", "x_axis", "y_axis", "fill"],
    component: ({
      legendPosition,
      titleDisplayEnabled,
      pmGraphTitle,
      data,
      refetchInterval,
    }) => (
      <ScatterGraphComponent
        legendPosition={legendPosition}
        titleDisplayEnabled={titleDisplayEnabled}
        pmGraphTitle={pmGraphTitle}
        data={data}
        refetchInterval={refetchInterval}
      />
    ),
    icon: <FaChartLine className="!text-lg" />,
  },
};
