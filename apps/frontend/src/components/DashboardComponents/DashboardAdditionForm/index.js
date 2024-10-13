import { Button, FormControl, Grid, TextField, useTheme } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";

import { useFormik } from "formik";

import { FieldComponent } from "../../../components/FieldComponent";

import { LOCAL_CONSTANTS } from "../../../constants";
import { displayError, displaySuccess } from "../../../utils/notification";
import { FiPlus } from "react-icons/fi";
import { DashboardDropZoneComponent } from "../DashboardDropZoneComponent";
import { WidgetsDnDList } from "../WidgetsDnDList";
import { addDashboardAPI } from "../../../api/dashboards";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../Resizables";

export const DashboardAdditionForm = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const {
    isPending: isAddingDashboard,
    isSuccess: isAddingDashboardSuccess,
    isError: isAddingDashboardError,
    error: addDashboardError,
    mutate: addDashboard,
  } = useMutation({
    mutationFn: ({ data }) => {
      return addDashboardAPI({ data });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess(LOCAL_CONSTANTS.STRINGS.DASHBOARD_ADDITION_SUCCESS);
      queryClient.invalidateQueries([
        LOCAL_CONSTANTS.REACT_QUERY_KEYS.DASHBOARDS,
      ]);
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const dashboardAdditionForm = useFormik({
    initialValues: {
      pm_dashboard_title: "",
      widgets: [],
      layouts: {},
    },
    validateOnMount: false,
    validateOnChange: false,
    validate: (values) => {
      const errors = {};

      return errors;
    },
    onSubmit: (values) => {
      const { pm_dashboard_title, ...pm_dashboard_options } = values;
      addDashboard({
        data: { pm_dashboard_title, pm_dashboard_options },
      });
    },
  });

  return (
    <div className="w-full h-full">
      <ResizablePanelGroup
        className={"!h-full"}
        direction="horizontal"
        autoSaveId="dashboard-widget-panel-sizes"
      >
        <ResizablePanel
          defaultSize={70}
          style={{ background: theme.palette.divider }}
        >
          <DashboardDropZoneComponent
            widgets={dashboardAdditionForm.values["widgets"]}
            setWidgets={(value) =>
              dashboardAdditionForm.setFieldValue("widgets", value)
            }
            layouts={dashboardAdditionForm.values["layouts"]}
            setLayouts={(value) => {
              dashboardAdditionForm.setFieldValue("layouts", value);
            }}
          />
        </ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel
          defaultSize={30}
          className="w-full !h-[calc(100vh-48px)] !overflow-y-auto"
          style={{
            background: theme.palette.background.default,
            borderLeftWidth: 1,
            borderColor: theme.palette.divider,
          }}
        >
          <Grid item sm={12} className="!top-0 !sticky !z-50">
            <div
              className="flex flex-row justify-start items-center p-3"
              style={{ background: theme.palette.background.default }}
            >
              <span className="text-sm font-semibold text-start">
                {LOCAL_CONSTANTS.STRINGS.DASHBOARD_ADDITION_PAGE_TITLE}
              </span>
            </div>
            <div
              className="flex flex-col justify-center items-start p-3"
              style={{ background: theme.palette.background.default }}
            >
              <FormControl fullWidth size="small" className="">
                <span className="text-xs font-light  !capitalize mb-1">{`Dashboard title`}</span>
                <TextField
                  required={true}
                  fullWidth
                  size="small"
                  variant="outlined"
                  type="text"
                  name={"pm_dashboard_title"}
                  value={dashboardAdditionForm.values["pm_dashboard_title"]}
                  onChange={dashboardAdditionForm.handleChange}
                  onBlur={dashboardAdditionForm.handleBlur}
                  error={dashboardAdditionForm.errors["pm_dashboard_title"]}
                />
              </FormControl>
              <FormControl fullWidth size="small" className="!mt-3">
                <span className="text-xs font-light  !capitalize mb-1">{`Description`}</span>
                <TextField
                  required={true}
                  fullWidth
                  size="small"
                  variant="outlined"
                  type="text"
                  name={"pm_dashboard_description"}
                  value={
                    dashboardAdditionForm.values["pm_dashboard_description"]
                  }
                  onChange={dashboardAdditionForm.handleChange}
                  onBlur={dashboardAdditionForm.handleBlur}
                  error={
                    dashboardAdditionForm.errors["pm_dashboard_description"]
                  }
                />
              </FormControl>

              <div className="mt-3 w-full flex flex-row justify-end">
                <Button
                  variant="contained"
                  onClick={dashboardAdditionForm.handleSubmit}
                >
                  {LOCAL_CONSTANTS.STRINGS.ADD_BUTTON_TEXT}
                </Button>
              </div>
            </div>
          </Grid>
          <Grid item sm={12}>
            <WidgetsDnDList />
          </Grid>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
