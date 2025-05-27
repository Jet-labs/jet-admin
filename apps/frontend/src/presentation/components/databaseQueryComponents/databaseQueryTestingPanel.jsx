import { IoClose } from "react-icons/io5";
import { DatabaseQueryTestingForm } from "./databaseQueryTestingForm";
import { useParams } from "react-router-dom";
import React, { useState } from "react";
import { DatabaseQueryResponseView } from "./databaseQueryResponseView";
import PropTypes from "prop-types";

export const DatabaseQueryTestingPanel = ({
  selectedQueryForTesting,
  setSelectedQueryForTesting,
}) => {
  DatabaseQueryTestingPanel.propTypes = {
    selectedQueryForTesting: PropTypes.object,
    setSelectedQueryForTesting: PropTypes.func.isRequired,
  };
  const [databaseQueryTestResult, setDatabaseQueryTestResult] = useState();
  const { tenantID, databaseSchemaName } = useParams();
  const isOpen = selectedQueryForTesting ? true : false;
  const _handleClose = () => {
    setSelectedQueryForTesting(null);
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out ${
          isOpen
            ? "opacity-50 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={_handleClose}
      ></div>
      <div
        className={`fixed right-0 top-0 h-full w-1/3 bg-white transform transition-transform duration-300 ease-in-out   ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-2 h-full">
          <button
            type="button"
            onClick={_handleClose}
            className=" focus:outline-none  text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 py-1 px-1 rounded border border-slate-300 transition-colors w-fit"
          >
            <IoClose className="text-base text-slate-700" />
          </button>
          {selectedQueryForTesting && (
            <div className="w-full flex flex-col justify-start items-stretch h-full flex-grow">
              <div className="w-full flex flex-row justify-end mt-2">
                <DatabaseQueryTestingForm
                  tenantID={tenantID}
                  databaseSchemaName={databaseSchemaName}
                  databaseQueryID={selectedQueryForTesting.databaseQueryID}
                  databaseQueryString={
                    selectedQueryForTesting.databaseQueryOptions
                      .databaseQueryString
                  }
                  databaseQueryArgs={
                    selectedQueryForTesting.databaseQueryOptions.databaseQueryArgs
                  }
                  setDatabaseQueryTestResult={setDatabaseQueryTestResult}
                />
              </div>
              <div className="w-full h-[calc(100%-70px)] mt-3 border-t border-t-slate-200">
                <DatabaseQueryResponseView
                  databaseQueryResult={databaseQueryTestResult}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
