import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LOCAL_CONSTANTS } from "../constants";
import { fetchRemoteConstantsAPI } from "../api/constants";
import { Loading } from "../pages/Loading";
import { DynamicLoadingComponent } from "../components/DynamicLoadingComponent";
const ConstantsContext = React.createContext(undefined);

const ConstantsContextProvider = ({ children }) => {
  const [dbModel, setDBModel] = useState(null);

  // // react-query for db users
  const { isLoading, data, error } = useQuery({
    queryKey: ["app_constants"],
    queryFn: fetchRemoteConstantsAPI,
    cacheTime: 0,
    retry: 3,
    staleTime: 0,
  });

  // effect for initial user fetch
  useEffect(() => {
    if (data) {
      setDBModel(data.db_model);
    }
  }, [isLoading, data, error]);

  return (
    <ConstantsContext.Provider
      value={{
        dbModel,
      }}
    >
      {dbModel ? (
        children
      ) : (
        <DynamicLoadingComponent
          textSet={["Loading constants..."]}
          showIcons={false}
        />
      )}
    </ConstantsContext.Provider>
  );
};

const useConstants = () => {
  const context = React.useContext(ConstantsContext);
  if (context === undefined) {
    throw new Error("useConstants error");
  }

  return context;
};

export { ConstantsContextProvider, useConstants };
