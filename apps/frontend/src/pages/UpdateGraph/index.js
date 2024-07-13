import React from "react";

import { useParams } from "react-router-dom";
import { GraphUpdateForm } from "../../components/GraphComponents/GraphUpdateForm";

const UpdateGraph = () => {
  const { id } = useParams();
  return <GraphUpdateForm id={id} />;
};

export default UpdateGraph;
