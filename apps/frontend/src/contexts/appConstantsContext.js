import { useQuery } from "@tanstack/react-query";
import React, { useMemo } from "react";
import {
  getAllAppConstantAPI,
  getAllInternalAppConstantAPI,
} from "../api/appConstants";
const AppConstantsValueContext = React.createContext(undefined);
const AppConstantsActionContext = React.createContext(undefined);

const AppConstantsContextProvider = ({ children }) => {
  const {
    isLoading: isLoadingAllAppConstants,
    data: appConstants,
    error: appConstantsError,
    isFetching: isFetchingAllAppConstants,
    refetch: reloadAllAppConstants,
  } = useQuery({
    queryKey: ["REACT_QUERY_KEY_APP_CONSTANTS"],
    queryFn: getAllAppConstantAPI,
    cacheTime: 0,
    retry: 3,
    staleTime: 0,
  });

  const {
    isLoading: isLoadinginternalAppConstants,
    data: internalAppConstants,
    error: internalAppConstantsError,
    refetch: reloadAllInternalAppConstants,
  } = useQuery({
    queryKey: ["internal_app_constants"],
    queryFn: getAllInternalAppConstantAPI,
    cacheTime: 0,
    retry: 3,
    staleTime: 0,
  });

  const processedInternalAppConstants = useMemo(() => {
    if (internalAppConstants && Array.isArray(internalAppConstants)) {
      const _t = {};
      internalAppConstants.forEach((_i) => {
        _t[_i.pm_app_constant_title] = _i.pm_app_constant_value;
      });
      return _t;
    }
  }, [internalAppConstants]);

  const processedInternalAppConstantsIDMap = useMemo(() => {
    if (internalAppConstants && Array.isArray(internalAppConstants)) {
      const _t = {};
      internalAppConstants.forEach((_i) => {
        _t[_i.pm_app_constant_title] = _i.pm_app_constant_id;
      });
      return _t;
    }
  }, [internalAppConstants]);
  console.log({ processedInternalAppConstants });
  return (
    <AppConstantsValueContext.Provider
      value={{
        appConstants,
        internalAppConstants: processedInternalAppConstants,
        isFetchingAllAppConstants,
        isLoadingAllAppConstants,
        processedInternalAppConstantsIDMap,
      }}
    >
      <AppConstantsActionContext.Provider
        value={{
          reloadAllAppConstants,
          reloadAllInternalAppConstants,
        }}
      >
        {children}
      </AppConstantsActionContext.Provider>
    </AppConstantsValueContext.Provider>
  );
};

const useAppConstants = () => {
  const context = React.useContext(AppConstantsValueContext);
  if (context === undefined) {
    throw new Error("useAppConstants error");
  }

  return context;
};

const useAppConstantActions = () => {
  const context = React.useContext(AppConstantsActionContext);
  if (context === undefined) {
    throw new Error("useAppConstantActions error");
  }

  return context;
};

export { AppConstantsContextProvider, useAppConstantActions, useAppConstants };
