import { Button, Grid, useTheme } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import React, { useEffect } from "react";
import { FiSettings } from "react-icons/fi";
import { useParams } from "react-router-dom";
import { getDashboardByIDAPI, updateDashboardAPI } from "../../api/dashboards";
import { DashboardDeletionForm } from "../../components/DashboardComponents/DashboardDeletionForm";
import { DashboardDropZoneComponent } from "../../components/DashboardComponents/DashboardDropZoneComponent";
import { FieldComponent } from "../../components/FieldComponent";
import { GraphsDnDList } from "../../components/DashboardComponents/GraphsDnDList";
import { LOCAL_CONSTANTS } from "../../constants";
import { displayError, displaySuccess } from "../../utils/notification";
import { DashboardUpdateForm } from "../../components/DashboardComponents/DashbaordUpdateForm";

const UpdateDashboard = () => {
  const { id } = useParams();

  return <DashboardUpdateForm id={id} />;
};

export default UpdateDashboard;
