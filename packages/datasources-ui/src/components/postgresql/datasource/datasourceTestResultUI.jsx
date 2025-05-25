import React from "react";

export const PostgreSQLDatasourceTestResultUI = ({ connectionResult }) => {
  const statusClasses = connectionResult
    ? "bg-green-100 !border-green-400 text-green-700" // Green for success
    : "bg-red-100 !border-red-400 text-red-700"; // Red for failure

  return (
    <div className="p-3">
      <div
        className={`w-full flex flex-col justify-start items-start p-3 rounded-md border ${statusClasses}`}
      >
        
        <div className="!flex !flex-row justify-start items-center">
          <span className="!text-sm !font-normal">
            {connectionResult ? "Connection successful" : "Connection failed"}
          </span>
        </div>
      </div>
    </div>
  );
};
