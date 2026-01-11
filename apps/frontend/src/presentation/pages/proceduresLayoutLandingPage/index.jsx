import React from "react";
import { useParams } from "react-router-dom";

const ProceduresLayoutLandingPage = () => {
  const { databaseSchemaName } = useParams();

  return (
    <div className="flex items-center justify-center h-full text-slate-500">
      <div className="text-center">
        <p className="text-lg">Select a procedure from the list</p>
        <p className="text-sm text-slate-400">or create a new one</p>
      </div>
    </div>
  );
};

export default ProceduresLayoutLandingPage;
