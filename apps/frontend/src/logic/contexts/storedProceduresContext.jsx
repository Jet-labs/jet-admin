import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAllStoredProceduresAPI } from "../../data/apis/storedProcedure";
import PropTypes from "prop-types";

const StoredProceduresStateContext = React.createContext(undefined);
const StoredProceduresActionsContext = React.createContext(undefined);

const StoredProceduresContextProvider = ({ children }) => {
  StoredProceduresContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };
  const { tenantID, databaseSchemaName } = useParams();
  const {
    isLoading: isLoadingStoredProcedures,
    data: storedProcedures,
    error: loadStoredProceduresError,
    isFetching: isFetchingStoredProcedures,
    isRefetching: isRefetchingStoredProcedures,
    refetch: refetchStoredProcedures,
  } = useQuery({
    queryKey: ["STORED_PROCEDURES", tenantID, databaseSchemaName],
    queryFn: () => getAllStoredProceduresAPI({ tenantID, databaseSchemaName }),
    refetchOnWindowFocus: false,
  });

  return (
    <StoredProceduresStateContext.Provider
      value={{
        storedProcedures,
        isLoadingStoredProcedures,
        isFetchingStoredProcedures,
        loadStoredProceduresError,
        isRefetchingStoredProcedures,
      }}
    >
      <StoredProceduresActionsContext.Provider
        value={{ refetchStoredProcedures }}
      >
        {children}
      </StoredProceduresActionsContext.Provider>
    </StoredProceduresStateContext.Provider>
  );
};

const useStoredProceduresState = () => {
  const context = React.useContext(StoredProceduresStateContext);
  if (context === undefined) {
    throw new Error("useStoredProceduresState must be used within StoredProceduresContextProvider");
  }
  return context;
};

const useStoredProceduresActions = () => {
  const context = React.useContext(StoredProceduresActionsContext);
  if (context === undefined) {
    throw new Error("useStoredProceduresActions must be used within StoredProceduresContextProvider");
  }
  return context;
};

export {
  StoredProceduresActionsContext,
  StoredProceduresContextProvider,
  StoredProceduresStateContext,
  useStoredProceduresActions,
  useStoredProceduresState
};
