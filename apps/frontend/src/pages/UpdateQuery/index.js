import React from "react";
import "react-data-grid/lib/styles.css";
import { useParams } from "react-router-dom";
import { QueryUpdateForm } from "../../components/QueryComponents/QueryUpdateForm";

const UpdateQuery = () => {
  const { id } = useParams();
  return <QueryUpdateForm id={id} />;
};

export default UpdateQuery;
