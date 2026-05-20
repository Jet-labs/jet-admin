
import { X } from 'lucide-react';
import { DataQueryTestingForm } from "./dataQueryTestingForm";
import { useParams } from "react-router-dom";
import React, { useState } from "react";
import PropTypes from "prop-types";
import { DATASOURCE_UI_COMPONENTS } from "@jet-admin/datasources-ui";

import { Button } from "@jet-admin/ui";
export const DataQueryTestingPanel = ({
  selectedQueryForTesting,
  setSelectedQueryForTesting,
}) => {
  DataQueryTestingPanel.propTypes = {
    selectedQueryForTesting: PropTypes.object,
    setSelectedQueryForTesting: PropTypes.func.isRequired,
  };
  const [dataQueryTestResult, setDataQueryTestResult] = useState();
  const { tenantID } = useParams();
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
        style={{
          zIndex: 1000,
        }}
      ></div>
      <div
        className={`fixed right-0 top-0 h-full w-1/3 bg-background transform transition-transform duration-300 ease-in-out  ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          zIndex: 1100,
        }}
      >
        <div className="p-4 h-full">
          <Button
            type="button"
            onClick={_handleClose}
            variant="outline"
            size="icon"
          >
            <X className="text-base text-foreground" />
          </Button>
          {selectedQueryForTesting && (
            <div className="w-full flex flex-col justify-start items-stretch h-full flex-grow">
              <div className="w-full flex flex-row justify-end mt-2">
                <DataQueryTestingForm
                  key={`dataQueryTestingPanel_${selectedQueryForTesting?.dataQueryID}`}
                  tenantID={tenantID}
                  dataQuery={selectedQueryForTesting}
                  dataQueryID={selectedQueryForTesting.dataQueryID}
                  datasourceID={selectedQueryForTesting.datasourceID}
                  datasourceType={selectedQueryForTesting.datasourceType}
                  dataQueryOptions={selectedQueryForTesting.dataQueryOptions}
                  setDataQueryTestResult={setDataQueryTestResult}
                />
              </div>
              <div className="w-full !h-[calc(100%-50px)] mt-3 border-t border-t-brand-border">
                {DATASOURCE_UI_COMPONENTS[
                  selectedQueryForTesting?.datasourceType
                ]?.queryResponseView({
                  queryResult: dataQueryTestResult,
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
