import React from "react";
import PropTypes from "prop-types";

export const PostgreSQLDatasourceTestResultUI = ({ connectionResult }) => {
  PostgreSQLDatasourceTestResultUI.propTypes = {
    connectionResult: PropTypes.object,
  };

  let connectionResultClass = "bg-slate-100 !border-slate-400 text-slate-700";
  let connectionResultText = "Connection not tested";

  if (connectionResult === true) {
    connectionResultClass = "bg-green-100 !border-green-400 text-green-700";
    connectionResultText = "Connection successful";
  } else if (connectionResult === false) {
    connectionResultClass = "bg-red-100 !border-red-400 text-red-700";
    connectionResultText = "Connection failed";
    connectionResult = "Connection failed";
  } else if (connectionResult === undefined) {
    connectionResultClass = "bg-slate-100 !border-slate-400 text-slate-700";
    connectionResultText = "Connection not tested";
  } else {
    connectionResultClass = "bg-orange-100 !border-orange-400 text-orange-700";
    connectionResultText = "Error testing connection";
  }

  return (
    <div className="p-3">
      <div
        className={`w-full flex flex-col justify-start items-start p-3 rounded-md border ${connectionResultClass}`}
      >
        
        <div className="!flex !flex-row justify-start items-center">
          <span className="!text-sm !font-normal">
            {connectionResultText}
          </span>
        </div>
      </div>
    </div>
  );
};
