import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import React, { useEffect, useState } from "react";
import { CONSTANTS } from "../../constants";
import { getUserInfoAPI } from "../../data/apis/auth";
import { firebaseAuth } from "../../config/firebase";

const AuthStateContext = React.createContext(undefined);
const AuthActionsContext = React.createContext(undefined);

const AuthContextProvider = ({ children }) => {
  const queryClient = useQueryClient();

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
      }}
    >
      <AuthActionsContext.Provider
        value={{
          googleSignIn,
          emailSignIn,
          emailSignUp,
          resetPassword,
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
