import React from "react";
import { useParams } from "react-router-dom";
import { DashboardUpdateForm } from "../../components/DashboardComponents/DashbaordUpdateForm";

const UpdateDashboard = () => {
  const { id } = useParams();

  return <DashboardUpdateForm id={id} />;
};

export default UpdateDashboard;
