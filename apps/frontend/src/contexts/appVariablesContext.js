import { useQuery } from "@tanstack/react-query";
import React, { useMemo } from "react";
import {
  getAllAppVariableAPI,
  getAllInternalAppVariableAPI,
} from "../api/appVariables";
const AppVariablesValueContext = React.createContext(undefined);
const AppVariablesActionContext = React.createContext(undefined);

const AppVariablesContextProvider = ({ children }) => {
  const {
    isLoading: isLoadingAllAppVariables,
    data: appVariables,
    error: appVariablesError,
    isFetching: isFetchingAllAppVariables,
    refetch: reloadAllAppVariables,
  } = useQuery({
    queryKey: ["REACT_QUERY_KEY_APP_VARIABLESS"],
    queryFn: getAllAppVariableAPI,
    cacheTime: 0,
    retry: 3,
    staleTime: 0,
  });

  const {
    isLoading: isLoadinginternalAppVariables,
    data: internalAppVariables,
    error: internalAppVariablesError,
    refetch: reloadAllInternalAppVariables,
  } = useQuery({
    queryKey: ["internal_app_variables"],
    queryFn: getAllInternalAppVariableAPI,
    cacheTime: 0,
    retry: 3,
    staleTime: 0,
  });

  const processedInternalAppVariables = useMemo(() => {
    if (internalAppVariables && Array.isArray(internalAppVariables)) {
      const _t = {};
      internalAppVariables.forEach((_i) => {
        _t[_i.pm_app_variable_title] = _i.pm_app_variable_value;
      });
      return _t;
    }
  }, [internalAppVariables]);

  const processedInternalAppVariablesIDMap = useMemo(() => {
    if (internalAppVariables && Array.isArray(internalAppVariables)) {
      const _t = {};
      internalAppVariables.forEach((_i) => {
        _t[_i.pm_app_variable_title] = _i.pm_app_variable_id;
      });
      return _t;
    }
  }, [internalAppVariables]);
  console.log({ processedInternalAppVariables });
  return (
    <AppVariablesValueContext.Provider
      value={{
        appVariables,
        internalAppVariables: processedInternalAppVariables,
        isFetchingAllAppVariables,
        isLoadingAllAppVariables,
        processedInternalAppVariablesIDMap,
      }}
    >
      <AppVariablesActionContext.Provider
        value={{
          reloadAllAppVariables,
          reloadAllInternalAppVariables,
        }}
      >
        {children}
      </AppVariablesActionContext.Provider>
    </AppVariablesValueContext.Provider>
  );
};

const useAppVariables = () => {
  const context = React.useContext(AppVariablesValueContext);
  if (context === undefined) {
    throw new Error("useAppVariables error");
  }

  return context;
};

const useAppVariableActions = () => {
  const context = React.useContext(AppVariablesActionContext);
  if (context === undefined) {
    throw new Error("useAppVariableActions error");
  }

  return context;
};

export { AppVariablesContextProvider, useAppVariableActions, useAppVariables };
