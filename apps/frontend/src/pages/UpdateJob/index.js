import React from "react";
import { useParams } from "react-router-dom";
import { JobUpdateForm } from "../../components/JobComponents/JobUpdateForm";

const UpdateJob = () => {
  const { id } = useParams();
  return <JobUpdateForm id={id} />;
};

export default UpdateJob;
