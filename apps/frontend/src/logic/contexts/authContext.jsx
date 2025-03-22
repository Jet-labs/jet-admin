import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import React, { useCallback, useEffect, useState } from "react";
import { CONSTANTS } from "../../constants";
import {
  getUserConfigAPI,
  getUserInfoAPI,
  updateUserConfigAPI,
} from "../../data/apis/auth";
import { firebaseAuth } from "../../config/firebase";
import { useParams } from "react-router-dom";
import { set } from "lodash";

const AuthStateContext = React.createContext(undefined);
const AuthActionsContext = React.createContext(undefined);

const AuthContextProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [userConfig, setUserConfig] = useState();
  // const { tenantID } = useParams();

  const [firebaseUserState, setFirebaseUserState] = useState({
    isLoading: true,
    user: null,
    error: null,
  });
  const [signUpState, setSignUpState] = useState({
    isLoading: false,
    success: false,
    error: null,
  });
  const [signInState, setSignInState] = useState({
    isLoading: false,
    success: false,
    error: null,
  });
  const [signOutState, setSignOutState] = useState({
    isLoading: false,
    success: false,
    error: null,
  });

  const [passwordResetState, setPasswordResetState] = useState({
    isLoading: false,
    success: false,
    error: null,
  });

  const {
    isLoading: isLoadingUser,
    isFetching: isFetchingUser,
    data: user,
    error: userError,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.DB_USER],
    queryFn: getUserInfoAPI,
    enabled: Boolean(firebaseUserState?.user),
    cacheTime: Infinity,
    retry: 3,
    staleTime: Infinity,
  });

  const {
    isPending: isFetchingUserConfig,
    isSuccess: isFetchingUserConfigSuccess,
    isError: isFetchingUserConfigError,
    error: getUserConfigError,
    mutate: getUserConfig,
  } = useMutation({
    mutationKey: [CONSTANTS.REACT_QUERY_KEYS.DB_USER_CONFIG],
    mutationFn: async ({ tenantID }) => {
      return await getUserConfigAPI({
        tenantID,
      });
    },
    retry: false,
    onSuccess: (data) => {
      setUserConfig(data);
    },
    onError: (error) => {},
  });

  const {
    isPending: isUpdatingUserConfig,
    isSuccess: isUpdatingUserConfigSuccess,
    isError: isUpdatingUserConfigError,
    error: updateUserConfigError,
    mutate: updateUserConfig,
  } = useMutation({
    mutationFn: ({ tenantID, config }) => {
      return updateUserConfigAPI({
        tenantID,
        config,
      });
    },
    retry: false,
    onSuccess: (tenantID) => {
      getUserConfig({ tenantID: tenantID });
    },
    onError: (error) => {},
  });

  // effect for setting up firebase auth listener
  useEffect(() => {
    const unsub = initAuth();
    return unsub;
  }, []);

  // firebase auth listener
  const initAuth = () => {
    // setAuth(new Auth({ isLoading: true, user: null, error: null }));
    const unsub = firebaseAuth.onAuthStateChanged(async (user) => {
      if (user) {
        setFirebaseUserState({ isLoading: false, error: null, user });
      } else {
        setFirebaseUserState({ isLoading: false, error: null, user: null });
      }
    });
    return unsub;
  };

  const googleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      setSignInState({ isLoading: true, success: false, error: null });
      await signInWithPopup(firebaseAuth, provider);
      setSignInState({ isLoading: false, success: true, error: null });
    } catch (error) {
      setSignInState({ isLoading: false, success: false, error: error });
    }
  };

  const emailSignUp = async (email, password) => {
    try {
      setSignUpState({ isLoading: true, success: false, error: null });
      await createUserWithEmailAndPassword(firebaseAuth, email, password);
      setSignUpState({ isLoading: false, success: true, error: null });
    } catch (error) {
      setSignUpState({ isLoading: false, success: false, error: error });
    }
  };

  const emailSignIn = async (email, password) => {
    try {
      setSignInState({ isLoading: true, success: false, error: null });
      await signInWithEmailAndPassword(firebaseAuth, email, password);
      window.localStorage.setItem("emailForSignIn", email);
      setSignInState({ isLoading: false, success: true, error: null });
    } catch (error) {
      setSignInState({ isLoading: false, success: false, error: error });
    }
  };

  const resetPassword = async (email) => {
    try {
      setPasswordResetState({ isLoading: true, success: false, error: null });
      await sendPasswordResetEmail(firebaseAuth, email);
      setPasswordResetState({
        isLoading: false,
        success: true,
        error: null,
      });
    } catch (error) {
      setPasswordResetState({
        isLoading: false,
        success: false,
        error: error,
      });
    }
  };

  const signOut = async () => {
    try {
      setSignOutState({ isLoading: true, success: false, error: null });
      await firebaseAuth.signOut();
      setSignOutState({ isLoading: false, success: true, error: null });
      window.location.reload();
    } catch (error) {
      setSignOutState({ isLoading: false, success: false, error });
    }
  };

  const updateUserConfigKey = useCallback(
    ({ tenantID, key, value }) => {
      console.log("updateUserConfigKey", tenantID, key, value);
      updateUserConfig({
        tenantID,
        config: { ...userConfig, [key]: value },
      });
    },
    [userConfig, updateUserConfig]
  );

  return (
    <AuthStateContext.Provider
      value={{
        firebaseUserState,
        user,
        isLoadingUser,
        isFetchingUser,
        signInState,
        signUpState,
        signOutState,
        passwordResetState,
        userConfig,
        isFetchingUserConfig,
        isUpdatingUserConfig,
      }}
    >
      <AuthActionsContext.Provider
        value={{
          googleSignIn,
          emailSignIn,
          emailSignUp,
          resetPassword,
          signOut,
          getUserConfig,
          updateUserConfig,
          updateUserConfigKey,
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
