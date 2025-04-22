import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useParams } from "react-router-dom";
import { CONSTANTS } from "../../constants";
import { getAllAPIKeysAPI } from "../../data/apis/apiKey";
import PropTypes from "prop-types";

const APIKeysStateContext = React.createContext(undefined);
const APIKeysActionsContext = React.createContext(undefined);

const APIKeysContextProvider = ({ children }) => {
  APIKeysContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };
  const { tenantID } = useParams();
  const {
    isLoading: isLoadingAPIKeys,
    data: apiKeys,
    error: loadAPIKeysError,
    isFetching: isFetchingAPIKeys,
    isRefetching: isRefetechingAPIKeys,
    refetch: refetchAPIKeys,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.DATABASE_NOTIFICATIONS(tenantID)],
    queryFn: () => getAllAPIKeysAPI({ tenantID }),
    refetchOnWindowFocus: false,
  });
  return (
    <APIKeysStateContext.Provider
      value={{
        apiKeys,
        isLoadingAPIKeys,
        isFetchingAPIKeys,
        isRefetechingAPIKeys,
        refetchAPIKeys,
        loadAPIKeysError,
      }}
    >
      <APIKeysActionsContext.Provider value={{ refetchAPIKeys }}>
        {children}
      </APIKeysActionsContext.Provider>
    </APIKeysStateContext.Provider>
  );
};

const useAPIKeysState = () => {
  const context = React.useContext(APIKeysStateContext);
  if (context === undefined) {
    throw new Error("useAPIKeysState error");
  }

  return context;
};

const useAPIKeysActions = () => {
  const context = React.useContext(APIKeysActionsContext);
  if (context === undefined) {
    throw new Error("useAPIKeysActions error");
  }

  return context;
};

export {
  APIKeysActionsContext,
  APIKeysContextProvider,
  APIKeysStateContext,
  useAPIKeysActions,
  useAPIKeysState,
};
