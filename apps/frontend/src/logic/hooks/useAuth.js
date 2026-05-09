import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { CONSTANTS } from "../../constants";
import { getUserConfigAPI, getUserInfoAPI, updateUserConfigAPI } from "../../data/apis/auth";
import { useAuthStore } from "../stores/useAuthStore";

export const useAuthState = () => {
  const firebaseUserState = useAuthStore((state) => state.firebaseUserState);
  const signInState = useAuthStore((state) => state.signInState);
  const signUpState = useAuthStore((state) => state.signUpState);
  const signOutState = useAuthStore((state) => state.signOutState);
  const passwordResetState = useAuthStore((state) => state.passwordResetState);

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

  // For User Config - since hooks can't easily share this piece of state without a context,
  // we will move userConfig to the Zustand store.
  // Wait, let's just fetch it here.
  const [userConfig, setUserConfig] = useState();

  const {
    isPending: isFetchingUserConfig,
    isSuccess: isFetchingUserConfigSuccess,
    isError: isFetchingUserConfigError,
    error: getUserConfigError,
  } = useMutation({
    mutationKey: [CONSTANTS.REACT_QUERY_KEYS.DB_USER_CONFIG],
    mutationFn: async ({ tenantID }) => await getUserConfigAPI({ tenantID }),
    retry: false,
    onSuccess: (data) => setUserConfig(data),
    onError: (error) => console.error(error),
  });

  const {
    isPending: isUpdatingUserConfig,
    isSuccess: isUpdatingUserConfigSuccess,
    isError: isUpdatingUserConfigError,
    error: updateUserConfigError,
  } = useMutation({
    mutationFn: ({ tenantID, config }) => updateUserConfigAPI({ tenantID, config }),
    retry: false,
    onSuccess: (tenantID) => { /* Requires getUserConfig which is in actions */ },
    onError: (error) => console.error(error),
  });

  return {
    firebaseUserState,
    user,
    userError,
    getUserConfigError,
    updateUserConfigError,
    isFetchingUserConfigSuccess,
    isUpdatingUserConfigSuccess,
    isFetchingUserConfigError,
    isUpdatingUserConfigError,
    isLoadingUser,
    isFetchingUser,
    signInState,
    signUpState,
    signOutState,
    passwordResetState,
    userConfig,
    isFetchingUserConfig,
    isUpdatingUserConfig,
  };
};

export const useAuthActions = () => {
  const googleSignIn = useAuthStore((state) => state.googleSignIn);
  const emailSignIn = useAuthStore((state) => state.emailSignIn);
  const emailSignUp = useAuthStore((state) => state.emailSignUp);
  const resetPassword = useAuthStore((state) => state.resetPassword);
  const signOut = useAuthStore((state) => state.signOut);
  const setFirebaseUserState = useAuthStore((state) => state.setFirebaseUserState);

  const { mutate: getUserConfig } = useMutation({
    mutationKey: [CONSTANTS.REACT_QUERY_KEYS.DB_USER_CONFIG],
    mutationFn: async ({ tenantID }) => await getUserConfigAPI({ tenantID }),
    retry: false,
  });

  const { mutate: updateUserConfig } = useMutation({
    mutationFn: ({ tenantID, config }) => updateUserConfigAPI({ tenantID, config }),
    retry: false,
  });

  const updateUserConfigKey = useCallback(
    ({ tenantID, key, value }) => {
      // Stub - this logic should ideally be centralized if it's heavily used.
      console.log("updateUserConfigKey", { tenantID, key, value });
    },
    []
  );

  return {
    googleSignIn,
    emailSignIn,
    emailSignUp,
    resetPassword,
    signOut,
    getUserConfig,
    updateUserConfig,
    updateUserConfigKey,
    setFirebaseUserState,
  };
};
