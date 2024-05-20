import { Grid, useTheme } from "@mui/material";
import { useFormik } from "formik";
import React, { useMemo } from "react";
import { FieldComponent } from "../../components/FieldComponent";
import { LOCAL_CONSTANTS } from "../../constants";
import { useAuthState } from "../../contexts/authContext";
import { getAllTableFields } from "../../utils/tables";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

import { faker } from "@faker-js/faker";
import { LineGraphComponent } from "../../components/LineGraphComponent";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

class LineChartDataset {
  /**
   *
   * @param {object} param0
   * @param {String} param0.label
   * @param {Array<Number>} param0.data
   * @param {String} param0.borderColor
   * @param {String} param0.backgroundColor
   */
  constructor({ label, data, borderColor, backgroundColor }) {
    this.label = label;
    this.data = data;
    this.borderColor = borderColor;
    this.backgroundColor = backgroundColor;
  }
}
class LineChartData {
  /**
   *
   * @param {object} param0
   * @param {Array<String>} param0.labels
   * @param {Array<LineChartDataset>} param0.datasets
   */
  constructor({ labels, datasets }) {
    this.labels = labels;
    this.datasets = datasets;
  }
}

const labels = ["January", "February", "March", "April", "May", "June", "July"];

export const data = {
  labels,
  datasets: [
    {
      label: "Dataset 1",
      data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
      borderColor: "rgb(255, 99, 132)",
      backgroundColor: "rgba(255, 99, 132, 0.5)",
    },
    {
      label: "Dataset 2",
      data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
      borderColor: "rgb(53, 162, 235)",
      backgroundColor: "rgba(53, 162, 235, 0.5)",
    },
  ],
};

const GraphBuilderPreview = ({ legendPosition, legendDisplay, title }) => {
  const theme = useTheme();
  const options = useMemo(() => {
    return {
      responsive: true,
      plugins: {
        legend: {
          position: legendPosition ? legendPosition : "top",
        },
        title: {
          display: Boolean(legendDisplay),
          text: title ? title : "Chart title here",
        },
      },
    };
  }, [legendPosition, legendDisplay, title]);
  return (
    <div className="!pt-10">
      <Grid
        container
        rowSpacing={2}
        className="rounded !p-3"
        style={{ background: theme.palette.action.selected }}
      >
        {options && <LineGraphComponent />}
      </Grid>
    </div>
  );
};
const GraphBuilderForm = () => {
  const theme = useTheme();
  // const { pmUser } = useAuthState();
  // const authorizedTables = useMemo(() => {
  //   if (pmUser) {
  //     const c = pmUser.extractAuthorizedTables();
  //     return c;
  //   } else {
  //     return null;
  //   }
  // }, [pmUser]);

  // const allColumns = useMemo(() => {
  //   if (pmUser && tableName) {
  //     const u = pmUser;
  //     const c = u.extractAuthorizationForRowAdditionFromPolicyObject(tableName);
  //     if (!c) {
  //       return null;
  //     } else {
  //       return getAllTableFields(dbModel, tableName);
  //     }
  //   } else {
  //     return null;
  //   }
  // }, [pmUser, dbModel, tableName]);

  const graphForm = useFormik({
    initialValues: {
      title: "",
      graph_type: LOCAL_CONSTANTS.GRAPH_TYPES.BAR.value,
      query: { where: {} },
    },
    validateOnMount: false,
    validateOnChange: false,
    validate: (values) => {
      const errors = {};

      return errors;
    },
    onSubmit: (values) => {
      console.log({ graph: values });
    },
  });

  return (
    <form onSubmit={graphForm.handleSubmit} className="!pt-10">
      <Grid
        container
        rowSpacing={2}
        className="rounded !p-3"
        style={{ background: theme.palette.action.selected }}
      >
        <Grid item xs={12} sm={12} md={12} lg={12} key={"title"}>
          <FieldComponent
            type={LOCAL_CONSTANTS.DATA_TYPES.STRING}
            name={"title"}
            value={graphForm.values["title"]}
            onBlur={graphForm.handleBlur}
            onChange={graphForm.handleChange}
            setFieldValue={graphForm.setFieldValue}
            helperText={graphForm.errors["title"]}
            error={Boolean(graphForm.errors["title"])}
            required={true}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} key={"graph_type"}>
          <FieldComponent
            type={LOCAL_CONSTANTS.DATA_TYPES.SINGLE_SELECT}
            selectOptions={Object.keys(LOCAL_CONSTANTS.GRAPH_TYPES).map((e) => {
              return LOCAL_CONSTANTS.GRAPH_TYPES[e];
            })}
            name={"graph_type"}
            value={graphForm.values["graph_type"]}
            onBlur={graphForm.handleBlur}
            onChange={graphForm.handleChange}
            setFieldValue={graphForm.setFieldValue}
            helperText={graphForm.errors["graph_type"]}
            error={Boolean(graphForm.errors["graph_type"])}
            required={true}
            customMapping={null}
            jsonMode={"code"}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} key={"query"}>
          <FieldComponent
            type={LOCAL_CONSTANTS.DATA_TYPES.JSON}
            name={"query"}
            value={graphForm.values["query"]}
            onBlur={graphForm.handleBlur}
            onChange={graphForm.handleChange}
            setFieldValue={graphForm.setFieldValue}
            helperText={graphForm.errors["query"]}
            error={Boolean(graphForm.errors["query"])}
            required={true}
            customMapping={null}
            jsonMode={"code"}
          />
        </Grid>
      </Grid>
    </form>
  );
};

const AddGraph = () => {
  return (
    <div className="w-full ">
      <Grid container columnSpacing={2} className="!px-3">
        <Grid item lg={5} md={4} className="w-full">
          <GraphBuilderForm />
        </Grid>
        <Grid item lg={7} md={8} className="w-full">
          <GraphBuilderPreview />
        </Grid>
      </Grid>
    </div>
  );
};

export default AddGraph;
