import { useFormik } from "formik";
import { LOCAL_CONSTANTS } from "../../../constants";
import { Button, Grid, useTheme } from "@mui/material";
export const TableAdditionForm = () => {
  const theme = useTheme();
  const tableAdditionForm = useFormik({
    initialValues: {
      table_name: LOCAL_CONSTANTS.STRINGS.FORM_FIELD_PLACEHOLDER_UNTITLED,
    },
  });
  return (
    <div className="w-full h-full overflow-y-scroll">
      <div
        className="flex flex-row items-center justify-between p-3"
        style={{
          background: theme.palette.background.paper,
          borderBottomWidth: 1,
          borderColor: theme.palette.divider,
        }}
      >
        <div className="flex flex-col items-start justify-start">
          <span className="text-lg font-bold text-start ">
            {LOCAL_CONSTANTS.STRINGS.TABLE_ADDITION_PAGE_TITLE}
          </span>
          {/* {graphData && (
            <span
              className="text-xs font-thin text-start text-slate-300"
              style={{ color: theme.palette.text.secondary }}
            >{`${graphData.pm_graph_title} | Graph ID : ${graphData.pm_graph_id}`}</span>
          )} */}
        </div>
        <div>
          <Button
            variant="contained"
            // onClick={_handleSubmit}
            // disabled={isUpdatingGraph}
          >
            {LOCAL_CONSTANTS.STRINGS.SUBMIT_BUTTON_TEXT}
          </Button>
          {/* {(id != null || id != undefined) && <GraphDeletionForm id={id} />} */}
        </div>
      </div>
      <Grid container spacing={1} className="!px-3"></Grid>
    </div>
  );
};
