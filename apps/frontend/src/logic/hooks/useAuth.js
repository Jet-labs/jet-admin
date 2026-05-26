import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getUserInfoAPI } from "../../data/apis/auth";
import { useAuthStore } from "../stores/useAuthStore";

export const useAuthState = () => {
  const firebaseUserState = useAuthStore((state) => state.firebaseUserState);
  const signInState = useAuthStore((state) => state.signInState);
  const signUpState = useAuthStore((state) => state.signUpState);
  const signOutState = useAuthStore((state) => state.signOutState);
  const passwordResetState = useAuthStore((state) => state.passwordResetState);

  const userConfig = useAuthStore((state) => state.userConfig);
  const isFetchingUserConfig = useAuthStore((state) => state.isFetchingUserConfig);
  const isUpdatingUserConfig = useAuthStore((state) => state.isUpdatingUserConfig);

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

  return {
    firebaseUserState,
    user,
    userError,
    getUserConfigError: null,
    updateUserConfigError: null,
    isFetchingUserConfigSuccess: !isFetchingUserConfig && !!userConfig,
    isUpdatingUserConfigSuccess: false,
    isFetchingUserConfigError: false,
    isUpdatingUserConfigError: false,
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
  const fetchUserConfig = useAuthStore((state) => state.fetchUserConfig);
  const updateUserConfigKey = useAuthStore((state) => state.updateUserConfigKey);

  return {
    googleSignIn,
    emailSignIn,
    emailSignUp,
    resetPassword,
    signOut,
    getUserConfig: fetchUserConfig,
    updateUserConfig: null,
    updateUserConfigKey,
    setFirebaseUserState,
  };
};
