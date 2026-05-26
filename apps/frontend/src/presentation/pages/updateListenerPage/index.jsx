import React from "react";
import { ListenerUpdationForm } from "../../components/listenerComponents/listenerUpdationForm";
import { useParams } from "react-router-dom";

const UpdateListenerPage = () => {
  const { tenantID, listenerID } = useParams();

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <ListenerUpdationForm key={listenerID} tenantID={tenantID} listenerID={listenerID} />
    </div>
  );
};

export default UpdateListenerPage;
