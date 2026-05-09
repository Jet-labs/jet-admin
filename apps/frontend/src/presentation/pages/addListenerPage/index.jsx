import React from "react";
import { ListenerAdditionForm } from "../../components/listenerComponents/listenerAdditionForm";
import { useParams } from "react-router-dom";

const AddListenerPage = () => {
  const { tenantID } = useParams();

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-brand-dark">
      <ListenerAdditionForm tenantID={tenantID} />
    </div>
  );
};

export default AddListenerPage;
