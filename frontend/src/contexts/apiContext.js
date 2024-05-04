import axios from "axios";
import React, { useEffect, useState } from "react";
import { fetchDBUserAPI } from "../api/auth";
import { LOCAL_CONSTANTS } from "../constants";

const APIStateContext = React.createContext(undefined);
const APIActionsContext = React.createContext(undefined);

const APIContextProvider = ({ children }) => {
  const [accessTokenAutoRefreshAxios, setAccessTokenAutoRefreshAxios] =
    useState();

  useEffect(() => {
    let c = axios.create();
    setAccessTokenAutoRefreshAxios(c);
  }, []);

  const useQuery = ({ fn, params }) => {};

  // // react-query for db users
  const {
    isFetching: isLoadingPMUser,
    error: pmUserError,
    refetch: fetchDBUser,
  } = useQuery({
    queryKey: [LOCAL_CONSTANTS.REACT_QUERY_KEYS.DB_USER],
    queryFn: () => fetchDBUserAPI(),
    // enabled: true,
    // retry: 0,
    // cacheTime: Infinity,
    // staleTime: Infinity,
    onSuccess: (data) => {
      console.log("setting user");
      setPMUser(data);
    },
  });

  return (
    <APIStateContext.Provider value={{}}>
      <APIActionsContext.Provider value={{}}>
        {children}
      </APIActionsContext.Provider>
    </APIStateContext.Provider>
  );
};

const useAPIState = () => {
  const context = React.useContext(APIStateContext);
  if (context === undefined) {
    throw new Error("useAPIState error");
  }

  return context;
};

const useAPIActions = () => {
  const context = React.useContext(APIActionsContext);
  if (context === undefined) {
    throw new Error("useAPIActions error");
  }

  return context;
};

export {
  APIActionsContext,
  APIContextProvider,
  APIStateContext,
  useAPIActions,
  useAPIState,
};
