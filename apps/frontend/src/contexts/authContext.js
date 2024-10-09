import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { fetchDBUserAPI, loginAPI } from "../api/auth";
import { LOCAL_CONSTANTS } from "../constants";
import { displayError, displaySuccess } from "../utils/notification";

const AuthStateContext = React.createContext(undefined);
const AuthActionsContext = React.createContext(undefined);

const AuthContextProvider = ({ children }) => {
  const [signOutState, setSignOutState] = useState({
    isLoading: false,
    success: false,
    error: null,
  });
  const {
    isFetching: isLoadingDBUser,
    data: pmUser,
    error: dbUserError,
    isFetched: isFetchedDBUser,
    isSuccess: isSuccessDBUser,
    isRefetching: isRefetchingDBUser,
    refetch: fetchDBUser,
  } = useQuery({
    queryKey: [LOCAL_CONSTANTS.REACT_QUERY_KEYS.DB_USER],
    queryFn: () => fetchDBUserAPI(),
    retry: false,
  });

  const {
    isPending: isLoggingIn,
    isSuccess: isLoginSuccess,
    error: loginError,
    mutate: login,
  } = useMutation({
    mutationFn: ({ username, password }) => {
      return loginAPI({ username, password });
    },
    retry: false,
    onSuccess: () => {
      displaySuccess("Login success!");
      fetchDBUser();
    },
    onError: (error) => {
      displayError(error);
    },
  });

  const signOut = async () => {
    try {
      setSignOutState({ isLoading: true, success: false, error: null });
      await localStorage.removeItem(
        LOCAL_CONSTANTS.STRINGS.ACCESS_TOKEN_LOCAL_STORAGE
      );
      await localStorage.removeItem(
        LOCAL_CONSTANTS.STRINGS.REFRESH_TOKEN_LOCAL_STORAGE
      );
      window.location.reload();
    } catch (error) {
      setSignOutState({ isLoading: false, success: false, error });
    }
  };

  return (
    <AuthStateContext.Provider
      value={{
        isLoggingIn,
        isLoginSuccess,
        loginError,
        pmUser,
        isLoadingDBUser,
        isRefetchingDBUser,
        dbUserError,
        signOutState,
      }}
    >
      <AuthActionsContext.Provider
        value={{
          login,
          signOut,
        }}
      >
        {children}
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
};

const useAuthState = () => {
  const context = React.useContext(AuthStateContext);
  if (context === undefined) {
    throw new Error("useAuthState error");
  }

  return context;
};

const useAuthActions = () => {
  const context = React.useContext(AuthActionsContext);
  if (context === undefined) {
    throw new Error("useAuthActions error");
  }

  return context;
};

export {
  AuthActionsContext,
  AuthContextProvider,
  AuthStateContext,
  useAuthActions,
  useAuthState,
};
