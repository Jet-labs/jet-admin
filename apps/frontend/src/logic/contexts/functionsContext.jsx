import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAllFunctionsAPI } from "../../data/apis/databaseFunction";
import PropTypes from "prop-types";

const FunctionsStateContext = React.createContext(undefined);
const FunctionsActionsContext = React.createContext(undefined);

const FunctionsContextProvider = ({ children }) => {
  FunctionsContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };
  const { tenantID, databaseSchemaName } = useParams();
  const {
    isLoading: isLoadingFunctions,
    data: functions,
    error: loadFunctionsError,
    isFetching: isFetchingFunctions,
    isRefetching: isRefetchingFunctions,
    refetch: refetchFunctions,
  } = useQuery({
    queryKey: ["DATABASE_FUNCTIONS", tenantID, databaseSchemaName],
    queryFn: () => getAllFunctionsAPI({ tenantID, databaseSchemaName }),
    refetchOnWindowFocus: false,
  });

  return (
    <FunctionsStateContext.Provider
      value={{
        functions,
        isLoadingFunctions,
        isFetchingFunctions,
        loadFunctionsError,
        isRefetchingFunctions,
      }}
    >
      <FunctionsActionsContext.Provider
        value={{ refetchFunctions }}
      >
        {children}
      </FunctionsActionsContext.Provider>
    </FunctionsStateContext.Provider>
  );
};

const useFunctionsState = () => {
  const context = React.useContext(FunctionsStateContext);
  if (context === undefined) {
    throw new Error("useFunctionsState must be used within FunctionsContextProvider");
  }
  return context;
};

const useFunctionsActions = () => {
  const context = React.useContext(FunctionsActionsContext);
  if (context === undefined) {
    throw new Error("useFunctionsActions must be used within FunctionsContextProvider");
  }
  return context;
};

export {
  FunctionsActionsContext,
  FunctionsContextProvider,
  FunctionsStateContext,
  useFunctionsActions,
  useFunctionsState
};
