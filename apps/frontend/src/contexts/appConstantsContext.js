import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LOCAL_CONSTANTS } from "../constants";
import {
  getAllAppConstantAPI,
  getDBModelAppConstantAPI,
} from "../api/appConstants";
import { Loading } from "../pages/Loading";
const AppConstantsValueContext = React.createContext(undefined);
const AppConstantsActionContext = React.createContext(undefined);

const AppConstantsContextProvider = ({ children }) => {
  // // react-query for db users
  const {
    isLoading: isLoadingDBModel,
    data: dbModelData,
    error: dbModelError,
  } = useQuery({
    queryKey: ["app_constants_db_model"],
    queryFn: getDBModelAppConstantAPI,
    cacheTime: 0,
    retry: 3,
    staleTime: 0,
  });

  const {
    isLoading: isLoadingAppConstants,
    data: appConstants,
    error: appConstantsError,
    refetch: reloadAllAppConstants,
  } = useQuery({
    queryKey: ["app_constants"],
    queryFn: getAllAppConstantAPI,
    cacheTime: 0,
    retry: 3,
    staleTime: 0,
  });

  return (
    <AppConstantsValueContext.Provider
      value={{
        dbModel: dbModelData?.db_model,
        appConstants,
      }}
    >
      <AppConstantsActionContext.Provider
        value={{
          reloadAllAppConstants,
        }}
      >
        {dbModelData?.db_model ? children : <Loading fullScreen={true} />}
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

export { AppConstantsContextProvider, useAppConstants, useAppConstantActions };
